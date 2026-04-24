namespace RealEstate.Api.Listings;

public record ListingListItem(
  long Id, string Title, long Price, string Currency,
  string City, string? District, int AreaM2, decimal Rooms,
  string DealType, string PropertyType, string Status,
  string? CoverImageUrl, DateTime CreatedAt);

public record ListingImageDto(long Id, string Url, int SortOrder);

public record ListingDetail(
  long Id, long OwnerUserId, string Title, string Description,
  long Price, string Currency, string City, string? District, string? AddressLine,
  decimal? Lat, decimal? Lng, int AreaM2, decimal Rooms, decimal? Bathrooms,
  int? Floor, int? TotalFloors, int? YearBuilt, string? HeatingType,
  string DealType, string PropertyType, string Status,
  DateTime CreatedAt, DateTime UpdatedAt,
  IReadOnlyList<ListingImageDto> Images);

public record UpsertListingRequest(
  string Title, string Description, string DealType, string PropertyType,
  long Price, string Currency, string City, string? District, string? AddressLine,
  decimal? Lat, decimal? Lng, int AreaM2, decimal Rooms, decimal? Bathrooms,
  int? Floor, int? TotalFloors, int? YearBuilt, string? HeatingType,
  string Status);

public record ListingSearch(
  string? City, string? District,
  long? MinPrice, long? MaxPrice,
  int? MinArea, int? MaxArea,
  decimal? Rooms,
  string? DealType, string? PropertyType,
  string? Sort, int Page = 1, int PageSize = 12);

public record PagedResponse<T>(IReadOnlyList<T> Items, int Page, int PageSize, long Total);
public record CreateResponse(long Id);
public record OkResponse(bool Ok = true);
public record UploadImageResponse(long ImageId, string Url);
