using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.OpenApi.Models;
using Questionnaire.Application.Services;
using Questionnaire.Infrastructure;
using DotNetEnv;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ──────────────────────────────────────────────────────────────────────
// 1. Load environment variables from .env
// ──────────────────────────────────────────────────────────────────────
Env.Load();

// ──────────────────────────────────────────────────────────────────────
// 2. Database
// ──────────────────────────────────────────────────────────────────────
builder.Services.AddDbContext<QuestionnaireDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Postgres")));

// ──────────────────────────────────────────────────────────────────────
// 3. Dependency Injection for your application services
// ──────────────────────────────────────────────────────────────────────
builder.Services.AddScoped<TemplateService, TemplateService>();
builder.Services.AddScoped<SectionService, SectionService>();
builder.Services.AddScoped<QuestionService, QuestionService>();
builder.Services.AddScoped<PublicationService, PublicationService>();
builder.Services.AddScoped<ProfessorService, ProfessorService>();
builder.Services.AddScoped<ProfessionalService, ProfessionalService>();
builder.Services.AddHttpClient();
builder.Services.AddScoped<IFormationCacheService, FormationCacheService>();
builder.Services.AddScoped<ISubmissionExportService, SubmissionExportService>();
builder.Services.AddScoped<FormationCacheService, FormationCacheService>();
builder.Services.AddScoped<StudentService, StudentService>();

// ──────────────────────────────────────────────────────────────────────
// 4. CORS – allow your Vite dev‐server origin
// ──────────────────────────────────────────────────────────────────────
const string AllowFrontend = "_allowFrontend";
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: AllowFrontend, policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// ──────────────────────────────────────────────────────────────────────
// 5. JWT Authentication
// ──────────────────────────────────────────────────────────────────────
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
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(Environment.GetEnvironmentVariable("JWT_TOKEN") ?? "")
            )
        };
    });

// ──────────────────────────────────────────────────────────────────────
// 6. Controllers & Swagger with JWT support
// ──────────────────────────────────────────────────────────────────────
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Questionnaire API",
        Version = "v1"
    });

    var jwtSecurityScheme = new OpenApiSecurityScheme
    {
        Scheme = "bearer",
        BearerFormat = "JWT",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Description = "Enter your JWT Bearer token below (e.g., Bearer eyJhbGci...)",

        Reference = new OpenApiReference
        {
            Id = JwtBearerDefaults.AuthenticationScheme,
            Type = ReferenceType.SecurityScheme
        }
    };

    options.AddSecurityDefinition(jwtSecurityScheme.Reference.Id, jwtSecurityScheme);
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        { jwtSecurityScheme, Array.Empty<string>() }
    });
});

// ──────────────────────────────────────────────────────────────────────
// ✅ 7. HealthChecks
// ──────────────────────────────────────────────────────────────────────
builder.Services.AddHealthChecks(); // ✅ AJOUT ICI

var app = builder.Build();
await ApplyMigrationsAsync(app);

// ──────────────────────────────────────────────────────────────────────
// 8. Configure HTTP pipeline
// ──────────────────────────────────────────────────────────────────────
// 8. Middleware Pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Questionnaire API V1");
        c.RoutePrefix = "docs"; // 👈 Swagger disponible à /docs/index.html
    });
}


// ★ CORS → Authentication → Authorization
app.UseCors(AllowFrontend);
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/health"); // ✅ AJOUT ICI

app.Run();

/// <summary>
/// Optional helper to apply EF Core migrations on startup.
/// </summary>
static async Task ApplyMigrationsAsync(WebApplication app)
{
    using var scope = app.Services.CreateScope();
    var services = scope.ServiceProvider;

    try
    {
        var context = services.GetRequiredService<QuestionnaireDbContext>();
        var logger = services.GetRequiredService<ILogger<Program>>();

        logger.LogInformation("Checking database connection...");
        await context.Database.CanConnectAsync();
        logger.LogInformation("Database connection OK.");

        logger.LogInformation("Checking for pending migrations...");
        var pending = await context.Database.GetPendingMigrationsAsync();
        
        if (pending.Any())
        {
            logger.LogInformation($"Found {pending.Count()} pending migrations: {string.Join(", ", pending)}");
            
            try
            {
                await context.Database.MigrateAsync();
                logger.LogInformation("All migrations applied successfully.");
            }
            catch (Npgsql.PostgresException ex) when (ex.SqlState == "42710") // Type already exists
            {
                logger.LogWarning($"Migration failed due to existing types: {ex.MessageText}");
                logger.LogInformation("Attempting to mark migrations as applied...");
                
                // Mark problematic migrations as applied without actually running them
                var appliedMigrations = await context.Database.GetAppliedMigrationsAsync();
                var migrationsToMark = pending.Where(p => !appliedMigrations.Contains(p));
                
                foreach (var migration in migrationsToMark)
                {
                    logger.LogInformation($"Marking migration as applied: {migration}");
                    await context.Database.ExecuteSqlRawAsync(
                        "INSERT INTO \"__EFMigrationsHistory\" (\"MigrationId\", \"ProductVersion\") VALUES ({0}, {1}) ON CONFLICT DO NOTHING",
                        migration, 
                        "8.0.0" // Use your actual EF version
                    );
                }
                
                logger.LogInformation("Migration history updated.");
            }
        }
        else
        {
            logger.LogInformation("No pending migrations.");
        }
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Error during database initialization.");
        
        // In production, you might want to continue running even if migrations fail
        // throw; // Comment this out if you want the app to start anyway
        
        // For development, keep the throw to catch issues early
        if (app.Environment.IsDevelopment())
        {
            throw;
        }
    }
}