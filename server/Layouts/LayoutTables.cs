using SpacetimeDB;

public partial class Module
{
    [Table(Public = true, Name = "Layouts")]
    public partial struct Layouts
    {
        [PrimaryKey]
        [AutoInc]
        public uint Id;

        public string Name;
        public string CreatedBy;

        [SpacetimeDB.Index.BTree(Name = "ActiveLayout")]
        public bool Active;
    }
}