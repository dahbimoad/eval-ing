using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace authentication_system.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PasswordDefault",
                table: "StudentProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PasswordDefault",
                table: "ProfessionalProfiles",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PasswordDefault",
                table: "StudentProfiles");

            migrationBuilder.DropColumn(
                name: "PasswordDefault",
                table: "ProfessionalProfiles");
        }
    }
}
