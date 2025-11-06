using System.Text.Json;
using SpacetimeDB;

public partial class Module
{
    public enum StreamingPlatform
    {
        Twitch,
        Youtube,
        Kick,
        Unhandled,
    }
    
    private static JwtClaims GetJwtClaims(ReducerContext ctx)
    {
        return ctx.SenderAuth.Jwt ?? throw new Exception("Client connected without JWT!");
    }

    private static string GetJwtPayloadProperty(JwtClaims claims, string propertyName)
    {
        using var doc = JsonDocument.Parse(claims.RawPayload);
        if (!doc.RootElement.TryGetProperty(propertyName, out var property))
            throw new Exception($"JWT does not have property: {propertyName}!");
        
        return property.ToString();
    }

    private static StreamingPlatform GetJwtStreamingPlatform(ReducerContext ctx)
    {
        var claims = GetJwtClaims(ctx);
        VerifyClient(ctx);
        
        var streamingPlatform = GetJwtPayloadProperty(claims, "login_method");

        return streamingPlatform.ToLower() switch
        {
            "twitch" => StreamingPlatform.Twitch,
            "google" => StreamingPlatform.Youtube,
            "kick" => StreamingPlatform.Kick,
            _ => StreamingPlatform.Unhandled
        };
    }

    private static string GetJwtUsernameLower(ReducerContext ctx)
    {
        var claims = GetJwtClaims(ctx);
        VerifyClient(ctx);
        
        return GetJwtPayloadProperty(claims, "preferred_username").ToLower();
    }
    
    private static string GetJwtUsernameCased(ReducerContext ctx)
    {
        var claims = GetJwtClaims(ctx);
        VerifyClient(ctx);
        
        return GetJwtPayloadProperty(claims, "preferred_username");
    }
    
    private static void VerifyClient(ReducerContext ctx)
    {
        if (ctx.SenderAuth.IsInternal) return;
        
        List<string> oidcClientIds = new List<string>
        {
            "client_031BvnxblLKmMtctMbLllZ"
        };

        var claims = GetJwtClaims(ctx);
        if (claims.Issuer != "https://auth.spacetimedb.com/oidc")
        {
            throw new Exception("Unauthorized: invalid issuer!");
        }

        if (!oidcClientIds.Any(i => claims.Audience.Contains(i)))
        {
            throw new Exception("Unauthorized: invalid audience!");
        }
    }

    private static void VerifyDeveloper(ReducerContext ctx)
    {
        if (ctx.SenderAuth.IsInternal) return;
        
        List<string> developerUserIds = new List<string>
        {
            "user_3nybGY0BzbbEh9qHg1M97t",
            "user_5banlS3zcyP4G2zCOJ9AF2",
            "user_2syrszGLPpa3BbrwaNDM28",
            "user_3w5JLAX87qk0iKKnEnnIa1",
        };
        
        var claims = GetJwtClaims(ctx);
        if (!developerUserIds.Any(i => claims.Subject.Contains(i)))
        {
            throw new Exception("Unauthorized: invalid developer id!");
        }
    }

    private static void VerifyInternal(ReducerContext ctx)
    {
        if (!ctx.SenderAuth.IsInternal)
        {
            throw new Exception("Unauthorized: token is not internal!");
        }
    }
}