// Services/StudentAdminService.cs
using authentication_system.Data;
using authentication_system.Entities;
using authentication_system.Helpers;
using authentication_system.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace authentication_system.Services;

public class StudentAdminService(UserDbContext db)
{
    public async Task<(StudentResponseDTO?, string?, string?)> CreateAsync(StudentCreateDTO dto)
    {
        var email = $"{dto.FirstName.ToLower()}.{dto.LastName.ToLower()}@etu.uae.ac.ma";

        if (await db.Users.AnyAsync(u => u.Email == email))
            return (null, null, "Un utilisateur avec cet email existe déjà.");

        var role = await db.Roles.FirstOrDefaultAsync(r => r.Name == "Étudiant");
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
            Filiere = dto.Filiere
        };

        db.Users.Add(user);
        db.StudentProfiles.Add(studentProfile);
        await db.SaveChangesAsync();

        return (ToDto(user, studentProfile), rawPassword, null);
    }

    public async Task<IEnumerable<StudentResponseDTO>> GetAllAsync()
    {
        return await db.Users
            .Include(u => u.StudentProfile)
            .Where(u => u.Role!.Name == "Étudiant")
            .Select(u => ToDto(u, u.StudentProfile!))
            .ToListAsync();
    }

    public async Task<StudentResponseDTO?> GetAsync(Guid id)
    {
        var user = await db.Users
            .Include(u => u.StudentProfile)
            .FirstOrDefaultAsync(u => u.Id == id && u.Role!.Name == "Étudiant");

        return user is null ? null : ToDto(user, user.StudentProfile!);
    }

    public async Task<(bool, string?)> UpdateAsync(Guid id, StudentUpdateDTO dto)
    {
        var user = await db.Users
            .Include(u => u.StudentProfile)
            .FirstOrDefaultAsync(u => u.Id == id && u.Role!.Name == "Étudiant");

        if (user is null) return (false, "Étudiant introuvable.");

        user.FirstName = dto.FirstName;
        user.LastName = dto.LastName;
        user.IsActive = dto.IsActive;
        user.StudentProfile!.Filiere = dto.Filiere;

        await db.SaveChangesAsync();
        return (true, null);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == id && u.Role!.Name == "Étudiant");
        if (user == null) return false;
        db.Users.Remove(user);
        await db.SaveChangesAsync();
        return true;
    }

    private static StudentResponseDTO ToDto(User u, StudentProfile profile) => new()
    {
        Id = u.Id,
        FirstName = u.FirstName,
        LastName = u.LastName,
        Email = u.Email,
        IsActive = u.IsActive,
        Filiere = profile.Filiere
    };
}
