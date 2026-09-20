namespace Parking.Api.Domain;

public enum FacilityStatus
{
    Draft,
    Submitted,
    UnderReview,
    Approved,
    Active,
    Suspended,
    Closed,
    Rejected
}

public enum FacilityType
{
    Surface,
    Multilevel,
    Underground,
    OnStreet,
    Mixed
}

public enum OccupancyMode
{
    Capacity,
    IndividualSpaces,
    Integrated
}

public enum OccupancySource
{
    Manual,
    EntryExit,
    Sensor,
    Anpr,
    ExternalApi
}

public enum SessionStatus
{
    Created,
    Active,
    PaymentPending,
    Completed,
    Cancelled
}

public enum EntryExitMethod
{
    Manual,
    Qr,
    Rfid,
    Anpr,
    Sensor,
    External
}

public enum TicketStatus
{
    Issued,
    Cancelled,
    Completed
}

public enum ProductType
{
    Hourly,
    Daily,
    Monthly,
    Reserved,
    Resident,
    Commercial,
    Corporate
}

public enum SubscriptionStatus
{
    Pending,
    Active,
    Expired,
    Cancelled
}

public enum ObligationStatus
{
    Outstanding,
    PartiallyPaid,
    Paid,
    Waived,
    Cancelled
}

public enum ZoneStatus
{
    Active,
    Inactive
}

public enum SpaceStatus
{
    Active,
    Inactive
}

public enum VehicleType
{
    Car,
    TwoWheeler,
    EV,
    Commercial,
    Bus,
    Other
}
