import { SpacetimeDBClient } from "@clockworklabs/spacetimedb-sdk";
import Guests from "../module_bindings/guests";
import Config from "../module_bindings/config";

export const SetStdbConnected = (client: SpacetimeDBClient, fetchedConfig: Config, setStdbConnected: Function, setStdbAuthenticated: Function) => {
    
    // NO AUTHENTICATION
    Guests.onInsert((newGuest) => {
        if (newGuest.identity.toHexString() !== client.identity?.toHexString()) return;
        
        setStdbConnected(true);
    });

    // AUTHENTICATION
    Guests.onUpdate((oldGuest, newGuest) => {
        if (newGuest.identity.toHexString() !== client.identity?.toHexString()) return;
        if (oldGuest.authenticated === newGuest.authenticated) return;
  
        if(fetchedConfig.authentication && newGuest.authenticated) setStdbAuthenticated(true);
    });
};