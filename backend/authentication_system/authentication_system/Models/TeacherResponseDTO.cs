namespace authentication_system.Models
{
    public class TeacherResponseDTO
    {
        public Guid Id { get; set; }
        public string Email { get; set; } = null!;
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string Module { get; set; } = null!;
        public bool IsActive { get; set; }
    }
}
