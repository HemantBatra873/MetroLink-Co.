using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Payment.Api.Services;

namespace Payment.Tests;

public sealed class FakeSettlementNotifier : IPaymentSettlementNotifier
{
    public int NotifyCallCount { get; private set; }
    public Guid? LastPaymentId { get; private set; }
    public string? LastExternalReference { get; private set; }

    public void Reset()
    {
        NotifyCallCount = 0;
        LastPaymentId = null;
        LastExternalReference = null;
    }

    public Task NotifySucceededAsync(
        Payment.Api.Domain.Payment payment,
        string externalPaymentReference,
        CancellationToken cancellationToken = default)
    {
        NotifyCallCount++;
        LastPaymentId = payment.Id;
        LastExternalReference = externalPaymentReference;
        return Task.CompletedTask;
    }
}

public sealed class PaymentWebApplicationFactory : WebApplicationFactory<Program>
{
    public FakeSettlementNotifier FakeSettlement { get; } = new();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<IPaymentSettlementNotifier>();
            services.AddSingleton<IPaymentSettlementNotifier>(FakeSettlement);
        });
    }
}
