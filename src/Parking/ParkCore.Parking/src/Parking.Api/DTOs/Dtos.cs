using Parking.Api.Domain;

namespace Parking.Api.DTOs;

public record CreateFacilityRequest(
    Guid OrganizationId,
    Guid OwnerOrganizationId,
    Guid OperatorOrganizationId,
    Guid? AreaId,
    string Name,
    string Code,
    string? Description,
    FacilityType FacilityType,
    string? Address,
    double? Latitude,
    double? Longitude,
    int TotalCapacity,
    OccupancyMode OccupancyMode,
    string? VehicleTypesCsv,
    string? OperatingHoursJson);

public record UpdateFacilityRequest(
    string Name,
    string? Description,
    string? Address,
    double? Latitude,
    double? Longitude,
    int TotalCapacity,
    OccupancyMode OccupancyMode,
    string? VehicleTypesCsv,
    string? OperatingHoursJson);

public record RejectFacilityRequest(string Reason);

public record CreateZoneRequest(string Name, string Code, string? ZoneType, int Capacity);
public record CreateSpaceRequest(string Code);

public record ManualOccupancyRequest(int Occupied, string? Notes);

public record CreateSessionEntryRequest(
    Guid OrganizationId,
    Guid FacilityId,
    Guid? ZoneId,
    Guid? AreaId,
    string VehiclePlate,
    string? VehicleExternalId,
    VehicleType VehicleType,
    EntryExitMethod EntryMethod,
    Guid? PricingProductId);

public record SessionExitRequest(EntryExitMethod? ExitMethod, DateTimeOffset? ExitTime);

public record ReportViolationRequest(
    Guid ViolationTypeId,
    string? LocationLabel,
    double? Latitude,
    double? Longitude,
    string? Notes);

public record CreateProductRequest(Guid OrganizationId, string Code, string Name, ProductType ProductType);

public record CreateRateRequest(
    Guid OrganizationId,
    Guid? FacilityId,
    Guid ProductId,
    VehicleType VehicleType,
    decimal BaseAmount,
    decimal? PerHourAmount,
    decimal? MaxDailyAmount,
    DateTimeOffset EffectiveFrom,
    DateTimeOffset? EffectiveTo);

public record UpdateRateRequest(
    decimal BaseAmount,
    decimal? PerHourAmount,
    decimal? MaxDailyAmount,
    DateTimeOffset? EffectiveTo,
    bool IsActive);

public record CreateSubscriptionRequest(
    Guid OrganizationId,
    Guid FacilityId,
    Guid ProductId,
    string CustomerLabel,
    string? CustomerKeycloakUserId,
    string? VehiclePlate,
    DateTimeOffset StartsAt,
    DateTimeOffset? EndsAt);

public record MarkObligationPaidRequest(decimal AmountPaid, string? ExternalPaymentReference);

public record PublicFacilityDto(
    Guid Id,
    string Name,
    string Code,
    FacilityType FacilityType,
    string? Address,
    double? Latitude,
    double? Longitude,
    int TotalCapacity,
    int? Occupied,
    int? AvailableSpaces,
    string? VehicleTypesCsv,
    string? OperatingHoursJson);

public record DashboardStatsDto(
    int TotalFacilities,
    int ActiveFacilities,
    int TotalCapacity,
    int Occupied,
    int Available,
    int TodayEntries,
    int TodayExits,
    int ActiveSessions,
    int OpenObligations,
    decimal OutstandingAmount,
    IReadOnlyList<RecentParkingActivityDto> RecentActivity);

public record RecentParkingActivityDto(Guid? SessionId, Guid? FacilityId, string EventType, DateTimeOffset OccurredAt);

public record SessionExitResultDto(
    Domain.Sessions.ParkingSession Session,
    Domain.Obligations.FinancialObligation? Obligation);
