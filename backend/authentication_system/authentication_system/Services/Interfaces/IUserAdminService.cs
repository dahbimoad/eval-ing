// Services/IUserAdminService.cs
using authentication_system.Models;

namespace authentication_system.Services;

public interface IUserAdminService
{
    Task<(UserResponseDTO? user, string? rawPassword, string? error)> CreateAsync(UserCreateDTO dto);
    Task<IEnumerable<UserResponseDTO>> GetAllAsync();
    Task<UserResponseDTO?> GetAsync(Guid id);
    Task<(bool ok, string? error)> UpdateAsync(Guid id, UserUpdateDTO dto);
    Task<bool> DeleteAsync(Guid id);
}
