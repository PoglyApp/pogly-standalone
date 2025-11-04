import { SpacetimeContext } from "@/Contexts/SpacetimeContext";
import { Guests } from "@/module_bindings";
import { useGuestEvents } from "@/StDB/Hooks_NEW/useGuestEvents";
import { useContext, useEffect, useState } from "react";

export const UserList = () => {
  const { spacetimeDB } = useContext(SpacetimeContext);
  const [users, setUsers] = useState<Guests[]>([]);

  useGuestEvents(setUsers);

  useEffect(() => {
    if (!spacetimeDB) return;

    const guests: Guests[] = spacetimeDB.Client.db.guests.iter() as Guests[];
    setUsers(() => [...guests]);
  }, [spacetimeDB]);

  return (
    <div id="guestListContainer" className="absolute flex gap-2 items-center p-2 right-10 top-7">
      {users.map((user, i) => {
        if (user.nickname !== "") {
          return (
            <div
              key={`${i}_USER_BUBBLE`}
              id={`${user.identity.toHexString().slice(-3)}_${user.nickname}`}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold`}
              style={{ backgroundColor: user.color }}
            >
              {user.nickname[0]}
            </div>
          );
        }
      })}
    </div>
  );
};
