// Services/IAccountService.cs
using authentication_system.Models;

namespace authentication_system.Services;

public interface IAccountService
{
    Task<ChangePasswordResult> ChangePasswordAsync(Guid userId, ChangePasswordDTO dto);

}
