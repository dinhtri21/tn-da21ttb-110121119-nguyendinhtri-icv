using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace iCV.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Update1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "provider",
                table: "user",
                type: "varchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_user_email",
                table: "user",
                column: "email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_user_email",
                table: "user");

            migrationBuilder.DropColumn(
                name: "provider",
                table: "user");
        }
    }
}
