import { DBConnection, EventContext, Guests } from "@/module_bindings";

export const useConnectEvents = (stdb: DBConnection, authKey: string, setAuthentication: Function) => {

    const connectCallback = (ctx: any) => {
        try {
            const configSettings = stdb.db.config.version.find(0);
            const localGuest = stdb.db.guests.address.find(stdb.clientAddress);
            if (
                ctx.clientAddress !== stdb.clientAddress || 
                !configSettings || 
                !localGuest
            ) return;
    
            if(configSettings.authentication && !localGuest.authenticated) stdb.reducers.authenticate(authKey);
        } finally {
            stdb.offReducer("Connect", connectCallback);
        }
    };

    const authenticateCallback = (ctx: EventContext, oldGuest: Guests, newGuest: Guests) => {
        try {
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
        } finally {
            stdb.db.guests.removeOnUpdate(authenticateCallback);
        }
    };

    stdb.onReducer("Connect", connectCallback);
    stdb.db.guests.onUpdate(authenticateCallback);
}