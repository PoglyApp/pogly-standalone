import { DBConnection } from "@/module_bindings";

export const useConnectEvents = (stdb: DBConnection, authKey: string, setAuthentication: Function) => {

    stdb.onReducer("Connect", (ctx: any) => {
        const configSettings = stdb.db.config.version.find(0);
        const localGuest = stdb.db.guests.address.find(stdb.clientAddress);
        if (
            ctx.clientAddress !== stdb.clientAddress || 
            !configSettings || 
            !localGuest
        ) return;

        if(configSettings.authentication && !localGuest.authenticated) stdb.reducers.authenticate(authKey);
    });

    stdb.db.guests.onUpdate((ctx, oldGuest, newGuest) => {
        const configSettings = stdb.db.config.version.find(0);
        const localGuest = stdb.db.guests.address.find(stdb.clientAddress);

        if (
            !configSettings || 
            !localGuest || 
            ctx.event.tag !== "Reducer" || 
            ctx.event.value.reducer.name !== "Authenticate" || 
            ctx.event.value.status.tag !== "Committed" || 
            oldGuest.address.toHexString() !== stdb.clientAddress.toHexString()
        ) return;
        
        if(!oldGuest.authenticated && newGuest.authenticated) setAuthentication(true);
    });
}