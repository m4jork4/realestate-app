using Dapper;
using MySqlConnector;
using RealEstate.Api.AdminMessages;

namespace RealEstate.Api.Data;

public interface IAdminMessageRepo
{
    Task<long> Create(long? userId, AdminMessageCreateRequest req);
    Task<IReadOnlyList<AdminMessageListItem>> GetLatest(int limit);
    Task<bool> Delete(long id);
}

public sealed class AdminMessageRepo : IAdminMessageRepo
{
    private readonly MySqlConnection db;

    public AdminMessageRepo(MySqlConnection db)
    {
        this.db = db;
    }

    public async Task<long> Create(long? userId, AdminMessageCreateRequest req)
    {
        const string sql = @"
INSERT INTO admin_messages (user_id, name, email, subject, message)
VALUES (@userId, @name, @email, @subject, @message);
SELECT LAST_INSERT_ID();";

        var id = await db.ExecuteScalarAsync<long>(sql, new
        {
            userId,
            name = req.Name.Trim(),
            email = req.Email.Trim(),
            subject = string.IsNullOrWhiteSpace(req.Subject) ? null : req.Subject!.Trim(),
            message = req.Message.Trim(),
        });
        return id;
    }

    public async Task<IReadOnlyList<AdminMessageListItem>> GetLatest(int limit)
    {
        const string sql = @"
SELECT id Id,
       user_id UserId,
       name Name,
       email Email,
       subject Subject,
       message Message,
       created_at CreatedAt
FROM admin_messages
ORDER BY id DESC
LIMIT @limit;";

        var rows = await db.QueryAsync<AdminMessageListItem>(sql, new { limit });
        return rows.ToList();
    }

    public async Task<bool> Delete(long id)
    {
        const string sql = "DELETE FROM admin_messages WHERE id=@id";
        var n = await db.ExecuteAsync(sql, new { id });
        return n > 0;
    }
}
