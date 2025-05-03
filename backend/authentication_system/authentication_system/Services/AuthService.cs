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
    /// <summary>
    /// Service d'authentification gérant les opérations de connexion, de rafraîchissement 
    /// des tokens et de création des JWT.
    /// </summary>
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
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _errorHandler = errorHandler ?? throw new ArgumentNullException(nameof(errorHandler));
        }

        /// <summary>
        /// Authentifie un utilisateur avec son email et mot de passe
        /// </summary>
        /// <param name="request">Données de connexion</param>
        /// <returns>Réponse d'authentification avec les tokens</returns>
        public async Task<AuthResponseDTO?> LoginAsync(LoginDTO request)
        {
            return await _errorHandler.HandleOperationAsync(async () =>
            {
                // Validation des entrées
                if (request == null || string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
                {
                    _logger.LogWarning("Login attempted with null request or empty email/password");
                    return null;
                }

                // Récupération de l'utilisateur avec ses rôles en une seule requête
                var user = await _context.Users
                    .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                    .AsNoTracking()  // Performance: nous n'avons pas besoin de tracker l'entité
                    .FirstOrDefaultAsync(u => u.Email == request.Email && u.IsActive);

                if (user is null)
                {
                    _logger.LogWarning("Login failed: user with email {Email} not found or inactive", request.Email);
                    return null;
                }

                // Vérification du mot de passe
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

        /// <summary>
        /// Rafraîchit les tokens d'authentification
        /// </summary>
        /// <param name="request">Demande de rafraîchissement contenant le refresh token</param>
        /// <returns>Nouveaux tokens d'authentification</returns>
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

        /// <summary>
        /// Crée une réponse d'authentification complète avec access token et refresh token
        /// </summary>
        private async Task<AuthResponseDTO> CreateTokenResponse(User user)
        {
            return await _errorHandler.HandleOperationAsync(async () =>
            {
                if (user == null)
                {
                    throw new ArgumentNullException(nameof(user));
                }

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

        /// <summary>
        /// Valide un refresh token et retourne l'utilisateur associé s'il est valide
        /// </summary>
        private async Task<User?> ValidateRefreshTokenAsync(string refreshToken)
        {
            return await _errorHandler.HandleOperationAsync(async () =>
            {
                if (string.IsNullOrEmpty(refreshToken))
                {
                    return null;
                }

                var token = await _context.RefreshTokens
                    .Include(rt => rt.User)
                    .ThenInclude(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                    .AsNoTracking()
                    .FirstOrDefaultAsync(rt => rt.Token == refreshToken &&
                                              rt.ExpiresAt > DateTime.UtcNow &&
                                              rt.RevokedAt == null);

                return token?.User;
            },
            "Erreur lors de la validation du refresh token");
        }

        /// <summary>
        /// Génère un nouveau refresh token cryptographiquement sécurisé
        /// </summary>
        private string GenerateRefreshToken()
        {
            return _errorHandler.HandleOperation(() =>
            {
                var randomNumber = new byte[64]; // Augmenté pour plus de sécurité
                using var rng = RandomNumberGenerator.Create();
                rng.GetBytes(randomNumber);
                return Convert.ToBase64String(randomNumber);
            },
            "Erreur lors de la génération du refresh token");
        }

        /// <summary>
        /// Génère un nouveau refresh token et l'enregistre en base de données
        /// </summary>
        private async Task<string> GenerateAndSaveRefreshTokenAsync(User user)
        {
            return await _errorHandler.HandleOperationAsync(async () =>
            {
                if (user == null)
                {
                    throw new ArgumentNullException(nameof(user));
                }

                var refreshToken = GenerateRefreshToken();

                // Invalider tous les anciens tokens en une seule opération
                if (_context.RefreshTokens != null)
                {
                    await _context.RefreshTokens
                        .Where(rt => rt.UserId == user.Id && rt.RevokedAt == null)
                        .ExecuteUpdateAsync(s => s.SetProperty(rt => rt.RevokedAt, DateTime.UtcNow));
                }
                else
                {
                    throw new InvalidOperationException("La collection RefreshTokens est inaccessible");
                }

                var newRefreshToken = new RefreshToken
                {
                    Token = refreshToken,
                    UserId = user.Id,
                    ExpiresAt = DateTime.UtcNow.AddDays(GetConfigValue("AppSettings:RefreshTokenExpiryDays", 7)),
                    CreatedAt = DateTime.UtcNow
                };

                _context.RefreshTokens?.Add(newRefreshToken);
                await _context.SaveChangesAsync();

                return refreshToken;
            },
            "Erreur lors de la génération et sauvegarde du refresh token");
        }

        /// <summary>
        /// Crée un JWT token avec les claims appropriés pour l'utilisateur
        /// </summary>
        private string CreateToken(User user)
        {
            return _errorHandler.HandleOperation(() =>
            {
                if (user == null)
                {
                    throw new ArgumentNullException(nameof(user));
                }

                // Récupération des variables d'environnement avec validation
                var jwtKey = GetRequiredEnvironmentVariable("JWT_TOKEN");
                var issuer = GetEnvironmentVariableOrDefault("JWT_ISSUER", "DefaultIssuer");
                var audience = GetEnvironmentVariableOrDefault("JWT_AUDIENCE", "DefaultAudience");

                // Construction des claims
                var claims = BuildUserClaims(user);

                // Création du token
                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
                var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512); // Algorithme plus sécurisé

                int tokenExpiryMinutes = GetConfigValue("AppSettings:TokenExpiryMinutes", 15);

                var token = new JwtSecurityToken(
                    issuer: issuer,
                    audience: audience,
                    claims: claims,
                    notBefore: DateTime.UtcNow,
                    expires: DateTime.UtcNow.AddMinutes(tokenExpiryMinutes),
                    signingCredentials: creds
                );

                return new JwtSecurityTokenHandler().WriteToken(token);
            },
            "Erreur lors de la création du token JWT");
        }

        /// <summary>
        /// Construit les claims pour l'utilisateur, incluant ses rôles
        /// </summary>
        private List<Claim> BuildUserClaims(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString())
            };

            // Traitement des rôles
            if (user.UserRoles?.Any() == true)
            {
                var roles = user.UserRoles
                    .Where(ur => ur.Role != null && !string.IsNullOrEmpty(ur.Role.Name))
                    .Select(ur => ur.Role.Name)
                    .ToList();

                // Ajouter le rôle principal
                if (roles.Count > 0)
                {
                    claims.Add(new Claim("role", roles[0]));
                }

                // Ajouter tous les rôles individuellement
                foreach (var role in roles)
                {
                    claims.Add(new Claim(ClaimTypes.Role, role));
                }

                // Ajouter tous les rôles en JSON pour la compatibilité
                claims.Add(new Claim("roles", System.Text.Json.JsonSerializer.Serialize(roles)));
            }

            return claims;
        }

        #region Méthodes utilitaires

        /// <summary>
        /// Récupère une valeur de configuration avec une valeur par défaut
        /// </summary>
        private int GetConfigValue(string key, int defaultValue)
        {
            if (!int.TryParse(_configuration[key], out int value))
            {
                _logger.LogWarning("Configuration value {Key} not found or invalid, using default: {DefaultValue}", key, defaultValue);
                return defaultValue;
            }
            return value > 0 ? value : defaultValue;
        }

        /// <summary>
        /// Récupère une variable d'environnement obligatoire
        /// </summary>
        private string GetRequiredEnvironmentVariable(string name)
        {
            var value = Environment.GetEnvironmentVariable(name);
            if (string.IsNullOrEmpty(value))
            {
                throw new InvalidOperationException($"La variable d'environnement {name} n'est pas définie.");
            }
            return value;
        }

        /// <summary>
        /// Récupère une variable d'environnement avec valeur par défaut
        /// </summary>
        private string GetEnvironmentVariableOrDefault(string name, string defaultValue)
        {
            var value = Environment.GetEnvironmentVariable(name);
            return string.IsNullOrEmpty(value) ? defaultValue : value;
        }

        #endregion
    }
}