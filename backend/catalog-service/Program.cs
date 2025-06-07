using Catalog.API.Data;
using Catalog.API.Data.Repositories;
using Catalog.API.Data.Repositories.Interfaces;
using Catalog.API.Services;
using Catalog.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using System.Text;
using Microsoft.OpenApi.Models;
using CatalogService.Services;

var builder = WebApplication.CreateBuilder(args);

// ─── CORS ──────────────────────────────────────────────────────────────────────
var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins, policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// ─── Controllers + JSON cycles ─────────────────────────────────────────────────
builder.Services.AddControllers()
    .AddJsonOptions(opts =>
        opts.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles
    );

// ─── EF Core / PostgreSQL ──────────────────────────────────────────────────────
builder.Services.AddDbContext<ApplicationDbContext>(opts =>
    opts.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
);

// ─── DI : Repositories & Services ───────────────────────────────────────────────
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<IFormationRepository, FormationRepository>();
builder.Services.AddScoped<IModuleRepository, ModuleRepository>();
builder.Services.AddSingleton<IKafkaProducer, KafkaProducer>();
builder.Services.AddScoped<IFormationService, FormationService>();
builder.Services.AddScoped<IModuleService, ModuleService>();

// ─── JWT Authentication Configuration ───────────────────────────────────────────
// Lit la section "Jwt" dans appsettings.json
try 
{
    var jwtSection = builder.Configuration.GetSection("Jwt");
    if (jwtSection == null)
    {
        throw new Exception("JWT configuration section not found");
    }

    var jwtToken = jwtSection["Token"];
    var jwtIssuer = jwtSection["Issuer"];
    var jwtAudience = jwtSection["Audience"];

    // Log the configuration values (for debugging)
    var logger = builder.Services.BuildServiceProvider().GetRequiredService<ILogger<Program>>();
    logger.LogInformation("JWT Token exists: {JwtTokenExists}", !string.IsNullOrEmpty(jwtToken));
    logger.LogInformation("JWT Issuer: {JwtIssuer}", jwtIssuer);
    logger.LogInformation("JWT Audience: {JwtAudience}", jwtAudience);

    // Validate JWT configuration
    if (string.IsNullOrEmpty(jwtToken))
        throw new Exception("Jwt:Token is missing or empty");
    if (string.IsNullOrEmpty(jwtIssuer))
        throw new Exception("Jwt:Issuer is missing or empty");
    if (string.IsNullOrEmpty(jwtAudience))
        throw new Exception("Jwt:Audience is missing or empty");

    builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(opts =>
        {
            opts.RequireHttpsMetadata = false;
            opts.SaveToken = true;
            opts.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = jwtIssuer,
                ValidAudience = jwtAudience,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtToken))
            };
        });
}
catch (Exception ex)
{
    // Log the error
    var logger = builder.Services.BuildServiceProvider().GetRequiredService<ILogger<Program>>();
    logger.LogError(ex, "Error configuring JWT authentication");
    
    // Continue with a fallback configuration or rethrow based on your requirements
    throw; // This will stop the application from starting with a clear error message
}

// ─── AutoMapper ────────────────────────────────────────────────────────────────
builder.Services.AddAutoMapper(typeof(Program));

// ─── Swagger / OpenAPI ─────────────────────────────────────────────────────────
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Catalog API", Version = "v1" });

    // Définition du schéma de sécurité Bearer
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Entrez 'Bearer' + votre token JWT\nExemple : Bearer eyJhbGciOiJIUzI1NiIs...",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer"
    });

    // Exige que le schéma soit envoyé dans l'en‑tête
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme {
                Reference = new OpenApiReference {
                    Type = ReferenceType.SecurityScheme,
                    Id   = "Bearer"
                },
                Scheme = "Bearer",
                Name   = "Bearer",
                In     = ParameterLocation.Header
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// ─── Pipeline HTTP ─────────────────────────────────────────────────────────────
app.UseSwagger();
app.UseSwaggerUI(o =>
{
    o.SwaggerEndpoint("/swagger/v1/swagger.json", "JwtAuthDotNet9 API v1");
    o.RoutePrefix = "docs"; // accessible via /docs
});

app.UseHttpsRedirection();

app.UseCors(MyAllowSpecificOrigins);

app.UseAuthentication(); // <— Ajouté
app.UseAuthorization();

app.MapControllers();

// ─── Apply migrations automatically ────────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var svc = scope.ServiceProvider;
    try
    {
        var ctx = svc.GetRequiredService<ApplicationDbContext>();
        ctx.Database.Migrate();
    }
    catch (Exception ex)
    {
        var log = svc.GetRequiredService<ILogger<Program>>();
        log.LogError(ex, "Erreur lors de la migration auto.");
    }
}

app.Run();