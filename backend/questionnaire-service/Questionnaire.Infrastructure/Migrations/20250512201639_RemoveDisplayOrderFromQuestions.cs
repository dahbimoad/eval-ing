using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Questionnaire.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveDisplayOrderFromQuestions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_section_TemplateId_DisplayOrder",
                table: "section");

            migrationBuilder.DropIndex(
                name: "IX_question_SectionId_DisplayOrder",
                table: "question");

            migrationBuilder.DropColumn(
                name: "DisplayOrder",
                table: "question");

            migrationBuilder.CreateIndex(
                name: "IX_section_TemplateId",
                table: "section",
                column: "TemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_question_SectionId",
                table: "question",
                column: "SectionId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_section_TemplateId",
                table: "section");

            migrationBuilder.DropIndex(
                name: "IX_question_SectionId",
                table: "question");

            migrationBuilder.AddColumn<int>(
                name: "DisplayOrder",
                table: "question",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_section_TemplateId_DisplayOrder",
                table: "section",
                columns: new[] { "TemplateId", "DisplayOrder" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_question_SectionId_DisplayOrder",
                table: "question",
                columns: new[] { "SectionId", "DisplayOrder" },
                unique: true);
        }
    }
}
