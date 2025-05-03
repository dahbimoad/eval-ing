using System.Text;
using authentication_system.Data;
using authentication_system.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using DotNetEnv;
using authentication_system.Services.Interfaces;



var builder = WebApplication.CreateBuilder(args);

// Charger les variables d'environnement depuis le fichier .env
Env.Load();

// Add controllers
builder.Services.AddControllers();

// Add Swagger and configure JWT security for Swagger UI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(o =>
{
    o.SwaggerDoc("v1", new OpenApiInfo { Title = "JwtAuthDotNet9 API", Version = "v1" });
    var jwtScheme = new OpenApiSecurityScheme
    {
        Scheme = "bearer",
        BearerFormat = "JWT",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Reference = new OpenApiReference
        {
            Id = JwtBearerDefaults.AuthenticationScheme,
            Type = ReferenceType.SecurityScheme
        }
    };
    o.AddSecurityDefinition(jwtScheme.Reference.Id, jwtScheme);
    o.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        { jwtScheme, Array.Empty<string>() }
    });
});

// Configuration de la base de données avec les variables d'environnement
var connectionString = $"Host={Environment.GetEnvironmentVariable("DB_HOST")};" +
                       $"Port={Environment.GetEnvironmentVariable("DB_PORT")};" +
                       $"Database={Environment.GetEnvironmentVariable("DB_NAME")};" +
                       $"Username={Environment.GetEnvironmentVariable("DB_USER")};" +
                       $"Password={Environment.GetEnvironmentVariable("DB_PASSWORD")};";


// Configure PostgreSQL database context
builder.Services.AddDbContext<UserDbContext>(opt =>
    opt.UseNpgsql(connectionString));

// Dependency injection
builder.Services.AddScoped<IUserProfileService, UserProfileService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IAccountService, AccountService>();
builder.Services.AddScoped<IUserAdminService, UserAdminService>();
builder.Services.AddScoped<IErrorHandler, ErrorHandler>();

// Récupérer les variables d'environnement pour JWT
var jwtKey = Environment.GetEnvironmentVariable("JWT_TOKEN");
var issuer = Environment.GetEnvironmentVariable("JWT_ISSUER");
var audience = Environment.GetEnvironmentVariable("JWT_AUDIENCE");

// Vérifier que la clé JWT est définie
if (string.IsNullOrEmpty(jwtKey))
{
    throw new InvalidOperationException("La variable d'environnement JWT_TOKEN n'est pas définie. Vérifiez votre fichier .env.");
}

// Configure JWT Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = issuer,
        ValidAudience = audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
});

var app = builder.Build();

// Swagger middleware (docs only in dev)
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(o =>
    {
        o.SwaggerEndpoint("/swagger/v1/swagger.json", "JwtAuthDotNet9 API v1");
        o.RoutePrefix = "docs";
    });
}

// Seed database (if needed)
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var dbContext = services.GetRequiredService<UserDbContext>();
    await UserDbContext.SeedAsync(dbContext);
}

// Middleware order is important
app.UseHttpsRedirection();
app.UseAuthentication(); // <- Must come before Authorization
app.UseAuthorization();
app.MapControllers();
app.MapGet("/health", () => "Service is running").AllowAnonymous();

app.Run();