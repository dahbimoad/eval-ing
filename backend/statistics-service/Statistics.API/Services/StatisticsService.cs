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
            _questionnaireServiceUrl = configuration["Services:QuestionnaireService"] ?? "http://localhost:5138";
        }

        public async Task<List<SubmissionExportDto>> GetSubmissionsByPublicationAsync(int publicationId)
        {
            try
            {
                var response = await _httpClient.GetAsync($"{_questionnaireServiceUrl}/api/publications/{publicationId}/submissions");
                response.EnsureSuccessStatusCode();

                var json = await response.Content.ReadAsStringAsync();
                var submissions = JsonSerializer.Deserialize<List<SubmissionExportDto>>(json, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                return submissions ?? new List<SubmissionExportDto>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching submissions for publication {PublicationId}", publicationId);
                return new List<SubmissionExportDto>();
            }
        }

        public async Task<QuestionnaireStatisticsDto> GetQuestionnaireStatisticsAsync(int publicationId)
        {
            var submissions = await GetSubmissionsByPublicationAsync(publicationId);
            
            if (!submissions.Any())
            {
                return new QuestionnaireStatisticsDto 
                { 
                    PublicationId = publicationId,
                    Title = "No Data Available",
                    TotalSubmissions = 0,
                    CompletionRate = 0
                };
            }

            var stats = new QuestionnaireStatisticsDto
            {
                PublicationId = publicationId,
                Title = $"Questionnaire {publicationId}",
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
            // Mock data for now - you can enhance this later
            return new OverallStatisticsDto
            {
                TotalQuestionnaires = 5,
                TotalSubmissions = 150,
                OverallCompletionRate = 85.5,
                FormationStatistics = new List<FormationStatisticsDto>
                {
                    new() { FormationCode = "GINF1", FormationTitle = "Génie Informatique 1ère année", SubmissionCount = 45, AverageRating = 4.2 },
                    new() { FormationCode = "GINF2", FormationTitle = "Génie Informatique 2ème année", SubmissionCount = 38, AverageRating = 4.1 },
                    new() { FormationCode = "GSTR", FormationTitle = "Génie STR", SubmissionCount = 32, AverageRating = 3.9 }
                }
            };
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