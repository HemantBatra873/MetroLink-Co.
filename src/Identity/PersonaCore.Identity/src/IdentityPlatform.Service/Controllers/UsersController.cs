using IdentityPlatform.Service.Domain.Entities;
using IdentityPlatform.Service.DTOs;
using IdentityPlatform.Service.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IdentityPlatform.Service.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IdentityDbContext _db;

    public UsersController(IdentityDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<User>>> GetUsers()
    {
        var users = await _db.Users.AsNoTracking().ToListAsync();
        return Ok(users);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<User>> GetUserById(Guid id)
    {
        var user = await _db.Users
            .AsNoTracking()
            .Include(u => u.Memberships)
                .ThenInclude(m => m.Organization)
            .Include(u => u.Memberships)
                .ThenInclude(m => m.Role)
            .Include(u => u.Memberships)
                .ThenInclude(m => m.ScopeArea)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null) return NotFound();
        return Ok(user);
    }

    [HttpPost("sync")]
    public async Task<ActionResult<User>> SyncUser([FromBody] SyncUserRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.KeycloakUserId))
        {
            return BadRequest("KeycloakUserId is required.");
        }

        var existingUser = await _db.Users.FirstOrDefaultAsync(u => u.KeycloakUserId == request.KeycloakUserId);
        if (existingUser != null)
        {
            existingUser.Email = request.Email;
            existingUser.DisplayName = request.DisplayName;
            await _db.SaveChangesAsync();
            return Ok(existingUser);
        }

        var newUser = new User
        {
            Id = Guid.NewGuid(),
            KeycloakUserId = request.KeycloakUserId,
            Email = request.Email,
            DisplayName = request.DisplayName,
            CreatedAt = DateTime.UtcNow
        };

        _db.Users.Add(newUser);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetUserById), new { id = newUser.Id }, newUser);
    }
}
