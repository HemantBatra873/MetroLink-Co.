namespace Enforcement.Api.Domain;

public enum CaseStatus
{
    Draft = 0,
    Issued = 1,
    Payable = 2,
    Paid = 3,
    Disputed = 4,
    UnderReview = 5,
    Upheld = 6,
    Cancelled = 7
}

public enum EvidenceType
{
    Photograph = 0,
    Video = 1,
    Document = 2,
    GpsCoordinates = 3,
    Timestamp = 4,
    OfficerNotes = 5,
    SensorData = 6,
    Other = 7
}

public enum ObligationStatus
{
    Outstanding = 0,
    PartiallyPaid = 1,
    Paid = 2,
    Waived = 3,
    Cancelled = 4
}

public enum ActionOutcomeKind
{
    Informational = 0,
    Financial = 1,
    Restrictive = 2
}
