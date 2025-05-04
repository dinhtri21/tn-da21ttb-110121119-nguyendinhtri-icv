using iCV.API.Configuration.Authentication;
using iCV.API.Configuration.Repository;
using iCV.API.Configuration.Swagger;
using iCV.Application.Common.Interfaces;
using iCV.Infrastructure.Data;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.EntityFrameworkCore;
using WatchStore.API.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin",
        policy =>
        {
            policy.WithOrigins(allowedOrigins ?? new string[] { })
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials();
        });
});

// SQl Server
builder.Services.AddDbContext<iCVDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// MediatR
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(IApplicationMarker).Assembly));

// Repository
builder.Services.AddRepositories();

// Google Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = GoogleDefaults.AuthenticationScheme;
})
.AddCookie()
.AddGoogle(GoogleDefaults.AuthenticationScheme, options =>
{
    options.ClientId = builder.Configuration["Authentication:Google:ClientId"];
    options.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"];
    options.CallbackPath = "/signin-google";
    options.Scope.Add("profile");
    options.ClaimActions.MapJsonKey("picture", "picture");
    options.SaveTokens = true; 
});

// Authentication
builder.Services.AddJwtAuthentication(builder.Configuration["Jwt:key"]);

// Swagger
builder.Services.AddSwaggerDocumentation();
//builder.Services.AddEndpointsApiExplorer();
//builder.Services.AddSwaggerGen();


var app = builder.Build();

// Middleware
app.UseMiddleware<ExceptionHandlingMiddleware>();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
