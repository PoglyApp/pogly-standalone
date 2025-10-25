using SpacetimeDB;

public partial class Module
{
    [Table(Public = true, Name = "Folders")]
    public partial struct Folders
    {
        [PrimaryKey]
        [AutoInc]
        public uint Id;

        public string Icon;
        public string Name;
        public string CreatedBy;
    }
}