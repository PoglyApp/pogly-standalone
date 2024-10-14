using System.Text.RegularExpressions;
using SpacetimeDB;
using static SpacetimeDB.Runtime;

public partial class Module
{
    [SpacetimeDB.Reducer]
    public static void AddElement(ReducerContext ctx, ElementStruct element, int transparency, string transform,
        string clip, uint? folderId = null)
    {
        string func = "AddElement";
        
        try
        {
            if (ctx.Address is null) return;
            if (!GetGuest(func, ctx.Address, out var guest)) return;
            if (!GuestAuthenticated(func, guest)) return;

            if (element is ElementStruct.ImageElement {ImageElement_.ImageElementData: ImageElementData.RawData data})
            {
                if (Config.FindByVersion(0)!.Value.StrictMode)
                    if (!Regex.Match(data.RawData_, SEVEN_TV_TENOR_REGEX, RegexOptions.IgnoreCase).Success) 
                        if (!IsGuestModerator(func, ctx.Sender)) return;
            }

            if (element is ElementStruct.TextElement text)
            {
                if (Regex.Match(text.TextElement_.Text, HTML_TAG_REGEX, RegexOptions.IgnoreCase).Success)
                    return;
            }
            
            uint maxId = 0;
            foreach (var i in Elements.Iter())
            {
                if (i.Id > maxId) maxId = i.Id;
            }

            var newElement = new Elements
            {
                Id = maxId + 1,
                Element = element,
                Transparency = transparency,
                Transform = transform,
                Clip = clip,
                Locked = false,
                LayoutId = GetActiveLayout(),
                FolderId = folderId,
                PlacedBy = guest.Nickname,
                LastEditedBy = guest.Nickname,
                ZIndex = ZIndex.FindByVersion(0)!.Value.Max + 1
            };
            newElement.Insert();
            
            LogAudit(ctx,func,GetEmptyStruct(),GetChangeStructFromElement(newElement), Config.FindByVersion(0)!.Value.DebugMode);
        }
        catch (Exception e)
        {
            Log($"[{func}] Error adding new element, requested by {ctx.Sender}! " + e.Message,LogLevel.Error);
        }
    }
    
    [SpacetimeDB.Reducer]
    public static void AddElementToLayout(ReducerContext ctx, ElementStruct element, int transparency, string transform,
        string clip, uint layoutId, uint? folderId = null)
    {
        string func = "AddElementToLayout";
        
        try
        {
            if (ctx.Address is null) return;
            if (!GetGuest(func, ctx.Address, out var guest)) return;
            if (!GuestAuthenticated(func, guest)) return;

            if (element is ElementStruct.ImageElement {ImageElement_.ImageElementData: ImageElementData.RawData data})
            {
                if (Config.FindByVersion(0)!.Value.StrictMode)
                    if (!Regex.Match(data.RawData_, SEVEN_TV_TENOR_REGEX, RegexOptions.IgnoreCase).Success) 
                        if (!IsGuestModerator(func, ctx.Sender)) return;
            }

            if (element is ElementStruct.TextElement text)
            {
                if (Regex.Match(text.TextElement_.Text, HTML_TAG_REGEX, RegexOptions.IgnoreCase).Success)
                    return;
            }

            uint maxId = 0;
            foreach (var i in Elements.Iter())
            {
                if (i.Id > maxId) maxId = i.Id;
            }
            
            var newElement = new Elements
            {
                Id = maxId + 1,
                Element = element,
                Transparency = transparency,
                Transform = transform,
                Clip = clip,
                Locked = false,
                LayoutId = layoutId,
                FolderId = folderId,
                PlacedBy = guest.Nickname,
                LastEditedBy = guest.Nickname,
                ZIndex = ZIndex.FindByVersion(0)!.Value.Max + 1
            };
            newElement.Insert();
            
            LogAudit(ctx,func,GetEmptyStruct(),GetChangeStructFromElement(newElement), Config.FindByVersion(0)!.Value.DebugMode);
        }
        catch (Exception e)
        {
            Log($"[{func}] Error adding new element, requested by {ctx.Sender}! " + e.Message,LogLevel.Error);
        }
    }
    
    [SpacetimeDB.Reducer]
    public static void ImportElement(ReducerContext ctx, ElementStruct element, int transparency, string transform,
        string clip, uint layoutId, string placedBy, string lastEditedBy, int zindex, uint? folderId = null)
    {
        string func = "ImportElement";
        
        if (Config.FindByVersion(0)!.Value.ConfigInit) return;
        
        try
        {
            var newElement = new Elements
            {
                Element = element,
                Transparency = transparency,
                Transform = transform,
                Clip = clip,
                Locked = false,
                LayoutId = layoutId,
                FolderId = folderId,
                PlacedBy = placedBy,
                LastEditedBy = lastEditedBy,
                ZIndex = zindex
            };
            newElement.Insert();
        }
        catch (Exception e)
        {
            Log($"[{func}] Error adding new element, requested by {ctx.Sender}! " + e.Message,LogLevel.Error);
        }
    }

    [SpacetimeDB.Reducer]
    public static void UpdateElement(ReducerContext ctx, uint elementId, ElementStruct element, int transparency, string transform,
        string clip, bool locked)
    {
        string func = "UpdateElement";
        try
        {
            if (ctx.Address is null) return;
            if (!GetGuest(func, ctx.Address, out var guest)) return;
            if (!GuestAuthenticated(func, guest)) return;
            
            if (element is ElementStruct.ImageElement {ImageElement_.ImageElementData: ImageElementData.RawData data})
            {
                if (Config.FindByVersion(0)!.Value.StrictMode)
                    if (!Regex.Match(data.RawData_, SEVEN_TV_TENOR_REGEX, RegexOptions.IgnoreCase).Success) 
                        if (!IsGuestModerator(func, ctx.Sender)) return;
            }
            
            if (element is ElementStruct.TextElement text)
            {
                if (Regex.Match(text.TextElement_.Text, HTML_TAG_REGEX, RegexOptions.IgnoreCase).Success)
                    return;
            }

            var oldElement = Elements.FilterById(elementId).First();
            var updatedElement = oldElement;
            updatedElement.Element = element;
            updatedElement.Transparency = transparency;
            updatedElement.Transform = transform;
            updatedElement.Clip = clip;
            updatedElement.Locked = locked;
            updatedElement.LastEditedBy = guest.Nickname;
            updatedElement.ZIndex = ZIndex.FindByVersion(0)!.Value.Max + 1;

            Elements.UpdateById(elementId, updatedElement);
            
            LogAudit(ctx,func,GetChangeStructFromElement(oldElement),GetChangeStructFromElement(updatedElement), Config.FindByVersion(0)!.Value.DebugMode);
        }
        catch (Exception e)
        {
            Log($"[{func}] Error updating element with id {elementId}, requested by {ctx.Sender}! " + e.Message, LogLevel.Error);
        }
    }

    [SpacetimeDB.Reducer]
    public static void UpdateElementStruct(ReducerContext ctx, uint elementId, ElementStruct elementStruct)
    {
        string func = "UpdateElementStruct";
        try
        {
            if (ctx.Address is null) return;
            if (!GetGuest(func, ctx.Address, out var guest)) return;
            if (!GuestAuthenticated(func, guest)) return;
            
            if (elementStruct is ElementStruct.ImageElement {ImageElement_.ImageElementData: ImageElementData.RawData data})
            {
                if (Config.FindByVersion(0)!.Value.StrictMode)
                    if (!Regex.Match(data.RawData_, SEVEN_TV_TENOR_REGEX, RegexOptions.IgnoreCase).Success) 
                        if (!IsGuestModerator(func, ctx.Sender)) return;
            }
            
            if (elementStruct is ElementStruct.TextElement text)
            {
                if (Regex.Match(text.TextElement_.Text, HTML_TAG_REGEX, RegexOptions.IgnoreCase).Success)
                    return;
            }

            var oldElement = Elements.FilterById(elementId).First();
            var updatedElement = oldElement;
            updatedElement.Element = elementStruct;
            updatedElement.LastEditedBy = guest.Nickname;

            Elements.UpdateById(elementId, updatedElement);
            
            LogAudit(ctx,func,GetChangeStructFromElement(oldElement),GetChangeStructFromElement(updatedElement), Config.FindByVersion(0)!.Value.DebugMode);
        }
        catch (Exception e)
        {
            Log($"[{func}] Error updating element struct with id {elementId}, requested by {ctx.Sender}! " + e.Message,LogLevel.Error);
        }
    }

    #region (UpdateStruct Reducers)

    [SpacetimeDB.Reducer]
    public static void UpdateTextElementText(ReducerContext ctx, uint elementId, string text)
    {
        string func = "UpdateTextElementText";
        try
        {
            if (ctx.Address is null) return;
            if (!GetGuest(func, ctx.Address, out var guest)) return;
            if (!GuestAuthenticated(func, guest)) return;
            
            if (Regex.Match(text, HTML_TAG_REGEX, RegexOptions.IgnoreCase).Success)
                return;

            var oldElement = Elements.FilterById(elementId).First();

            if (oldElement.Element is not ElementStruct.TextElement textElement) return;
            
            var updatedElement = oldElement;
            var updatedTextElement = textElement.TextElement_;
            updatedTextElement.Text = text;
            updatedElement.Element = new ElementStruct.TextElement(updatedTextElement);

            Elements.UpdateById(elementId, updatedElement);
            
            LogAudit(ctx,func,GetChangeStructFromElement(oldElement),GetChangeStructFromElement(updatedElement), Config.FindByVersion(0)!.Value.DebugMode);
        }
        catch (Exception e)
        {
            Log($"[{func}] Error updating UpdateTextElementText with id {elementId} and text {text}, requested by {ctx.Sender}! " + e.Message,LogLevel.Error);
        }
    }

    [SpacetimeDB.Reducer]
    public static void UpdateTextElementSize(ReducerContext ctx, uint elementId, int size)
    {
        string func = "UpdateTextElementSize";
        try
        {
            if (ctx.Address is null) return;
            if (!GetGuest(func, ctx.Address, out var guest)) return;
            if (!GuestAuthenticated(func, guest)) return;

            var oldElement = Elements.FilterById(elementId).First();

            if (oldElement.Element is not ElementStruct.TextElement textElement) return;
            
            var updatedElement = oldElement;
            var updatedTextElement = textElement.TextElement_;
            updatedTextElement.Size = size;
            updatedElement.Element = new ElementStruct.TextElement(updatedTextElement);

            Elements.UpdateById(elementId, updatedElement);
            
            LogAudit(ctx,func,GetChangeStructFromElement(oldElement),GetChangeStructFromElement(updatedElement), Config.FindByVersion(0)!.Value.DebugMode);
        }
        catch (Exception e)
        {
            Log($"[{func}] Error updating UpdateTextElementSize with id {elementId} and size {size.ToString()}, requested by {ctx.Sender}! " + e.Message,LogLevel.Error);
        }
    }

    [SpacetimeDB.Reducer]
    public static void UpdateTextElementColor(ReducerContext ctx, uint elementId, string color)
    {
        string func = "UpdateTextElementColor";
        try
        {
            if (ctx.Address is null) return;
            if (!GetGuest(func, ctx.Address, out var guest)) return;
            if (!GuestAuthenticated(func, guest)) return;

            var oldElement = Elements.FilterById(elementId).First();

            if (oldElement.Element is not ElementStruct.TextElement textElement) return;
            
            var updatedElement = oldElement;
            var updatedTextElement = textElement.TextElement_;
            updatedTextElement.Color = color;
            updatedElement.Element = new ElementStruct.TextElement(updatedTextElement);

            Elements.UpdateById(elementId, updatedElement);
            
            LogAudit(ctx,func,GetChangeStructFromElement(oldElement),GetChangeStructFromElement(updatedElement), Config.FindByVersion(0)!.Value.DebugMode);
        }
        catch (Exception e)
        {
            Log($"[{func}] Error updating UpdateTextElementColor with id {elementId} and color {color}, requested by {ctx.Sender}! " + e.Message,LogLevel.Error);
        }
    }

    [SpacetimeDB.Reducer]
    public static void UpdateTextElementFont(ReducerContext ctx, uint elementId, string font)
    {
        string func = "UpdateTextElementFont";
        try
        {
            if (ctx.Address is null) return;
            if (!GetGuest(func, ctx.Address, out var guest)) return;
            if (!GuestAuthenticated(func, guest)) return;

            var oldElement = Elements.FilterById(elementId).First();

            if (oldElement.Element is not ElementStruct.TextElement textElement) return;
            
            var updatedElement = oldElement;
            var updatedTextElement = textElement.TextElement_;
            updatedTextElement.Font = font;
            updatedElement.Element = new ElementStruct.TextElement(updatedTextElement);

            Elements.UpdateById(elementId, updatedElement);
            
            LogAudit(ctx,func,GetChangeStructFromElement(oldElement),GetChangeStructFromElement(updatedElement), Config.FindByVersion(0)!.Value.DebugMode);
        }
        catch (Exception e)
        {
            Log($"[{func}] Error updating UpdateTextElementFont with id {elementId} and font {font}, requested by {ctx.Sender}! " + e.Message,LogLevel.Error);
        }
    }
    
    [SpacetimeDB.Reducer]
    public static void UpdateTextElementShadow(ReducerContext ctx, uint elementId, string css)
    {
        string func = "UpdateTextElementShadow";
        try
        {
            if (ctx.Address is null) return;
            if (!GetGuest(func, ctx.Address, out var guest)) return;
            if (!GuestAuthenticated(func, guest)) return;

            var oldElement = Elements.FilterById(elementId).First();

            if (oldElement.Element is not ElementStruct.TextElement textElement) return;
            
            var updatedElement = oldElement;
            var updatedTextElement = textElement.TextElement_;
            updatedTextElement.Css = css;
            updatedElement.Element = new ElementStruct.TextElement(updatedTextElement);

            Elements.UpdateById(elementId, updatedElement);
            
            LogAudit(ctx,func,GetChangeStructFromElement(oldElement),GetChangeStructFromElement(updatedElement), Config.FindByVersion(0)!.Value.DebugMode);
        }
        catch (Exception e)
        {
            Log($"[{func}] Error updating UpdateTextElementShadow with id {elementId} and font {css}, requested by {ctx.Sender}! " + e.Message,LogLevel.Error);
        }
    }

    [SpacetimeDB.Reducer]
    public static void UpdateImageElementDataStruct(ReducerContext ctx, uint elementId,
        ImageElementData imageElementData)
    {
        string func = "UpdateImageElementDataStruct";
        try
        {
            if (ctx.Address is null) return;
            if (!GetGuest(func, ctx.Address, out var guest)) return;
            if (!GuestAuthenticated(func, guest)) return;
            if (Config.FindByVersion(0)!.Value.StrictMode)
            {
                if (!IsGuestModerator(func, ctx.Sender)) return;
            }

            var oldElement = Elements.FilterById(elementId).First();

            if (oldElement.Element is not ElementStruct.ImageElement imageElement) return;
            
            var updatedElement = oldElement;
            var updatedImageElement = imageElement.ImageElement_;
            updatedImageElement.ImageElementData = imageElementData;
            updatedElement.Element = new ElementStruct.ImageElement(updatedImageElement);

            Elements.UpdateById(elementId, updatedElement);
            
            LogAudit(ctx,func,GetChangeStructFromElement(oldElement),GetChangeStructFromElement(updatedElement), Config.FindByVersion(0)!.Value.DebugMode);
        }
        catch (Exception e)
        {
            Log($"[{func}] Error updating UpdateImageElementDataStruct with id {elementId}, requested by {ctx.Sender}! " + e.Message,LogLevel.Error);
        }
    }

    [SpacetimeDB.Reducer]
    public static void UpdateImageElementSize(ReducerContext ctx, uint elementId, int width, int height)
    {
        string func = "UpdateImageElementSize";
        try
        {
            if (ctx.Address is null) return;
            if (!GetGuest(func, ctx.Address, out var guest)) return;
            if (!GuestAuthenticated(func, guest)) return;

            var oldElement = Elements.FilterById(elementId).First();

            if (oldElement.Element is not ElementStruct.ImageElement imageElement) return;
            
            var updatedElement = oldElement;
            var updatedImageElement = imageElement.ImageElement_;
            updatedImageElement.Width = width;
            updatedImageElement.Height = height;
            updatedElement.Element = new ElementStruct.ImageElement(updatedImageElement);

            Elements.UpdateById(elementId, updatedElement);
            
            LogAudit(ctx,func,GetChangeStructFromElement(oldElement),GetChangeStructFromElement(updatedElement), Config.FindByVersion(0)!.Value.DebugMode);
        }
        catch (Exception e)
        {
            Log($"[{func}] Error updating UpdateImageElementSize with id {elementId} with width {width} / height {height}, requested by {ctx.Sender}! " + e.Message,LogLevel.Error);
        }
    }
    
    [SpacetimeDB.Reducer]
    public static void UpdateImageElementWidth(ReducerContext ctx, uint elementId, int width)
    {
        string func = "UpdateImageElementWidth";
        try
        {
            if (ctx.Address is null) return;
            if (!GetGuest(func, ctx.Address, out var guest)) return;
            if (!GuestAuthenticated(func, guest)) return;

            var oldElement = Elements.FilterById(elementId).First();

            if (oldElement.Element is not ElementStruct.ImageElement imageElement) return;
            
            var updatedElement = oldElement;
            var updatedImageElement = imageElement.ImageElement_;
            updatedImageElement.Width = width;
            updatedElement.Element = new ElementStruct.ImageElement(updatedImageElement);

            Elements.UpdateById(elementId, updatedElement);
            
            LogAudit(ctx,func,GetChangeStructFromElement(oldElement),GetChangeStructFromElement(updatedElement), Config.FindByVersion(0)!.Value.DebugMode);
        }
        catch (Exception e)
        {
            Log($"[{func}] Error updating UpdateImageElementWidth with id {elementId} with width {width}, requested by {ctx.Sender}! " + e.Message,LogLevel.Error);
        }
    }
    
    [SpacetimeDB.Reducer]
    public static void UpdateImageElementHeight(ReducerContext ctx, uint elementId, int height)
    {
        string func = "UpdateImageElementHeight";
        try
        {
            if (ctx.Address is null) return;
            if (!GetGuest(func, ctx.Address, out var guest)) return;
            if (!GuestAuthenticated(func, guest)) return;

            var oldElement = Elements.FilterById(elementId).First();

            if (oldElement.Element is not ElementStruct.ImageElement imageElement) return;
            
            var updatedElement = oldElement;
            var updatedImageElement = imageElement.ImageElement_;
            updatedImageElement.Height = height;
            updatedElement.Element = new ElementStruct.ImageElement(updatedImageElement);

            Elements.UpdateById(elementId, updatedElement);
            
            LogAudit(ctx,func,GetChangeStructFromElement(oldElement),GetChangeStructFromElement(updatedElement), Config.FindByVersion(0)!.Value.DebugMode);
        }
        catch (Exception e)
        {
            Log($"[{func}] Error updating UpdateImageElementHeight with id {elementId} with height {height}, requested by {ctx.Sender}! " + e.Message,LogLevel.Error);
        }
    }

    [SpacetimeDB.Reducer]
    public static void UpdateWidgetElementDataId(ReducerContext ctx, uint elementId, uint elementDataId)
    {
        string func = "UpdateWidgetElementDataId";
        try
        {
            if (ctx.Address is null) return;
            if (!GetGuest(func, ctx.Address, out var guest)) return;
            if (!GuestAuthenticated(func, guest)) return;

            var oldElement = Elements.FilterById(elementId).First();

            if (oldElement.Element is not ElementStruct.WidgetElement widgetElement) return;
            
            var updatedElement = oldElement;
            var updatedWidgetElement = widgetElement.WidgetElement_;
            updatedWidgetElement.ElementDataId = elementDataId;
            updatedElement.Element = new ElementStruct.WidgetElement(updatedWidgetElement);

            Elements.UpdateById(elementId, updatedElement);
            
            LogAudit(ctx,func,GetChangeStructFromElement(oldElement),GetChangeStructFromElement(updatedElement), Config.FindByVersion(0)!.Value.DebugMode);
        }
        catch (Exception e)
        {
            Log($"[{func}] Error updating UpdateWidgetElementDataId with id {elementId} with dataId {elementDataId}, requested by {ctx.Sender}! " + e.Message,LogLevel.Error);
        }
    }

    [SpacetimeDB.Reducer]
    public static void UpdateWidgetElementSize(ReducerContext ctx, uint elementId, int width, int height)
    {
        string func = "UpdateWidgetElementSize";
        try
        {
            if (ctx.Address is null) return;
            if (!GetGuest(func, ctx.Address, out var guest)) return;
            if (!GuestAuthenticated(func, guest)) return;

            var oldElement = Elements.FilterById(elementId).First();

            if (oldElement.Element is not ElementStruct.WidgetElement widgetElement) return;
            
            var updatedElement = oldElement;
            var updatedWidgetElement = widgetElement.WidgetElement_;
            updatedWidgetElement.Width = width;
            updatedWidgetElement.Height = height;
            updatedElement.Element = new ElementStruct.WidgetElement(updatedWidgetElement);

            Elements.UpdateById(elementId, updatedElement);
            
            LogAudit(ctx,func,GetChangeStructFromElement(oldElement),GetChangeStructFromElement(updatedElement), Config.FindByVersion(0)!.Value.DebugMode);
        }
        catch (Exception e)
        {
            Log($"[{func}] Error updating UpdateWidgetElementSize with id {elementId} with width {width} / height {height}, requested by {ctx.Sender}! " + e.Message,LogLevel.Error);
        }
    }
    
    [SpacetimeDB.Reducer]
    public static void UpdateWidgetElementWidth(ReducerContext ctx, uint elementId, int width)
    {
        string func = "UpdateWidgetElementWidth";
        try
        {
            if (ctx.Address is null) return;
            if (!GetGuest(func, ctx.Address, out var guest)) return;
            if (!GuestAuthenticated(func, guest)) return;

            var oldElement = Elements.FilterById(elementId).First();

            if (oldElement.Element is not ElementStruct.WidgetElement widgetElement) return;
            
            var updatedElement = oldElement;
            var updatedWidgetElement = widgetElement.WidgetElement_;
            updatedWidgetElement.Width = width;
            updatedElement.Element = new ElementStruct.WidgetElement(updatedWidgetElement);

            Elements.UpdateById(elementId, updatedElement);
            
            LogAudit(ctx,func,GetChangeStructFromElement(oldElement),GetChangeStructFromElement(updatedElement), Config.FindByVersion(0)!.Value.DebugMode);
        }
        catch (Exception e)
        {
            Log($"[{func}] Error updating UpdateWidgetElementWidth with id {elementId} with width {width}, requested by {ctx.Sender}! " + e.Message,LogLevel.Error);
        }
    }
    
    [SpacetimeDB.Reducer]
    public static void UpdateWidgetElementHeight(ReducerContext ctx, uint elementId, int height)
    {
        string func = "UpdateWidgetElementHeight";
        try
        {
            if (ctx.Address is null) return;
            if (!GetGuest(func, ctx.Address, out var guest)) return;
            if (!GuestAuthenticated(func, guest)) return;

            var oldElement = Elements.FilterById(elementId).First();

            if (oldElement.Element is not ElementStruct.WidgetElement widgetElement) return;
            
            var updatedElement = oldElement;
            var updatedWidgetElement = widgetElement.WidgetElement_;
            updatedWidgetElement.Height = height;
            updatedElement.Element = new ElementStruct.WidgetElement(updatedWidgetElement);

            Elements.UpdateById(elementId, updatedElement);
            
            LogAudit(ctx,func,GetChangeStructFromElement(oldElement),GetChangeStructFromElement(updatedElement), Config.FindByVersion(0)!.Value.DebugMode);
        }
        catch (Exception e)
        {
            Log($"[{func}] Error updating UpdateWidgetElementHeight with id {elementId} with height {height}, requested by {ctx.Sender}! " + e.Message,LogLevel.Error);
        }
    }

    [SpacetimeDB.Reducer]
    public static void UpdateWidgetElementRawData(ReducerContext ctx, uint elementId, string rawData)
    {
        string func = "UpdateWidgetElementRawData";
        try
        {
            if (ctx.Address is null) return;
            if (!GetGuest(func, ctx.Address, out var guest)) return;
            if (!GuestAuthenticated(func, guest)) return;
            if (Config.FindByVersion(0)!.Value.StrictMode)
            {
                if (!IsGuestModerator(func, ctx.Sender)) return;
            }

            var oldElement = Elements.FilterById(elementId).First();

            if (oldElement.Element is not ElementStruct.WidgetElement widgetElement) return;
            
            var updatedElement = oldElement;
            var updatedWidgetElement = widgetElement.WidgetElement_;
            updatedWidgetElement.RawData = rawData;
            updatedElement.Element = new ElementStruct.WidgetElement(updatedWidgetElement);

            Elements.UpdateById(elementId, updatedElement);
            
            LogAudit(ctx,func,GetChangeStructFromElement(oldElement),GetChangeStructFromElement(updatedElement), Config.FindByVersion(0)!.Value.DebugMode);
        }
        catch (Exception e)
        {
            Log($"[{func}] Error updating UpdateWidgetElementRawData with id {elementId}, requested by {ctx.Sender}! " + e.Message,LogLevel.Error);
        }
    }

    #endregion

    [SpacetimeDB.Reducer]
    public static void UpdateElementTransparency(ReducerContext ctx, uint elementId, int transparency)
    {
        string func = "UpdateElementTransparency";
        try
        {
            if (ctx.Address is null) return;
            if (!GetGuest(func, ctx.Address, out var guest)) return;
            if (!GuestAuthenticated(func, guest)) return;

            var oldElement = Elements.FilterById(elementId).First();
            var updatedElement = oldElement;
            updatedElement.Transparency = transparency;
            updatedElement.LastEditedBy = guest.Nickname;

            Elements.UpdateById(elementId, updatedElement);
            
            LogAudit(ctx,func,GetChangeStructFromElement(oldElement),GetChangeStructFromElement(updatedElement), Config.FindByVersion(0)!.Value.DebugMode);
        }
        catch (Exception e)
        {
            Log($"[{func}] Error updating element transparency with id {elementId}, requested by {ctx.Sender}! " + e.Message,LogLevel.Error);
        }
    }

    [SpacetimeDB.Reducer]
    public static void UpdateElementTransform(ReducerContext ctx, uint elementId, string transform)
    {
        string func = "UpdateElementTransform";
        try
        {
            if (ctx.Address is null) return;
            if (!GetGuest(func, ctx.Address, out var guest)) return;
            if (!GuestAuthenticated(func, guest)) return;

            var oldElement = Elements.FilterById(elementId).First();
            var updatedElement = oldElement;
            updatedElement.Transform = transform;
            updatedElement.LastEditedBy = guest.Nickname;

            Elements.UpdateById(elementId, updatedElement);
            
            LogAudit(ctx,func,GetChangeStructFromElement(oldElement),GetChangeStructFromElement(updatedElement), Config.FindByVersion(0)!.Value.DebugMode);
        }
        catch (Exception e)
        {
            Log($"[{func}] Error updating element transform with id {elementId}, requested by {ctx.Sender}! " + e.Message,LogLevel.Error);
        }
    }
    
    [SpacetimeDB.Reducer]
    public static void UpdateElementClip(ReducerContext ctx, uint elementId, string clip)
    {
        string func = "UpdateElementClip";
        try
        {
            if (ctx.Address is null) return;
            if (!GetGuest(func, ctx.Address, out var guest)) return;
            if (!GuestAuthenticated(func, guest)) return;

            var oldElement = Elements.FilterById(elementId).First();
            var updatedElement = oldElement;
            updatedElement.Clip = clip;
            updatedElement.LastEditedBy = guest.Nickname;

            Elements.UpdateById(elementId, updatedElement);
            
            LogAudit(ctx,func,GetChangeStructFromElement(oldElement),GetChangeStructFromElement(updatedElement), Config.FindByVersion(0)!.Value.DebugMode);
        }
        catch (Exception e)
        {
            Log($"[{func}] Error updating elements clipping with id {elementId}, requested by {ctx.Sender}! " + e.Message,LogLevel.Error);
        }
    }

    [SpacetimeDB.Reducer]
    public static void UpdateElementLocked(ReducerContext ctx, uint elementId, bool locked)
    {
        string func = "UpdateElementLocked";
        try
        {
            if (ctx.Address is null) return;
            if (!GetGuest(func, ctx.Address, out var guest)) return;
            if (!GuestAuthenticated(func, guest)) return;

            var oldElement = Elements.FilterById(elementId).First();
            var updatedElement = oldElement;
            updatedElement.Locked = locked;
            updatedElement.LastEditedBy = guest.Nickname;

            Elements.UpdateById(elementId, updatedElement);
            
            LogAudit(ctx, func, GetChangeStructFromElement(oldElement),GetChangeStructFromElement(updatedElement), Config.FindByVersion(0)!.Value.DebugMode);
        }
        catch (Exception e)
        {
            Log($"[{func}] Error updating elements locked with id {elementId}, requested by {ctx.Sender}! " + e.Message, LogLevel.Error);
        }
    }

    [SpacetimeDB.Reducer]
    public static void UpdateElementLayout(ReducerContext ctx, uint elementId, uint layoutId)
    {
        string func = "UpdateElementLayout";

        try
        {
            if (ctx.Address is null) return;
            if (!GetGuest(func, ctx.Address, out var guest)) return;
            if (!GuestAuthenticated(func, guest)) return;
            if (Config.FindByVersion(0)!.Value.StrictMode)
            {
                if (!IsGuestModerator(func, ctx.Sender)) return;
            }

            var oldElement = Elements.FilterById(elementId).First();
            var updatedElement = oldElement;
            updatedElement.LayoutId = layoutId;
            updatedElement.LastEditedBy = guest.Nickname;

            Elements.UpdateById(elementId, updatedElement);
            
            //TODO: Update AuditLog Elements ChangeStruct to include Layout Column
            if(Config.FindByVersion(0)!.Value.DebugMode) 
                Log($"[Elements - {func}] {guest.Nickname} updated elementId {elementId} to layout {layoutId}!");
        }
        catch(Exception e)
        {
            Log($"[{func}] Error updating elements layout with id {elementId} and layoutId {layoutId}, requested by {ctx.Sender}! " + e.Message, LogLevel.Error);
        }
    }
    
    [SpacetimeDB.Reducer]
    public static void UpdateElementFolder(ReducerContext ctx, uint elementId, uint? folderId)
    {
        string func = "UpdateElementFolder";

        try
        {
            if (ctx.Address is null) return;
            if (!GetGuest(func, ctx.Address, out var guest)) return;
            if (!GuestAuthenticated(func, guest)) return;
            if (Config.FindByVersion(0)!.Value.StrictMode)
            {
                if (!IsGuestModerator(func, ctx.Sender)) return;
            }

            var oldElement = Elements.FilterById(elementId).First();
            var updatedElement = oldElement;
            updatedElement.FolderId = folderId;
            updatedElement.LastEditedBy = guest.Nickname;

            Elements.UpdateById(elementId, updatedElement);
            
            //TODO: Update AuditLog Elements ChangeStruct to include Layout Column
            if(Config.FindByVersion(0)!.Value.DebugMode) 
                Log($"[Elements - {func}] {guest.Nickname} updated elementId {elementId} to folder {folderId}!");
        }
        catch(Exception e)
        {
            Log($"[{func}] Error updating elements layout with id {elementId} and folderId {folderId}, requested by {ctx.Sender}! " + e.Message, LogLevel.Error);
        }
    }
    
    private static void UpdateElementZIndex(ReducerContext ctx, uint elementId)
    {
        if (elementId == 0) return;
        string func = "UpdateElementZIndex";
        try
        {
            if (ctx.Address is null) return;
            if (!GetGuest(func, ctx.Address, out var guest)) return;
            if (!GuestAuthenticated(func, guest)) return;

            List<int> zIndexes = new List<int>();
            foreach (var e in Elements.Iter())
            {
                zIndexes.Add(e.ZIndex);
            }

            var updateZIndex = ZIndex.FindByVersion(0)!.Value;
            updateZIndex.Min = zIndexes.Min();
            updateZIndex.Max = zIndexes.Max();

            if (updateZIndex.Min > updateZIndex.Ceiling && updateZIndex.Max > updateZIndex.Ceiling)
            {
                updateZIndex.Min -= updateZIndex.Ceiling;
                updateZIndex.Max -= updateZIndex.Ceiling;
            }

            ZIndex.UpdateByVersion(0, updateZIndex);
            
            var oldElement = Elements.FilterById(elementId).First();
            var updatedElement = oldElement;
            updatedElement.ZIndex = updateZIndex.Max+1;
            updatedElement.LastEditedBy = guest.Nickname;

            Elements.UpdateById(elementId, updatedElement);
            
            LogAudit(ctx,func,GetChangeStructFromElement(oldElement),GetChangeStructFromElement(updatedElement), Config.FindByVersion(0)!.Value.DebugMode);
        }
        catch (Exception e)
        {
            Log($"[{func}] Error updating elements zIndex with id {elementId}, requested by {ctx.Sender}! " + e.Message, LogLevel.Error);
        }
    }

    [SpacetimeDB.Reducer]
    public static void DeleteElement(ReducerContext ctx, uint elementId)
    {
        string func = "DeleteElement";
        
        if (ctx.Address is null) return;
        if (!GetGuest(func, ctx.Address, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        if (Config.FindByVersion(0)!.Value.StrictMode)
        {
            if (!IsGuestModerator(func, ctx.Sender)) return;
        }
        
        try
        {
            var oldElement = Elements.FilterById(elementId).First();

            Elements.DeleteById(oldElement.Id);
            
            LogAudit(ctx,func,GetChangeStructFromElement(oldElement),GetEmptyStruct(), Config.FindByVersion(0)!.Value.DebugMode);
        }
        catch (Exception e)
        {
            Log($"[{func}] Error deleting element with id {elementId}, requested by {ctx.Sender}! " + e.Message, LogLevel.Error);
        }
    }

    [SpacetimeDB.Reducer]
    public static void DeleteAllElements(ReducerContext ctx)
    {
        string func = "DeleteAllElements";
        
        if (ctx.Address is null) return;
        if (!GetGuest(func, ctx.Address, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        if (Config.FindByVersion(0)!.Value.StrictMode)
        {
            if (!IsGuestModerator(func, ctx.Sender)) return;
        }
        
        try
        {
            foreach (var e in Elements.Iter())
            {
                Elements.DeleteById(e.Id);
                LogAudit(ctx,func,GetChangeStructFromElement(e),GetEmptyStruct(), Config.FindByVersion(0)!.Value.DebugMode);
            }
        }
        catch (Exception e)
        {
            Log($"[{func}] Error deleting all elements, requested by {ctx.Sender}! " + e.Message, LogLevel.Error);
        }
    }
}