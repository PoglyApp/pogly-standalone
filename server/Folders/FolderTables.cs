using SpacetimeDB;
using static SpacetimeDB.Runtime;

public partial class Module
{
    [SpacetimeDB.Table(Public = true)]
    public partial struct Folders
    {
        [SpacetimeDB.Column(ColumnAttrs.PrimaryKeyAuto)]
        public uint Id;

        public string Icon;
        public string Name;
        public string CreatedBy;
    }
}