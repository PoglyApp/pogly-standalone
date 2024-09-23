using System.Net;
using System.Runtime.InteropServices.JavaScript;
using SpacetimeDB;
using static SpacetimeDB.Runtime;

public partial class Module
{
    [SpacetimeDB.Table(Public = true)]
    public partial struct Heartbeat
    {
        [SpacetimeDB.Column(ColumnAttrs.PrimaryKey)]
        public uint Id;
        
        public Identity ServerIdentity;

        public int Tick;
    }

    [SpacetimeDB.Table(Public = false, Scheduled = "KeepAlive")]
    public partial struct KeepAliveWorker { }
    
    [SpacetimeDB.Table(Public = true)]
    public partial struct Config
    {
        [SpacetimeDB.Column(ColumnAttrs.PrimaryKey)]
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

    [SpacetimeDB.Table(Public = false)]
    public partial struct _AuthenticationKey
    {
        [SpacetimeDB.Column(ColumnAttrs.PrimaryKey)]
        public uint Version;

        public string Key;
    }
    
    // [SpacetimeDB.Table(Public = false, Scheduled = "AuthenticateDoWork")]
    // public partial struct AuthenticationWorker { }
    
    [SpacetimeDB.Table(Public = false)]
    public partial struct ZIndex
    {
        [SpacetimeDB.Column(ColumnAttrs.PrimaryKey)]
        public uint Version;

        public int Min;
        public int Max;
        public int Ceiling;
    }

    private const string SEVEN_TV_TENOR_REGEX = @"^https?:\/\/(www\.)?cdn\.7tv\.app(?:\/.*)?$|^https?:\/\/(www\.)?media\.tenor\.com(?:\/.*)?$|^https?:\/\/(www\.)?cdn\.betterttv\.net(?:\/.*)?$";

    private const string HTML_TAG_REGEX = @"<[^>]*>";
}