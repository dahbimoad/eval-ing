// Models/UserProfileCreateDTO.cs
namespace authentication_system.Models;

public class UserProfileCreateDTO
{
    public string? PhoneNumber { get; set; }
    public string? CIN { get; set; }
    public string? ProfilePictureUrl { get; set; }
    public DateTime? BirthDate { get; set; }
    public string? Address { get; set; }
    public string? AdditionalInfos { get; set; }
}
