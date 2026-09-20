using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Enforcement.Api.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "enforcement_domains",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OrganizationId = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_enforcement_domains", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "action_types",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EnforcementDomainId = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    OutcomeKind = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_action_types", x => x.Id);
                    table.ForeignKey(
                        name: "FK_action_types_enforcement_domains_EnforcementDomainId",
                        column: x => x.EnforcementDomainId,
                        principalTable: "enforcement_domains",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "enforcement_cases",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CaseNumber = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    OrganizationId = table.Column<Guid>(type: "uuid", nullable: false),
                    AreaId = table.Column<Guid>(type: "uuid", nullable: true),
                    EnforcementDomainId = table.Column<Guid>(type: "uuid", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedByKeycloakUserId = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    AssignedOfficerKeycloakUserId = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: true),
                    IssuedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    LocationLabel = table.Column<string>(type: "text", nullable: true),
                    Latitude = table.Column<double>(type: "double precision", nullable: true),
                    Longitude = table.Column<double>(type: "double precision", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_enforcement_cases", x => x.Id);
                    table.ForeignKey(
                        name: "FK_enforcement_cases_enforcement_domains_EnforcementDomainId",
                        column: x => x.EnforcementDomainId,
                        principalTable: "enforcement_domains",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "subject_types",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EnforcementDomainId = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    ExternalSystemHint = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_subject_types", x => x.Id);
                    table.ForeignKey(
                        name: "FK_subject_types_enforcement_domains_EnforcementDomainId",
                        column: x => x.EnforcementDomainId,
                        principalTable: "enforcement_domains",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "violation_types",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EnforcementDomainId = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_violation_types", x => x.Id);
                    table.ForeignKey(
                        name: "FK_violation_types_enforcement_domains_EnforcementDomainId",
                        column: x => x.EnforcementDomainId,
                        principalTable: "enforcement_domains",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "case_audit_events",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EnforcementCaseId = table.Column<Guid>(type: "uuid", nullable: false),
                    EventType = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    ActorKeycloakUserId = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    OccurredAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Reason = table.Column<string>(type: "text", nullable: true),
                    DetailsJson = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_case_audit_events", x => x.Id);
                    table.ForeignKey(
                        name: "FK_case_audit_events_enforcement_cases_EnforcementCaseId",
                        column: x => x.EnforcementCaseId,
                        principalTable: "enforcement_cases",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "case_subjects",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EnforcementCaseId = table.Column<Guid>(type: "uuid", nullable: false),
                    SubjectTypeCode = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    ExternalId = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: true),
                    DisplayLabel = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    MetadataJson = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_case_subjects", x => x.Id);
                    table.ForeignKey(
                        name: "FK_case_subjects_enforcement_cases_EnforcementCaseId",
                        column: x => x.EnforcementCaseId,
                        principalTable: "enforcement_cases",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "enforcement_actions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EnforcementCaseId = table.Column<Guid>(type: "uuid", nullable: false),
                    ActionTypeId = table.Column<Guid>(type: "uuid", nullable: false),
                    IssuedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    IssuedByKeycloakUserId = table.Column<string>(type: "text", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    FinancialObligationId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_enforcement_actions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_enforcement_actions_action_types_ActionTypeId",
                        column: x => x.ActionTypeId,
                        principalTable: "action_types",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_enforcement_actions_enforcement_cases_EnforcementCaseId",
                        column: x => x.EnforcementCaseId,
                        principalTable: "enforcement_cases",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "evidence_items",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EnforcementCaseId = table.Column<Guid>(type: "uuid", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    UriOrValue = table.Column<string>(type: "text", nullable: true),
                    ContentType = table.Column<string>(type: "text", nullable: true),
                    CapturedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CapturedByKeycloakUserId = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_evidence_items", x => x.Id);
                    table.ForeignKey(
                        name: "FK_evidence_items_enforcement_cases_EnforcementCaseId",
                        column: x => x.EnforcementCaseId,
                        principalTable: "enforcement_cases",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "financial_obligations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EnforcementCaseId = table.Column<Guid>(type: "uuid", nullable: false),
                    EnforcementActionId = table.Column<Guid>(type: "uuid", nullable: true),
                    Amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    AmountPaid = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Currency = table.Column<string>(type: "character varying(8)", maxLength: 8, nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    DueAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    ExternalPaymentReference = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_financial_obligations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_financial_obligations_enforcement_cases_EnforcementCaseId",
                        column: x => x.EnforcementCaseId,
                        principalTable: "enforcement_cases",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "case_violations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EnforcementCaseId = table.Column<Guid>(type: "uuid", nullable: false),
                    ViolationTypeId = table.Column<Guid>(type: "uuid", nullable: false),
                    OffenceNumberApplied = table.Column<int>(type: "integer", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_case_violations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_case_violations_enforcement_cases_EnforcementCaseId",
                        column: x => x.EnforcementCaseId,
                        principalTable: "enforcement_cases",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_case_violations_violation_types_ViolationTypeId",
                        column: x => x.ViolationTypeId,
                        principalTable: "violation_types",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "penalty_rules",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ViolationTypeId = table.Column<Guid>(type: "uuid", nullable: false),
                    OffenceNumber = table.Column<int>(type: "integer", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Currency = table.Column<string>(type: "character varying(8)", maxLength: 8, nullable: false),
                    EffectiveFrom = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    EffectiveTo = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    AreaId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_penalty_rules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_penalty_rules_violation_types_ViolationTypeId",
                        column: x => x.ViolationTypeId,
                        principalTable: "violation_types",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_action_types_EnforcementDomainId_Code",
                table: "action_types",
                columns: new[] { "EnforcementDomainId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_case_audit_events_EnforcementCaseId",
                table: "case_audit_events",
                column: "EnforcementCaseId");

            migrationBuilder.CreateIndex(
                name: "IX_case_subjects_EnforcementCaseId",
                table: "case_subjects",
                column: "EnforcementCaseId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_case_violations_EnforcementCaseId",
                table: "case_violations",
                column: "EnforcementCaseId");

            migrationBuilder.CreateIndex(
                name: "IX_case_violations_ViolationTypeId",
                table: "case_violations",
                column: "ViolationTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_enforcement_actions_ActionTypeId",
                table: "enforcement_actions",
                column: "ActionTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_enforcement_actions_EnforcementCaseId",
                table: "enforcement_actions",
                column: "EnforcementCaseId");

            migrationBuilder.CreateIndex(
                name: "IX_enforcement_cases_CaseNumber",
                table: "enforcement_cases",
                column: "CaseNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_enforcement_cases_EnforcementDomainId",
                table: "enforcement_cases",
                column: "EnforcementDomainId");

            migrationBuilder.CreateIndex(
                name: "IX_enforcement_domains_OrganizationId_Code",
                table: "enforcement_domains",
                columns: new[] { "OrganizationId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_evidence_items_EnforcementCaseId",
                table: "evidence_items",
                column: "EnforcementCaseId");

            migrationBuilder.CreateIndex(
                name: "IX_financial_obligations_EnforcementCaseId",
                table: "financial_obligations",
                column: "EnforcementCaseId");

            migrationBuilder.CreateIndex(
                name: "IX_penalty_rules_ViolationTypeId",
                table: "penalty_rules",
                column: "ViolationTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_subject_types_EnforcementDomainId_Code",
                table: "subject_types",
                columns: new[] { "EnforcementDomainId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_violation_types_EnforcementDomainId_Code",
                table: "violation_types",
                columns: new[] { "EnforcementDomainId", "Code" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "case_audit_events");

            migrationBuilder.DropTable(
                name: "case_subjects");

            migrationBuilder.DropTable(
                name: "case_violations");

            migrationBuilder.DropTable(
                name: "enforcement_actions");

            migrationBuilder.DropTable(
                name: "evidence_items");

            migrationBuilder.DropTable(
                name: "financial_obligations");

            migrationBuilder.DropTable(
                name: "penalty_rules");

            migrationBuilder.DropTable(
                name: "subject_types");

            migrationBuilder.DropTable(
                name: "action_types");

            migrationBuilder.DropTable(
                name: "enforcement_cases");

            migrationBuilder.DropTable(
                name: "violation_types");

            migrationBuilder.DropTable(
                name: "enforcement_domains");
        }
    }
}
