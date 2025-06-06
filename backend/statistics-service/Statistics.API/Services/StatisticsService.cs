using Statistics.API.Models;
using Statistics.API.Services;
using System.Text.Json;

namespace Statistics.API.Services
{
    public class StatisticsService : IStatisticsService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<StatisticsService> _logger;
        private readonly string _questionnaireServiceUrl;

        public StatisticsService(HttpClient httpClient, ILogger<StatisticsService> logger, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _logger = logger;
            
            // Priority: Environment variable -> Configuration -> Default
            _questionnaireServiceUrl = Environment.GetEnvironmentVariable("QUESTIONNAIRE_SERVICE_URL") 
                ?? configuration["Services:QuestionnaireService"] 
                ?? "http://localhost:5138";
                
            _logger.LogInformation("Using Questionnaire Service URL: {Url}", _questionnaireServiceUrl);
        }

        public async Task<List<SubmissionExportDto>> GetSubmissionsByPublicationAsync(int publicationId)
        {
            try
            {
                _logger.LogInformation("Fetching submissions for publication {PublicationId} from {ServiceUrl}", 
                    publicationId, _questionnaireServiceUrl);
                    
                var response = await _httpClient.GetAsync($"{_questionnaireServiceUrl}/api/publications/{publicationId}/submissions");
                
                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning("Questionnaire service returned {StatusCode} for publication {PublicationId}. Service might not be running.", 
                        response.StatusCode, publicationId);
                    return new List<SubmissionExportDto>();
                }

                var json = await response.Content.ReadAsStringAsync();
                var submissions = JsonSerializer.Deserialize<List<SubmissionExportDto>>(json, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                _logger.LogInformation("Successfully fetched {Count} submissions for publication {PublicationId}", 
                    submissions?.Count ?? 0, publicationId);

                return submissions ?? new List<SubmissionExportDto>();
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "HTTP error connecting to questionnaire service at {ServiceUrl}. Is the service running?", 
                    _questionnaireServiceUrl);
                return new List<SubmissionExportDto>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching submissions for publication {PublicationId}", publicationId);
                return new List<SubmissionExportDto>();
            }
        }

        public async Task<QuestionnaireStatisticsDto> GetQuestionnaireStatisticsAsync(int publicationId)
        {
            // Get publication info from the all publications endpoint
            var allPublications = await GetAllPublicationsAsync();
            var publicationInfo = allPublications.FirstOrDefault(p => p.Id == publicationId);
            var submissions = await GetSubmissionsByPublicationAsync(publicationId);
            
            if (!submissions.Any())
            {
                return new QuestionnaireStatisticsDto 
                { 
                    PublicationId = publicationId,
                    Title = publicationInfo?.Title ?? "No Data Available",
                    TotalSubmissions = 0,
                    CompletionRate = 0,
                    StartDate = DateTime.UtcNow,
                    EndDate = DateTime.UtcNow
                };
            }

            var stats = new QuestionnaireStatisticsDto
            {
                PublicationId = publicationId,
                Title = publicationInfo?.Title ?? $"Publication {publicationId}",
                TotalSubmissions = submissions.Count,
                CompletionRate = 100.0, // All retrieved submissions are complete
                SectionStatistics = CalculateSectionStatistics(submissions),
                StartDate = submissions.Min(s => s.SubmittedAt),
                EndDate = submissions.Max(s => s.SubmittedAt)
            };

            return stats;
        }

        public async Task<OverallStatisticsDto> GetOverallStatisticsAsync()
        {
            _logger.LogInformation("Calculating overall statistics from questionnaire service");

            // Get all publications from the questionnaire service
            var allPublications = await GetAllPublicationsAsync();
            
            if (!allPublications.Any())
            {
                _logger.LogWarning("No publications found from questionnaire service");
                return new OverallStatisticsDto
                {
                    TotalQuestionnaires = 0,
                    TotalSubmissions = 0,
                    OverallCompletionRate = 0,
                    FormationStatistics = new List<FormationStatisticsDto>()
                };
            }
            
            var totalSubmissions = 0;
            var formationStats = new List<FormationStatisticsDto>();
            var validPublications = 0;

            // For each publication, get its submissions and calculate stats
            foreach (var publication in allPublications)
            {
                var submissions = await GetSubmissionsByPublicationAsync(publication.Id);
                if (submissions.Any())
                {
                    totalSubmissions += submissions.Count;
                    validPublications++;

                    // Calculate average rating for this publication
                    var averageRating = CalculateAverageRating(submissions);
                    
                    formationStats.Add(new FormationStatisticsDto
                    {
                        FormationCode = publication.FormationCode ?? $"FORM_{publication.Id}",
                        FormationTitle = publication.FormationTitle ?? $"Formation {publication.Id}",
                        SubmissionCount = submissions.Count,
                        AverageRating = averageRating
                    });
                }
            }

            // Since we only track completed submissions, completion rate is always 100%
            // In a real scenario, you would track started vs completed submissions
            var overallCompletionRate = validPublications > 0 ? 100.0 : 0.0;

            var overallStats = new OverallStatisticsDto
            {
                TotalQuestionnaires = validPublications,
                TotalSubmissions = totalSubmissions,
                OverallCompletionRate = overallCompletionRate,
                FormationStatistics = formationStats
            };

            _logger.LogInformation("Overall statistics calculated: {TotalQuestionnaires} questionnaires, {TotalSubmissions} submissions", 
                overallStats.TotalQuestionnaires, overallStats.TotalSubmissions);

            return overallStats;
        }

        public async Task<List<QuestionnaireStatisticsSummaryDto>> GetPublicationsSummaryAsync(List<int> publicationIds)
        {
            var summaries = new List<QuestionnaireStatisticsSummaryDto>();
            
            foreach (var publicationId in publicationIds)
            {
                try
                {
                    var stats = await GetQuestionnaireStatisticsAsync(publicationId);
                    if (stats != null)
                    {
                        summaries.Add(new QuestionnaireStatisticsSummaryDto
                        {
                            PublicationId = stats.PublicationId,
                            Title = stats.Title,
                            TotalSubmissions = stats.TotalSubmissions,
                            CompletionRate = stats.CompletionRate,
                            AverageRating = CalculateOverallRating(stats.SectionStatistics)
                        });
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error getting summary for publication {PublicationId}", publicationId);
                }
            }

            return summaries;
        }

        private double CalculateOverallRating(List<SectionStatisticsDto> sections)
        {
            var averageScores = sections
                .SelectMany(s => s.QuestionStatistics)
                .Where(q => q.AverageScore.HasValue)
                .Select(q => q.AverageScore!.Value);

            return averageScores.Any() ? Math.Round(averageScores.Average(), 1) : 0.0;
        }

        public async Task<List<PublicationInfoDto>> GetAllPublicationsAsync()
        {
            try
            {
                _logger.LogInformation("Fetching all publications from questionnaire service");
                var response = await _httpClient.GetAsync($"{_questionnaireServiceUrl}/api/publications");
                
                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError("Failed to fetch publications. Status: {StatusCode}", response.StatusCode);
                    return new List<PublicationInfoDto>();
                }

                var json = await response.Content.ReadAsStringAsync();
                var publications = JsonSerializer.Deserialize<List<PublicationInfoDto>>(json, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                _logger.LogInformation("Successfully fetched {Count} publications", publications?.Count ?? 0);
                return publications ?? new List<PublicationInfoDto>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching all publications from questionnaire service");
                return new List<PublicationInfoDto>();
            }
        }

        private async Task<PublicationInfoDto?> GetPublicationInfoAsync(int publicationId)
        {
            try
            {
                _logger.LogInformation("Fetching publication info for {PublicationId}", publicationId);
                var response = await _httpClient.GetAsync($"{_questionnaireServiceUrl}/api/publications/{publicationId}");
                
                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning("Failed to fetch publication info for {PublicationId}. Status: {StatusCode}", 
                        publicationId, response.StatusCode);
                    return null;
                }

                var json = await response.Content.ReadAsStringAsync();
                var publication = JsonSerializer.Deserialize<PublicationInfoDto>(json, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                return publication;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching publication info for {PublicationId}", publicationId);
                return null;
            }
        }

        private double CalculateAverageRating(List<SubmissionExportDto> submissions)
        {
            var allNumericAnswers = submissions
                .SelectMany(s => s.Sections)
                .SelectMany(sec => sec.Answers)
                .Where(a => a.Type == 1 && a.ValueNumber.HasValue) // Only Likert scale questions
                .Select(a => (double)a.ValueNumber!.Value);

            return allNumericAnswers.Any() ? Math.Round(allNumericAnswers.Average(), 1) : 0.0;
        }

        private List<SectionStatisticsDto> CalculateSectionStatistics(List<SubmissionExportDto> submissions)
        {
            var sectionStats = new List<SectionStatisticsDto>();

            if (!submissions.Any()) return sectionStats;

            var allSections = submissions.SelectMany(s => s.Sections).GroupBy(s => s.SectionId);

            foreach (var sectionGroup in allSections)
            {
                var firstSection = sectionGroup.First();
                var questionStats = CalculateQuestionStatistics(sectionGroup.SelectMany(s => s.Answers).ToList());

                sectionStats.Add(new SectionStatisticsDto
                {
                    SectionId = firstSection.SectionId,
                    SectionTitle = firstSection.Title,
                    QuestionStatistics = questionStats
                });
            }

            return sectionStats;
        }

        private List<QuestionStatisticsDto> CalculateQuestionStatistics(List<AnswerDto> answers)
        {
            var questionStats = new List<QuestionStatisticsDto>();
            var questionGroups = answers.GroupBy(a => a.QuestionId);

            foreach (var questionGroup in questionGroups)
            {
                var firstAnswer = questionGroup.First();
                var questionStat = new QuestionStatisticsDto
                {
                    QuestionId = firstAnswer.QuestionId,
                    QuestionText = firstAnswer.Wording,
                    QuestionType = GetQuestionTypeName(firstAnswer.Type),
                    TotalAnswers = questionGroup.Count()
                };

                // Calculate statistics based on question type
                switch (firstAnswer.Type)
                {
                    case 1: // Likert
                        var numericAnswers = questionGroup.Where(a => a.ValueNumber.HasValue).Select(a => a.ValueNumber!.Value);
                        if (numericAnswers.Any())
                        {
                            questionStat.AverageScore = (double)numericAnswers.Average();
                            questionStat.AnswerDistribution = numericAnswers
                                .GroupBy(v => v)
                                .Select(g => new AnswerDistributionDto
                                {
                                    AnswerValue = g.Key.ToString(),
                                    Count = g.Count(),
                                    Percentage = (double)g.Count() / questionGroup.Count() * 100
                                })
                                .OrderBy(d => decimal.Parse(d.AnswerValue))
                                .ToList();
                        }
                        break;

                    case 2: // Binary
                        var binaryAnswers = questionGroup.Where(a => a.ValueNumber.HasValue).Select(a => a.ValueNumber!.Value);
                        questionStat.AnswerDistribution = binaryAnswers
                            .GroupBy(v => v)
                            .Select(g => new AnswerDistributionDto
                            {
                                AnswerValue = g.Key == 1 ? "Oui" : "Non",
                                Count = g.Count(),
                                Percentage = (double)g.Count() / questionGroup.Count() * 100
                            })
                            .ToList();
                        break;

                    case 3: // Text
                        questionStat.TextAnswers = questionGroup
                            .Where(a => !string.IsNullOrEmpty(a.ValueText))
                            .Select(a => a.ValueText!)
                            .ToList();
                        break;
                }

                questionStats.Add(questionStat);
            }

            return questionStats;
        }

        private string GetQuestionTypeName(int type)
        {
            return type switch
            {
                1 => "Likert",
                2 => "Binary", 
                3 => "Text",
                _ => "Unknown"
            };
        }
    }
}