using SpacetimeDB;

public partial class Module
{
    [Table(Public = true, Name = "Layouts")]
    [Index(Name = "ActiveLayout", BTree = ["Active"])]
    public partial struct Layouts
    {
        [PrimaryKey]
        [AutoInc]
        public uint Id;

        public string Name;
        public string CreatedBy;

        public bool Active;
    }
}