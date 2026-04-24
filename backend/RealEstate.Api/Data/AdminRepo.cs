using Dapper;
using MySqlConnector;

namespace RealEstate.Api.Data;

public sealed record AdminUserListItem(
    long Id,
    string Email,
    string Role,
    string Name,
    string? Phone,
    DateTime CreatedAt
);

public sealed record AdminListingListItem(
    long Id,
    string Title,
    string Status,
    long Price,
    string Currency,
    string City,
    string? District,
    int AreaM2,
    decimal Rooms,
    DateTime CreatedAt,
    long OwnerUserId,
    string OwnerEmail,
    string OwnerName
);

public interface IAdminRepo
{
    Task<IReadOnlyList<AdminUserListItem>> GetUsers(int limit = 500);
    Task<bool> SetUserRole(long userId, string role);

    Task<(IReadOnlyList<AdminListingListItem> Items, long Total)> GetListings(int page, int pageSize, string? status, string? q);
    Task<bool> SetListingStatus(long listingId, string status);
}

public sealed class AdminRepo(MySqlConnection db) : IAdminRepo
{
    public async Task<IReadOnlyList<AdminUserListItem>> GetUsers(int limit = 500)
    {
        limit = Math.Clamp(limit, 1, 2000);

        var sql = @"
SELECT
  CAST(id AS SIGNED) AS Id,
  email AS Email,
  role AS Role,
  name AS Name,
  phone AS Phone,
  created_at AS CreatedAt
FROM users
ORDER BY created_at DESC
LIMIT @limit;";

        var rows = await db.QueryAsync<AdminUserListItem>(sql, new { limit });
        return rows.ToList();
    }

    public async Task<bool> SetUserRole(long userId, string role)
    {
        var sql = @"UPDATE users SET role=@role WHERE id=@userId;";
        var rows = await db.ExecuteAsync(sql, new { userId, role });
        return rows > 0;
    }

    public async Task<(IReadOnlyList<AdminListingListItem> Items, long Total)> GetListings(int page, int pageSize, string? status, string? q)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 50);
        var offset = (page - 1) * pageSize;

        var where = new List<string> { "1=1" };
        var p = new DynamicParameters();

        if (!string.IsNullOrWhiteSpace(status))
        {
            where.Add("l.status = @status");
            p.Add("status", status);
        }

        if (!string.IsNullOrWhiteSpace(q))
        {
            where.Add("(l.title LIKE @q OR l.city LIKE @q OR u.email LIKE @q OR u.name LIKE @q)");
            p.Add("q", "%" + q.Trim() + "%");
        }

        var whereSql = "WHERE " + string.Join(" AND ", where);

        p.Add("limit", pageSize);
        p.Add("offset", offset);

        var sqlItems = $@"
SELECT
  CAST(l.id AS SIGNED) AS Id,
  l.title AS Title,
  l.status AS Status,
  l.price AS Price,
  l.currency AS Currency,
  l.city AS City,
  l.district AS District,
  l.area_m2 AS AreaM2,
  l.rooms AS Rooms,
  l.created_at AS CreatedAt,
  CAST(u.id AS SIGNED) AS OwnerUserId,
  u.email AS OwnerEmail,
  u.name AS OwnerName
FROM listings l
JOIN users u ON u.id = l.owner_user_id
{whereSql}
ORDER BY l.created_at DESC
LIMIT @limit OFFSET @offset;";

        var sqlCount = $@"SELECT COUNT(*) FROM listings l JOIN users u ON u.id=l.owner_user_id {whereSql};";

        var items = (await db.QueryAsync<AdminListingListItem>(sqlItems, p)).ToList();
        var total = await db.ExecuteScalarAsync<long>(sqlCount, p);

        return (items, total);
    }

    public async Task<bool> SetListingStatus(long listingId, string status)
    {
        var sql = @"UPDATE listings SET status=@status WHERE id=@listingId;";
        var rows = await db.ExecuteAsync(sql, new { listingId, status });
        return rows > 0;
    }
}