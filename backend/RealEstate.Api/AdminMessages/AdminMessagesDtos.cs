namespace RealEstate.Api.AdminMessages;

public sealed class AdminMessageCreateRequest
{
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
    public string? Subject { get; set; }
    public string Message { get; set; } = "";
}

public sealed class AdminMessageListItem
{
    public long Id { get; set; }
    public long? UserId { get; set; }
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
    public string? Subject { get; set; }
    public string Message { get; set; } = "";
    public DateTime CreatedAt { get; set; }
}
