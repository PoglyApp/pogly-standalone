using SpacetimeDB;
public partial class Module
{
    [SpacetimeDB.Type]
    public enum DataType
    {
        TextElement,
        ImageElement,
        WidgetElement,
    }
}