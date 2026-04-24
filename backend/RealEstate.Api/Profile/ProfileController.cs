using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using RealEstate.Api.Common;
using RealEstate.Api.Data;
using RealEstate.Api.Auth;

namespace RealEstate.Api.Profile;

[ApiController]
[Route("api/profile")]
[Authorize]
public sealed class ProfileController : ControllerBase
{
    private readonly IUserRepo users;
    private readonly IJwtTokenService jwt;

    public ProfileController(IUserRepo users, IJwtTokenService jwt)
    {
        this.users = users;
        this.jwt = jwt;
    }

    public sealed record ProfileDto(long UserId, string Email, string Name, string Role, string? Phone);

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var userId = GetUserId();
        var u = await users.GetById(userId) ?? throw new ApiException("User not found.", 404);
        return Ok(new ProfileDto(u.Id, u.Email, u.Name, u.Role, u.Phone));
    }

    public sealed record UpdateProfileRequest(string Name, string? Phone);

    // Mentés után adunk új tokent, hogy a navbar név is frissüljön
    public sealed record UpdateProfileResponse(string Token, long UserId, string Email, string Role, string Name, string? Phone);

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] UpdateProfileRequest req)
    {
        var userId = GetUserId();

        var name = (req.Name ?? "").Trim();
        if (string.IsNullOrWhiteSpace(name)) throw new ApiException("Név kötelezõ.", 400);

        var phone = string.IsNullOrWhiteSpace(req.Phone) ? null : req.Phone.Trim();

        var ok = await users.UpdateProfile(userId, name, phone);
        if (!ok) throw new ApiException("Mentés sikertelen.", 400);

        var u = await users.GetById(userId) ?? throw new ApiException("User not found.", 404);
        var token = jwt.CreateToken(u.Id, u.Email, u.Role, u.Name);

        return Ok(new UpdateProfileResponse(token, u.Id, u.Email, u.Role, u.Name, u.Phone));
    }

    public sealed record ChangePasswordRequest(string CurrentPassword, string NewPassword);

    [HttpPut("password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest req)
    {
        var userId = GetUserId();
        var u = await users.GetById(userId) ?? throw new ApiException("User not found.", 404);

        if (string.IsNullOrWhiteSpace(req.CurrentPassword))
            throw new ApiException("Régi jelszó kötelezõ.", 400);

        if (string.IsNullOrWhiteSpace(req.NewPassword) || req.NewPassword.Length < 6)
            throw new ApiException("Új jelszó minimum 6 karakter.", 400);

        if (!BCrypt.Net.BCrypt.Verify(req.CurrentPassword, u.PasswordHash))
            throw new ApiException("A régi jelszó hibás.", 400);

        var hash = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);
        await users.UpdatePasswordHash(userId, hash);

        return Ok(new { ok = true });
    }

    private long GetUserId()
    {
        var sub = User.FindFirstValue("sub");
        if (!string.IsNullOrWhiteSpace(sub) && long.TryParse(sub, out var idFromSub))
            return idFromSub;

        var nid = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!string.IsNullOrWhiteSpace(nid) && long.TryParse(nid, out var idFromNid))
            return idFromNid;

        var uid = User.FindFirstValue("userId");
        if (!string.IsNullOrWhiteSpace(uid) && long.TryParse(uid, out var idFromUid))
            return idFromUid;

        throw new ApiException("Missing user id claim in token.", 401);
    }
}