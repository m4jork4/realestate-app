using Dapper;
using MySqlConnector;

namespace RealEstate.Api.Data;

public sealed record InquiryCreateRequest(string Name, string Email, string? Phone, string Message);

public sealed record InquiryListItem(
    long Id,
    long ListingId,
    string ListingTitle,
    string Name,
    string Email,
    string? Phone,
    string Message,
    DateTime CreatedAt
);

public interface IInquiryRepo
{
    Task<long> Create(long listingId, long? userId, InquiryCreateRequest req);
    Task<IReadOnlyList<InquiryListItem>> GetMine(long ownerUserId, int limit = 200);
    Task<bool> Delete(long inquiryId, long callerUserId, bool isAdmin);
}

public sealed class InquiryRepo(MySqlConnection db) : IInquiryRepo
{
    public async Task<long> Create(long listingId, long? userId, InquiryCreateRequest req)
    {
        var sql = @"
INSERT INTO inquiries(listing_id, user_id, name, email, phone, message)
VALUES (@listingId, @userId, @name, @email, @phone, @message);
SELECT CAST(LAST_INSERT_ID() AS SIGNED);";

        return await db.ExecuteScalarAsync<long>(sql, new
        {
            listingId,
            userId,
            name = req.Name,
            email = req.Email,
            phone = req.Phone,
            message = req.Message
        });
    }

    public async Task<IReadOnlyList<InquiryListItem>> GetMine(long ownerUserId, int limit = 200)
    {
        var sql = @"
SELECT
  CAST(i.id AS SIGNED) AS Id,
  CAST(i.listing_id AS SIGNED) AS ListingId,
  l.title AS ListingTitle,
  i.name AS Name,
  i.email AS Email,
  i.phone AS Phone,
  i.message AS Message,
  i.created_at AS CreatedAt
FROM inquiries i
JOIN listings l ON l.id = i.listing_id
WHERE l.owner_user_id = @ownerUserId
ORDER BY i.created_at DESC
LIMIT @limit;";

        var rows = await db.QueryAsync<InquiryListItem>(sql, new { ownerUserId, limit });
        return rows.ToList();
    }

    public async Task<bool> Delete(long inquiryId, long callerUserId, bool isAdmin)
    {
        // csak a hirdetés tulaja vagy admin törölhet
        var sql = @"
DELETE i
FROM inquiries i
JOIN listings l ON l.id = i.listing_id
WHERE i.id = @inquiryId
  AND (@isAdmin = 1 OR l.owner_user_id = @callerUserId);";

        var affected = await db.ExecuteAsync(sql, new
        {
            inquiryId,
            callerUserId,
            isAdmin = isAdmin ? 1 : 0
        });

        return affected > 0;
    }
}