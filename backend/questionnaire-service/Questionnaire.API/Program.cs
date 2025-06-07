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

// ✅ Register TemplateService here
builder.Services.AddScoped<TemplateService, TemplateService>();
// ✅ Register SectionService here
builder.Services.AddScoped<SectionService, SectionService>();
// ✅ Register QuestionService here
builder.Services.AddScoped<QuestionService, QuestionService>();
// ✅ Register PublicationService here
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

// Add HTTP client for cache endpoint
builder.Services.AddHttpClient();

// Add formation cache service
builder.Services.AddScoped<IFormationCacheService, FormationCacheService>();


// Add Kafka consumer as hosted service
builder.Services.AddHostedService<FormationEventConsumer>();
// Register other services like controllers and Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// ✅ Apply migrations automatically at startup
await ApplyMigrationsAsync(app);

// Configure the HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI(o =>
{
    o.SwaggerEndpoint("/swagger/v1/swagger.json", "JwtAuthDotNet9 API v1");
    o.RoutePrefix = "docs"; // accessible via /docs
});

app.UseAuthentication(); // Apply authentication middleware
app.UseAuthorization();  // Apply authorization middleware

app.MapControllers();

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
        
        // Check if there are pending migrations
        var pendingMigrations = await context.Database.GetPendingMigrationsAsync();
        
        if (pendingMigrations.Any())
        {
            logger.LogInformation($"Found {pendingMigrations.Count()} pending migration(s). Applying migrations...");
            
            // Apply pending migrations
            await context.Database.MigrateAsync();
            
            logger.LogInformation("Migrations applied successfully!");
        }
        else
        {
            logger.LogInformation("Database is up to date. No migrations needed.");
        }
        
        // Ensure database can connect
        await context.Database.CanConnectAsync();
        logger.LogInformation("Database connection verified successfully.");
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while applying migrations.");
        
        // You can choose to throw the exception to prevent app startup
        // or handle it gracefully depending on your requirements
        throw;
    }
}