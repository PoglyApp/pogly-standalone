using System.Text;
using SpacetimeDB;
using SpacetimeDB.Internal.TableHandles;

public partial class Module
{
    private static void Configure(ReducerContext ctx)
    {
        try
        {
            ctx.Db.Heartbeat.Insert(new Heartbeat
            {
                Id = 0,
                ServerIdentity = ctx.Identity,
                Tick = 0
            });


            ctx.Db.KeepAliveWorker.Insert(new KeepAliveWorker
            {
                Id = 0,
                ScheduledAt = TimeSpan.FromSeconds(5)
            });

            ctx.Db.Config.Insert(new Config
            {
                Version = 0,
                OwnerIdentity = ctx.Identity,
                StreamingPlatform = "twitch",
                StreamName = "bobross",
                DebugMode = false,
                UpdateHz = 120,
                EditorBorder = 200,
                Authentication = false,
                StrictMode = false,
                EditorGuidelines = "Placeholder: Follow Twitch ToS :^)",
                ConfigInit = false
            });

            int length = 12;
            Random rng = new Random();
            string alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            var sb = new StringBuilder(length);
            for (int i = 0; i < length; i++)
            {
                int index = rng.Next(0, alphabet.Length);
                sb.Append(alphabet[index]);
            }

            ctx.Db.OwnerRecoveryKey.Insert(new AuthenticationKey
            {
                Version = 0,
                Key = sb.ToString()
            });

            ctx.Db.ZIndex.Insert(new ZIndex
            {
                Version = 0,
                Min = 0,
                Max = 0,
                Ceiling = 1000000
            });

            ctx.Db.Layouts.Insert(new Layouts
            {
                Name = "Default",
                CreatedBy = "Server",
                Active = true
            });
            
            Log.Info($"[Configure] Server successfully started!");
        }
        catch (Exception e)
        {
            Log.Exception($"[Configure] Sever encountered a fatal error on Configuration! " + e.Message);
        }
    }

    [Reducer]
    public static void SetConfig(ReducerContext ctx, string platform, string channel, bool debug, uint updateHz, 
        uint editorBorder, bool authentication, bool strictMode, string authKey="")
    {
        string func = "SetConfig";

        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        
        var oldConfig = ctx.Db.Config.Version.Find(0);

        if (oldConfig.HasValue)
        {
            if (oldConfig.Value.ConfigInit)
            {
                Log.Exception($"{ctx.Sender} tried to initialize Config- but Config is already initialized!");
                throw new Exception($"{ctx.Sender} tried to initialize Config- but Config is already initialized!");
            }
            
            if (authentication && string.IsNullOrEmpty(authKey))
                throw new Exception($"Unable to {func}: {ctx.Sender} has authentication enabled but did not provide a Key!");

            try
            {
                var newConfig = oldConfig.Value;
                newConfig.StreamingPlatform = platform;
                newConfig.StreamName = channel;
                newConfig.OwnerIdentity = guest.Identity;
                newConfig.DebugMode = debug;
                newConfig.UpdateHz = updateHz;
                newConfig.EditorBorder = editorBorder;
                newConfig.Authentication = authentication;
                newConfig.StrictMode = strictMode;
                newConfig.ConfigInit = true;

                try
                {
                    SetPermission(ctx, newConfig.OwnerIdentity, PermissionTypes.Owner);
                }
                catch (Exception e)
                {
                    Log.Exception($"[{func}] - Unable to set guest as owner! " + e.Message);
                    throw new Exception($"[{func}] - Unable to set guest as owner!");
                }
            
                ctx.Db.AuthenticationKey.Insert(new AuthenticationKey
                {
                    Version = 0,
                    Key = authKey
                });
                
                ctx.Db.Config.Version.Update(newConfig);
                
                Log.Info($"[{func}] Success with Globals => DebugMode:{newConfig.DebugMode.ToString()}, StrictMode:{newConfig.StrictMode.ToString()}, Authentication:{newConfig.Authentication.ToString()}!");
            }
            catch (Exception e)
            {
                Log.Error($"[{func}] - Unable to SetConfig! " + e.Message);
                throw new Exception($"[{func}] - Unable to SetConfig!");
            }
        }
        else
        {
            Log.Exception($"{ctx.Sender} tried to initialize SetConfig - but we couldn't find the default Config!");
        }
    }

    [Reducer]
    public static void ClaimOwnership(ReducerContext ctx, string _key)
    {
        if (ctx.ConnectionId is null)
            throw new Exception($"Unable to Claim Ownership: {ctx.Sender} does not have an address!");

        if (!GetGuest("ClaimOwnership", ctx, out var guest))
            throw new Exception($"Unable to Claim Ownership: {ctx.Sender} does not have Guest entry!");

        if (string.IsNullOrEmpty(_key))
            throw new Exception($"Unable to Claim Ownership: {ctx.Sender} did not provide a Key!");
        
        var config = ctx.Db.Config.Version.Find(0) ?? throw new Exception($"Unable to Claim Ownership: Server cannot find Config!");
        
        if(config.OwnerIdentity != ctx.Identity) throw new Exception($"Unable to Claim Ownership: {ctx.Sender} tried to claim ownership after it's already been claimed!");

        try
        {
            var key = ctx.Db.OwnerRecoveryKey.Version.Find(0);

            if (key.HasValue)
            {
                if (_key != key.Value.Key) return;
                
                var newConfig = config;
                newConfig.OwnerIdentity = guest.Identity;
                ctx.Db.Config.Version.Update(newConfig);
                
                SetPermission(ctx, guest.Identity, PermissionTypes.Owner);
            }
            else
            {
                Log.Error($"[ClaimOwnership] {ctx.Sender} tried to Claim Ownership - couldn't find ownership recovery key!");
            }
        }
        catch (Exception e)
        {
            Log.Error($"[ClaimOwnership] {ctx.Sender} tried to Claim Ownership - there was an issue! " + e.Message);
        }
        
    }
    
    [Reducer]
    public static void UpdateConfig(ReducerContext ctx, string platform, string channel, uint updateHz,
        bool authentication, bool strictMode)
    {
        string func = "UpdateConfig";
        
        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        
        if (!HasPermission(ctx, ctx.Sender, PermissionTypes.UpdateConfig)) return;

        try
        {
            var oldConfig = ctx.Db.Config.Version.Find(0);

            if (oldConfig.HasValue)
            {
                var newConfig = oldConfig.Value;
                newConfig.StreamingPlatform = platform;
                newConfig.StreamName = channel;
                newConfig.UpdateHz = updateHz;
                newConfig.Authentication = authentication;
                newConfig.StrictMode = strictMode;
            
                ctx.Db.Config.Version.Update(newConfig);
                Log.Info($"[{func}] Success with Globals => StreamingPlatform:{newConfig.StreamingPlatform}, StreamName:{newConfig.StreamName}, UpdateHz:{newConfig.UpdateHz.ToString()}, StrictMode:{newConfig.StrictMode.ToString()}!");
            }
            else
            {
                Log.Error($"[{func}] Error updating Config - Could not find Default config!");
            }
            
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] - Unable to UpdateConfig! " + e.Message);
        }
    }
    
    [Reducer]
    public static void ImportConfig(ReducerContext ctx, string platform, string channel, Identity ownerIdentity, bool debug, uint updateHz, 
        uint editorBorder, bool authentication, bool strictMode, int zmin, int zmax, string authKey="")
    {
        string func = "ImportConfig";
        var config = ctx.Db.Config.Version.Find(0);

        if (config.HasValue)
        {
            if (config.Value.ConfigInit)
            {
                Log.Exception($"{ctx.Sender} tried to import Config- but Config is already initialized!");
                throw new Exception($"{ctx.Sender} tried to import Config- but Config is already initialized!");
            }
            
            try
            {
                var newConfig = config.Value;
                newConfig.StreamingPlatform = platform;
                newConfig.StreamName = channel;
                newConfig.OwnerIdentity = ownerIdentity;
                newConfig.DebugMode = debug;
                newConfig.UpdateHz = updateHz;
                newConfig.EditorBorder = editorBorder;
                newConfig.Authentication = authentication;
                newConfig.StrictMode = strictMode;
                newConfig.ConfigInit = true;
        
                ctx.Db.AuthenticationKey.Insert(new AuthenticationKey
                {
                    Version = 0,
                    Key = authKey
                });

                var zindex = ctx.Db.ZIndex.Version.Find(0);

                if (zindex.HasValue)
                {
                    var newZIndex = zindex.Value;
                    newZIndex.Min = zmin;
                    newZIndex.Max = zmax;
                    ctx.Db.ZIndex.Version.Update(newZIndex);
                }
                else
                {
                    Log.Exception($"[{func}] - Unable to set ZIndex, can't find default!");
                    throw new Exception($"[{func}] - Unable to set ZIndex, can't find default!");
                }

                ctx.Db.Config.Version.Update(newConfig);
            }
            catch (Exception e)
            {
                Log.Exception($"[{func}] - Unable to ImportConfig! " + e.Message);
                throw new Exception($"[{func}] - Unable to ImportConfig!");
            }
        }
        else
        {
            Log.Exception($"{ctx.Sender} tried to initialize ImportConfig - but we couldn't find the default Config!");
        }
    }

    [Reducer]
    public static void UpdateAuthenticationKey(ReducerContext ctx, string authenticationKey)
    {
        string func = "UpdateAuthenticationKey";
        
        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        
        if (!HasPermission(ctx, ctx.Sender, PermissionTypes.UpdateAuthenticationKey)) return;

        try
        {
            var oldAuthKey = ctx.Db.AuthenticationKey.Version.Find(0);
            if (oldAuthKey.HasValue)
            {
                var newAuthKey = oldAuthKey.Value;
                newAuthKey.Key = authenticationKey;
                ctx.Db.AuthenticationKey.Version.Update(newAuthKey);
            }
            else
            {
                Log.Error($"[{func}] Error updating Authentication Key - can't find Default Auth key!");
            }
            
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Encountered error updating Authentication Key, requested by {ctx.Sender}. " + e.Message);
        }
    }

    [Reducer]
    public static void UpdateEditorGuidelines(ReducerContext ctx, string guidelines)
    {
        string func = "UpdateEditorGuidelines";

        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        
        if (!HasPermission(ctx, ctx.Sender, PermissionTypes.UpdateEditorGuidelines)) return;

        try
        {
            var oldConfig = ctx.Db.Config.Version.Find(0);

            if (oldConfig.HasValue)
            {
                var newConfig = oldConfig.Value;
                newConfig.EditorGuidelines = guidelines;

                ctx.Db.Config.Version.Update(newConfig);
            }
            else
            {
                Log.Error($"[{func}] Error updating editor guidelines - can't find default config!");
            }
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Encountered error updating EditorGuidelines, requested by {ctx.Sender}. " + e.Message);
        }
    }

    [Reducer]
    public static void Authenticate(ReducerContext ctx, string _key)
    {
        if (ctx.ConnectionId is null) throw new Exception($"Unable to Authenticate: {ctx.Sender} does not have an address!");
        if (!GetGuest("Authenticate", ctx, out var guest))
            throw new Exception($"Unable to Authenticate: {ctx.Sender} does not have Guest entry!");
        
        if (string.IsNullOrEmpty(_key))
            throw new Exception($"Unable to Authenticate: {ctx.Sender} did not provide a Key!");

        try
        {
            var key = ctx.Db.AuthenticationKey.Version.Find(0);

            if (key.HasValue)
            {
                if (_key != key.Value.Key) return;
                var g = ctx.Db.Guests.Address.Find(ctx.ConnectionId.Value);
                if (g is null) throw new Exception("Guest is null!");
                var newGuest = g.Value;
                newGuest.Authenticated = true;
                ctx.Db.Guests.Address.Update(newGuest);
            }
            else
            {
                Log.Error($"[Authenticate] {ctx.Sender} tried to authenticate - couldn't find AuthenticationKey 0!");
            }
        }
        catch (Exception e)
        {
            Log.Error($"[Authenticate] - Unable to update {guest.Nickname} ({guest.Identity.ToString()}) authenticated status for some reason! " + e.Message);
            throw new Exception(
                $"[Authenticate] - Unable to update {guest.Nickname} ({guest.Identity.ToString()}) authenticated status for some reason!");
        }
    }
}