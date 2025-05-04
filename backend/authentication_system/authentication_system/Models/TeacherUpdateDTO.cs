namespace authentication_system.Models
{
    // Models/TeacherUpdateDTO.cs
    public class TeacherUpdateDTO
    {
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public bool IsActive { get; set; }
        public string Module { get; set; } = null!;
    }

}
