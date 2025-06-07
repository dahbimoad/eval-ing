using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authentication.JwtBearer;
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
builder.Services.AddScoped<TemplateService,      TemplateService>();
builder.Services.AddScoped<SectionService,       SectionService>();
builder.Services.AddScoped<QuestionService,      QuestionService>();
builder.Services.AddScoped<PublicationService,   PublicationService>();
builder.Services.AddScoped<ProfessorService,     ProfessorService>();
builder.Services.AddScoped<ProfessionalService,  ProfessionalService>();
builder.Services.AddScoped<FormationCacheService,FormationCacheService>();
builder.Services.AddScoped<ISubmissionExportService, SubmissionExportService>();

// ──────────────────────────────────────────────────────────────────────
// 4. CORS – allow your Vite dev‐server origin
// ──────────────────────────────────────────────────────────────────────
const string AllowFrontend = "_allowFrontend";
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: AllowFrontend, policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")  // ← must exactly match your front-end
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
        options.SaveToken            = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidateAudience         = true,
            ValidateLifetime         = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer   = Environment.GetEnvironmentVariable("JWT_ISSUER"),
            ValidAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE"),
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(
                    Environment.GetEnvironmentVariable("JWT_TOKEN") ?? ""
                )
            )
        };
    });

// ──────────────────────────────────────────────────────────────────────
// 6. Controllers & Swagger
// ──────────────────────────────────────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// ✅ Apply migrations automatically at startup
await ApplyMigrationsAsync(app);

// ──────────────────────────────────────────────────────────────────────
// 7. Configure HTTP pipeline
// ──────────────────────────────────────────────────────────────────────
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Questionnaire API V1");
        c.RoutePrefix = string.Empty;
    });
}

// ★ **CORS must come before** Authentication + Authorization
app.UseCors(AllowFrontend);

app.UseAuthentication();
app.UseAuthorization();

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