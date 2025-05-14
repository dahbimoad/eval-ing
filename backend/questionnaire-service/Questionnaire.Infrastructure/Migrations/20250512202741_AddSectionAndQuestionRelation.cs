using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Questionnaire.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSectionAndQuestionRelation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_section_TemplateId",
                table: "section");

            migrationBuilder.CreateIndex(
                name: "IX_section_TemplateId_DisplayOrder",
                table: "section",
                columns: new[] { "TemplateId", "DisplayOrder" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_section_TemplateId_DisplayOrder",
                table: "section");

            migrationBuilder.CreateIndex(
                name: "IX_section_TemplateId",
                table: "section",
                column: "TemplateId");
        }
    }
}
