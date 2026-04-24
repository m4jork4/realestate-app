using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using RealEstate.Api.Common;
using RealEstate.Api.Data;

namespace RealEstate.Api.Inquiries;

[ApiController]
[Route("api")]
public sealed class InquiriesController : ControllerBase
{
    private readonly IInquiryRepo inquiries;

    public InquiriesController(IInquiryRepo inquiries)
    {
        this.inquiries = inquiries;
    }

    
    [HttpPost("listings/{listingId:long}/inquiries")]
    [AllowAnonymous]
    public async Task<IActionResult> Create(long listingId, [FromBody] InquiryCreateRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Name)) throw new ApiException("Név kötelező.", 400);
        if (string.IsNullOrWhiteSpace(req.Email)) throw new ApiException("Email kötelező.", 400);
        if (string.IsNullOrWhiteSpace(req.Message)) throw new ApiException("Üzenet kötelező.", 400);

        long? userId = null;
        if (User?.Identity?.IsAuthenticated == true)
        {
            userId = TryGetUserId();
        }

        var id = await inquiries.Create(listingId, userId, req);
        return Ok(new { id });
    }

    
    [HttpGet("inquiries/mine")]
    [Authorize]
    public async Task<IActionResult> Mine([FromQuery] int limit = 200)
    {
        var userId = GetUserId();
        limit = Math.Clamp(limit, 1, 500);

        var items = await inquiries.GetMine(userId, limit);
        return Ok(new { items });
    }

    
    [HttpDelete("inquiries/{id:long}")]
    [Authorize]
    public async Task<IActionResult> Delete(long id)
    {
        var userId = GetUserId();
        var isAdmin = IsAdmin();

        var ok = await inquiries.Delete(id, userId, isAdmin);
        if (!ok) throw new ApiException("Nincs jogosultságod törölni vagy nem létezik.", 404);

        return Ok(new { ok = true });
    }

    private bool IsAdmin()
    {
        
        var roles = User.FindAll(ClaimTypes.Role).Select(r => r.Value);
        if (roles.Any(r => string.Equals(r, "ADMIN", StringComparison.OrdinalIgnoreCase))) return true;

        var role = User.FindFirstValue("role");
        return string.Equals(role, "ADMIN", StringComparison.OrdinalIgnoreCase);
    }

    private long GetUserId() =>
        TryGetUserId() ?? throw new ApiException("Missing user id claim in token.", 401);

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