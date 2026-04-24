using Microsoft.AspNetCore.Hosting;

namespace RealEstate.Api.Images;

public sealed class LocalImageStorage
{
    private readonly IWebHostEnvironment env;

    public LocalImageStorage(IWebHostEnvironment env)
    {
        this.env = env;
    }

    public async Task<string> SaveListingImage(long listingId, IFormFile file)
    {
        if (file == null || file.Length == 0)
            throw new Exception("Empty file.");

        var webRoot = env.WebRootPath;

        if (string.IsNullOrWhiteSpace(webRoot))
        {
            
            webRoot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        }

        var uploadsPath = Path.Combine(webRoot, "uploads", "listings", listingId.ToString());

        Directory.CreateDirectory(uploadsPath);

        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        var fullPath = Path.Combine(uploadsPath, fileName);

        using var stream = new FileStream(fullPath, FileMode.Create);
        await file.CopyToAsync(stream);

        
        return $"/uploads/listings/{listingId}/{fileName}";
    }
}