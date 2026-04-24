using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace RealEstate.Api.Auth;

public interface IJwtTokenService
{
    string CreateToken(long userId, string email, string role, string name);
}

public sealed class JwtTokenService(IConfiguration cfg) : IJwtTokenService
{
    public string CreateToken(long userId, string email, string role, string name)
    {
        var jwt = cfg.GetSection("Jwt");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["Key"]!));

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new(JwtRegisteredClaimNames.Email, email),
            new(ClaimTypes.Role, role),
            new("name", name)
        };

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expires = DateTime.UtcNow.AddMinutes(int.Parse(jwt["ExpiresMinutes"]!));

        var token = new JwtSecurityToken(
            issuer: jwt["Issuer"],
            audience: jwt["Audience"],
            claims: claims,
            expires: expires,
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
