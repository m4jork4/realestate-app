using Dapper;
using MySqlConnector;

namespace RealEstate.Api.Data;

public interface IUserRepo
{
    Task<UserRow?> GetByEmail(string email);
    Task<UserRow?> GetById(long id);

    Task<long> Insert(string email, string passwordHash, string role, string name, string? phone);

    Task<bool> UpdateProfile(long id, string name, string? phone);
    Task<bool> UpdatePasswordHash(long id, string passwordHash);
}

public sealed class UserRepo(MySqlConnection db) : IUserRepo
{
    public Task<UserRow?> GetByEmail(string email) =>
        db.QuerySingleOrDefaultAsync<UserRow>(
            @"SELECT
                CAST(id AS SIGNED) AS Id,
                email,
                password_hash AS PasswordHash,
                role,
                name,
                phone
              FROM users
              WHERE email = @email
              LIMIT 1;",
            new { email });

    public Task<UserRow?> GetById(long id) =>
        db.QuerySingleOrDefaultAsync<UserRow>(
            @"SELECT
                CAST(id AS SIGNED) AS Id,
                email,
                password_hash AS PasswordHash,
                role,
                name,
                phone
              FROM users
              WHERE id = @id
              LIMIT 1;",
            new { id });

    public async Task<long> Insert(string email, string passwordHash, string role, string name, string? phone)
    {
        var sql = @"
INSERT INTO users(email, password_hash, role, name, phone)
VALUES (@email, @passwordHash, @role, @name, @phone);
SELECT CAST(LAST_INSERT_ID() AS SIGNED);";

        return await db.ExecuteScalarAsync<long>(sql, new { email, passwordHash, role, name, phone });
    }

    public async Task<bool> UpdateProfile(long id, string name, string? phone)
    {
        var sql = @"UPDATE users SET name=@name, phone=@phone WHERE id=@id;";
        var rows = await db.ExecuteAsync(sql, new { id, name, phone });
        return rows > 0;
    }

    public async Task<bool> UpdatePasswordHash(long id, string passwordHash)
    {
        var sql = @"UPDATE users SET password_hash=@passwordHash WHERE id=@id;";
        var rows = await db.ExecuteAsync(sql, new { id, passwordHash });
        return rows > 0;
    }
}

public sealed record UserRow(long Id, string Email, string PasswordHash, string Role, string Name, string? Phone);