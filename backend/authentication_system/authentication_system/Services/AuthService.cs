using authentication_system.Data;
using authentication_system.Entities;
using authentication_system.Models;
using authentication_system.Exceptions;
using authentication_system.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace authentication_system.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthService> _logger;
        private readonly IErrorHandler _errorHandler;

        public AuthService(
            UserDbContext context,
            IConfiguration configuration,
            ILogger<AuthService> logger,
            IErrorHandler errorHandler)
        {
            _context = context;
            _configuration = configuration;
            _logger = logger;
            _errorHandler = errorHandler;
        }

        public async Task<AuthResponseDTO?> LoginAsync(LoginDTO request)
        {
            return await _errorHandler.HandleOperationAsync(async () =>
            {
                if (request == null || string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
                {
                    _logger.LogWarning("Login attempted with null request or empty email/password");
                    return null;
                }

                var user = await _context.Users
                    .Include(u => u.Role)
                    .AsNoTracking()
                    .FirstOrDefaultAsync(u => u.Email == request.Email && u.IsActive);

                if (user is null)
                {
                    _logger.LogWarning("Login failed: user with email {Email} not found or inactive", request.Email);
                    return null;
                }

                if (new PasswordHasher<User>().VerifyHashedPassword(user, user.PasswordHash, request.Password)
                    == PasswordVerificationResult.Failed)
                {
                    _logger.LogWarning("Login failed: invalid password for user {Email}", request.Email);
                    return null;
                }

                _logger.LogInformation("User {Email} logged in successfully", user.Email);
                return await CreateTokenResponse(user);
            },
            "Une erreur s'est produite lors de la connexion");
        }

        public async Task<AuthResponseDTO?> RefreshTokensAsync(RefreshTokenRequestDTO request)
        {
            return await _errorHandler.HandleOperationAsync(async () =>
            {
                if (request == null || string.IsNullOrEmpty(request.RefreshToken))
                {
                    _logger.LogWarning("Token refresh attempted with null or empty refresh token");
                    return null;
                }

                var user = await ValidateRefreshTokenAsync(request.RefreshToken);
                if (user is null)
                {
                    _logger.LogWarning("Token refresh failed: invalid or expired refresh token");
                    return null;
                }

                _logger.LogInformation("Refresh token used successfully for user {Email}", user.Email);
                return await CreateTokenResponse(user);
            },
            "Une erreur s'est produite lors du rafraîchissement du token");
        }

        private async Task<AuthResponseDTO> CreateTokenResponse(User user)
        {
            return await _errorHandler.HandleOperationAsync(async () =>
            {
                var accessToken = CreateToken(user);
                var refreshToken = await GenerateAndSaveRefreshTokenAsync(user);
                int tokenExpiryMinutes = GetConfigValue("AppSettings:TokenExpiryMinutes", 15);

                return new AuthResponseDTO
                {
                    AccessToken = accessToken,
                    RefreshToken = refreshToken,
                    Expiration = DateTime.UtcNow.AddMinutes(tokenExpiryMinutes)
                };
            },
            "Erreur lors de la création des tokens d'authentification");
        }

        private async Task<User?> ValidateRefreshTokenAsync(string refreshToken)
        {
            return await _errorHandler.HandleOperationAsync(async () =>
            {
                var token = await _context.RefreshTokens
                    .Include(rt => rt.User)
                    .ThenInclude(u => u.Role)
                    .AsNoTracking()
                    .FirstOrDefaultAsync(rt => rt.Token == refreshToken &&
                                             rt.ExpiresAt > DateTime.UtcNow &&
                                             rt.RevokedAt == null);
                return token?.User;
            },
            "Erreur lors de la validation du refresh token");
        }

        private string GenerateRefreshToken()
        {
            return _errorHandler.HandleOperation(() =>
            {
                var randomNumber = new byte[64];
                using var rng = RandomNumberGenerator.Create();
                rng.GetBytes(randomNumber);
                return Convert.ToBase64String(randomNumber);
            },
            "Erreur lors de la génération du refresh token");
        }

        private async Task<string> GenerateAndSaveRefreshTokenAsync(User user)
        {
            return await _errorHandler.HandleOperationAsync(async () =>
            {
                var refreshToken = GenerateRefreshToken();

                await _context.RefreshTokens
                    .Where(rt => rt.UserId == user.Id && rt.RevokedAt == null)
                    .ExecuteUpdateAsync(s => s.SetProperty(rt => rt.RevokedAt, DateTime.UtcNow));

                var newRefreshToken = new RefreshToken
                {
                    Token = refreshToken,
                    UserId = user.Id,
                    ExpiresAt = DateTime.UtcNow.AddDays(GetConfigValue("AppSettings:RefreshTokenExpiryDays", 7)),
                    CreatedAt = DateTime.UtcNow
                };

                _context.RefreshTokens.Add(newRefreshToken);
                await _context.SaveChangesAsync();

                return refreshToken;
            },
            "Erreur lors de la génération et sauvegarde du refresh token");
        }

        private string CreateToken(User user)
        {
            return _errorHandler.HandleOperation(() =>
            {
                var jwtKey = GetRequiredEnvironmentVariable("JWT_TOKEN");
                var issuer = GetEnvironmentVariableOrDefault("JWT_ISSUER", "DefaultIssuer");
                var audience = GetEnvironmentVariableOrDefault("JWT_AUDIENCE", "DefaultAudience");

                var claims = new List<Claim>
                {
                    new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                    new Claim(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                    new Claim(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString()),
                    new Claim(ClaimTypes.Role, user.Role?.Name ?? "")
                };

                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
                var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512);

                var token = new JwtSecurityToken(
                    issuer: issuer,
                    audience: audience,
                    claims: claims,
                    notBefore: DateTime.UtcNow,
                    expires: DateTime.UtcNow.AddMinutes(GetConfigValue("AppSettings:TokenExpiryMinutes", 15)),
                    signingCredentials: creds
                );

                return new JwtSecurityTokenHandler().WriteToken(token);
            },
            "Erreur lors de la création du token JWT");
        }

        private int GetConfigValue(string key, int defaultValue)
        {
            return int.TryParse(_configuration[key], out var value) && value > 0 ? value : defaultValue;
        }

        private string GetRequiredEnvironmentVariable(string name)
        {
            var value = Environment.GetEnvironmentVariable(name);
            if (string.IsNullOrEmpty(value))
                throw new InvalidOperationException($"La variable d'environnement {name} n'est pas définie.");
            return value;
        }

        private string GetEnvironmentVariableOrDefault(string name, string defaultValue)
        {
            var value = Environment.GetEnvironmentVariable(name);
            return string.IsNullOrEmpty(value) ? defaultValue : value;
        }

        public async Task<bool> LogoutAsync(LogoutRequestDTO request)
        {
            return await _errorHandler.HandleOperationAsync(async () =>
            {
                if (request == null || string.IsNullOrEmpty(request.RefreshToken))
                {
                    _logger.LogWarning("Logout attempted with null or empty refresh token");
                    return false;
                }

                // Recherche du refresh token dans la base de données
                var refreshToken = await _context.RefreshTokens
                    .FirstOrDefaultAsync(rt => rt.Token == request.RefreshToken &&
                                             rt.RevokedAt == null);

                if (refreshToken == null)
                {
                    _logger.LogWarning("Logout failed: refresh token not found or already revoked");
                    return false;
                }

                // Révocation du refresh token
                refreshToken.RevokedAt = DateTime.UtcNow;

                // Révocation de tous les autres refresh tokens du même utilisateur (option de sécurité)
                // Décommentez cette section si vous souhaitez révoquer tous les tokens de l'utilisateur
                /*
                await _context.RefreshTokens
                    .Where(rt => rt.UserId == refreshToken.UserId && rt.RevokedAt == null)
                    .ExecuteUpdateAsync(s => s.SetProperty(rt => rt.RevokedAt, DateTime.UtcNow));
                */

                // Enregistrement des modifications
                await _context.SaveChangesAsync();

                _logger.LogInformation("User with ID {UserId} logged out successfully", refreshToken.UserId);
                return true;
            },
            "Une erreur s'est produite lors de la déconnexion");
        }

    }
}