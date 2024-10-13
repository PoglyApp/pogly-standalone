using SpacetimeDB;
using static SpacetimeDB.Runtime;

public partial class Module
{
    private static void Configure(ReducerContext ctx)
    {
        try
        {
            new Heartbeat
            {
                Id = 0,
                ServerIdentity = ctx.Sender,
                Tick = 0
            }.Insert();

            new KeepAliveWorker
            {
                ScheduledId = 0,
                ScheduledAt = TimeSpan.FromSeconds(5)
            }.Insert();

            new Config
            {
                Version = 0,
                OwnerIdentity = ctx.Sender,
                StreamingPlatform = "twitch",
                StreamName = "bobross",
                DebugMode = false,
                UpdateHz = 120,
                EditorBorder = 200,
                Authentication = false,
                StrictMode = false,
                EditorGuidelines = "Placeholder: Follow Twitch ToS :^)",
                ConfigInit = false
            }.Insert();

            new ZIndex
            {
                Version = 0,
                Min = 0,
                Max = 0,
                Ceiling = 1000000
            }.Insert();

            new Layouts
            {
                Name = "Default",
                CreatedBy = "Server",
                Active = true
            }.Insert();
            
            Log($"[Configure] Server successfully started!",LogLevel.Info);
        }
        catch (Exception e)
        {
            Log($"[Configure] Sever encountered a fatal error on Configuration! " + e.Message,LogLevel.Panic);
        }
    }

    [SpacetimeDB.Reducer]
    public static void SetConfig(ReducerContext ctx, string platform, string channel, bool debug, uint updateHz, 
        uint editorBorder, bool authentication, bool strictMode, string authKey="")
    {
        string func = "SetConfig";
        var config = Config.FilterByVersion(0).First();

        if (config.ConfigInit)
        {
            Log($"{ctx.Sender} tried to initialize Config- but Config is already initialized!",LogLevel.Warn);
            throw new Exception($"{ctx.Sender} tried to initialize Config- but Config is already initialized!");
        }
        
        if (!GetGuest(func, ctx.Address!, out var guest))
            throw new Exception($"Unable to {func}: {ctx.Sender} does not have Guest entry!");
        
        if (authentication && string.IsNullOrEmpty(authKey))
            throw new Exception($"Unable to {func}: {ctx.Sender} has authentication enabled but did not provide a Key!");

        try
        {
            config.StreamingPlatform = platform;
            config.StreamName = channel;
            config.OwnerIdentity = guest.Identity;
            config.DebugMode = debug;
            config.UpdateHz = updateHz;
            config.EditorBorder = editorBorder;
            config.Authentication = authentication;
            config.StrictMode = strictMode;
            config.ConfigInit = true;

            try
            {
                new Permissions
                {
                    Identity = config.OwnerIdentity,
                    PermissionLevel = PermissionLevel.Owner
                }.Insert();
            }
            catch (Exception e)
            {
                Log($"[{func}] - Unable to set guest as owner! " + e.Message,LogLevel.Panic);
                throw new Exception($"[{func}] - Unable to set guest as owner!");
            }
        
            new _AuthenticationKey
            {
                Version = 0,
                Key = authKey
            }.Insert();

            //if (config.Authentication && !IsAuthWorking()) StartAuthWorker();
            Config.UpdateByVersion(0, config);
            Log($"[{func}] Success with Globals => DebugMode:{config.DebugMode.ToString()}, StrictMode:{config.StrictMode.ToString()}, Authentication:{config.Authentication.ToString()}!");
        }
        catch (Exception e)
        {
            Log($"[{func}] - Unable to SetConfig! " + e.Message,LogLevel.Panic);
            throw new Exception($"[{func}] - Unable to SetConfig!");
        }
    }
    
    [SpacetimeDB.Reducer]
    public static void UpdateConfig(ReducerContext ctx, string platform, string channel, uint updateHz,
        bool authentication, bool strictMode)
    {
        string func = "UpdateConfig";
        
        if (ctx.Address is null) return;
        if (!GetGuest(func, ctx.Address, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        if (!IsGuestOwner(func, ctx.Sender)) return;

        try
        {
            var oldConfig = Config.FindByVersion(0)!.Value;
            var newConfig = oldConfig;
            newConfig.StreamingPlatform = platform;
            newConfig.StreamName = channel;
            newConfig.UpdateHz = updateHz;
            newConfig.Authentication = authentication;
            newConfig.StrictMode = strictMode;
            
            Config.UpdateByVersion(0, newConfig);
            Log($"[{func}] Success with Globals => StreamingPlatform:{newConfig.StreamingPlatform}, StreamName:{newConfig.StreamName}, UpdateHz:{newConfig.UpdateHz.ToString()}, StrictMode:{newConfig.StrictMode.ToString()}!");
        }
        catch (Exception e)
        {
            Log($"[{func}] - Unable to UpdateConfig! " + e.Message,LogLevel.Error);
        }
    }
    
    [SpacetimeDB.Reducer]
    public static void ImportConfig(ReducerContext ctx, string platform, string channel, Identity ownerIdentity, bool debug, uint updateHz, 
        uint editorBorder, bool authentication, bool strictMode, int zmin, int zmax, string authKey="")
    {
        string func = "ImportConfig";
        var config = Config.FilterByVersion(0).First();
        if (config.ConfigInit) return;

        try
        {
            config.StreamingPlatform = platform;
            config.StreamName = channel;
            config.OwnerIdentity = ownerIdentity;
            config.DebugMode = debug;
            config.UpdateHz = updateHz;
            config.EditorBorder = editorBorder;
            config.Authentication = authentication;
            config.StrictMode = strictMode;
            config.ConfigInit = true;
        
            new _AuthenticationKey
            {
                Version = 0,
                Key = authKey
            }.Insert();

            var zindex = ZIndex.FilterByVersion(0).First();
            zindex.Min = zmin;
            zindex.Max = zmax;
            ZIndex.UpdateByVersion(0, zindex);

            Config.UpdateByVersion(0, config); 
        }
        catch (Exception e)
        {
            Log($"[{func}] - Unable to ImportConfig! " + e.Message,LogLevel.Panic);
            throw new Exception($"[{func}] - Unable to ImportConfig!");
        }
    }

    [SpacetimeDB.Reducer]
    public static void UpdateAuthenticationKey(ReducerContext ctx, string authenticationKey)
    {
        string func = "UpdateAuthenticationKey";
        
        if (ctx.Address is null) return;
        if (!GetGuest(func, ctx.Address, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        if (!IsGuestOwner(func, ctx.Sender)) return;

        try
        {
            var oldAuthKey = _AuthenticationKey.FindByVersion(0)!.Value;
            var newAuthKey = oldAuthKey;
            newAuthKey.Key = authenticationKey;
            _AuthenticationKey.UpdateByVersion(0, newAuthKey);
        }
        catch (Exception e)
        {
            Log($"[{func}] Encountered error updating Authentication Key, requested by {ctx.Sender}. " + e.Message,
                LogLevel.Error);
        }
    }

    [SpacetimeDB.Reducer]
    public static void UpdateEditorGuidelines(ReducerContext ctx, string guidelines)
    {
        string func = "UpdateEditorGuidelines";

        if (ctx.Address is null) return;
        if (!GetGuest(func, ctx.Address, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        if (!IsGuestOwner(func, ctx.Sender)) return;

        try
        {
            var oldConfig = Config.FindByVersion(0)!.Value;
            var newConfig = oldConfig;
            newConfig.EditorGuidelines = guidelines;
            
            Config.UpdateByVersion(0, newConfig);
        }
        catch (Exception e)
        {
            Log($"[{func}] Encountered error updating EditorGuidelines, requested by {ctx.Sender}. " + e.Message,
                LogLevel.Error);
        }
    }
    
    //private static List<Tuple<Address,int>> _identities = new();

    [SpacetimeDB.Reducer]
    public static void Authenticate(ReducerContext ctx, string key)
    {
        if (ctx.Address is null) throw new Exception($"Unable to Authenticate: {ctx.Sender} does not have an address!");
        if (!GetGuest("Authenticate", ctx.Address, out var guest))
            throw new Exception($"Unable to Authenticate: {ctx.Sender} does not have Guest entry!");
        
        if (string.IsNullOrEmpty(key))
            throw new Exception($"Unable to Authenticate: {ctx.Sender} did not provide a Key!");

        try
        {
            var _key = _AuthenticationKey.FindByVersion(0);
            if (_key is not null)
            {
                if (key == _key.Value.Key)
                {
                    //_identities.Add(new Tuple<Address, int>(ctx.Address,0));
                    var g = Guests.FindByAddress(ctx.Address);
                    if (g is null) throw new Exception("Guest is null!");
                    var newGuest = g.Value;
                    newGuest.Authenticated = true;
                    Guests.UpdateByAddress(newGuest.Address, newGuest);
                }
            }
        }
        catch (Exception e)
        {
            Log($"[Authenticate] - Unable to update {guest.Nickname} ({guest.Identity.ToString()}) authenticated status for some reason! " + e.Message,LogLevel.Error);
            throw new Exception(
                $"[Authenticate] - Unable to update {guest.Nickname} ({guest.Identity.ToString()}) authenticated status for some reason!");
        }
    }
    
    
    // private static int _maxPatience = 25;
    // private static int _currentPatience = 0;
    //
    // [SpacetimeDB.Reducer]
    // public static void AuthenticateDoWork(ReducerContext ctx, AuthenticationWorker args)
    // {
    //     if (Guests.Iter().Count() == 0 || _identities.Count == 0)
    //     {
    //         _currentPatience++;
    //     }
    //     else
    //     {
    //         _currentPatience = 0;
    //     }
    //     
    //     if (_currentPatience > _maxPatience)
    //     {
    //         _currentPatience = 0;
    //         Log("[AuthDoWork] Max patience reached... pausing.");
    //         _identities.Clear();
    //         StopAuthWorker();
    //         return;
    //     }
    //
    //     if (_identities.Count == 0) return;
    //
    //     foreach (var i in _identities)
    //     {
    //         try
    //         {
    //             var g = GetGuest("AuthDoWork", i.Item1, out var guest);
    //             if (!g) continue;
    //
    //             if (guest.Authenticated) _identities.Remove(i);
    //             if (i.Item2 > 15) _identities.Remove(i);
    //
    //             guest.Authenticated = true;
    //             var a = Guests.UpdateByAddress(i.Item1, guest);
    //             if (!a)
    //             {
    //                 _identities[_identities.FindIndex(id => id.Item1 == i.Item1)] = new Tuple<Address, int>(i.Item1, i.Item2+1);
    //             }
    //         }
    //         catch (Exception e)
    //         {
    //             Log("AuthDoWork Error: " + e.Message, LogLevel.Error);
    //         }
    //     }
    // }
}