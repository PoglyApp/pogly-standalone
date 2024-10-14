using System.Diagnostics;
using SpacetimeDB;
using static SpacetimeDB.Runtime;

public partial class Module
{
    [SpacetimeDB.Reducer]
    public static void AddElementData(ReducerContext ctx, string name, DataType type, string data, int width, int height)
    {
        string func = "AddElementData";
        
        if (ctx.Address is null) return;
        if (!GetGuest(func, ctx.Address, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        if (Config.FindByVersion(0)!.Value.StrictMode)
        {
            if (!IsGuestModerator(func, ctx.Sender)) return;
        }
        
        try
        {
            uint maxId = 0;
            foreach (var i in ElementData.Iter())
            {
                if (i.Id > maxId) maxId = i.Id;
            }
            
            var elementData = new ElementData
            {
                Id = maxId + 1,
                Name = name,
                DataType = type,
                Data = data,
                DataWidth = width,
                DataHeight = height,
                CreatedBy = guest.Nickname
            };
            elementData.Insert();
            
            LogAudit(ctx,func,GetEmptyStruct(),GetChangeStructFromElementData(elementData), Config.FindByVersion(0)!.Value.DebugMode);
        }
        catch (Exception e)
        {
            Log($"[{func}] Error adding element data with name {name}, requested by {ctx.Sender}. " + e.Message, LogLevel.Error);
        }
    }
    
    [SpacetimeDB.Reducer]
    public static void AddElementDataWithId(ReducerContext ctx, uint id, string name, DataType type, string data, int width, int height)
    {
        string func = "AddElementDataWithId";
        
        if (ctx.Address is null) return;
        if (!GetGuest(func, ctx.Address, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        if (Config.FindByVersion(0)!.Value.StrictMode)
        {
            if (!IsGuestModerator(func, ctx.Sender)) return;
        }
        
        try
        {
            var elementData = new ElementData
            {
                Id = id,
                Name = name,
                DataType = type,
                Data = data,
                DataWidth = width,
                DataHeight = height,
                CreatedBy = guest.Nickname
            };
            elementData.Insert();
            
            LogAudit(ctx,func,GetEmptyStruct(),GetChangeStructFromElementData(elementData), Config.FindByVersion(0)!.Value.DebugMode);
        }
        catch (Exception e)
        {
            Log($"[{func}] Error adding element data with name {name}, requested by {ctx.Sender}. " + e.Message, LogLevel.Error);
        }
    }
    
    [SpacetimeDB.Reducer]
    public static void AddElementDataArray(ReducerContext ctx, string name, DataType type, string data, byte[] array, int width, int height)
    {
        string func = "AddElementDataArray";
        
        if (ctx.Address is null) return;
        if (!GetGuest(func, ctx.Address, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        if (Config.FindByVersion(0)!.Value.StrictMode)
        {
            if (!IsGuestModerator(func, ctx.Sender)) return;
        }
        
        try
        {
            uint maxId = 0;
            foreach (var i in ElementData.Iter())
            {
                if (i.Id > maxId) maxId = i.Id;
            }
            
            var elementData = new ElementData
            {
                Id = maxId + 1,
                Name = name,
                DataType = type,
                Data = data,
                ByteArray = array,
                DataWidth = width,
                DataHeight = height,
                CreatedBy = guest.Nickname
            };
            elementData.Insert();
            
            LogAudit(ctx,func,GetEmptyStruct(),GetChangeStructFromElementData(elementData), Config.FindByVersion(0)!.Value.DebugMode);
        }
        catch (Exception e)
        {
            Log($"[{func}] Error adding element data with name {name}, requested by {ctx.Sender}. " + e.Message, LogLevel.Error);
        }
    }
    
    [SpacetimeDB.Reducer]
    public static void AddElementDataArrayWithId(ReducerContext ctx, uint id, string name, DataType type, string data, byte[] array, int width, int height)
    {
        string func = "AddElementDataArrayWithId";
        
        if (ctx.Address is null) return;
        if (!GetGuest(func, ctx.Address, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        if (Config.FindByVersion(0)!.Value.StrictMode)
        {
            if (!IsGuestModerator(func, ctx.Sender)) return;
        }
        
        try
        {
            var elementData = new ElementData
            {
                Id = id,
                Name = name,
                DataType = type,
                Data = data,
                ByteArray = array,
                DataWidth = width,
                DataHeight = height,
                CreatedBy = guest.Nickname
            };
            elementData.Insert();
            
            LogAudit(ctx,func,GetEmptyStruct(),GetChangeStructFromElementData(elementData), Config.FindByVersion(0)!.Value.DebugMode);
        }
        catch (Exception e)
        {
            Log($"[{func}] Error adding element data with name {name}, requested by {ctx.Sender}. " + e.Message, LogLevel.Error);
        }
    }
    
    [SpacetimeDB.Reducer]
    public static void ImportElementData(ReducerContext ctx, uint id, string name, DataType type, string data, int width, int height, string createdBy)
    {
        string func = "ImportElementDataArrayWithId";
        
        if (Config.FindByVersion(0)!.Value.ConfigInit) return;
        
        try
        {
            var elementData = new ElementData
            {
                Id = id,
                Name = name,
                DataType = type,
                Data = data,
                ByteArray = null,
                DataWidth = width,
                DataHeight = height,
                CreatedBy = createdBy
            };
            elementData.Insert();
        }
        catch (Exception e)
        {
            Log($"[{func}] Error adding element data with name {name}, requested by {ctx.Sender}. " + e.Message, LogLevel.Error);
        }
    }

    [SpacetimeDB.Reducer]
    public static void UpdateElementData(ReducerContext ctx, uint dataId, string name, string data, int width, int height)
    {
        string func = "UpdateElementData";
        
        if (ctx.Address is null) return;
        if (!GetGuest(func, ctx.Address, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        if (Config.FindByVersion(0)!.Value.StrictMode)
        {
            if (!IsGuestModerator(func, ctx.Sender)) return;
        }
        
        try
        {
            var oldData = ElementData.FilterById(dataId).First();
            var updatedData = oldData;
            updatedData.Name = name;
            updatedData.Data = data;
            updatedData.DataWidth = width;
            updatedData.DataHeight = height;

            ElementData.UpdateById(dataId, updatedData);
            
            LogAudit(ctx,func,GetChangeStructFromElementData(oldData),GetChangeStructFromElementData(updatedData), Config.FindByVersion(0)!.Value.DebugMode);
        }
        catch (Exception e)
        {
            Log($"[{func}] Error updating element data with id {dataId}, requested by {ctx.Sender}. " + e.Message,LogLevel.Error);
        }
    }

    [SpacetimeDB.Reducer]
    public static void UpdateElementDataSize(ReducerContext ctx, uint dataId, int width, int height)
    {
        string func = "UpdateElementDataSize";

        if (ctx.Address is null) return;
        if (!GetGuest(func, ctx.Address, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;

        try
        {
            var oldData = ElementData.FilterById(dataId).First();
            var updatedData = oldData;
            updatedData.DataWidth = width;
            updatedData.DataHeight = height;

            ElementData.UpdateById(dataId, updatedData);
            
            LogAudit(ctx, func, GetChangeStructFromElementData(oldData), GetChangeStructFromElementData(updatedData), Config.FindByVersion(0)!.Value.DebugMode);
        }
        catch (Exception e)
        {
            Log($"[{func}] Error updating element data size with id {dataId}, requested by {ctx.Sender}. " + e.Message,LogLevel.Error);
        }
    }
    
    [SpacetimeDB.Reducer]
    public static void UpdateElementDataName(ReducerContext ctx, uint dataId, string name)
    {
        string func = "UpdateElementDataName";
        
        if (ctx.Address is null) return;
        if (!GetGuest(func, ctx.Address, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        
        try
        {
            var oldData = ElementData.FilterById(dataId).First();
            var updatedData = oldData;
            updatedData.Name = name;

            ElementData.UpdateById(dataId, updatedData);
            
            LogAudit(ctx,func,GetChangeStructFromElementData(oldData),GetChangeStructFromElementData(updatedData), Config.FindByVersion(0)!.Value.DebugMode);
        }
        catch (Exception e)
        {
            Log($"[{func}] Error updating element data name with id {dataId}, requested by {ctx.Sender}. " + e.Message,LogLevel.Error);
        }
    }
    
    [SpacetimeDB.Reducer]
    public static void UpdateElementDataData(ReducerContext ctx, uint dataId, string data)
    {
        string func = "UpdateElementDataData";
        
        if (ctx.Address is null) return;
        if (!GetGuest(func, ctx.Address, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        if (Config.FindByVersion(0)!.Value.StrictMode)
        {
            if (!IsGuestModerator(func, ctx.Sender)) return;
        }
        
        try
        {
            var oldData = ElementData.FilterById(dataId).First();
            var updatedData = oldData;
            updatedData.Data = data;

            ElementData.UpdateById(dataId, updatedData);
            
            LogAudit(ctx,func,GetChangeStructFromElementData(oldData),GetChangeStructFromElementData(updatedData), Config.FindByVersion(0)!.Value.DebugMode);
        }
        catch (Exception e)
        {
            Log($"[{func}] Error updating element data name with id {dataId}, requested by {ctx.Sender}. " + e.Message,LogLevel.Error);
        }
    }

    [SpacetimeDB.Reducer]
    public static void DeleteElementDataById(ReducerContext ctx, uint id)
    {
        string func = "DeleteElementDataById";
        
        if (ctx.Address is null) return;
        if (!GetGuest(func, ctx.Address, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        if (Config.FindByVersion(0)!.Value.StrictMode)
        {
            if (!IsGuestModerator(func, ctx.Sender)) return;
        }
        
        try
        {
            var oldData = ElementData.FilterById(id).First();

            foreach (var e in Elements.Iter())
            {
                switch (e.Element)
                {
                    case ElementStruct.ImageElement imageElement:
                        if(imageElement.ImageElement_.ImageElementData is ImageElementData.ElementDataId imageElementData)
                            if (imageElementData.ElementDataId_ == id)
                                Elements.DeleteById(e.Id);
                        break;
                    case ElementStruct.WidgetElement widgetElement:
                        if (widgetElement.WidgetElement_.ElementDataId == id)
                            Elements.DeleteById(e.Id);
                        break;
                }
            }

            ElementData.DeleteById(oldData.Id);
            
            LogAudit(ctx,func,GetChangeStructFromElementData(oldData),GetEmptyStruct(), Config.FindByVersion(0)!.Value.DebugMode);
        }
        catch (Exception e)
        {
            Log($"[{func}] Error deleting element data by id {id}, requested by {ctx.Sender} " + e.Message, LogLevel.Error);
        }
    }
    
    [SpacetimeDB.Reducer]
    public static void DeleteElementDataByName(ReducerContext ctx, string name)
    {
        string func = "DeleteElementDataByName";
        
        if (ctx.Address is null) return;
        if (!GetGuest(func, ctx.Address, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        if (Config.FindByVersion(0)!.Value.StrictMode)
        {
            if (!IsGuestModerator(func, ctx.Sender)) return;
        }
        
        try
        {
            var oldData = ElementData.FilterByName(name).First();
            
            foreach (var e in Elements.Iter())
            {
                switch (e.Element)
                {
                    case ElementStruct.ImageElement imageElement:
                        if(imageElement.ImageElement_.ImageElementData is ImageElementData.ElementDataId imageElementData)
                            if (imageElementData.ElementDataId_ == oldData.Id)
                                Elements.DeleteById(imageElementData.ElementDataId_);
                        break;
                    case ElementStruct.WidgetElement widgetElement:
                        if (widgetElement.WidgetElement_.ElementDataId == oldData.Id)
                            Elements.DeleteById(widgetElement.WidgetElement_.ElementDataId);
                        break;
                }
            }

            ElementData.DeleteById(oldData.Id);
                
            LogAudit(ctx,func,GetChangeStructFromElementData(oldData),GetEmptyStruct(), Config.FindByVersion(0)!.Value.DebugMode);
        }
        catch (Exception e)
        {
            Log($"[{func}] Error deleting element data by name {name}, requested by {ctx.Sender}. " + e.Message, LogLevel.Error);
        }
    }

    [SpacetimeDB.Reducer]
    public static void DeleteAllElementData(ReducerContext ctx)
    {
        string func = "DeleteAllElementData";
        
        if (ctx.Address is null) return;
        if (!GetGuest(func, ctx.Address, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        if (Config.FindByVersion(0)!.Value.StrictMode)
        {
            if (!IsGuestModerator(func, ctx.Sender)) return;
        }
        
        try
        {
            foreach (var data in ElementData.Iter())
            {
                foreach (var e in Elements.Iter())
                {
                    switch (e.Element)
                    {
                        case ElementStruct.ImageElement imageElement:
                            if(imageElement.ImageElement_.ImageElementData is ImageElementData.ElementDataId imageElementData)
                                if (imageElementData.ElementDataId_ == data.Id)
                                    Elements.DeleteById(imageElementData.ElementDataId_);
                            break;
                        case ElementStruct.WidgetElement widgetElement:
                            if (widgetElement.WidgetElement_.ElementDataId == data.Id)
                                Elements.DeleteById(widgetElement.WidgetElement_.ElementDataId);
                            break;
                    }
                }
                
                ElementData.DeleteById(data.Id);
                LogAudit(ctx,func,GetChangeStructFromElementData(data),GetEmptyStruct(), Config.FindByVersion(0)!.Value.DebugMode);
            }
        }
        catch (Exception e)
        {
            Log($"[{func}] Error deleting all element data, requested by {ctx.Sender} " + e.Message, LogLevel.Error);
        }
    }
}