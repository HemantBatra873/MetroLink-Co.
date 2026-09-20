namespace Payment.Api.Authorization;

/// <summary>
/// Role claims used by Payment API and UI.
/// Admin sees all payments; Operator can initiate; Viewer is read-only within org scope.
/// </summary>
public static class PaymentRoles
{
    public const string Admin = "PaymentAdmin";
    public const string Operator = "PaymentOperator";
    public const string Viewer = "PaymentViewer";

    public const string CanView = Admin + "," + Operator + "," + Viewer;
    public const string CanInitiate = Admin + "," + Operator;
    public const string CanAdminister = Admin;
}

public static class PaymentPolicies
{
    public const string ViewPayments = "Payment.View";
    public const string InitiatePayments = "Payment.Initiate";
    public const string AdministerPayments = "Payment.Admin";
}
