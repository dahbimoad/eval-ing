using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Questionnaire.Application.DTOs;
using Questionnaire.Domain.Entities;
using Questionnaire.Infrastructure;          // QuestionnaireDbContext

namespace Questionnaire.Application.Services;

/// <summary>
/// Keeps a local cache of formations in sync with the Formation micro-service.
/// </summary>
public sealed class FormationCacheService
{
    private readonly QuestionnaireDbContext _context;

    public FormationCacheService(QuestionnaireDbContext context) =>
        _context = context;

    /// Inserts or updates a single formation row keyed by Code.
    public async Task AddOrUpdateAsync(FormationDto dto)
    {
        var cache = await _context.Formations
                                  .FirstOrDefaultAsync(f => f.Code == dto.Code);

        if (cache is null)
        {
            cache = new FormationCache
            {
                Code      = dto.Code,
                CreatedAt = DateTime.UtcNow
            };
            _context.Formations.Add(cache);
        }

        cache.Title       = dto.Title;
        cache.Description = dto.Description;
        cache.Credits     = dto.Credits;
        cache.UpdatedAt   = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }
}
