using Microsoft.EntityFrameworkCore;
using Questionnaire.Application.DTOs;
using Questionnaire.Domain.Entities;
using Questionnaire.Infrastructure;

namespace Questionnaire.Application.Services
{
    public class ProfessionalService
    {
        private readonly QuestionnaireDbContext _context;

        public ProfessionalService(QuestionnaireDbContext context)
        {
            _context = context;
        }

        public async Task<List<QuestionnaireForProfessionalDto>> GetPublishedQuestionnairesForProfAsync()
        {
            var templates = await _context.Templates
                .Where(t => t.Status == TemplateStatus.Published && t.Role == "Professionnel")
                .Include(t => t.Sections)
                    .ThenInclude(s => s.Questions)
                .ToListAsync();

            return templates.Select(t => MapTemplateToDto(t)).ToList();
        }

        public async Task<QuestionnaireForProfessionalDto> GetTemplateDetailsAsync(string templateCode)
        {
            var template = await _context.Templates
                .Where(t => t.TemplateCode == templateCode && t.Status == TemplateStatus.Published && t.Role == "Professionnel")
                .Include(t => t.Sections)
                    .ThenInclude(s => s.Questions)
                .FirstOrDefaultAsync();

            if (template == null)
                throw new KeyNotFoundException("Le questionnaire demandé n'existe pas ou n'est pas accessible.");

            return MapTemplateToDto(template);
        }

        public async Task SubmitAnswersAsync(Guid userId, string templateCode, SubmitAnswersRequestDto request)
        {
            var now = DateTimeOffset.UtcNow;

            var publication = await _context.Publications
                .Where(p => p.TemplateCode == templateCode && p.StartAt <= now && p.EndAt >= now)
                .FirstOrDefaultAsync();

            if (publication == null)
                throw new KeyNotFoundException("Aucune publication active trouvée pour ce questionnaire.");

            var template = await _context.Templates
                .FirstOrDefaultAsync(t => t.TemplateCode == publication.TemplateCode && t.Role == "Professionnel");

            if (template == null)
                throw new InvalidOperationException("Cette publication ne concerne pas les professionnels.");

            var submission = await _context.Submissions
                .Include(s => s.Answers)
                .FirstOrDefaultAsync(s => s.PublicationId == publication.Id && s.UserId == userId);

            if (submission == null)
            {
                submission = new Submission(publication.Id, userId);
                _context.Submissions.Add(submission);
            }

            foreach (var ans in request.Answers)
            {
                submission.AddOrUpdate(ans.QuestionId, ans.ValueNumber, ans.ValueText);
            }

            submission.Complete();
            await _context.SaveChangesAsync();
        }

        // 🔁 Mapping pour factoriser la logique DTO
        private static QuestionnaireForProfessionalDto MapTemplateToDto(QuestionnaireTemplate template)
        {
            return new QuestionnaireForProfessionalDto
            {
                TemplateCode = template.TemplateCode ?? string.Empty,
                Title = template.Title ?? string.Empty,
                Version = template.Version,
                Sections = template.Sections.Select(s => new SectionDto
                {
                    Id = s.Id,
                    Title = s.Title,
                
                    Questions = s.Questions.Select(q => new QuestionDto
                    {
                        Id = q.Id,
                        Wording = q.Wording,
                        Type = q.Type.ToString(),
                        Mandatory = q.Mandatory,
                        MaxLength = q.MaxLength,
                        Options = q.Options.ToList()
                    }).ToList()
                }).ToList()
            };
        }
    }
}