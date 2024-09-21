using SpacetimeDB;
using static SpacetimeDB.Runtime;

public partial class Module
{
    private static void LogAudit(ReducerContext ctx, string reducer, ChangeStruct oldChange, ChangeStruct newChange, bool consoleLog = false)
    {
        try
        {
            string nick = "";
            if (ctx.Sender == Heartbeat.FilterById(0).First().ServerIdentity)
            {
                nick = "Server";
            }
            else
            {
                if (ctx.Address is null) return;
                var guest = Guests.FindByAddress(ctx.Address);
                if (guest is null)
                {
                    //Log($"[AuditLog - {reducer}] Unable to audit log because Guest nickname is null!",LogLevel.Error);
                    return;
                }
    
                nick = guest.Value.Nickname;
            }
            
            // Disable Audit log stuff for now.
            
            // new AuditLog
            // {
            //     UnixTime = ctx.Time.ToUnixTimeSeconds(),
            //     Identity = ctx.Sender,
            //     Nickname = nick,
            //     Reducer = reducer,
            //     OldChange = oldChange,
            //     NewChange = newChange
            // }.Insert();
    
            if (consoleLog)
            {
                switch (newChange)
                {
                    case ChangeStruct.ElementChange b:
                        switch (oldChange)
                        {
                            case ChangeStruct.EmptyChange:
                                Log($"[Elements - {reducer}] {ctx.Sender} added:\n\t({b.ElementChange_.Id},{b.ElementChange_.Element},{b.ElementChange_.Transparency},{b.ElementChange_.Transform},{b.ElementChange_.Clip},{b.ElementChange_.PlacedBy},{b.ElementChange_.LastEditedBy},{b.ElementChange_.ZIndex})", LogLevel.Info);
                                break;
                            case ChangeStruct.ElementChange a:
                                Log($"[Elements - {reducer}] {ctx.Sender} changed:\n\tOld: ({a.ElementChange_.Id},{a.ElementChange_.Element},{a.ElementChange_.Transparency},{a.ElementChange_.Transform},{a.ElementChange_.Clip},{a.ElementChange_.PlacedBy},{a.ElementChange_.LastEditedBy},{a.ElementChange_.ZIndex})\n\tNew: ({b.ElementChange_.Id},{b.ElementChange_.Element},{b.ElementChange_.Transparency},{b.ElementChange_.Transform},{b.ElementChange_.Clip},{b.ElementChange_.PlacedBy},{b.ElementChange_.LastEditedBy},{b.ElementChange_.ZIndex})", LogLevel.Info);
                                break;
                        }

                        break;
                    case ChangeStruct.ElementDataChange d:
                        switch (oldChange)
                        {
                            case ChangeStruct.EmptyChange:
                                Log($"[ElementData - {reducer}] {ctx.Sender} added:\n\t({d.ElementDataChange_.Id},{d.ElementDataChange_.Name},{d.ElementDataChange_.DataType},{d.ElementDataChange_.Data},{d.ElementDataChange_.CreatedBy})", LogLevel.Info);
                                break;
                            case ChangeStruct.ElementDataChange c:
                                Log($"[ElementData - {reducer}] {ctx.Sender} changed:\n\tOld: ({c.ElementDataChange_.Id},{c.ElementDataChange_.Name},{c.ElementDataChange_.DataType},{c.ElementDataChange_.Data},{c.ElementDataChange_.CreatedBy})\n\tNew: ({d.ElementDataChange_.Id},{d.ElementDataChange_.Name},{d.ElementDataChange_.DataType},{d.ElementDataChange_.Data},{d.ElementDataChange_.CreatedBy})", LogLevel.Info);
                                break;
                        }
                        break;
                    case ChangeStruct.GuestChange f:
                        switch (oldChange)
                        {
                            case ChangeStruct.EmptyChange:
                                Log($"[Guests - {reducer}] {ctx.Sender} added:\n\t({f.GuestChange_.Identity}{f.GuestChange_.Nickname},{f.GuestChange_.Color},{f.GuestChange_.SelectedElementId},{f.GuestChange_.PositionX},{f.GuestChange_.PositionY})",LogLevel.Info);
                                break;
                            case ChangeStruct.GuestChange e:
                                Log($"[Guests - {reducer}] {ctx.Sender} change:\n\tOld: ({e.GuestChange_.Identity}{e.GuestChange_.Nickname},{e.GuestChange_.Color},{e.GuestChange_.SelectedElementId},{e.GuestChange_.PositionX},{e.GuestChange_.PositionY})\n\tNew: ({f.GuestChange_.Identity}{f.GuestChange_.Nickname},{f.GuestChange_.Color},{f.GuestChange_.SelectedElementId},{f.GuestChange_.PositionX},{f.GuestChange_.PositionY})",LogLevel.Info);
                                break;
                        }
                        break;
                    case ChangeStruct.EmptyChange:
                        switch (oldChange)
                        {
                            case ChangeStruct.ElementDataChange g:
                                Log($"[ElementData - {reducer}] {ctx.Sender} deleted:\n\t({g.ElementDataChange_.Id},{g.ElementDataChange_.Name},{g.ElementDataChange_.DataType},{g.ElementDataChange_.Data},{g.ElementDataChange_.CreatedBy})",LogLevel.Info);
                                break;
                            case ChangeStruct.ElementChange h:
                                Log($"[Elements - {reducer}] {ctx.Sender} deleted:\n\t({h.ElementChange_.Id},{h.ElementChange_.Element},{h.ElementChange_.Transparency},{h.ElementChange_.Transform},{h.ElementChange_.Clip},{h.ElementChange_.PlacedBy},{h.ElementChange_.LastEditedBy},{h.ElementChange_.ZIndex})",LogLevel.Info);
                                break;
                            case ChangeStruct.GuestChange i:
                                Log($"[Guests - {reducer}] {ctx.Sender} deleted:\n\t({i.GuestChange_.Identity},{i.GuestChange_.Nickname},{i.GuestChange_.Color},{i.GuestChange_.SelectedElementId},{i.GuestChange_.PositionX},{i.GuestChange_.PositionY})",LogLevel.Info);
                                break;
                            case ChangeStruct.EmptyChange:
                                Log($"Logger encountered null changing to null?? Shouldn't happen",LogLevel.Error);
                                break;
                            case ChangeStruct.ChatMessage:
                                Log($"[AuditLog - {reducer}] Somehow the chat message made its way into the oldChange Struct?", LogLevel.Error);
                                break;
                        }
                        break;
                    case ChangeStruct.ChatMessage chat:
                        Log($"[AuditLog - {reducer}] {ctx.Sender} chatted: ({chat.ChatMessage_.Message})", LogLevel.Info);
                        break;
                }
            }
        }
        catch (Exception e)
        {
            Log($"[Audit Log] Unable to log changes for {reducer}! " + e.Message,LogLevel.Error);
        }
    }

    private static ChangeStruct GetChangeStructFromGuest(Guests g)
    {
        GuestChange guest = new()
        {
            Identity = g.Identity,
            Nickname = g.Nickname,
            Color = g.Color,
            SelectedElementId = g.SelectedElementId,
            PositionX = g.PositionX,
            PositionY = g.PositionY
        };
        
        return new ChangeStruct.GuestChange(guest);
    }

    private static ChangeStruct GetChangeStructFromElement(Elements e)
    {
        ElementChange element = new()
        {
            Id = e.Id,
            Element = e.Element,
            Transparency = e.Transparency,
            Transform = e.Transform,
            Clip = e.Clip,
            PlacedBy = e.PlacedBy,
            LastEditedBy = e.LastEditedBy,
            ZIndex = e.ZIndex
        };

        return new ChangeStruct.ElementChange(element);
    }

    private static ChangeStruct GetChangeStructFromElementData(ElementData ed)
    {
        ElementDataChange edata = new()
        {
            Id = ed.Id,
            Name = ed.Name,
            DataType = ed.DataType,
            Data = ed.Data,
            CreatedBy = ed.CreatedBy
        };
        return new ChangeStruct.ElementDataChange(edata);
    }

    private static ChangeStruct GetChangeStructFromChatMessage(string chat)
    {
        ChatMessage chatM = new()
        {
            Message = chat
        };
        
        return new Module.ChangeStruct.ChatMessage(chatM);
    }

    private static ChangeStruct GetEmptyStruct()
    {
        EmptyChange echange = new() { };
        
        return new ChangeStruct.EmptyChange(echange);
    }
}