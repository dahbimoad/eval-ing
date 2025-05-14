namespace authentication_system.Models
{
    public class ProfessionalResponseDTO
    {
        public Guid Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;

        public int GraduationYear { get; set; }

        public string? PasswordDefault { get; set; }  // Ajouter ce champ
    }
}
