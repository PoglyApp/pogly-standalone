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
        var config = Config.FilterByVersion(0).First();

        if (config.ConfigInit)
        {
            Log($"{ctx.Sender} tried to initialize Config- but Config is already initialized!",LogLevel.Warn);
            throw new Exception($"{ctx.Sender} tried to initialize Config- but Config is already initialized!");
        }
        
        if (!GetGuest("SetConfig", ctx.Sender, out var guest))
            throw new Exception($"Unable to SetConfig: {ctx.Sender} does not have Guest entry!");
        
        if (authentication && string.IsNullOrEmpty(authKey))
            throw new Exception($"Unable to SetConfig: {ctx.Sender} has authentication enabled but did not provide a Key!");

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
                Log("[SetConfig] - Unable to set guest as owner! " + e.Message,LogLevel.Panic);
                throw new Exception("[SetConfig] - Unable to set guest as owner!");
            }
        
            new _AuthenticationKey
            {
                Version = 0,
                Key = authKey
            }.Insert();

            if (config.Authentication && !IsAuthWorking()) StartAuthWorker();
            Config.UpdateByVersion(0, config);
            Log($"[SetConfig] Success with Globals => DebugMode:{config.DebugMode.ToString()}, StrictMode:{config.StrictMode.ToString()}, Authentication:{config.Authentication.ToString()}");
        }
        catch (Exception e)
        {
            Log("[SetConfig] - Unable to SetConfig! " + e.Message,LogLevel.Panic);
            throw new Exception("[SetConfig] - Unable to SetConfig!");
        }
    }

    [SpacetimeDB.Reducer]
    public static void UpdateAuthenticationKey(ReducerContext ctx, string authenticationKey)
    {
        string func = "UpdateAuthenticationKey";
        
        if (!GetGuest(func, ctx.Sender, out var guest)) return;
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
    
    private static List<Tuple<Identity,int>> _identities = new();

    [SpacetimeDB.Reducer]
    public static void Authenticate(ReducerContext ctx, string key)
    {
        if (!GetGuest("Authenticate", ctx.Sender, out var guest))
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
                    _identities.Add(new Tuple<Identity, int>(ctx.Sender,0));
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
    
    
    private static int _maxPatience = 25;
    private static int _currentPatience = 0;
    
    [SpacetimeDB.Reducer]
    public static void AuthenticateDoWork(ReducerContext ctx, AuthenticationWorker args)
    {
        if (Guests.Iter().Count() == 0 || _identities.Count == 0)
        {
            _currentPatience++;
        }
        else
        {
            _currentPatience = 0;
        }
        
        if (_currentPatience > _maxPatience)
        {
            _currentPatience = 0;
            Log("[AuthDoWork] Max patience reached... pausing.");
            _identities.Clear();
            StopAuthWorker();
            return;
        }

        if (_identities.Count == 0) return;

        foreach (var i in _identities)
        {
            try
            {
                var g = GetGuest("AuthDoWork", i.Item1, out var guest);
                if (!g) continue;

                if (guest.Authenticated) _identities.Remove(i);
                if (i.Item2 > 15) _identities.Remove(i);

                guest.Authenticated = true;
                var a = Guests.UpdateByIdentity(i.Item1, guest);
                if (!a)
                {
                    _identities[_identities.FindIndex(id => id.Item1 == i.Item1)] = new Tuple<Identity, int>(i.Item1, i.Item2+1);
                }
            }
            catch (Exception e)
            {
                Log("AuthDoWork Error: " + e.Message, LogLevel.Error);
            }
        }
    }
}