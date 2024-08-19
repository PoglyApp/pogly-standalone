import { SpacetimeDBClient } from "@clockworklabs/spacetimedb-sdk";
import Guests from "../module_bindings/guests";
import Config from "../module_bindings/config";

export const SetStdbConnected = (client: SpacetimeDBClient, setStdbConnected: Function, setError: Function) => {
    
    // NO AUTHENTICATION
    Guests.onInsert((newGuest) => {
        if (newGuest.identity.toHexString() === client.identity?.toHexString()) setStdbConnected(true);
    });

    // AUTHENTICATION
    Guests.onUpdate((oldGuest, newGuest) => {
        if (newGuest.identity.toHexString() !== client.identity?.toHexString()) return;
        if (oldGuest.authenticated === newGuest.authenticated) return;
  
        const fetchedConfig = Config.findByVersion(0);
  
        if (!fetchedConfig) {
          setError(true);
          return;
        }
  
        if(fetchedConfig.authentication && newGuest.authenticated) setStdbConnected(true);
    });
};