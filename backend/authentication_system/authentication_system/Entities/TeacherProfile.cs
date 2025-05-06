namespace authentication_system.Entities
{
    public class TeacherProfile
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;

        public string Module { get; set; } = string.Empty;

        // Nouveau champ pour stocker le mot de passe en clair (usage interne uniquement)
        public string? PasswordDefault { get; set; } // ⚠️ à protéger côté API
    }
}
