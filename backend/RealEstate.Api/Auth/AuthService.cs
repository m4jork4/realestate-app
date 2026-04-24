using RealEstate.Api.Common;
using RealEstate.Api.Data;

namespace RealEstate.Api.Auth;

public interface IAuthService
{
    Task<AuthResponse> Register(RegisterRequest req);
    Task<AuthResponse> Login(LoginRequest req);
}

public sealed class AuthService(IUserRepo users, IJwtTokenService jwt) : IAuthService
{
    public async Task<AuthResponse> Register(RegisterRequest req)
    {
        var existing = await users.GetByEmail(req.Email);
        if (existing is not null) throw new ApiException("Email already registered.", 409);

        var hash = BCrypt.Net.BCrypt.HashPassword(req.Password);
        var userId = await users.Insert(req.Email, hash, "USER", req.Name, req.Phone);

        var token = jwt.CreateToken(userId, req.Email, "USER", req.Name);
        return new AuthResponse(token, userId, req.Email, "USER", req.Name);
    }

    public async Task<AuthResponse> Login(LoginRequest req)
    {
        var user = await users.GetByEmail(req.Email)
            ?? throw new ApiException("Bad credentials.", 401);

        if (!BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
            throw new ApiException("Bad credentials.", 401);

        var token = jwt.CreateToken(user.Id, user.Email, user.Role, user.Name);
        return new AuthResponse(token, user.Id, user.Email, user.Role, user.Name);
    }
}
