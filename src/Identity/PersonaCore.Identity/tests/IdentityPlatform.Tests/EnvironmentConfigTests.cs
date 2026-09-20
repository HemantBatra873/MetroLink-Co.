using Microsoft.Extensions.Configuration;
using Xunit;

namespace IdentityPlatform.Tests;

public class EnvironmentConfigTests
{
    [Theory]
    [InlineData("Development")]
    [InlineData("QA")]
    [InlineData("Sandbox")]
    [InlineData("Production")]
    public void VerifyEnvironmentConfigurations_LoadCorrectSettings(string envName)
    {
        var config = new ConfigurationBuilder()
            .SetBasePath(AppContext.BaseDirectory)
            .AddJsonFile("appsettings.json", optional: true)
            .AddJsonFile($"appsettings.{envName}.json", optional: true)
            .Build();

        var authority = config["Jwt:Authority"];
        Assert.False(string.IsNullOrWhiteSpace(authority), $"Jwt:Authority should be configured for environment '{envName}'.");
    }
}
