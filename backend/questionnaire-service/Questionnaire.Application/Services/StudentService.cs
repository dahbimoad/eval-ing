using Microsoft.EntityFrameworkCore;
using Questionnaire.Application.DTOs;
using Questionnaire.Domain.Entities;
using Questionnaire.Infrastructure;

namespace Questionnaire.Application.Services
{
    public class StudentService
    {
        private readonly QuestionnaireDbContext _context;

        public StudentService(QuestionnaireDbContext context)
        {
            _context = context;
        }

        public async Task<List<QuestionnaireForStudentDto>> GetPublishedQuestionnairesForStudentAsync(string filiereCode)
        {
            var now = DateTimeOffset.UtcNow;

            // Find the filiere by code
            var filiere = await _context.Formations
                .FirstOrDefaultAsync(f => f.Code == filiereCode);

            if (filiere == null)
                throw new KeyNotFoundException($"Filiere with code '{filiereCode}' not found.");

            // Get active publications for this filiere
            var activePublications = await _context.Publications
                .Where(p => p.FiliereId == filiere.Id && p.StartAt <= now && p.EndAt >= now)
                .ToListAsync();

            if (!activePublications.Any())
                return new List<QuestionnaireForStudentDto>();

            // Get templates for these publications that are for students
            var templateCodes = activePublications.Select(p => p.TemplateCode).Distinct();
            
            var templates = await _context.Templates
                .Where(t => templateCodes.Contains(t.TemplateCode) && 
                           t.Status == TemplateStatus.Published && 
                           t.Role == "Étudiant")
                .Include(t => t.Sections)
                    .ThenInclude(s => s.Questions)
                .ToListAsync();

            return templates.Select(t => MapTemplateToStudentDto(t, filiereCode)).ToList();
        }

        // 🆕 NEW METHOD: Get specific questionnaire details for student
        public async Task<QuestionnaireForStudentDto> GetTemplateDetailsAsync(string templateCode, string filiereCode)
        {
            var now = DateTimeOffset.UtcNow;

            // Find the filiere by code
            var filiere = await _context.Formations
                .FirstOrDefaultAsync(f => f.Code == filiereCode);

            if (filiere == null)
                throw new KeyNotFoundException($"Filiere with code '{filiereCode}' not found.");

            // Check if there's an active publication for this template and filiere
            var activePublication = await _context.Publications
                .Where(p => p.TemplateCode == templateCode && 
                           p.FiliereId == filiere.Id && 
                           p.StartAt <= now && 
                           p.EndAt >= now)
                .FirstOrDefaultAsync();

            if (activePublication == null)
                throw new KeyNotFoundException("No active publication found for this questionnaire in your filiere.");

            // Get the template details
            var template = await _context.Templates
                .Where(t => t.TemplateCode == templateCode && 
                           t.Status == TemplateStatus.Published && 
                           t.Role == "Étudiant")
                .Include(t => t.Sections)
                    .ThenInclude(s => s.Questions)
                .FirstOrDefaultAsync();

            if (template == null)
                throw new KeyNotFoundException("The requested questionnaire does not exist or is not accessible.");

            return MapTemplateToStudentDto(template, filiereCode);
        }

        public async Task SubmitAnswersAsync(Guid userId, string templateCode, string filiereCode, SubmitAnswersRequestDto request)
        {
            var now = DateTimeOffset.UtcNow;

            // Find the filiere by code
            var filiere = await _context.Formations
                .FirstOrDefaultAsync(f => f.Code == filiereCode);

            if (filiere == null)
                throw new KeyNotFoundException($"Filiere with code '{filiereCode}' not found.");

            // Find the active publication for this template and filiere
            var publication = await _context.Publications
                .Where(p => p.TemplateCode == templateCode && 
                           p.FiliereId == filiere.Id && 
                           p.StartAt <= now && 
                           p.EndAt >= now)
                .FirstOrDefaultAsync();

            if (publication == null)
                throw new KeyNotFoundException("No active publication found for this questionnaire in your filiere.");

            // Verify that the publication corresponds to a template for students
            var template = await _context.Templates
                .FirstOrDefaultAsync(t => t.TemplateCode == publication.TemplateCode && 
                                         t.Role == "Étudiant");

            if (template == null)
                throw new InvalidOperationException("This publication is not for Students");

            // Check if student already has a submission for this publication
            var submission = await _context.Submissions
                .Include(s => s.Answers)
                .FirstOrDefaultAsync(s => s.PublicationId == publication.Id && s.UserId == userId);

            if (submission == null)
            {
                submission = new Submission(publication.Id, userId);
                _context.Submissions.Add(submission);
            }

            // Add or update answers
            foreach (var ans in request.Answers)
            {
                submission.AddOrUpdate(ans.QuestionId, ans.ValueNumber, ans.ValueText);
            }

            submission.Complete();

            await _context.SaveChangesAsync();
        }

        // 🔁 Mapping method to convert Template to StudentDto
        private static QuestionnaireForStudentDto MapTemplateToStudentDto(QuestionnaireTemplate template, string filiereCode)
        {
            return new QuestionnaireForStudentDto
            {
                TemplateCode = template.TemplateCode ?? string.Empty,
                Title = template.Title ?? string.Empty,
                Version = template.Version,
                FiliereCode = filiereCode,
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