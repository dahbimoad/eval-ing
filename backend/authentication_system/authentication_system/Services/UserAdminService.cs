// Services/UserAdminService.cs
using authentication_system.Data;
using authentication_system.Entities;
using authentication_system.Helpers;
using authentication_system.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace authentication_system.Services;

public class UserAdminService(UserDbContext db) : IUserAdminService
{
    public async Task<(UserResponseDTO?, string?, string?)> CreateAsync(UserCreateDTO dto)
    {
        var email = $"{dto.FirstName.ToLower()}.{dto.LastName.ToLower()}@etu.uae.ac.ma";

        if (await db.Users.AnyAsync(u => u.Email == email))
            return (null, null, "Un utilisateur avec cet email existe déjà.");

        var role = await db.Roles.FirstOrDefaultAsync(r => r.Name == dto.RoleName);
        if (role == null) return (null, null, $"Rôle '{dto.RoleName}' introuvable.");

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

        db.Users.Add(user);
        await db.SaveChangesAsync();

        return (ToDto(user, role.Name), rawPassword, null);
    }

    public async Task<IEnumerable<UserResponseDTO>> GetAllAsync() =>
        await db.Users
            .Include(u => u.Role)
            .Select(u => ToDto(u, u.Role != null ? u.Role.Name : ""))
            .ToListAsync();

    public async Task<UserResponseDTO?> GetAsync(Guid id)
    {
        var user = await db.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == id);

        return user == null
            ? null
            : ToDto(user, user.Role?.Name ?? "");
    }

    public async Task<(bool, string?)> UpdateAsync(Guid id, UserUpdateDTO dto)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == id);
        if (user == null) return (false, "Utilisateur introuvable.");

        var newRole = await db.Roles.FirstOrDefaultAsync(r => r.Name == dto.RoleName);
        if (newRole == null) return (false, "Rôle invalide.");

        user.FirstName = dto.FirstName;
        user.LastName = dto.LastName;
        user.IsActive = dto.IsActive;
        user.RoleId = newRole.Id;

        await db.SaveChangesAsync();
        return (true, null);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var user = await db.Users.FindAsync(id);
        if (user == null) return false;
        db.Users.Remove(user);
        await db.SaveChangesAsync();
        return true;
    }

    private static UserResponseDTO ToDto(User u, string role) => new()
    {
        Id = u.Id,
        FirstName = u.FirstName,
        LastName = u.LastName,
        Email = u.Email,
        IsActive = u.IsActive,
        Role = role
    };
}
