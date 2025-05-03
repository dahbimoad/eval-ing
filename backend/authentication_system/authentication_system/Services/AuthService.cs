using authentication_system.Data;
using authentication_system.Entities;
using authentication_system.Models;
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
using authentication_system.Exceptions;
using authentication_system.Services.Interfaces;

namespace authentication_system.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthService> _logger;

        public AuthService(UserDbContext context, IConfiguration configuration, ILogger<AuthService> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<AuthResponseDTO?> LoginAsync(LoginDTO request)
        {
            try
            {
                if (request == null)
                {
                    _logger.LogWarning("Login attempted with null request");
                    return null;
                }

                if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
                {
                    _logger.LogWarning("Login attempted with empty email or password");
                    return null;
                }

                var user = await _context.Users
                    .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                    .FirstOrDefaultAsync(u => u.Email == request.Email);

                if (user is null)
                {
                    _logger.LogWarning("Login failed: user with email {Email} not found", request.Email);
                    return null;
                }

                if (!user.IsActive)
                {
                    _logger.LogWarning("Login failed: user with email {Email} is not active", request.Email);
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
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during login for user with email {Email}", request?.Email);
                throw new AuthenticationException("Une erreur s'est produite lors de la connexion", ex);
            }
        }

        public async Task<AuthResponseDTO?> RefreshTokensAsync(RefreshTokenRequestDTO request)
        {
            try
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
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during token refresh");
                throw new AuthenticationException("Une erreur s'est produite lors du rafraîchissement du token", ex);
            }
        }

        private async Task<AuthResponseDTO> CreateTokenResponse(User user)
        {
            try
            {
                if (user == null)
                {
                    throw new ArgumentNullException(nameof(user));
                }

                var accessToken = CreateToken(user);
                var refreshToken = await GenerateAndSaveRefreshTokenAsync(user);

                int tokenExpiryMinutes = GetTokenExpiryMinutes();

                return new AuthResponseDTO
                {
                    AccessToken = accessToken,
                    RefreshToken = refreshToken,
                    Expiration = DateTime.UtcNow.AddMinutes(tokenExpiryMinutes)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating token response for user {UserId}", user?.Id);
                throw new AuthenticationException("Erreur lors de la création des tokens d'authentification", ex);
            }
        }

        private int GetTokenExpiryMinutes()
        {
            const int defaultExpiryMinutes = 15;

            if (!int.TryParse(_configuration["AppSettings:TokenExpiryMinutes"], out int minutes))
            {
                _logger.LogWarning("Invalid token expiry configuration, using default of {DefaultMinutes} minutes", defaultExpiryMinutes);
                return defaultExpiryMinutes;
            }

            return minutes > 0 ? minutes : defaultExpiryMinutes;
        }

        private async Task<User?> ValidateRefreshTokenAsync(string refreshToken)
        {
            try
            {
                if (string.IsNullOrEmpty(refreshToken))
                {
                    return null;
                }

                var token = await _context.RefreshTokens
                    .Include(rt => rt.User)
                    .ThenInclude(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                    .FirstOrDefaultAsync(rt => rt.Token == refreshToken &&
                                              rt.ExpiresAt > DateTime.UtcNow &&
                                              rt.RevokedAt == null);

                return token?.User;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating refresh token");
                throw new AuthenticationException("Erreur lors de la validation du refresh token", ex);
            }
        }

        private string GenerateRefreshToken()
        {
            try
            {
                var randomNumber = new byte[32];
                using var rng = RandomNumberGenerator.Create();
                rng.GetBytes(randomNumber);
                return Convert.ToBase64String(randomNumber);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating refresh token");
                throw new AuthenticationException("Erreur lors de la génération du refresh token", ex);
            }
        }

        private async Task<string> GenerateAndSaveRefreshTokenAsync(User user)
        {
            try
            {
                if (user == null)
                {
                    throw new ArgumentNullException(nameof(user));
                }

                var refreshToken = GenerateRefreshToken();

                // Invalider tous les anciens tokens
                if (_context.RefreshTokens != null)
                {
                    var existingTokens = await _context.RefreshTokens
                        .Where(rt => rt.UserId == user.Id && rt.RevokedAt == null)
                        .ToListAsync();

                    if (existingTokens != null)
                    {
                        foreach (var token in existingTokens)
                        {
                            if (token != null)
                            {
                                token.RevokedAt = DateTime.UtcNow;
                            }
                        }
                    }
                }

                var newRefreshToken = new RefreshToken
                {
                    Token = refreshToken,
                    UserId = user.Id,
                    ExpiresAt = DateTime.UtcNow.AddDays(GetRefreshTokenExpiryDays()),
                    CreatedAt = DateTime.UtcNow
                };

                if (_context.RefreshTokens != null)
                {
                    _context.RefreshTokens.Add(newRefreshToken);
                    await _context.SaveChangesAsync();
                }
                else
                {
                    throw new InvalidOperationException("La collection RefreshTokens est inaccessible");
                }

                return refreshToken;
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Database error when saving refresh token for user {UserId}", user?.Id);
                throw new AuthenticationException("Erreur de base de données lors de l'enregistrement du refresh token", ex);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating and saving refresh token for user {UserId}", user?.Id);
                throw new AuthenticationException("Erreur lors de la génération et sauvegarde du refresh token", ex);
            }
        }

        private int GetRefreshTokenExpiryDays()
        {
            const int defaultExpiryDays = 7;

            if (!int.TryParse(_configuration["AppSettings:RefreshTokenExpiryDays"], out int days))
            {
                return defaultExpiryDays;
            }

            return days > 0 ? days : defaultExpiryDays;
        }

        private string CreateToken(User user)
        {
            try
            {
                if (user == null)
                {
                    throw new ArgumentNullException(nameof(user));
                }

                // Récupération des variables d'environnement
                var jwtKey = Environment.GetEnvironmentVariable("JWT_TOKEN");
                var issuer = Environment.GetEnvironmentVariable("JWT_ISSUER");
                var audience = Environment.GetEnvironmentVariable("JWT_AUDIENCE");

                // Vérification que la clé JWT est bien définie
                if (string.IsNullOrEmpty(jwtKey))
                {
                    throw new InvalidOperationException("La variable d'environnement JWT_TOKEN n'est pas définie.");
                }

                // Claims de base pour l'identifiant utilisateur et l'email
                var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString())
        };

                // Ajouter les rôles
                List<string> roles = new List<string>();
                if (user.UserRoles != null)
                {
                    roles = user.UserRoles
                        .Where(ur => ur.Role != null && !string.IsNullOrEmpty(ur.Role.Name))
                        .Select(ur => ur.Role.Name)
                        .ToList();
                }

                // Ajouter un claim spécifique 'role' pour le rôle principal (premier rôle)
                if (roles.Count > 0)
                {
                    claims.Add(new Claim("role", roles[0]));
                }

                // Ajouter tous les rôles dans un claim séparé pour la compatibilité avec ClaimTypes.Role
                foreach (var role in roles)
                {
                    claims.Add(new Claim(ClaimTypes.Role, role));
                }

                // Pour une meilleure compatibilité avec différents systèmes, ajoutons aussi un claim avec tous les rôles au format JSON
                if (roles.Count > 0)
                {
                    claims.Add(new Claim("roles", System.Text.Json.JsonSerializer.Serialize(roles)));
                }

                // Utiliser la clé depuis les variables d'environnement
                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
                var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

                // Récupérer la durée d'expiration du token
                var tokenExpirationMinutes = GetTokenExpiryMinutes();

                var token = new JwtSecurityToken(
                    issuer: issuer,
                    audience: audience,
                    claims: claims,
                    notBefore: DateTime.UtcNow,
                    expires: DateTime.UtcNow.AddMinutes(tokenExpirationMinutes),
                    signingCredentials: creds
                );

                return new JwtSecurityTokenHandler().WriteToken(token);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating JWT token for user {UserId}", user?.Id);
                throw new AuthenticationException("Erreur lors de la création du token JWT", ex);
            }
        }

    }
}