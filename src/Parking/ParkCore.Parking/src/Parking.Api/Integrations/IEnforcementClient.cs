namespace Parking.Api.Integrations;

public record CreateEnforcementCaseRequest(
    Guid OrganizationId,
    Guid EnforcementDomainId,
    Guid? AreaId,
    string SubjectTypeCode,
    string SubjectDisplayLabel,
    string? SubjectExternalId,
    string? SubjectMetadataJson,
    Guid ViolationTypeId,
    string? LocationLabel,
    double? Latitude,
    double? Longitude,
    string? Notes);

public interface IEnforcementClient
{
    Task<Guid> CreateCaseAsync(CreateEnforcementCaseRequest request, CancellationToken cancellationToken = default);
}

public class HttpEnforcementClient : IEnforcementClient
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<HttpEnforcementClient> _logger;

    public HttpEnforcementClient(HttpClient httpClient, ILogger<HttpEnforcementClient> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<Guid> CreateCaseAsync(CreateEnforcementCaseRequest request, CancellationToken cancellationToken = default)
    {
        using var response = await _httpClient.PostAsJsonAsync("api/v1/enforcement-cases", request, cancellationToken);
        response.EnsureSuccessStatusCode();
        var doc = await response.Content.ReadFromJsonAsync<EnforcementCaseCreatedResponse>(cancellationToken: cancellationToken);
        if (doc?.Id is null || doc.Id == Guid.Empty)
            throw new InvalidOperationException("Enforcement API returned no case id.");
        return doc.Id;
    }

    private sealed record EnforcementCaseCreatedResponse(Guid Id);
}

public class DevStubEnforcementClient : IEnforcementClient
{
    public Task<Guid> CreateCaseAsync(CreateEnforcementCaseRequest request, CancellationToken cancellationToken = default)
        => Task.FromResult(Guid.NewGuid());
}
