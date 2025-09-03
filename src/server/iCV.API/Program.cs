using iCV.API.Configuration.Authentication;
using iCV.API.Configuration.Database;
using iCV.API.Configuration.Repository;
using iCV.API.Configuration.Swagger;
using iCV.Application.Common.Interfaces;
using iCV.Infrastructure.Configurations;
using iCV.Infrastructure.MongoMappings;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using WatchStore.API.Middleware;
using FluentValidation;
using FluentValidation.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// FluentValidation
builder.Services.AddValidatorsFromAssemblyContaining<IValidatorMarker>();

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

// Configure session
builder.Services.AddDistributedMemoryCache(); // In RAM cache for session state
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
    options.Cookie.SameSite = SameSiteMode.Lax;
    // Fix for development: use SameAsRequest instead of Always
    options.Cookie.SecurePolicy = builder.Environment.IsDevelopment() ? 
        CookieSecurePolicy.SameAsRequest : CookieSecurePolicy.Always;
    // Remove __Host- prefix for development (requires HTTPS)
    options.Cookie.Name = builder.Environment.IsDevelopment() ? 
        "SessionId" : "__Host-SessionId";
});

// SQl Server
//builder.Services.AddDbContext<iCVDbContext>(options =>
//    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// MongoDB
builder.Services.AddMongoDb(builder.Configuration);

// MediatR
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(IApplicationMarker).Assembly));

// Repository
builder.Services.AddRepositories();

// Google Authentication - Disable built-in handler since we have custom implementation
// builder.Services.AddAuthentication(options =>
// {
//     options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
//     options.DefaultChallengeScheme = GoogleDefaults.AuthenticationScheme;
// })
// .AddCookie()
// .AddGoogle(GoogleDefaults.AuthenticationScheme, options =>
// {
//     options.ClientId = builder.Configuration["Authentication:Google:ClientId"];
//     options.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"];
//     options.CallbackPath = builder.Configuration["Authentication:Google:CallbackPath"];
//     options.Scope.Add("profile");
//     options.ClaimActions.MapJsonKey("picture", "picture");
//     options.SaveTokens = true; 
// });

// Authentication
builder.Services.AddJwtAuthentication(builder.Configuration["Jwt:key"]);

// Swagger
builder.Services.AddSwaggerDocumentation();
//builder.Services.AddEndpointsApiExplorer();
//builder.Services.AddSwaggerGen();
//builder.Services.AddSession();

builder.Services.AddAutoMapper(typeof(IApplicationMarker).Assembly);

var app = builder.Build();

// Middleware
app.UseMiddleware<ExceptionHandlingMiddleware>();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
// Static Files
app.UseStaticFiles();

app.UseHttpsRedirection();

app.Use(async (context, next) =>
{
    context.Response.Headers["Cross-Origin-Embedder-Policy"] = "same-origin-allow-popups";
    await next();
});

app.UseRouting();
app.UseCors("AllowSpecificOrigin");
app.UseSession();
// app.UseAuthentication(); // Commented out since we disabled built-in Google auth
app.UseAuthorization();

app.MapControllers();

app.Run();
