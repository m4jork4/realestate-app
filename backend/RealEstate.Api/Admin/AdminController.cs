using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using RealEstate.Api.Common;
using RealEstate.Api.Data;

namespace RealEstate.Api.Admin;

[ApiController]
[Route("api/admin")]
[Authorize]
public sealed class AdminController : ControllerBase
{
    private readonly IAdminRepo admin;

    public AdminController(IAdminRepo admin)
    {
        this.admin = admin;
    }

    [HttpGet("users")]
    public async Task<IActionResult> Users([FromQuery] int limit = 500)
    {
        EnsureAdmin();
        var items = await admin.GetUsers(limit);
        return Ok(new { items });
    }

    public sealed record SetRoleRequest(string Role);

    [HttpPut("users/{id:long}/role")]
    public async Task<IActionResult> SetRole(long id, [FromBody] SetRoleRequest req)
    {
        EnsureAdmin();

        var role = (req.Role ?? "").Trim().ToUpperInvariant();
        if (role is not ("USER" or "ADMIN"))
            throw new ApiException("Role csak USER vagy ADMIN lehet.", 400);

        var ok = await admin.SetUserRole(id, role);
        if (!ok) throw new ApiException("User nem található.", 404);

        return Ok(new { ok = true });
    }

    [HttpGet("listings")]
    public async Task<IActionResult> Listings(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? status = null,
        [FromQuery] string? q = null)
    {
        EnsureAdmin();

        var (items, total) = await admin.GetListings(page, pageSize, status, q);
        return Ok(new { items, page, pageSize, total });
    }

    public sealed record SetStatusRequest(string Status);

    [HttpPut("listings/{id:long}/status")]
    public async Task<IActionResult> SetStatus(long id, [FromBody] SetStatusRequest req)
    {
        EnsureAdmin();

        var status = (req.Status ?? "").Trim().ToUpperInvariant();
        if (status is not ("ACTIVE" or "INACTIVE"))
            throw new ApiException("Status csak ACTIVE vagy INACTIVE lehet.", 400);

        var ok = await admin.SetListingStatus(id, status);
        if (!ok) throw new ApiException("Listing nem található.", 404);

        return Ok(new { ok = true });
    }

    private void EnsureAdmin()
    {
        var roles = User.FindAll(ClaimTypes.Role).Select(r => r.Value);
        var roleClaim = User.FindFirstValue("role");

        var isAdmin =
            roles.Any(r => string.Equals(r, "ADMIN", StringComparison.OrdinalIgnoreCase)) ||
            string.Equals(roleClaim, "ADMIN", StringComparison.OrdinalIgnoreCase);

        if (!isAdmin) throw new ApiException("Nincs jogosultság (ADMIN kell).", 403);
    }
}