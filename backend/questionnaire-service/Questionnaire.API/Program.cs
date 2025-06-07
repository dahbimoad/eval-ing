using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Questionnaire.Application.Services;
using Questionnaire.Infrastructure;
using DotNetEnv;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Load environment variables from .env file
Env.Load();

// Add services to the container.
builder.Services.AddDbContext<QuestionnaireDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Postgres")));

// ✅ Register Application Services
builder.Services.AddScoped<TemplateService, TemplateService>();
builder.Services.AddScoped<SectionService, SectionService>();
builder.Services.AddScoped<QuestionService, QuestionService>();
builder.Services.AddScoped<PublicationService, PublicationService>();
builder.Services.AddScoped<ProfessorService, ProfessorService>();
builder.Services.AddScoped<ProfessionalService, ProfessionalService>();
builder.Services.AddScoped<FormationCacheService, FormationCacheService>();
builder.Services.AddScoped<SubmissionExportService, SubmissionExportService>();
builder.Services.AddScoped<ISubmissionExportService, SubmissionExportService>();

// JWT Authentication Configuration
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER"),
            ValidAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE"),
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Environment.GetEnvironmentVariable("JWT_TOKEN")))
        };
    });

// Add HTTP client
builder.Services.AddHttpClient();
builder.Services.AddScoped<IFormationCacheService, FormationCacheService>();

// Kafka consumer
builder.Services.AddHostedService<FormationEventConsumer>();

// Controllers & Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ✅ Health checks
builder.Services.AddHealthChecks(); // 🔥 Ajout ici

var app = builder.Build();

// ✅ Apply migrations automatically
await ApplyMigrationsAsync(app);

// Swagger
app.UseSwagger();
app.UseSwaggerUI(o =>
{
    o.SwaggerEndpoint("/swagger/v1/swagger.json", "JwtAuthDotNet9 API v1");
    o.RoutePrefix = "docs";
});

// Middleware
app.UseAuthentication();
app.UseAuthorization();

// Mapping routes
app.MapControllers();
app.MapHealthChecks("/health"); // 🔥 Ajout ici

app.Run();

// Method to apply migrations automatically
static async Task ApplyMigrationsAsync(WebApplication app)
{
    using var scope = app.Services.CreateScope();
    var services = scope.ServiceProvider;

    try
    {
        var context = services.GetRequiredService<QuestionnaireDbContext>();
        var logger = services.GetRequiredService<ILogger<Program>>();

        logger.LogInformation("Checking for pending migrations...");

        var pendingMigrations = await context.Database.GetPendingMigrationsAsync();

        if (pendingMigrations.Any())
        {
            logger.LogInformation($"Found {pendingMigrations.Count()} pending migration(s). Applying migrations...");
            await context.Database.MigrateAsync();
            logger.LogInformation("Migrations applied successfully!");
        }
        else
        {
            logger.LogInformation("Database is up to date. No migrations needed.");
        }

        await context.Database.CanConnectAsync();
        logger.LogInformation("Database connection verified successfully.");
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while applying migrations.");
        throw;
    }
}
