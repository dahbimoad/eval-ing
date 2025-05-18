using System.ComponentModel.DataAnnotations;

namespace authentication_system.Models
{
    public class ProfessionalCreateDTO
    {
        [Required(ErrorMessage = "Le prénom est obligatoire")]
        public string FirstName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Le nom est obligatoire")]
        public string LastName { get; set; } = string.Empty;

        [Required(ErrorMessage = "L'email est obligatoire")]
        [EmailAddress(ErrorMessage = "Format d'email invalide")]
        public string Email { get; set; } = string.Empty;
    }
}
