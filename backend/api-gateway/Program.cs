using Yarp.ReverseProxy;

var builder = WebApplication.CreateBuilder(args);

// Load proxy routes and clusters from appsettings.json
builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

var app = builder.Build();
app.MapReverseProxy();
app.Run();
