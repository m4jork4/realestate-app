using Dapper;
using MySqlConnector;
using RealEstate.Api.Common;
using RealEstate.Api.Listings;

namespace RealEstate.Api.Data;

public interface IListingRepo
{
    Task<(IReadOnlyList<ListingListItem> Items, long Total)> SearchPublic(ListingSearch q);

    Task<(IReadOnlyList<ListingListItem> Items, long Total)> SearchMine(long ownerUserId, int page, int pageSize, string? sort);

    Task<ListingDetail?> GetById(long id);
    Task<long> Create(long ownerUserId, UpsertListingRequest req);
    Task<bool> Update(long id, long ownerUserId, UpsertListingRequest req);
    Task<bool> Delete(long id, long ownerUserId);

    Task<long> AddImage(long listingId, long ownerUserId, string url);
    Task<bool> DeleteImage(long listingId, long ownerUserId, long imageId);
}

public sealed class ListingRepo(MySqlConnection db) : IListingRepo
{
    public async Task<(IReadOnlyList<ListingListItem> Items, long Total)> SearchPublic(ListingSearch q)
    {
        var where = new List<string> { "l.status='ACTIVE'" };
        var p = new DynamicParameters();

        if (!string.IsNullOrWhiteSpace(q.City)) { where.Add("l.city=@city"); p.Add("city", q.City); }
        if (!string.IsNullOrWhiteSpace(q.District)) { where.Add("l.district=@district"); p.Add("district", q.District); }
        if (q.MinPrice is not null) { where.Add("l.price >= @minPrice"); p.Add("minPrice", q.MinPrice); }
        if (q.MaxPrice is not null) { where.Add("l.price <= @maxPrice"); p.Add("maxPrice", q.MaxPrice); }
        if (q.MinArea is not null) { where.Add("l.area_m2 >= @minArea"); p.Add("minArea", q.MinArea); }
        if (q.MaxArea is not null) { where.Add("l.area_m2 <= @maxArea"); p.Add("maxArea", q.MaxArea); }
        if (q.Rooms is not null) { where.Add("l.rooms >= @rooms"); p.Add("rooms", q.Rooms); }
        if (!string.IsNullOrWhiteSpace(q.DealType)) { where.Add("l.deal_type=@dealType"); p.Add("dealType", q.DealType); }
        if (!string.IsNullOrWhiteSpace(q.PropertyType)) { where.Add("l.property_type=@propertyType"); p.Add("propertyType", q.PropertyType); }

        var whereSql = "WHERE " + string.Join(" AND ", where);

        var sortSql = q.Sort switch
        {
            "price_asc" => "ORDER BY l.price ASC",
            "price_desc" => "ORDER BY l.price DESC",
            "area_desc" => "ORDER BY l.area_m2 DESC",
            _ => "ORDER BY l.created_at DESC"
        };

        var page = Math.Max(1, q.Page);
        var pageSize = Math.Clamp(q.PageSize, 1, 50);
        var offset = (page - 1) * pageSize;

        p.Add("limit", pageSize);
        p.Add("offset", offset);

        var sqlItems = $@"
SELECT
  CAST(l.id AS SIGNED) AS Id,
  l.title AS Title,
  l.price AS Price,
  l.currency AS Currency,
  l.city AS City,
  l.district AS District,
  l.area_m2 AS AreaM2,
  l.rooms AS Rooms,
  l.deal_type AS DealType,
  l.property_type AS PropertyType,
  l.status AS Status,
  (
    SELECT li.url
    FROM listing_images li
    WHERE li.listing_id = l.id
    ORDER BY li.sort_order ASC, li.id ASC
    LIMIT 1
  ) AS CoverImageUrl,
  l.created_at AS CreatedAt
FROM listings l
{whereSql}
{sortSql}
LIMIT @limit OFFSET @offset;";

        var sqlCount = $@"SELECT COUNT(*) FROM listings l {whereSql};";

        var items = (await db.QueryAsync<ListingListItem>(sqlItems, p)).ToList();
        var total = await db.ExecuteScalarAsync<long>(sqlCount, p);

        return (items, total);
    }

    public async Task<(IReadOnlyList<ListingListItem> Items, long Total)> SearchMine(long ownerUserId, int page, int pageSize, string? sort)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 50);
        var offset = (page - 1) * pageSize;

        var sortSql = sort switch
        {
            "price_asc" => "ORDER BY l.price ASC",
            "price_desc" => "ORDER BY l.price DESC",
            _ => "ORDER BY l.created_at DESC"
        };

        var p = new
        {
            ownerUserId,
            limit = pageSize,
            offset
        };

        var sqlItems = $@"
SELECT
  CAST(l.id AS SIGNED) AS Id,
  l.title AS Title,
  l.price AS Price,
  l.currency AS Currency,
  l.city AS City,
  l.district AS District,
  l.area_m2 AS AreaM2,
  l.rooms AS Rooms,
  l.deal_type AS DealType,
  l.property_type AS PropertyType,
  l.status AS Status,
  (
    SELECT li.url
    FROM listing_images li
    WHERE li.listing_id = l.id
    ORDER BY li.sort_order ASC, li.id ASC
    LIMIT 1
  ) AS CoverImageUrl,
  l.created_at AS CreatedAt
FROM listings l
WHERE l.owner_user_id = @ownerUserId
{sortSql}
LIMIT @limit OFFSET @offset;";

        var sqlCount = @"SELECT COUNT(*) FROM listings WHERE owner_user_id=@ownerUserId;";

        var items = (await db.QueryAsync<ListingListItem>(sqlItems, p)).ToList();
        var total = await db.ExecuteScalarAsync<long>(sqlCount, new { ownerUserId });

        return (items, total);
    }

    public async Task<ListingDetail?> GetById(long id)
    {
        var sqlListing = @"
SELECT
  CAST(id AS SIGNED) AS Id,
  CAST(owner_user_id AS SIGNED) AS OwnerUserId,
  title AS Title,
  description AS Description,
  price AS Price,
  currency AS Currency,
  city AS City,
  district AS District,
  address_line AS AddressLine,
  lat AS Lat,
  lng AS Lng,
  area_m2 AS AreaM2,
  rooms AS Rooms,
  bathrooms AS Bathrooms,
  floor AS Floor,
  total_floors AS TotalFloors,
  year_built AS YearBuilt,
  heating_type AS HeatingType,
  deal_type AS DealType,
  property_type AS PropertyType,
  status AS Status,
  created_at AS CreatedAt,
  updated_at AS UpdatedAt
FROM listings
WHERE id=@id;";

        var row = await db.QuerySingleOrDefaultAsync<ListingDetailRow>(sqlListing, new { id });
        if (row is null) return null;

        var images = (await db.QueryAsync<ListingImageDto>(
            @"SELECT CAST(id AS SIGNED) AS Id, url AS Url, sort_order AS SortOrder
              FROM listing_images
              WHERE listing_id=@id
              ORDER BY sort_order ASC, id ASC;",
            new { id })).ToList();

        return new ListingDetail(
            row.Id, row.OwnerUserId, row.Title, row.Description,
            row.Price, row.Currency, row.City, row.District, row.AddressLine,
            row.Lat, row.Lng, row.AreaM2, row.Rooms, row.Bathrooms,
            row.Floor, row.TotalFloors, row.YearBuilt, row.HeatingType,
            row.DealType, row.PropertyType, row.Status,
            row.CreatedAt, row.UpdatedAt,
            images
        );
    }

    public async Task<long> Create(long ownerUserId, UpsertListingRequest req)
    {
        var sql = @"
INSERT INTO listings
(owner_user_id,title,description,status,deal_type,property_type,price,currency,city,district,address_line,lat,lng,area_m2,rooms,bathrooms,floor,total_floors,year_built,heating_type)
VALUES
(@ownerUserId,@Title,@Description,@Status,@DealType,@PropertyType,@Price,@Currency,@City,@District,@AddressLine,@Lat,@Lng,@AreaM2,@Rooms,@Bathrooms,@Floor,@TotalFloors,@YearBuilt,@HeatingType);
SELECT CAST(LAST_INSERT_ID() AS SIGNED);";

        return await db.ExecuteScalarAsync<long>(sql, new
        {
            ownerUserId,
            req.Title,
            req.Description,
            req.Status,
            req.DealType,
            req.PropertyType,
            req.Price,
            req.Currency,
            req.City,
            req.District,
            req.AddressLine,
            req.Lat,
            req.Lng,
            req.AreaM2,
            req.Rooms,
            req.Bathrooms,
            req.Floor,
            req.TotalFloors,
            req.YearBuilt,
            req.HeatingType
        });
    }

    public async Task<bool> Update(long id, long ownerUserId, UpsertListingRequest req)
    {
        var sql = @"
UPDATE listings SET
  title=@Title, description=@Description, status=@Status,
  deal_type=@DealType, property_type=@PropertyType,
  price=@Price, currency=@Currency,
  city=@City, district=@District, address_line=@AddressLine,
  lat=@Lat, lng=@Lng, area_m2=@AreaM2, rooms=@Rooms, bathrooms=@Bathrooms,
  floor=@Floor, total_floors=@TotalFloors, year_built=@YearBuilt, heating_type=@HeatingType
WHERE id=@id AND owner_user_id=@ownerUserId;";

        var rows = await db.ExecuteAsync(sql, new
        {
            id,
            ownerUserId,
            req.Title,
            req.Description,
            req.Status,
            req.DealType,
            req.PropertyType,
            req.Price,
            req.Currency,
            req.City,
            req.District,
            req.AddressLine,
            req.Lat,
            req.Lng,
            req.AreaM2,
            req.Rooms,
            req.Bathrooms,
            req.Floor,
            req.TotalFloors,
            req.YearBuilt,
            req.HeatingType
        });

        return rows > 0;
    }

    public async Task<bool> Delete(long id, long ownerUserId)
    {
        var rows = await db.ExecuteAsync(
            "DELETE FROM listings WHERE id=@id AND owner_user_id=@ownerUserId;",
            new { id, ownerUserId });

        return rows > 0;
    }

    
    public async Task<long> AddImage(long listingId, long ownerUserId, string url)
    {
        var ok = await db.ExecuteScalarAsync<long>(
            "SELECT COUNT(*) FROM listings WHERE id=@listingId AND owner_user_id=@ownerUserId;",
            new { listingId, ownerUserId });

        if (ok == 0) throw new ApiException("Not allowed.", 403);

        var maxSort = await db.ExecuteScalarAsync<int?>(
            "SELECT MAX(sort_order) FROM listing_images WHERE listing_id=@listingId;",
            new { listingId });

        var nextSort = (maxSort ?? -1) + 1;

        var sql = @"
INSERT INTO listing_images(listing_id,url,sort_order)
VALUES(@listingId,@url,@sortOrder);
SELECT CAST(LAST_INSERT_ID() AS SIGNED);";

        return await db.ExecuteScalarAsync<long>(sql, new { listingId, url, sortOrder = nextSort });
    }

    public async Task<bool> DeleteImage(long listingId, long ownerUserId, long imageId)
    {
        var ok = await db.ExecuteScalarAsync<long>(
            "SELECT COUNT(*) FROM listings WHERE id=@listingId AND owner_user_id=@ownerUserId;",
            new { listingId, ownerUserId });

        if (ok == 0) throw new ApiException("Not allowed.", 403);

        var rows = await db.ExecuteAsync(
            "DELETE FROM listing_images WHERE id=@imageId AND listing_id=@listingId;",
            new { imageId, listingId });

        return rows > 0;
    }

    private sealed record ListingDetailRow(
        long Id, long OwnerUserId, string Title, string Description,
        long Price, string Currency, string City, string? District, string? AddressLine,
        decimal? Lat, decimal? Lng, int AreaM2, decimal Rooms, decimal? Bathrooms,
        int? Floor, int? TotalFloors, int? YearBuilt, string? HeatingType,
        string DealType, string PropertyType, string Status,
        DateTime CreatedAt, DateTime UpdatedAt);
}