// Services/ProfessionalAdminService.cs
using authentication_system.Data;
using authentication_system.Entities;
using authentication_system.Helpers;
using authentication_system.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace authentication_system.Services;

public class ProfessionalAdminService
{
    private readonly UserDbContext _db;

    public ProfessionalAdminService(UserDbContext db)
    {
        _db = db;
    }

    public async Task<(ProfessionalResponseDTO?, string?, string?)> CreateAsync(ProfessionalCreateDTO dto)
    {
        var email = $"{dto.FirstName.ToLower()}.{dto.LastName.ToLower()}@pro.uae.ac.ma";

        if (await _db.Users.AnyAsync(u => u.Email == email))
            return (null, null, "Un utilisateur avec cet email existe déjà.");

        var role = await _db.Roles.FirstOrDefaultAsync(r => r.Name == "Professionnel");
        if (role == null) return (null, null, "Le rôle Professionnel n'existe pas.");

        var rawPassword = PasswordHelper.GenerateSecurePassword();

        var user = new User
        {
            Id = Guid.NewGuid(),
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = email,
            PasswordHash = new PasswordHasher<User>().HashPassword(null!, rawPassword),
            CreatedAt = DateTime.UtcNow,

            RoleId = role.Id
        };

        var profile = new ProfessionalProfile
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            GraduationYear = dto.GraduationYear
        };

        _db.Users.Add(user);
        _db.ProfessionalProfiles.Add(profile);
        await _db.SaveChangesAsync();

        return (ToDTO(user, profile), rawPassword, null);
    }

    public async Task<List<ProfessionalResponseDTO>> GetAllAsync()
    {
        return await _db.ProfessionalProfiles
            .Include(p => p.User)
            .Select(p => ToDTO(p.User, p))
            .ToListAsync();
    }

    public async Task<ProfessionalResponseDTO?> GetAsync(Guid id)
    {
        var profile = await _db.ProfessionalProfiles
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.UserId == id);

        return profile == null ? null : ToDTO(profile.User, profile);
    }

    public async Task<(bool, string?)> UpdateAsync(Guid id, ProfessionalUpdateDTO dto)
    {
        var profile = await _db.ProfessionalProfiles
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.UserId == id);

        if (profile == null) return (false, "Professionnel introuvable.");

        profile.User.FirstName = dto.FirstName;
        profile.User.LastName = dto.LastName;

        profile.GraduationYear = dto.GraduationYear;

        await _db.SaveChangesAsync();
        return (true, null);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var profile = await _db.ProfessionalProfiles.FirstOrDefaultAsync(p => p.UserId == id);
        if (profile == null) return false;

        var user = await _db.Users.FindAsync(id);
        if (user != null) _db.Users.Remove(user);

        _db.ProfessionalProfiles.Remove(profile);
        await _db.SaveChangesAsync();
        return true;
    }

    private static ProfessionalResponseDTO ToDTO(User user, ProfessionalProfile profile) => new()
    {
        Id = user.Id,
        FirstName = user.FirstName,
        LastName = user.LastName,
        Email = user.Email,

        GraduationYear = profile.GraduationYear
    };
}
