using System.Collections.Concurrent;

namespace Questionnaire.Application.Services
{
    public class FormationCacheService : IFormationCacheService
    {
        // Using in-memory cache for simplicity - you can replace with Redis, Database, etc.
        private readonly ConcurrentDictionary<string, FormationCacheDto> _cache = new();
        private readonly ILogger<FormationCacheService> _logger;
        private readonly IHttpClientFactory _httpClientFactory;

        public FormationCacheService(
            ILogger<FormationCacheService> logger,
            IHttpClientFactory httpClientFactory)
        {
            _logger = logger;
            _httpClientFactory = httpClientFactory;
        }

        public async Task AddOrUpdateFormationAsync(FormationCreatedEvent formationEvent)
        {
            try
            {
                var formationCache = new FormationCacheDto
                {
                    Title = formationEvent.Title,
                    Description = formationEvent.Description,
                    Code = formationEvent.Code,
                    Credits = formationEvent.Credits
                };

                // Update in-memory cache
                _cache.AddOrUpdate(formationEvent.Code, formationCache, (key, oldValue) => formationCache);

                // Also update via HTTP endpoint if needed
                await UpdateCacheViaHttpAsync(formationCache);

                _logger.LogInformation("Formation cache updated for code: {Code}", formationEvent.Code);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update formation cache for code: {Code}", formationEvent.Code);
                throw;
            }
        }

        private async Task UpdateCacheViaHttpAsync(FormationCacheDto formation)
        {
            try
            {
                var httpClient = _httpClientFactory.CreateClient();
                var json = JsonSerializer.Serialize(formation, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await httpClient.PostAsync("http://localhost:5138/api/formation-cache", content);
                
                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation("Formation cache HTTP endpoint updated successfully for code: {Code}", formation.Code);
                }
                else
                {
                    _logger.LogWarning("Formation cache HTTP endpoint update failed with status: {StatusCode} for code: {Code}", 
                        response.StatusCode, formation.Code);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update formation cache via HTTP for code: {Code}", formation.Code);
            }
        }

        public Task<FormationCacheDto?> GetFormationAsync(string code)
        {
            _cache.TryGetValue(code, out var formation);
            return Task.FromResult(formation);
        }

        public Task<IEnumerable<FormationCacheDto>> GetAllFormationsAsync()
        {
            return Task.FromResult(_cache.Values.AsEnumerable());
        }
    }
}