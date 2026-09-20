namespace IdentityPlatform.Service.DTOs;

public record SyncUserRequest(
    string KeycloakUserId,
    string Email,
    string DisplayName
);

public record CreateOrganizationRequest(
    string Name,
    string Code
);

public record CreateOrganizationUnitRequest(
    Guid OrganizationId,
    Guid? ParentUnitId,
    string Name,
    string Code
);

public record CreateAreaRequest(
    Guid OrganizationId,
    Guid? ParentAreaId,
    string Name,
    string Code
);

public record CreatePermissionRequest(
    string Code,
    string Description
);

public record CreateRoleRequest(
    Guid? OrganizationId,
    string Name,
    string Code,
    List<Guid>? PermissionIds
);

public record AssignPermissionsToRoleRequest(
    List<Guid> PermissionIds
);

public record CreateMembershipRequest(
    Guid UserId,
    Guid OrganizationId,
    Guid? OrganizationUnitId,
    Guid RoleId,
    Guid? ScopeAreaId
);
