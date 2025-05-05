namespace authentication_system.Models
{
    public class ProfessionalUpdateDTO
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public int GraduationYear { get; set; }
    }
}
