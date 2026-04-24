using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using RealEstate.Api.Common;
using RealEstate.Api.Data;
using RealEstate.Api.Images;

namespace RealEstate.Api.Listings;

[ApiController]
[Route("api/listings")]
public sealed class ListingsController : ControllerBase
{
    private readonly IListingRepo listings;
    private readonly LocalImageStorage imageStorage;

    public ListingsController(IListingRepo listings, LocalImageStorage imageStorage)
    {
        this.listings = listings;
        this.imageStorage = imageStorage;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> Search(
        [FromQuery] string? city,
        [FromQuery] string? district,
        [FromQuery] long? minPrice,
        [FromQuery] long? maxPrice,
        [FromQuery] int? minArea,
        [FromQuery] int? maxArea,
        [FromQuery] decimal? rooms,
        [FromQuery] string? dealType,
        [FromQuery] string? propertyType,
        [FromQuery] string? sort,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 12)
    {
        var q = new ListingSearch(
            City: city,
            District: district,
            MinPrice: minPrice,
            MaxPrice: maxPrice,
            MinArea: minArea,
            MaxArea: maxArea,
            Rooms: rooms,
            DealType: dealType,
            PropertyType: propertyType,
            Sort: sort,
            Page: page,
            PageSize: pageSize
        );

        var (items, total) = await listings.SearchPublic(q);

        return Ok(new { items, page, pageSize, total });
    }

    //  SAJÁT HIRDETÉSEK
    
    [HttpGet("mine")]
    [Authorize]
    public async Task<IActionResult> Mine(
        [FromQuery] string? sort,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 12)
    {
        var userId = GetUserId();
        var (items, total) = await listings.SearchMine(userId, page, pageSize, sort);
        return Ok(new { items, page, pageSize, total });
    }

    [HttpGet("{id:long}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(long id)
    {
        var item = await listings.GetById(id);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] UpsertListingRequest req)
    {
        var userId = GetUserId();
        var id = await listings.Create(userId, req);
        return Ok(new { id });
    }

    [HttpPut("{id:long}")]
    [Authorize]
    public async Task<IActionResult> Update(long id, [FromBody] UpsertListingRequest req)
    {
        var userId = GetUserId();
        var ok = await listings.Update(id, userId, req);
        return ok ? NoContent() : NotFound();
    }

    [HttpDelete("{id:long}")]
    [Authorize]
    public async Task<IActionResult> Delete(long id)
    {
        var userId = GetUserId();
        var ok = await listings.Delete(id, userId);
        return ok ? NoContent() : NotFound();
    }

    //  KÉPFELTÖLTÉS (több fájl)
    
    [HttpPost("{id:long}/images")]
    [Authorize]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(15_000_000)]
    public async Task<IActionResult> UploadImages(long id, [FromForm] List<IFormFile>? files)
    {
        var userId = GetUserId();

        files ??= new List<IFormFile>();
        if (files.Count == 0 && Request.Form.Files.Count > 0)
            files = Request.Form.Files.ToList();

        if (files.Count == 0)
            throw new ApiException("No files uploaded. Use form field name: files", 400);

        if (files.Count > 8)
            throw new ApiException("Too many files. Max 8 images per upload.", 400);

        var results = new List<object>();

        foreach (var f in files)
        {
            var url = await imageStorage.SaveListingImage(id, f);
            var imageId = await listings.AddImage(id, userId, url);
            results.Add(new { id = imageId, url });
        }

        return Ok(new { images = results });
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