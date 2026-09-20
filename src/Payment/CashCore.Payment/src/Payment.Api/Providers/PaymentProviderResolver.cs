namespace Payment.Api.Providers;

using Microsoft.Extensions.Configuration;

public interface IPaymentProviderResolver
{
    IPaymentProvider Resolve(string? providerCode);
}

public sealed class PaymentProviderResolver : IPaymentProviderResolver
{
    private readonly IReadOnlyDictionary<string, IPaymentProvider> _providers;
    private readonly string _defaultProviderCode;

    public PaymentProviderResolver(IEnumerable<IPaymentProvider> providers, IConfiguration configuration)
    {
        _providers = providers.ToDictionary(p => p.ProviderCode, StringComparer.OrdinalIgnoreCase);
        _defaultProviderCode = configuration["Payment:DefaultProvider"] ?? "Mock";
    }

    public IPaymentProvider Resolve(string? providerCode)
    {
        var code = string.IsNullOrWhiteSpace(providerCode) ? _defaultProviderCode : providerCode.Trim();
        if (_providers.TryGetValue(code, out var provider))
            return provider;

        throw new InvalidOperationException($"Unknown payment provider '{code}'.");
    }
}
