namespace QuestionService.Services
{
    public interface IFormationCacheService
    {
        Task AddOrUpdateFormationAsync(FormationCreatedEvent formationEvent);
        Task<FormationCacheDto?> GetFormationAsync(string code);
        Task<IEnumerable<FormationCacheDto>> GetAllFormationsAsync();
    }
}