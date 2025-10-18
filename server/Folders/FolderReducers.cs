using SpacetimeDB;

public partial class Module
{
    [Reducer]
    public static void AddFolder(ReducerContext ctx, string name, string icon)
    {
        string func = "AddFolder";

        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        if (ctx.Db.Config.Version.Find(0)!.Value.StrictMode)
        {
            if (!IsGuestModerator(func, ctx)) return;
        }

        try
        {
            uint maxId = 0;
            foreach (var i in ctx.Db.Folders.Iter())
            {
                if (i.Id > maxId) maxId = i.Id;
            }
            
            var newFolder = new Folders
            {
                Id = maxId + 1,
                Icon = icon,
                Name = name,
                CreatedBy = guest.Nickname
            };
            ctx.Db.Folders.Insert(newFolder);
            
            //TODO: Add AuditLog() ChangeStruct types and methods for Folders
            if(ctx.Db.Config.Version.Find(0)!.Value.DebugMode) 
                Log.Info($"[Folders - {func}] {guest.Nickname} added folder {name}!");
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Error adding new Folder, requested by {ctx.Sender}! " + e.Message);
        }
    }

    [Reducer]
    public static void UpdateFolderName(ReducerContext ctx, uint folderId, string name)
    {
        string func = "UpdateFolderName";

        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        if (ctx.Db.Config.Version.Find(0)!.Value.StrictMode)
        {
            if (!IsGuestModerator(func, ctx)) return;
        }

        try
        {
            var oldFolder = ctx.Db.Folders.Id.Find(folderId);

            if (oldFolder.HasValue)
            {
                var newFolder = oldFolder.Value;
                newFolder.Name = name;
                ctx.Db.Folders.Id.Update(newFolder);
            
                //TODO: Add AuditLog() ChangeStruct types and methods for Layouts
                if(ctx.Db.Config.Version.Find(0)!.Value.DebugMode) 
                    Log.Info($"[Folders - {func}] {guest.Nickname} updated folderId {folderId} name to {name}!");
            }
            else
            {
                Log.Error($"[{func}] Error updating folderId {folderId} name, with name {name}, requested by {ctx.Sender}! Couldn't find existing Folder!");
            }
            
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Error updating folderId {folderId} name, with name {name}, requested by {ctx.Sender}! " + e.Message);
        }
    }
    
    [Reducer]
    public static void UpdateFolderIcon(ReducerContext ctx, uint folderId, string icon)
    {
        string func = "UpdateFolderIcon";

        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        if (ctx.Db.Config.Version.Find(0)!.Value.StrictMode)
        {
            if (!IsGuestModerator(func, ctx)) return;
        }

        try
        {
            var oldFolder = ctx.Db.Folders.Id.Find(folderId);

            if (oldFolder.HasValue)
            {
                var newFolder = oldFolder.Value;
                newFolder.Icon = icon;
                ctx.Db.Folders.Id.Update(newFolder);
            
                //TODO: Add AuditLog() ChangeStruct types and methods for Layouts
                if(ctx.Db.Config.Version.Find(0)!.Value.DebugMode) 
                    Log.Info($"[Folders - {func}] {guest.Nickname} updated folderId {folderId} icon to {icon}!");
            }
            else
            {
                Log.Error($"[{func}] Error updating folderId {folderId} icon, with icon {icon}, requested by {ctx.Sender}! Couldn't find existing Folder!");
            }
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Error updating folderId {folderId} icon, with icon {icon}, requested by {ctx.Sender}! " + e.Message);
        }
    }

    [Reducer]
    public static void DeleteFolder(ReducerContext ctx, uint folderId, bool preserveElements = true)
    {
        string func = "DeleteFolder";

        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        if (ctx.Db.Config.Version.Find(0)!.Value.StrictMode)
        {
            if (!IsGuestModerator(func, ctx)) return;
        }

        try
        {
            foreach (var e in ctx.Db.ElementData.Iter().Where(x => x.FolderId == folderId))
            {
                if (preserveElements)
                {
                    var newE = e;
                    newE.FolderId = null;
                    ctx.Db.ElementData.Id.Update(newE);
                }
                else
                {
                    ctx.Db.ElementData.Id.Delete(e.Id);
                }
            }

            ctx.Db.Folders.Id.Delete(folderId);
            
            //TODO: Add AuditLog() ChangeStruct types and methods for Layouts
            if(ctx.Db.Config.Version.Find(0)!.Value.DebugMode) 
                Log.Info($"[Folders - {func}] {guest.Nickname} deleted folderId {folderId}!");
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Error deleting folderId {folderId}, requested by {ctx.Sender}! " + e.Message);
        }
    }
    
    [Reducer]
    public static void DeleteAllFolders(ReducerContext ctx, bool preserveElements = true)
    {
        string func = "DeleteAllFolders";

        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        if (ctx.Db.Config.Version.Find(0)!.Value.StrictMode)
        {
            if (!IsGuestModerator(func, ctx)) return;
        }

        try
        {
            foreach (var e in ctx.Db.ElementData.Iter())
            {
                if (preserveElements)
                {
                    var newE = e;
                    newE.FolderId = null;
                    ctx.Db.ElementData.Id.Update(newE);
                }
                else
                {
                    ctx.Db.ElementData.Id.Delete(e.Id);
                }
            }

            foreach (var folder in ctx.Db.Folders.Iter())
            {
                ctx.Db.Folders.Id.Delete(folder.Id);
            }   
            
            //TODO: Add AuditLog() ChangeStruct types and methods for Layouts
            if(ctx.Db.Config.Version.Find(0)!.Value.DebugMode) 
                Log.Info($"[Folders - {func}] {guest.Nickname} deleted all folders!");
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Error deleting all folders, requested by {ctx.Sender}! " + e.Message);
        }
    }
}