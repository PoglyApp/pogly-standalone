using SpacetimeDB;

public partial class Module
{
    [Table(Public = true, Name = "OverlayCommand")]
    public partial struct OverlayCommand
    {
        [PrimaryKey]
        [AutoInc]
        public uint Id;
        
        public CommandType Command;
        public Identity IssuedBy;
        public long Timestamp;
        public bool Completed;
    }
}