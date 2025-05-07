// Services/TeacherAdminService.cs
using authentication_system.Data;
using authentication_system.Entities;
using authentication_system.Helpers;
using authentication_system.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace authentication_system.Services;

public class TeacherAdminService
{
    private readonly UserDbContext _db;

    public TeacherAdminService(UserDbContext db)
    {
        _db = db;
    }

    // ✅ CREATE : retourne seulement le Teacher avec son mot de passe par défaut
    public async Task<(TeacherResponseDTO? Teacher, string? Error)> CreateAsync(TeacherCreateDTO dto)
    {
        var email = $"{dto.FirstName.ToLower()}.{dto.LastName.ToLower()}@prof.uae.ac.ma";

        if (await _db.Users.AnyAsync(u => u.Email == email))
            return (null, "Un utilisateur avec cet email existe déjà.");

        var teacherRole = await _db.Roles.FirstOrDefaultAsync(r => r.Name == "Enseignant");
        if (teacherRole == null)
            return (null, "Le rôle Enseignant n'existe pas.");

        var rawPassword = PasswordHelper.GenerateSecurePassword();

        var user = new User
        {
            Id = Guid.NewGuid(),
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = email,
            PasswordHash = new PasswordHasher<User>().HashPassword(null!, rawPassword),
            CreatedAt = DateTime.UtcNow,

            RoleId = teacherRole.Id
        };

        var profile = new TeacherProfile
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Module = dto.Module,
            PasswordDefault = rawPassword // important : stocké en base
        };

        await _db.Users.AddAsync(user);
        await _db.TeacherProfiles.AddAsync(profile);
        await _db.SaveChangesAsync();

        var dtoWithPassword = ToDTO(user, profile, includePassword: true);
        return (dtoWithPassword, null);
    }

    // ✅ READ ALL
    public async Task<List<TeacherResponseDTO>> GetAllAsync()
    {
        var teachers = await _db.TeacherProfiles
            .Include(tp => tp.User)
            .ToListAsync();

        return teachers.Select(tp => ToDTO(tp.User, tp, includePassword: true)).ToList();
    }

    // ✅ READ BY ID
    public async Task<TeacherResponseDTO?> GetAsync(Guid id)
    {
        var tp = await _db.TeacherProfiles
            .Include(tp => tp.User)
            .FirstOrDefaultAsync(tp => tp.UserId == id);

        return tp == null ? null : ToDTO(tp.User, tp, includePassword: true);
    }

    // ✅ UPDATE
    public async Task<(bool Success, string? Error)> UpdateAsync(Guid id, TeacherUpdateDTO dto)
    {
        var teacher = await _db.TeacherProfiles
            .Include(tp => tp.User)
            .FirstOrDefaultAsync(tp => tp.UserId == id);

        if (teacher == null) return (false, "Enseignant introuvable.");

        teacher.User.FirstName = dto.FirstName;
        teacher.User.LastName = dto.LastName;

        teacher.Module = dto.Module;

        await _db.SaveChangesAsync();
        return (true, null);
    }

    // ✅ DELETE
    public async Task<bool> DeleteAsync(Guid id)
    {
        var teacher = await _db.TeacherProfiles.FirstOrDefaultAsync(tp => tp.UserId == id);
        if (teacher == null) return false;

        var user = await _db.Users.FindAsync(id);
        if (user != null) _db.Users.Remove(user);

        _db.TeacherProfiles.Remove(teacher);
        await _db.SaveChangesAsync();
        return true;
    }

    // ✅ Mapping : inclure le mot de passe par défaut si demandé
    private static TeacherResponseDTO ToDTO(User user, TeacherProfile profile, bool includePassword = false) => new()
    {
        Id = user.Id,
        FirstName = user.FirstName,
        LastName = user.LastName,
        Email = user.Email,

        Module = profile.Module ?? "",
        PasswordDefault = includePassword ? profile.PasswordDefault : null
    };
}
