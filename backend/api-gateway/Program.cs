var builder = WebApplication.CreateBuilder(args);

// Add health checks
builder.Services.AddHealthChecks();

// Add CORS if needed
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        }
        else
        {
            policy.WithOrigins("https://www.eval-ing.live", "https://eval-ing.live")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        }
    });
});

// Add logging configuration
builder.Logging.AddConsole();
builder.Logging.SetMinimumLevel(LogLevel.Information);

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

// Add middleware for logging requests
app.Use(async (context, next) =>
{
    var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
    logger.LogInformation("Request: {Method} {Path}", context.Request.Method, context.Request.Path);
    
    await next();
    
    logger.LogInformation("Response: {StatusCode}", context.Response.StatusCode);
});

// Enable CORS
app.UseCors();

// Add health check endpoint
app.MapHealthChecks("/health");

// Add a beautiful API documentation landing page
app.MapGet("/", (HttpContext context) => {
    // Use environment-specific URLs
    var isDevelopment = app.Environment.IsDevelopment();
    var baseUrl = isDevelopment ? "http://localhost" : "https://api.eval-ing.live";
    var authPort = isDevelopment ? ":5001" : ":5001";
    var catalogPort = isDevelopment ? ":5003" : ":5003";
    var questionnairePort = isDevelopment ? ":5004" : ":5004";
    var statisticsPort = isDevelopment ? ":5005" : ":5005";
    
    var html = $@"
<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Evaluation Formation API Gateway</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }}
        .container {{
            background: white;
            border-radius: 20px;
            padding: 40px;
            max-width: 800px;
            width: 100%;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }}
        .header {{
            text-align: center;
            margin-bottom: 40px;
        }}
        .header h1 {{
            color: #333;
            font-size: 2.5em;
            margin-bottom: 10px;
        }}
        .header p {{
            color: #666;
            font-size: 1.1em;
        }}
        .status {{
            text-align: center;
            background: #d4edda;
            color: #155724;
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 30px;
            border: 1px solid #c3e6cb;
        }}
        .services {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }}
        .service-card {{
            background: #f8f9fa;
            border-radius: 15px;
            padding: 25px;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            border: 2px solid #e9ecef;
        }}
        .service-card:hover {{
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }}
        .service-card h3 {{
            color: #495057;
            margin-bottom: 15px;
            font-size: 1.3em;
        }}
        .service-card p {{
            color: #6c757d;
            margin-bottom: 15px;
            line-height: 1.5;
        }}
        .swagger-link {{
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            transition: all 0.3s ease;
        }}
        .swagger-link:hover {{
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }}
        .footer {{
            text-align: center;
            color: #6c757d;
            font-size: 0.9em;
            border-top: 1px solid #e9ecef;
            padding-top: 20px;
        }}
        .health-link {{
            color: #28a745;
            text-decoration: none;
            font-weight: 600;
        }}
        .health-link:hover {{
            text-decoration: underline;
        }}
        .env-badge {{
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            font-weight: 600;
            margin-left: 10px;
        }}
        .dev {{
            background: #fff3cd;
            color: #856404;
        }}
        .prod {{
            background: #d1ecf1;
            color: #0c5460;
        }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>Evaluation Formation API</h1>
            <p>Microservices API Gateway - Explore our backend services</p>
        </div>
        
        <div class='status'>
            <strong>API Gateway Status:</strong> Running 
            <span class='env-badge {(isDevelopment ? "dev" : "prod")}'>{(isDevelopment ? "Development" : "Production")}</span>
            <br><a href='/health' class='health-link'>Check Health</a>
        </div>
        
        <div class='services'>
            <div class='service-card'>
                <h3>Authentication Service</h3>
                <p>Handle user authentication, registration, password management, and JWT token operations.</p>
                <a href='{baseUrl}{authPort}/docs' class='swagger-link' target='_blank'>View Swagger Docs</a>
            </div>
            
            <div class='service-card'>
                <h3>Catalog Service</h3>
                <p>Manage formation catalogs, courses, categories, and educational content.</p>
                <a href='{baseUrl}{catalogPort}/docs' class='swagger-link' target='_blank'>View Swagger Docs</a>
            </div>
            
            <div class='service-card'>
                <h3>Questionnaire Service</h3>
                <p>Create and manage questionnaires, surveys, questions, and response collection.</p>
                <a href='{baseUrl}{questionnairePort}/docs' class='swagger-link' target='_blank'>View Swagger Docs</a>
            </div>
            
            <div class='service-card'>
                <h3>Statistics Service</h3>
                <p>Generate analytics, reports, and statistical data from user interactions and evaluations.</p>
                <a href='{baseUrl}{statisticsPort}/docs' class='swagger-link' target='_blank'>View Swagger Docs</a>
            </div>
        </div>
        
        <div class='footer'>
            <p>Environment: {(isDevelopment ? "Development" : "Production")} | Last Updated: {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss UTC}</p>
            <p>For API support, visit our <a href='https://www.eval-ing.live' style='color: #667eea;'>main application</a></p>
        </div>
    </div>
</body>
</html>";
    
    return Results.Content(html, "text/html");
});

app.Run();