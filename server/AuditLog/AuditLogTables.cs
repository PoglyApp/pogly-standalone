using SpacetimeDB;
using static SpacetimeDB.Runtime;

public partial class Module
{
    [SpacetimeDB.Table(Public = false)]
    public partial struct AuditLog
    {
        [SpacetimeDB.Column(ColumnAttrs.PrimaryKeyAuto)]
        public uint Id;

        public long UnixTime;
        public Identity Identity;
        public string Nickname;
        public string Reducer;
        public ChangeStruct OldChange;
        public ChangeStruct NewChange;
    }
}