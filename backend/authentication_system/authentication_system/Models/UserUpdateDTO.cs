namespace authentication_system.Models;

public class UserUpdateDTO
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public string RoleName { get; set; } = string.Empty; // possibilité de changer le rôle
}