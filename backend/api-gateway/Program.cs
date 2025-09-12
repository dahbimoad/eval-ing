var builder = WebApplication.CreateBuilder(args);

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
    var baseUrl = isDevelopment ? "http://localhost" : "http://209.38.233.63";
    var authPort = isDevelopment ? ":5001" : ":5001";
    var catalogPort = isDevelopment ? ":5003" : ":5003";
    var questionnairePort = isDevelopment ? ":5004" : ":5004";
    var statisticsPort = isDevelopment ? ":5005" : ":5005";
    var envBadgeClass = isDevelopment ? "dev" : "prod";
    var envText = isDevelopment ? "Development" : "Production";
    
    var html = $@"<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Eval-Ing API Gateway</title>
    <link rel=""icon"" type=""image/svg+xml"" href=""data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='grad' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' style='stop-color:%23667eea'/><stop offset='100%' style='stop-color:%23764ba2'/></linearGradient></defs><circle cx='50' cy='50' r='45' fill='url(%23grad)'/><text x='50' y='65' text-anchor='middle' fill='white' font-family='Arial, sans-serif' font-size='40' font-weight='bold'>E</text></svg>"">
    <link href=""https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"" rel=""stylesheet"">
    <link href=""https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"" rel=""stylesheet"">
    <style>
        :root {{
            --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            --secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            --success-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            --warning-gradient: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
            --card-shadow: 0 10px 40px rgba(0,0,0,0.1);
            --card-shadow-hover: 0 20px 60px rgba(0,0,0,0.15);
            --border-radius: 16px;
            --border-radius-lg: 24px;
            --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }}

        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}

        body {{
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
            position: relative;
            overflow-x: hidden;
        }}

        body::before {{
            content: '';
            position: fixed;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: url('data:image/svg+xml,<svg xmlns=""http://www.w3.org/2000/svg"" viewBox=""0 0 100 100""><circle cx=""20"" cy=""20"" r=""2"" fill=""rgba(255,255,255,0.1)""/><circle cx=""80"" cy=""40"" r=""1.5"" fill=""rgba(255,255,255,0.08)""/><circle cx=""40"" cy=""80"" r=""1"" fill=""rgba(255,255,255,0.06)""/><circle cx=""90"" cy=""90"" r=""2.5"" fill=""rgba(255,255,255,0.05)""/></svg>');
            animation: float 20s ease-in-out infinite;
            pointer-events: none;
            z-index: 0;
        }}

        @keyframes float {{
            0%, 100% {{ transform: translateY(0px) rotate(0deg); }}
            33% {{ transform: translateY(-30px) rotate(120deg); }}
            66% {{ transform: translateY(-60px) rotate(240deg); }}
        }}

        .container {{
            max-width: 1200px;
            margin: 0 auto;
            position: relative;
            z-index: 1;
        }}

        .header {{
            text-align: center;
            margin-bottom: 60px;
            animation: fadeInUp 0.8s ease-out;
        }}

        .header h1 {{
            font-size: 3.5rem;
            font-weight: 700;
            color: white;
            margin-bottom: 16px;
            text-shadow: 0 4px 20px rgba(0,0,0,0.3);
            letter-spacing: -0.02em;
        }}

        .header p {{
            font-size: 1.25rem;
            color: rgba(255,255,255,0.9);
            font-weight: 400;
            margin-bottom: 24px;
        }}

        .header .version {{
            display: inline-block;
            background: rgba(255,255,255,0.2);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.875rem;
            font-weight: 500;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.3);
        }}

        .status-card {{
            background: rgba(255,255,255,0.95);
            backdrop-filter: blur(20px);
            border-radius: var(--border-radius-lg);
            padding: 32px;
            margin-bottom: 48px;
            box-shadow: var(--card-shadow);
            border: 1px solid rgba(255,255,255,0.2);
            animation: fadeInUp 0.8s ease-out 0.2s both;
        }}

        .status-header {{
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 20px;
            flex-wrap: wrap;
            gap: 16px;
        }}

        .status-title {{
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 1.5rem;
            font-weight: 600;
            color: #2d3748;
        }}

        .status-icon {{
            width: 32px;
            height: 32px;
            background: var(--success-gradient);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            animation: pulse 2s infinite;
        }}

        @keyframes pulse {{
            0%, 100% {{ transform: scale(1); }}
            50% {{ transform: scale(1.05); }}
        }}

        .env-badge {{
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            border-radius: 12px;
            font-size: 0.875rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.025em;
        }}

        .env-badge.dev {{
            background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%);
            color: #8b4513;
        }}

        .env-badge.prod {{
            background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
            color: white;
        }}

        .status-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 24px;
        }}

        .status-item {{
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px;
            background: rgba(255,255,255,0.5);
            border-radius: var(--border-radius);
            border: 1px solid rgba(255,255,255,0.3);
        }}

        .status-item i {{
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            font-size: 0.875rem;
            background: var(--success-gradient);
            color: white;
        }}

        .status-item.uptime i {{
            background: var(--warning-gradient);
        }}

        .status-item.version i {{
            background: var(--secondary-gradient);
        }}

        .health-link {{
            color: #059669;
            text-decoration: none;
            font-weight: 600;
            transition: var(--transition);
        }}

        .health-link:hover {{
            color: #047857;
            text-decoration: underline;
        }}

        .services-section {{
            margin-bottom: 48px;
        }}

        .section-title {{
            font-size: 2rem;
            font-weight: 700;
            color: white;
            text-align: center;
            margin-bottom: 32px;
            text-shadow: 0 2px 10px rgba(0,0,0,0.3);
            animation: fadeInUp 0.8s ease-out 0.4s both;
        }}

        .services-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 24px;
        }}

        .service-card {{
            background: rgba(255,255,255,0.95);
            backdrop-filter: blur(20px);
            border-radius: var(--border-radius-lg);
            padding: 32px;
            transition: var(--transition);
            border: 1px solid rgba(255,255,255,0.2);
            box-shadow: var(--card-shadow);
            position: relative;
            overflow: hidden;
            animation: fadeInUp 0.8s ease-out calc(0.6s + var(--delay)) both;
        }}

        .service-card:nth-child(1) {{ --delay: 0s; }}
        .service-card:nth-child(2) {{ --delay: 0.1s; }}
        .service-card:nth-child(3) {{ --delay: 0.2s; }}
        .service-card:nth-child(4) {{ --delay: 0.3s; }}

        .service-card::before {{
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: var(--primary-gradient);
            transform: scaleX(0);
            transition: var(--transition);
        }}

        .service-card:hover {{
            transform: translateY(-8px);
            box-shadow: var(--card-shadow-hover);
        }}

        .service-card:hover::before {{
            transform: scaleX(1);
        }}

        .service-header {{
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 20px;
        }}

        .service-icon {{
            width: 48px;
            height: 48px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.25rem;
            color: white;
            flex-shrink: 0;
        }}

        .service-card:nth-child(1) .service-icon {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }}

        .service-card:nth-child(2) .service-icon {{
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }}

        .service-card:nth-child(3) .service-icon {{
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }}

        .service-card:nth-child(4) .service-icon {{
            background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        }}

        .service-card h3 {{
            font-size: 1.375rem;
            font-weight: 600;
            color: #1a202c;
            margin: 0;
            line-height: 1.2;
        }}

        .service-card p {{
            color: #4a5568;
            margin-bottom: 24px;
            line-height: 1.6;
            font-size: 0.9375rem;
        }}

        .service-actions {{
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
        }}

        .swagger-link {{
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: var(--primary-gradient);
            color: white;
            text-decoration: none;
            padding: 12px 20px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 0.875rem;
            transition: var(--transition);
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }}

        .swagger-link:hover {{
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }}

        .status-indicator {{
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            background: rgba(16, 185, 129, 0.1);
            color: #059669;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
            border: 1px solid rgba(16, 185, 129, 0.2);
        }}

        .status-dot {{
            width: 6px;
            height: 6px;
            background: #10b981;
            border-radius: 50%;
            animation: pulse 2s infinite;
        }}

        .documentation-section {{
            margin-bottom: 48px;
            animation: fadeInUp 0.8s ease-out 1.2s both;
        }}

        .documentation-card {{
            background: rgba(255,255,255,0.95);
            backdrop-filter: blur(20px);
            border-radius: var(--border-radius-lg);
            padding: 32px;
            border: 1px solid rgba(255,255,255,0.2);
            box-shadow: var(--card-shadow);
            text-align: center;
            position: relative;
            overflow: hidden;
        }}

        .documentation-card::before {{
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }}

        .documentation-header {{
            margin-bottom: 24px;
        }}

        .documentation-icon {{
            width: 64px;
            height: 64px;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.75rem;
            color: white;
            margin: 0 auto 16px;
            animation: pulse 2s infinite;
        }}

        .documentation-title {{
            font-size: 1.75rem;
            font-weight: 700;
            color: #1a202c;
            margin-bottom: 12px;
        }}

        .documentation-description {{
            color: #4a5568;
            font-size: 1.125rem;
            line-height: 1.6;
            margin-bottom: 32px;
        }}

        .documentation-link {{
            display: inline-flex;
            align-items: center;
            gap: 12px;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 16px;
            font-weight: 600;
            font-size: 1.125rem;
            transition: var(--transition);
            box-shadow: 0 8px 30px rgba(240, 147, 251, 0.3);
        }}

        .documentation-link:hover {{
            transform: translateY(-4px);
            box-shadow: 0 12px 40px rgba(240, 147, 251, 0.4);
        }}

        .footer {{
            background: rgba(255,255,255,0.95);
            backdrop-filter: blur(20px);
            border-radius: var(--border-radius-lg);
            padding: 32px;
            text-align: center;
            border: 1px solid rgba(255,255,255,0.2);
            box-shadow: var(--card-shadow);
            animation: fadeInUp 0.8s ease-out 1s both;
        }}

        .footer-content {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 24px;
            margin-bottom: 24px;
        }}

        .footer-section h4 {{
            font-size: 1.125rem;
            font-weight: 600;
            color: #1a202c;
            margin-bottom: 12px;
        }}

        .footer-section p, .footer-section a {{
            color: #4a5568;
            font-size: 0.875rem;
            line-height: 1.6;
            text-decoration: none;
        }}

        .footer-section a:hover {{
            color: #667eea;
            text-decoration: underline;
        }}

        .footer-bottom {{
            border-top: 1px solid rgba(0,0,0,0.1);
            padding-top: 20px;
            color: #6b7280;
            font-size: 0.875rem;
        }}

        @keyframes fadeInUp {{
            from {{
                opacity: 0;
                transform: translateY(30px);
            }}
            to {{
                opacity: 1;
                transform: translateY(0);
            }}
        }}

        @media (max-width: 768px) {{
            body {{
                padding: 16px;
            }}

            .header h1 {{
                font-size: 2.5rem;
            }}

            .header p {{
                font-size: 1.125rem;
            }}

            .services-grid {{
                grid-template-columns: 1fr;
            }}

            .service-card {{
                padding: 24px;
            }}

            .status-card {{
                padding: 24px;
            }}

            .status-header {{
                flex-direction: column;
                align-items: flex-start;
            }}

            .service-actions {{
                flex-direction: column;
            }}

            .swagger-link {{
                justify-content: center;
            }}
        }}
    </style>
</head>
<body>
    <div class='container'>
        <header class='header'>
            <h1><i class=""fas fa-code-branch""></i> Eval-Ing API</h1>
            <p>Modern Microservices Architecture - Explore our backend ecosystem</p>
            <div class='version'>API Gateway</div>
        </header>
        
        <div class='status-card'>
            <div class='status-header'>
                <div class='status-title'>
                    <div class='status-icon'>
                        <i class=""fas fa-heartbeat""></i>
                    </div>
                    API Gateway Status
                </div>
                <div class='env-badge {envBadgeClass}'>
                    <i class=""fas fa-server""></i>
                    {envText}
                </div>
            </div>
            
            <div class='status-grid'>
                <div class='status-item health'>
                    <i class=""fas fa-check-circle""></i>
                    <div>
                        <div><strong>Health:</strong> <a href='/health' class='health-link'>System Healthy</a></div>
                    </div>
                </div>
                <div class='status-item uptime'>
                    <i class=""fas fa-clock""></i>
                    <div>
                        <div><strong>Services:</strong> 5 Active</div>
                        <small>API Gateway + Microservices</small>
                    </div>
                </div>
                <div class='status-item version'>
                    <i class=""fas fa-code""></i>
                    <div>
                        <div><strong>Environment:</strong> {envText}</div>
                        <small>Last Updated: {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss UTC}</small>
                    </div>
                </div>
            </div>
        </div>
        
        <section class='services-section'>
            <h2 class='section-title'><i class=""fas fa-cubes""></i> Microservices Dashboard</h2>
            
            <div class='services-grid'>
                <div class='service-card'>
                    <div class='service-header'>
                        <div class='service-icon'>
                            <i class=""fas fa-shield-alt""></i>
                        </div>
                        <div>
                            <h3>Authentication Service</h3>
                            <div class='status-indicator'>
                                <div class='status-dot'></div>
                                Online
                            </div>
                        </div>
                    </div>
                    <p>Secure user authentication, registration, password management, and JWT token operations with OAuth2 integration.</p>
                    <div class='service-actions'>
                        <a href='{baseUrl}{authPort}/docs' class='swagger-link' target='_blank'>
                            <i class=""fas fa-book""></i>
                            Swagger Docs
                        </a>
                    </div>
                </div>
                
                <div class='service-card'>
                    <div class='service-header'>
                        <div class='service-icon'>
                            <i class=""fas fa-graduation-cap""></i>
                        </div>
                        <div>
                            <h3>Catalog Service</h3>
                            <div class='status-indicator'>
                                <div class='status-dot'></div>
                                Online
                            </div>
                        </div>
                    </div>
                    <p>Comprehensive management of formation catalogs, courses, categories, and educational content with search capabilities.</p>
                    <div class='service-actions'>
                        <a href='{baseUrl}{catalogPort}/docs' class='swagger-link' target='_blank'>
                            <i class=""fas fa-book""></i>
                            Swagger Docs
                        </a>
                    </div>
                </div>
                
                <div class='service-card'>
                    <div class='service-header'>
                        <div class='service-icon'>
                            <i class=""fas fa-clipboard-list""></i>
                        </div>
                        <div>
                            <h3>Questionnaire Service</h3>
                            <div class='status-indicator'>
                                <div class='status-dot'></div>
                                Online
                            </div>
                        </div>
                    </div>
                    <p>Advanced questionnaire and survey management with dynamic question types, response collection, and real-time analytics.</p>
                    <div class='service-actions'>
                        <a href='{baseUrl}{questionnairePort}/docs' class='swagger-link' target='_blank'>
                            <i class=""fas fa-book""></i>
                            Swagger Docs
                        </a>
                    </div>
                </div>
                
                <div class='service-card'>
                    <div class='service-header'>
                        <div class='service-icon'>
                            <i class=""fas fa-chart-line""></i>
                        </div>
                        <div>
                            <h3>Statistics Service</h3>
                            <div class='status-indicator'>
                                <div class='status-dot'></div>
                                Online
                            </div>
                        </div>
                    </div>
                    <p>Powerful analytics engine generating insights, reports, and statistical data from user interactions and evaluation metrics.</p>
                    <div class='service-actions'>
                        <a href='{baseUrl}{statisticsPort}/docs' class='swagger-link' target='_blank'>
                            <i class=""fas fa-book""></i>
                            Swagger Docs
                        </a>
                    </div>
                </div>
            </div>
        </section>
        
        <section class='documentation-section'>
            <div class='documentation-card'>
                <div class='documentation-header'>
                    <div class='documentation-icon'>
                        <i class=""fas fa-folder-open""></i>
                    </div>
                    <h3 class='documentation-title'>📁 Project Reports & Demos</h3>
                </div>
                <p class='documentation-description'>
                    Explore comprehensive project documentation, technical reports, architecture diagrams, 
                    and demonstration videos showcasing the complete system functionality and development process.
                </p>
                <a href='https://drive.google.com/drive/u/1/folders/1RepeGm5a3tKa8LWXnGJ7CpoN5OyxAdKA' 
                   class='documentation-link' 
                   target='_blank' 
                   rel='noopener noreferrer'>
                    <i class=""fas fa-external-link-alt""></i>
                    View Documentation & Videos
                </a>
            </div>
        </section>
        
        <footer class='footer'>
            <div class='footer-content'>
                <div class='footer-section'>
                    <h4><i class=""fas fa-info-circle""></i> System Information</h4>
                    <p>Environment: {envText}</p>
                    <p>Last Updated: {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss UTC}</p>
                </div>
                <div class='footer-section'>
                    <h4><i class=""fas fa-link""></i> Quick Links</h4>
                    <p><a href='https://www.eval-ing.live'>Main Application</a></p>
                    <p><a href='/health'>Health Check</a></p>
                </div>
                <div class='footer-section'>
                    <h4><i class=""fas fa-envelope""></i> Developer Contact</h4>
                    <p>Portfolio demonstration project</p>
                    <p><a href='mailto:dahbimoad1@gmail.com'>dahbimoad1@gmail.com</a></p>
                </div>
            </div>
            <div class='footer-bottom'>
                <p>&copy; 2025 Eval-Ing Platform. Built with ❤️ using .NET 9 and modern web technologies.</p>
            </div>
        </footer>
    </div>
</body>
</html>";
    
    return Results.Content(html, "text/html");
});

app.Run();