using SpacetimeDB;

public partial class Module
{
    [Table(Public = true, Name = "Heartbeat")]
    public partial struct Heartbeat
    {
        [PrimaryKey]
        public uint Id;
        
        public Identity ServerIdentity;

        public int Tick;
    }

    [Table(Public = false, Scheduled = "KeepAlive", Name = "KeepAliveWorker")]
    public partial struct KeepAliveWorker { }
    
    [Table(Public = true, Name = "Config")]
    public partial struct Config
    {
        [PrimaryKey]
        public uint Version;

        public Identity OwnerIdentity;
        public string StreamingPlatform;
        public string StreamName;
        public bool DebugMode;
        public uint UpdateHz;
        public uint EditorBorder;
        public bool Authentication;
        public bool StrictMode;
        public string EditorGuidelines;
        public bool ConfigInit;
    }

    [Table(Public = false, Name = "AuthenticationKey")]
    public partial struct AuthenticationKey
    {
        [PrimaryKey]
        public uint Version;

        public string Key;
    }
    
    [Table(Public = false, Name = "ZIndex")]
    public partial struct ZIndex
    {
        [PrimaryKey]
        public uint Version;

        public int Min;
        public int Max;
        public int Ceiling;
    }

    private const string SEVEN_TV_TENOR_REGEX = @"^https?:\/\/(www\.)?cdn\.7tv\.app(?:\/.*)?$|^https?:\/\/(www\.)?media\.tenor\.com(?:\/.*)?$|^https?:\/\/(www\.)?cdn\.betterttv\.net(?:\/.*)?$";

    private const string HTML_TAG_REGEX = @"<[^>]*>";
}