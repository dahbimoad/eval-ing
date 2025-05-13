using System.Net.Http.Headers;
using System.Text.Json;

public interface IAuthServiceClient
{
    Task<bool> ValidateTokenAsync(string token);
}

public class AuthServiceClient : IAuthServiceClient
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<AuthServiceClient> _logger;

    public AuthServiceClient(HttpClient httpClient, ILogger<AuthServiceClient> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<bool> ValidateTokenAsync(string token)
    {
        try
        {
            // Validate token format first
            if (string.IsNullOrWhiteSpace(token) )
            {
                _logger.LogWarning("Empty token provided");
                return false;
            }

            var request = new HttpRequestMessage(HttpMethod.Get, "/health");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            
            var response = await _httpClient.SendAsync(request);
            
            // Detailed logging
            if (!response.IsSuccessStatusCode)
            {
                var responseContent = await response.Content.ReadAsStringAsync();
                _logger.LogError($"Auth service validation failed. Status: {response.StatusCode}. Response: {responseContent}");
                
                // Try to parse error response
                try 
                {
                    var errorResponse = JsonSerializer.Deserialize<AuthErrorResponse>(responseContent);
                    _logger.LogError($"Auth service error details: {errorResponse?.Title} - {errorResponse?.Detail}");
                }
                catch { /* Ignore parsing errors */ }
            }

            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to validate token with AuthService");
            return false;
        }
    }

    private class AuthErrorResponse
    {
        public string? Title { get; set; }
        public string? Detail { get; set; }
        public int? Status { get; set; }
    }
}
