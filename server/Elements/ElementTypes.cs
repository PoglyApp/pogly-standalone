using SpacetimeDB;

public partial class Module
{
    [SpacetimeDB.Type]
    public partial struct TextElement
    {
        public string Text;
        public int Size;
        public string Color;
        public string Font;
        public string Css;
    }

    [SpacetimeDB.Type]
    public partial struct ImageElement
    {
        public ImageElementData ImageElementData;
        public int Width;
        public int Height;
    }

    [SpacetimeDB.Type]
    public partial struct WidgetElement
    {
        public uint ElementDataId;
        public int Width;
        public int Height;
        public string RawData;
    }

    [SpacetimeDB.Type]
    public partial record ElementStruct : SpacetimeDB.TaggedEnum<(TextElement TextElement, ImageElement ImageElement, WidgetElement WidgetElement)> {}
    
    [SpacetimeDB.Type]
    public partial record ImageElementData: SpacetimeDB.TaggedEnum<(uint ElementDataId, string RawData)> {}
}