using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace RealEstate.Api.Auth;

[ApiController]
[Route("api/auth")]
public sealed class AuthController(IAuthService auth) : ControllerBase
{
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest req)
        => Ok(await auth.Register(req));

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest req)
        => Ok(await auth.Login(req));

    [Authorize]
    [HttpGet("me")]
    public ActionResult<MeResponse> Me()
    {
        var userId = long.Parse(User.Claims.First(c => c.Type == JwtRegisteredClaimNames.Sub).Value);
        var email = User.Claims.First(c => c.Type == JwtRegisteredClaimNames.Email).Value;
        var role = User.Claims.First(c => c.Type == System.Security.Claims.ClaimTypes.Role).Value;
        var name = User.Claims.First(c => c.Type == "name").Value;
        return Ok(new MeResponse(userId, email, role, name));
    }
}
