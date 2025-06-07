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
// core services
builder.Services.AddScoped<TemplateService, TemplateService>();
builder.Services.AddScoped<SectionService, SectionService>();
builder.Services.AddScoped<QuestionService, QuestionService>();
builder.Services.AddScoped<PublicationService, PublicationService>();
builder.Services.AddScoped<ProfessorService, ProfessorService>();
builder.Services.AddScoped<ProfessionalService, ProfessionalService>();
// cache + HTTP client
builder.Services.AddHttpClient();                                              // ← register IHttpClientFactory
builder.Services.AddScoped<IFormationCacheService, FormationCacheService>();   // ← inject via interface
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
        
        logger.LogInformation("Checking for pending migrations...");
        
        var pending = await context.Database.GetPendingMigrationsAsync();
        if (pending.Any())
        {
            logger.LogInformation($"Applying {pending.Count()} pending migrations...");
            await context.Database.MigrateAsync();
            logger.LogInformation("Migrations applied.");
        }
        else
        {
            logger.LogInformation("No pending migrations.");
        }
        
        await context.Database.CanConnectAsync();
        logger.LogInformation("Database connection OK.");
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Error applying migrations.");
        throw;
    }
}
