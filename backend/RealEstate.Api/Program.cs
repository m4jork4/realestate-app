using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using MySqlConnector;
using RealEstate.Api.Auth;
using RealEstate.Api.Data;
using RealEstate.Api.Images;
using RealEstate.Api.Listings;
using Dapper;

var builder = WebApplication.CreateBuilder(args);

// Controllers + Swagger
builder.Services.AddControllers(opt => opt.Filters.Add(new RealEstate.Api.Common.ApiExceptionFilter()));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "RealEstate API", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = " Bearer {token}"
    });

    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});


// CORS (frontendnek)
builder.Services.AddCors(opt =>
{
    opt.AddPolicy("frontend", p =>
        p.WithOrigins("http://localhost:5173", "https://localhost:5173")
         .AllowAnyHeader()
         .AllowAnyMethod()
         .AllowCredentials());
});

// MySQL connection (Scoped)
builder.Services.AddScoped<MySqlConnection>(_ =>
{
    var cs = builder.Configuration.GetConnectionString("Default");
    return new MySqlConnection(cs);
});

// Repos + Services
builder.Services.AddScoped<IUserRepo, UserRepo>();
builder.Services.AddScoped<IListingRepo, ListingRepo>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IInquiryRepo, InquiryRepo>();
builder.Services.AddScoped<IAdminRepo, AdminRepo>();
builder.Services.AddScoped<IAdminMessageRepo, AdminMessageRepo>();
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
builder.Services.AddScoped<LocalImageStorage>();

// JWT Auth

var jwt = builder.Configuration.GetSection("Jwt");
var key = jwt["Key"] ?? "";
var issuer = jwt["Issuer"] ?? "";
var audience = jwt["Audience"] ?? "";
var keyBytes = Encoding.UTF8.GetBytes(key);

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt =>
    {
        var isDev = builder.Environment.IsDevelopment();

        // DEV-ben legyen részletes
        opt.IncludeErrorDetails = isDev;
        opt.RequireHttpsMetadata = false;

        opt.TokenValidationParameters = new TokenValidationParameters
        {
            //  aláírás ellenőrzés
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(keyBytes),

            //  lejárat ellenőrzés
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(1),

            
            ValidateIssuer = !isDev,
            ValidateAudience = !isDev,
            ValidIssuer = issuer,
            ValidAudience = audience
        };

        opt.Events = new JwtBearerEvents
        {
            OnMessageReceived = ctx =>
            {
                var auth = ctx.Request.Headers.Authorization.ToString();
                Console.WriteLine(string.IsNullOrWhiteSpace(auth)
                    ? "JWT: Missing Authorization header"
                    : $"JWT: Authorization header present, len={auth.Length}, starts={auth[..Math.Min(20, auth.Length)]}...");
                return Task.CompletedTask;
            },

            OnTokenValidated = ctx =>
            {
                
                var sub = ctx.Principal?.FindFirst("sub")?.Value
                          ?? ctx.Principal?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                          ?? "(no-sub)";
                var email = ctx.Principal?.FindFirst("email")?.Value ?? "(no-email)";
                Console.WriteLine($"JWT OK: sub={sub}, email={email}");
                return Task.CompletedTask;
            },

            OnAuthenticationFailed = ctx =>
            {
                Console.WriteLine("JWT auth failed: " + ctx.Exception);
                return Task.CompletedTask;
            },

            OnChallenge = async ctx =>
            {
                
                Console.WriteLine($"JWT challenge: {ctx.Error} / {ctx.ErrorDescription}");

                if (!isDev) return;

                ctx.HandleResponse();
                ctx.Response.StatusCode = 401;
                ctx.Response.ContentType = "application/json";

                var payload = new
                {
                    error = "Unauthorized",
                    details = ctx.ErrorDescription ?? ctx.Error ?? "JWT validation failed",
                    expected = new
                    {
                        issuer,
                        audience,
                        keyLength = key.Length
                    }
                };

                await ctx.Response.WriteAsJsonAsync(payload);
            }
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

app.UseCors("frontend");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseStaticFiles(); // wwwroot (uploads innen)

app.UseAuthentication();
app.UseAuthorization();



app.MapGet("/dbcheck", async (IConfiguration cfg) =>
{
    var cs = cfg.GetConnectionString("Default") ?? "(null)";
    try
    {
        await using var db = new MySqlConnection(cs);
        await db.OpenAsync();
        var v = await db.ExecuteScalarAsync<string>("SELECT VERSION();");
        return Results.Ok(new { ok = true, version = v, connectionString = cs });
    }
    catch (Exception ex)
    {
        return Results.Problem(
            title: "DB connect failed",
            detail: ex.ToString(),
            statusCode: 500,
            extensions: new Dictionary<string, object?> { ["connectionString"] = cs }
        );
    }
});


app.MapControllers();

app.Run();
