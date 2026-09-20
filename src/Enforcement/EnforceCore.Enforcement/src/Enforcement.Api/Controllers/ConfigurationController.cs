using Enforcement.Api.Authorization;
using Enforcement.Api.Domain;
using Enforcement.Api.DTOs;
using Enforcement.Api.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Enforcement.Api.Controllers;

[ApiController]
[Route("api/v1/configuration")]
public class ConfigurationController : ControllerBase
{
    private readonly EnforcementDbContext _db;

    public ConfigurationController(EnforcementDbContext db) => _db = db;

    [HttpGet("domains")]
    [RequirePermission(EnforcementPermissions.RuleView)]
    public async Task<IActionResult> ListDomains([FromQuery] Guid organizationId, CancellationToken ct)
    {
        var domains = await _db.EnforcementDomains
            .AsNoTracking()
            .Include(d => d.SubjectTypes)
            .Include(d => d.ViolationTypes).ThenInclude(v => v.PenaltyRules)
            .Include(d => d.ActionTypes)
            .Where(d => d.OrganizationId == organizationId)
            .OrderBy(d => d.Code)
            .ToListAsync(ct);
        return Ok(domains);
    }

    [HttpPost("domains")]
    [RequirePermission(EnforcementPermissions.RuleManage)]
    public async Task<IActionResult> CreateDomain([FromBody] CreateDomainRequest request, CancellationToken ct)
    {
        var entity = new EnforcementDomain
        {
            Id = Guid.NewGuid(),
            OrganizationId = request.OrganizationId,
            Code = request.Code.ToUpperInvariant(),
            Name = request.Name,
            Description = request.Description,
            IsActive = true
        };
        _db.EnforcementDomains.Add(entity);
        await _db.SaveChangesAsync(ct);
        return Ok(entity);
    }

    [HttpPost("subject-types")]
    [RequirePermission(EnforcementPermissions.RuleManage)]
    public async Task<IActionResult> CreateSubjectType([FromBody] CreateSubjectTypeRequest request, CancellationToken ct)
    {
        var entity = new SubjectTypeDefinition
        {
            Id = Guid.NewGuid(),
            EnforcementDomainId = request.EnforcementDomainId,
            Code = request.Code.ToUpperInvariant(),
            Name = request.Name,
            ExternalSystemHint = request.ExternalSystemHint
        };
        _db.SubjectTypes.Add(entity);
        await _db.SaveChangesAsync(ct);
        return Ok(entity);
    }

    [HttpPost("violation-types")]
    [RequirePermission(EnforcementPermissions.RuleManage)]
    public async Task<IActionResult> CreateViolationType([FromBody] CreateViolationTypeRequest request, CancellationToken ct)
    {
        var entity = new ViolationType
        {
            Id = Guid.NewGuid(),
            EnforcementDomainId = request.EnforcementDomainId,
            Code = request.Code.ToUpperInvariant(),
            Name = request.Name,
            Description = request.Description,
            IsActive = true
        };
        _db.ViolationTypes.Add(entity);
        await _db.SaveChangesAsync(ct);
        return Ok(entity);
    }

    [HttpPost("action-types")]
    [RequirePermission(EnforcementPermissions.RuleManage)]
    public async Task<IActionResult> CreateActionType([FromBody] CreateActionTypeRequest request, CancellationToken ct)
    {
        var entity = new ActionTypeDefinition
        {
            Id = Guid.NewGuid(),
            EnforcementDomainId = request.EnforcementDomainId,
            Code = request.Code.ToUpperInvariant(),
            Name = request.Name,
            OutcomeKind = request.OutcomeKind,
            IsActive = true
        };
        _db.ActionTypes.Add(entity);
        await _db.SaveChangesAsync(ct);
        return Ok(entity);
    }

    [HttpPost("penalty-rules")]
    [RequirePermission(EnforcementPermissions.RuleManage)]
    public async Task<IActionResult> CreatePenaltyRule([FromBody] CreatePenaltyRuleRequest request, CancellationToken ct)
    {
        var entity = new PenaltyRule
        {
            Id = Guid.NewGuid(),
            ViolationTypeId = request.ViolationTypeId,
            OffenceNumber = request.OffenceNumber,
            Amount = request.Amount,
            Currency = string.IsNullOrWhiteSpace(request.Currency) ? "INR" : request.Currency.ToUpperInvariant(),
            EffectiveFrom = request.EffectiveFrom,
            EffectiveTo = request.EffectiveTo,
            AreaId = request.AreaId,
            IsActive = true
        };
        _db.PenaltyRules.Add(entity);
        await _db.SaveChangesAsync(ct);
        return Ok(entity);
    }
}
