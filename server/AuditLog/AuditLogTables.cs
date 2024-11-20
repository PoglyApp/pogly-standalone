using SpacetimeDB;

public partial class Module
{
    [Table(Public = false, Name = "AuditLog")]
    public partial struct AuditLog
    {
        [PrimaryKey]
        [AutoInc]
        public uint Id;

        public long UnixTime;
        public Identity Identity;
        public string Nickname;
        public string Reducer;
        public ChangeStruct OldChange;
        public ChangeStruct NewChange;
    }
}