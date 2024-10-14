using SpacetimeDB;
using static SpacetimeDB.Runtime;

public partial class Module
{
    [SpacetimeDB.Reducer]
    public static void AddLayout(ReducerContext ctx, string name, bool active = false)
    {
        string func = "AddLayout";

        if (ctx.Address is null) return;

        try
        {
            if (!GetGuest(func, ctx.Address, out var guest))
                return;
            if (!GuestAuthenticated(func, guest)) return;
            if (Config.FindByVersion(0)!.Value.StrictMode)
            {
                if (!IsGuestModerator(func, ctx.Sender)) return;
            }
            
            uint maxId = 0;
            foreach (var i in Layouts.Iter())
            {
                if (i.Id > maxId) maxId = i.Id;
            }

            var newLayout = new Layouts
            {
                Id = maxId + 1,
                Name = name,
                CreatedBy = guest.Nickname,
                Active = active
            };
            newLayout.Insert();
            
            //TODO: Add AutitLog() ChangeStruct types and methods for Layouts
            if(Config.FindByVersion(0)!.Value.DebugMode) 
                Log($"[Layouts - {func}] {guest.Nickname} added layout {name}!");
        }
        catch (Exception e)
        {
            Log($"[{func}] Error adding new Layout, requested by {ctx.Sender}! " + e.Message, LogLevel.Error);
        }
    }
    
    [SpacetimeDB.Reducer]
    public static void AddLayoutWithId(ReducerContext ctx, uint id, string name, bool active = false)
    {
        string func = "AddLayoutWithId";

        if (ctx.Address is null) return;

        try
        {
            if (!GetGuest(func, ctx.Address, out var guest))
                return;
            if (!GuestAuthenticated(func, guest)) return;
            if (Config.FindByVersion(0)!.Value.StrictMode)
            {
                if (!IsGuestModerator(func, ctx.Sender)) return;
            }

            var newLayout = new Layouts
            {
                Id = id,
                Name = name,
                CreatedBy = guest.Nickname,
                Active = active
            };
            newLayout.Insert();
            
            //TODO: Add AutitLog() ChangeStruct types and methods for Layouts
            if(Config.FindByVersion(0)!.Value.DebugMode) 
                Log($"[Layouts - {func}] {guest.Nickname} added layout {name}!");
        }
        catch (Exception e)
        {
            Log($"[{func}] Error adding new Layout, requested by {ctx.Sender}! " + e.Message, LogLevel.Error);
        }
    }
    
    [SpacetimeDB.Reducer]
    public static void ImportLayout(ReducerContext ctx, uint id, string name, string createdBy, bool active = false)
    {
        string func = "ImportLayout";

        if (Config.FindByVersion(0)!.Value.ConfigInit) return;

        try
        {
            var newLayout = new Layouts
            {
                Id = id,
                Name = name,
                CreatedBy = createdBy,
                Active = active
            };
            newLayout.Insert();
        }
        catch (Exception e)
        {
            Log($"[{func}] Error adding new Layout, requested by {ctx.Sender}! " + e.Message, LogLevel.Error);
        }
    }

    [SpacetimeDB.Reducer]
    public static void UpdateLayoutName(ReducerContext ctx, uint layoutId, string name)
    {
        string func = "UpdateLayoutName";

        if (ctx.Address is null) return;

        try
        {
            if (!GetGuest(func, ctx.Address, out var guest))
                return;
            if (!GuestAuthenticated(func, guest)) return;
            if (Config.FindByVersion(0)!.Value.StrictMode)
            {
                if (!IsGuestModerator(func, ctx.Sender)) return;
            }

            var oldLayout = Layouts.FilterById(layoutId).First();
            var newLayout = oldLayout;
            newLayout.Name = name;
            Layouts.UpdateById(layoutId, newLayout);
            
            //TODO: Add AutitLog() ChangeStruct types and methods for Layouts
            if(Config.FindByVersion(0)!.Value.DebugMode) 
                Log($"[Layouts - {func}] {guest.Nickname} updated layoutId {layoutId} name to {name}!");
        }
        catch (Exception e)
        {
            Log($"[{func}] Error Updating layoutId {layoutId} name, with name {name}, requested by {ctx.Sender}! " +e.Message,LogLevel.Error);
        }
    }

    [SpacetimeDB.Reducer]
    public static void SetLayoutActive(ReducerContext ctx, uint layoutId)
    {
        string func = "SetLayoutActive";

        if (ctx.Address is null) return;
        
        try
        {
            if (!GetGuest(func, ctx.Address, out var guest))
                return;
            if (!GuestAuthenticated(func, guest)) return;
            if (Config.FindByVersion(0)!.Value.StrictMode)
            {
                if (!IsGuestModerator(func, ctx.Sender)) return;
            }

            foreach (var oldLayout in Layouts.Iter())
            {
                var updatedLayout = oldLayout;
                updatedLayout.Active = oldLayout.Id == layoutId;
                Layouts.UpdateById(oldLayout.Id, updatedLayout);
            }
            
            //TODO: Add AutitLog() ChangeStruct types and methods for Layouts
            if(Config.FindByVersion(0)!.Value.DebugMode) 
                Log($"[Layouts - {func}] {guest.Nickname} set layoutId {layoutId} active!");
        }
        catch (Exception e)
        {
            Log($"[{func}] Error setting active layoutId {layoutId}, requested by {ctx.Sender}! " + e.Message,LogLevel.Error);
        }
    }

    [SpacetimeDB.Reducer]
    public static void DeleteLayout(ReducerContext ctx, uint layoutId, bool preserveElements = false, uint preserveLayoutId = 1)
    {
        string func = "DeleteLayout";

        if (ctx.Address is null) return;
        
        try
        {
            if (!GetGuest(func, ctx.Address, out var guest))
                return;
            if (!GuestAuthenticated(func, guest)) return;
            if (Config.FindByVersion(0)!.Value.StrictMode)
            {
                if (!IsGuestModerator(func, ctx.Sender)) return;
            }
            
            if (layoutId == 1) return;

            var oldLayout = Layouts.FilterById(layoutId).First();
            if (oldLayout is {Name: "Default", CreatedBy: "Server"}) return;

            var activeLayout = GetActiveLayout();
            
            if(oldLayout.Id == activeLayout) SetLayoutActive(ctx, 1);

            foreach (var e in Elements.Query(x => x.LayoutId == layoutId))
            {
                if (preserveElements)
                {
                    var newE = e;
                    newE.LayoutId = preserveLayoutId;
                    Elements.UpdateById(e.Id, newE);
                }
                else
                {
                    Elements.DeleteById(e.Id);
                }
            }

            foreach (Guests g in Guests.Query(x => x.SelectedLayoutId == layoutId))
            {
                var newGuest = g;
                newGuest.SelectedLayoutId = GetActiveLayout();
                Guests.UpdateByAddress(g.Address, newGuest);
            }

            Layouts.DeleteById(layoutId);
            
            //TODO: Add AutitLog() ChangeStruct types and methods for Layouts
            if(Config.FindByVersion(0)!.Value.DebugMode) 
                Log($"[Layouts - {func}] {guest.Nickname} deleted layoutId {layoutId}!");
        }
        catch (Exception e)
        {
            Log($"[{func}] Error deleting layoutId {layoutId}, requested by {ctx.Sender}! " + e.Message, LogLevel.Error);
        }
    }
    
    [SpacetimeDB.Reducer]
    public static void DeleteAllLayouts(ReducerContext ctx, bool preserveElements = false)
    {
        string func = "DeleteAllLayouts";

        if (ctx.Address is null) return;

        try
        {
            if (!GetGuest(func, ctx.Address, out var guest))
                return;
            if (!GuestAuthenticated(func, guest)) return;
            if (Config.FindByVersion(0)!.Value.StrictMode)
            {
                if (!IsGuestModerator(func, ctx.Sender)) return;
            }

            var activeLayout = GetActiveLayout();
            
            if(activeLayout != 1) SetLayoutActive(ctx, 1);

            foreach (var e in Elements.Query(x => x.LayoutId != 1))
            {
                if (preserveElements)
                {
                    var newE = e;
                    newE.LayoutId = 1;
                    Elements.UpdateById(e.Id, newE);
                }
                else
                {
                    Elements.DeleteById(e.Id);
                }
            }

            foreach (var layout in Layouts.Query(x => x.Id != 1))
            {
                if(layout is not {Name: "Default", CreatedBy: "Server"}) //Just a cheeky double-check
                    Layouts.DeleteById(layout.Id);
            }
            
            foreach (Guests g in Guests.Iter())
            {
                var newGuest = g;
                newGuest.SelectedLayoutId = 1;
                Guests.UpdateByAddress(g.Address, newGuest);
            }
            
            //TODO: Add AutitLog() ChangeStruct types and methods for Layouts
            if(Config.FindByVersion(0)!.Value.DebugMode) 
                Log($"[Layouts - {func}] {guest.Nickname} deleted all layouts!");
        }
        catch (Exception e)
        {
            Log($"[{func}] Error deleting all layouts, requested by {ctx.Sender}! " + e.Message, LogLevel.Error);
        }
    }
}