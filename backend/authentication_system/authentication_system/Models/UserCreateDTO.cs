namespace authentication_system.Models;

public class UserCreateDTO
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string RoleName { get; set; } = string.Empty; // ex. "Student", "Teacher"
}