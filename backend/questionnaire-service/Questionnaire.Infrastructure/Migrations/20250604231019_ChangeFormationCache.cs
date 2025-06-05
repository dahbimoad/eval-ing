using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Questionnaire.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ChangeFormationCache : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Name",
                table: "formation_cache",
                newName: "Title");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "formation_cache",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<int>(
                name: "Credits",
                table: "formation_cache",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "formation_cache",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "formation_cache",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "formation_cache");

            migrationBuilder.DropColumn(
                name: "Credits",
                table: "formation_cache");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "formation_cache");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "formation_cache");

            migrationBuilder.RenameColumn(
                name: "Title",
                table: "formation_cache",
                newName: "Name");
        }
    }
}
