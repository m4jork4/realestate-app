namespace RealEstate.Api.Auth;

public record RegisterRequest(string Email, string Password, string Name, string? Phone);
public record LoginRequest(string Email, string Password);
public record AuthResponse(string Token, long UserId, string Email, string Role, string Name);
public record MeResponse(long UserId, string Email, string Role, string Name);
