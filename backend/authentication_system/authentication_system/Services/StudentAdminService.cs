// Services/StudentAdminService.cs
using authentication_system.Data;
using authentication_system.Entities;
using authentication_system.Helpers;
using authentication_system.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace authentication_system.Services;

public class StudentAdminService
{
    private readonly UserDbContext _db;

    public StudentAdminService(UserDbContext db)
    {
        _db = db;
    }

    // ✅ CREATE : retourne l'étudiant avec son mot de passe par défaut
    public async Task<(StudentResponseDTO? Student, string? RawPassword, string? Error)> CreateAsync(StudentCreateDTO dto)
    {
        var email = $"{dto.FirstName.ToLower()}.{dto.LastName.ToLower()}@etu.uae.ac.ma";

        if (await _db.Users.AnyAsync(u => u.Email == email))
            return (null, null, "Un utilisateur avec cet email existe déjà.");

        var role = await _db.Roles.FirstOrDefaultAsync(r => r.Name == "Étudiant");
        if (role == null) return (null, null, "Rôle Étudiant non trouvé.");

        var rawPassword = PasswordHelper.GenerateSecurePassword();

        var user = new User
        {
            Id = Guid.NewGuid(),
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = email,
            CreatedAt = DateTime.UtcNow,
            PasswordHash = new PasswordHasher<User>().HashPassword(null!, rawPassword),
            RoleId = role.Id
        };

        var studentProfile = new StudentProfile
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Filiere = dto.Filiere,
            PasswordDefault = rawPassword // Mot de passe par défaut
        };

        _db.Users.Add(user);
        _db.StudentProfiles.Add(studentProfile);
        await _db.SaveChangesAsync();

        return (ToDto(user, studentProfile), rawPassword, null);
    }

    // ✅ READ ALL
    public async Task<List<StudentResponseDTO>> GetAllAsync()
    {
        var students = await _db.Users
            .Include(u => u.StudentProfile)
            .Where(u => u.Role!.Name == "Étudiant")
            .ToListAsync();

        return students.Select(u => ToDto(u, u.StudentProfile!)).ToList();
    }

    // ✅ READ BY ID
    public async Task<StudentResponseDTO?> GetAsync(Guid id)
    {
        var user = await _db.Users
            .Include(u => u.StudentProfile)
            .FirstOrDefaultAsync(u => u.Id == id && u.Role!.Name == "Étudiant");

        return user is null ? null : ToDto(user, user.StudentProfile!);
    }

    // ✅ UPDATE
    public async Task<(bool Success, string? Error)> UpdateAsync(Guid id, StudentUpdateDTO dto)
    {
        var user = await _db.Users
            .Include(u => u.StudentProfile)
            .FirstOrDefaultAsync(u => u.Id == id && u.Role!.Name == "Étudiant");

        if (user is null) return (false, "Étudiant introuvable.");

        user.FirstName = dto.FirstName;
        user.LastName = dto.LastName;

        user.StudentProfile!.Filiere = dto.Filiere;

        await _db.SaveChangesAsync();
        return (true, null);
    }

    // ✅ DELETE
    public async Task<bool> DeleteAsync(Guid id)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id && u.Role!.Name == "Étudiant");
        if (user == null) return false;

        _db.Users.Remove(user);
        await _db.SaveChangesAsync();
        return true;
    }

    // ✅ DTO Mapping : retourne uniquement le mot de passe par défaut si demandé
    private static StudentResponseDTO ToDto(User u, StudentProfile profile) => new()
    {
        Id = u.Id,
        FirstName = u.FirstName,
        LastName = u.LastName,
        Email = u.Email,
        Filiere = profile.Filiere,
        PasswordDefault = profile.PasswordDefault // Retourne le mot de passe par défaut
    };
}
