using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using RealEstate.Api.Common;
using RealEstate.Api.Data;

namespace RealEstate.Api.AdminMessages;

[ApiController]
[Route("api")]
public sealed class AdminMessagesController : ControllerBase
{
    private readonly IAdminMessageRepo repo;

    public AdminMessagesController(IAdminMessageRepo repo)
    {
        this.repo = repo;
    }

    
    [HttpPost("admin-messages")]
    [AllowAnonymous]
    public async Task<IActionResult> Create([FromBody] AdminMessageCreateRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Name)) throw new ApiException("Név kötelező.", 400);
        if (string.IsNullOrWhiteSpace(req.Email)) throw new ApiException("Email kötelező.", 400);
        if (string.IsNullOrWhiteSpace(req.Message)) throw new ApiException("Üzenet kötelező.", 400);

        long? userId = null;
        if (User?.Identity?.IsAuthenticated == true)
        {
            userId = TryGetUserId();
        }

        var id = await repo.Create(userId, req);
        return Ok(new { id });
    }

    
    [HttpGet("admin/messages")]
    [Authorize]
    public async Task<IActionResult> Get([FromQuery] int limit = 200)
    {
        if (!IsAdmin()) throw new ApiException("Nincs jogosultság.", 403);
        limit = Math.Clamp(limit, 1, 500);

        var items = await repo.GetLatest(limit);
        return Ok(new { items });
    }

    
    [HttpDelete("admin/messages/{id:long}")]
    [Authorize]
    public async Task<IActionResult> Delete(long id)
    {
        if (!IsAdmin()) throw new ApiException("Nincs jogosultság.", 403);

        var ok = await repo.Delete(id);
        if (!ok) throw new ApiException("Nem létezik.", 404);
        return Ok(new { ok = true });
    }

    private bool IsAdmin()
    {
        var roles = User.FindAll(ClaimTypes.Role).Select(r => r.Value);
        if (roles.Any(r => string.Equals(r, "ADMIN", StringComparison.OrdinalIgnoreCase))) return true;

        var role = User.FindFirstValue("role");
        return string.Equals(role, "ADMIN", StringComparison.OrdinalIgnoreCase);
    }

    private long? TryGetUserId()
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

        return null;
    }
}
