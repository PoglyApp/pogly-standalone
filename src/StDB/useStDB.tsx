import { useEffect, useState } from "react";
import { SpacetimeDBClient, Identity, Address } from "@clockworklabs/spacetimedb-sdk";
import Heartbeat from "../module_bindings/heartbeat";
import Guests from "../module_bindings/guests";
import Elements from "../module_bindings/elements";
import ElementData from "../module_bindings/element_data";
import UpdateGuestReducer from "../module_bindings/update_guest_reducer";
import UpdateGuestNicknameReducer from "../module_bindings/update_guest_nickname_reducer";
import UpdateGuestSelectedElementReducer from "../module_bindings/update_guest_selected_element_reducer";
import UpdateGuestPositionReducer from "../module_bindings/update_guest_position_reducer";
import AddElementDataReducer from "../module_bindings/add_element_data_reducer";
import UpdateElementDataReducer from "../module_bindings/update_element_data_reducer";
import UpdateElementDataNameReducer from "../module_bindings/update_element_data_name_reducer";
import UpdateElementDataDataReducer from "../module_bindings/update_element_data_data_reducer";
import DeleteElementDataByIdReducer from "../module_bindings/delete_element_data_by_id_reducer";
import DeleteElementDataByNameReducer from "../module_bindings/delete_element_data_by_name_reducer";
import DeleteAllElementDataReducer from "../module_bindings/delete_all_element_data_reducer";
import AddElementReducer from "../module_bindings/add_element_reducer";
import UpdateElementReducer from "../module_bindings/update_element_reducer";
import UpdateElementStructReducer from "../module_bindings/update_element_struct_reducer";
import UpdateElementTransparencyReducer from "../module_bindings/update_element_transparency_reducer";
import UpdateElementTransformReducer from "../module_bindings/update_element_transform_reducer";
import UpdateElementClipReducer from "../module_bindings/update_element_clip_reducer";
import UpdateElementLockedReducer from "../module_bindings/update_element_locked_reducer";
import DeleteElementReducer from "../module_bindings/delete_element_reducer";
import DeleteAllElementsReducer from "../module_bindings/delete_all_elements_reducer";
import KeepAliveReducer from "../module_bindings/keep_alive_reducer";
import SendMessageReducer from "../module_bindings/send_message_reducer";
import Config from "../module_bindings/config";
import AuthenticateReducer from "../module_bindings/authenticate_reducer";
import SetConfigReducer from "../module_bindings/set_config_reducer";
import Permissions from "../module_bindings/permissions";
import SetIdentityPermissionReducer from "../module_bindings/set_identity_permission_reducer";
import SetIdentityPermissionEditorReducer from "../module_bindings/set_identity_permission_editor_reducer";
import SetIdentityPermissionModeratorReducer from "../module_bindings/set_identity_permission_moderator_reducer";
import AuthenticateDoWorkReducer from "../module_bindings/authenticate_do_work_reducer";
import { ConnectionConfigType } from "../Types/ConfigTypes/ConnectionConfigType";
import ClearIdentityPermissionReducer from "../module_bindings/clear_identity_permission_reducer";
import UpdateTextElementColorReducer from "../module_bindings/update_text_element_color_reducer";
import UpdateTextElementFontReducer from "../module_bindings/update_text_element_font_reducer";
import UpdateTextElementSizeReducer from "../module_bindings/update_text_element_size_reducer";
import UpdateTextElementTextReducer from "../module_bindings/update_text_element_text_reducer";
import UpdateWidgetElementSizeReducer from "../module_bindings/update_widget_element_size_reducer";
import UpdateImageElementSizeReducer from "../module_bindings/update_image_element_size_reducer";
import Layouts from "../module_bindings/layouts";
import AddLayoutReducer from "../module_bindings/add_layout_reducer";
import UpdateLayoutNameReducer from "../module_bindings/update_layout_name_reducer";
import SetLayoutActiveReducer from "../module_bindings/set_layout_active_reducer";
import DeleteLayoutReducer from "../module_bindings/delete_layout_reducer";
import DeleteAllLayoutsReducer from "../module_bindings/delete_all_layouts_reducer";
import AddElementToLayoutReducer from "../module_bindings/add_element_to_layout_reducer";
import UpdateImageElementDataStructReducer from "../module_bindings/update_image_element_data_struct_reducer";
import UpdateImageElementHeightReducer from "../module_bindings/update_image_element_height_reducer";
import UpdateImageElementWidthReducer from "../module_bindings/update_image_element_width_reducer";
import UpdateWidgetElementDataIdReducer from "../module_bindings/update_widget_element_data_id_reducer";
import UpdateWidgetElementRawDataReducer from "../module_bindings/update_widget_element_raw_data_reducer";
import UpdateWidgetElementHeightReducer from "../module_bindings/update_widget_element_height_reducer";
import UpdateWidgetElementWidthReducer from "../module_bindings/update_widget_element_width_reducer";
import UpdateAuthenticationKeyReducer from "../module_bindings/update_authentication_key_reducer";
import RefreshOverlayReducer from "../module_bindings/refresh_overlay_reducer";
import ClearRefreshOverlayRequestsReducer from "../module_bindings/clear_refresh_overlay_requests_reducer";
import KickGuestReducer from "../module_bindings/kick_guest_reducer";
import RefreshOverlayClearStorageReducer from "../module_bindings/refresh_overlay_clear_storage_reducer";
import { SetStdbConnected } from "../Utility/SetStdbConnected";
import KickSelfReducer from "../module_bindings/kick_self_reducer";
import ConnectReducer from "../module_bindings/connect_reducer";
import { DebugLogger } from "../Utility/DebugLogger";
import UpdateTextElementShadowReducer from "../module_bindings/update_text_element_shadow_reducer";
import AddElementDataArrayReducer from "../module_bindings/add_element_data_array_reducer";
import UpdateConfigReducer from "../module_bindings/update_config_reducer";
import UpdateEditorGuidelinesReducer from "../module_bindings/update_editor_guidelines_reducer";
import AddElementDataWithIdReducer from "../module_bindings/add_element_data_with_id_reducer";
import AddLayoutWithIdReducer from "../module_bindings/add_layout_with_id_reducer";
import AddElementDataArrayWithIdReducer from "../module_bindings/add_element_data_array_with_id_reducer";
import AddFolderReducer from "../module_bindings/add_folder_reducer";
import UpdateFolderNameReducer from "../module_bindings/update_folder_name_reducer";
import UpdateFolderIconReducer from "../module_bindings/update_folder_icon_reducer";
import DeleteFolderReducer from "../module_bindings/delete_folder_reducer";
import DeleteAllFoldersReducer from "../module_bindings/delete_all_folders_reducer";
import UpdateElementLayoutReducer from "../module_bindings/update_element_layout_reducer";
import UpdateElementFolderReducer from "../module_bindings/update_element_folder_reducer";
import UpdateGuestSelectedLayoutReducer from "../module_bindings/update_guest_selected_layout_reducer";

const useStDB = (
  connectionConfig: ConnectionConfigType | undefined,
  setStdbConnected: Function,
  setStdbAuthenticated: Function,
  setStdbInitialized: Function,
  setInstanceConfigured: Function
) => {
  const [identity, setIdentity] = useState<Identity>();
  const [address, setAddress] = useState<Address>();
  const [config, setConfig] = useState<Config>();
  const [error, setError] = useState<boolean>(false);
  const [disconnected, setDisconnected] = useState<boolean>(false);
  const [stdbClient, setStdbClient] = useState<SpacetimeDBClient>();

  useEffect(() => {
    if (!connectionConfig) return;
    DebugLogger("Initializing SpacetimeDB");

    SpacetimeDBClient.registerTables(Heartbeat, Guests, Elements, ElementData, Config, Permissions, Layouts);
    SpacetimeDBClient.registerReducers(
      UpdateGuestReducer,
      UpdateGuestNicknameReducer,
      UpdateGuestSelectedElementReducer,
      UpdateGuestPositionReducer,
      AddElementDataReducer,
      AddElementDataWithIdReducer,
      AddElementDataArrayReducer,
      AddElementDataArrayWithIdReducer,
      UpdateElementDataReducer,
      UpdateElementDataNameReducer,
      UpdateElementDataDataReducer,
      DeleteElementDataByIdReducer,
      DeleteElementDataByNameReducer,
      DeleteAllElementDataReducer,
      AddElementReducer,
      UpdateElementReducer,
      UpdateElementStructReducer,
      UpdateElementTransparencyReducer,
      UpdateElementTransformReducer,
      UpdateElementClipReducer,
      UpdateElementLockedReducer,
      UpdateElementLayoutReducer,
      UpdateElementFolderReducer,
      UpdateTextElementColorReducer,
      UpdateTextElementFontReducer,
      UpdateTextElementSizeReducer,
      UpdateTextElementTextReducer,
      UpdateTextElementShadowReducer,
      UpdateTextElementShadowReducer,
      UpdateWidgetElementSizeReducer,
      UpdateImageElementSizeReducer,
      UpdateImageElementDataStructReducer,
      UpdateImageElementHeightReducer,
      UpdateImageElementWidthReducer,
      UpdateWidgetElementDataIdReducer,
      UpdateWidgetElementRawDataReducer,
      UpdateWidgetElementHeightReducer,
      UpdateWidgetElementWidthReducer,
      DeleteElementReducer,
      DeleteAllElementsReducer,
      KeepAliveReducer,
      SendMessageReducer,
      AuthenticateReducer,
      AuthenticateDoWorkReducer,
      SetConfigReducer,
      UpdateConfigReducer,
      SetIdentityPermissionReducer,
      SetIdentityPermissionEditorReducer,
      SetIdentityPermissionModeratorReducer,
      ClearIdentityPermissionReducer,
      AddLayoutReducer,
      AddLayoutWithIdReducer,
      UpdateLayoutNameReducer,
      SetLayoutActiveReducer,
      DeleteLayoutReducer,
      DeleteAllLayoutsReducer,
      AddElementToLayoutReducer,
      UpdateAuthenticationKeyReducer,
      RefreshOverlayReducer,
      ClearRefreshOverlayRequestsReducer,
      KickGuestReducer,
      KickSelfReducer,
      ConnectReducer,
      RefreshOverlayClearStorageReducer,
      UpdateEditorGuidelinesReducer,
      AddFolderReducer,
      UpdateFolderNameReducer,
      UpdateFolderIconReducer,
      DeleteFolderReducer,
      DeleteAllFoldersReducer,
      UpdateGuestSelectedLayoutReducer
    );

    const stdbToken = localStorage.getItem("stdbToken") || "";
    const isOverlay: Boolean = window.location.href.includes("/overlay");

    const client = new SpacetimeDBClient(connectionConfig?.domain || "", connectionConfig?.module || "", stdbToken);
    let address: Address | undefined;

    client?.onConnect((token: string, Identity: Identity, Address: Address) => {
      try {
        setIdentity(Identity);
        setAddress(Address);
        address = Address;
        setStdbClient(client);
        localStorage.setItem("stdbToken", token);
        console.log("Connected to StDB! [" + Identity.toHexString() + "] @ [" + Address.toHexString() + "]");
        client?.subscribe([
          "SELECT * FROM Heartbeat",
          "SELECT * FROM Guests",
          "SELECT * FROM Config",
          "SELECT * FROM Permissions",
        ]);
      } catch (error) {
        console.log("SpacetimeDB connect failed:", error);
      }
    });

    // False = initial connection data
    // True = subscribed to all data (we set subscriptions in app.tsx)
    let connected = false;
    let done = false;

    client?.on("initialStateSync", () => {
      try {
        if (connected) {
          if (!done) {
            done = true;
            setStdbInitialized(true);
          }
        } else {
          connected = true;

          const fetchedConfig = Config.findByVersion(0);

          if (!fetchedConfig) {
            setError(true);
            return;
          }

          if (fetchedConfig.configInit) setInstanceConfigured(true);

          setConfig(fetchedConfig);

          if (!address) {
            setError(true);
            return;
          }

          SetStdbConnected(client, address, fetchedConfig, setStdbConnected, setStdbAuthenticated);
        }
      } catch (error) {
        console.log("initialStateSync failed:", error);
      }
    });

    client?.onError((...args: any[]) => {
      if (args[0].type === "close") {
        setDisconnected(true);
        return;
      }

      setError(true);
      console.log("Error with SpacetimeDB: ", args);
    });

    client?.connect();
  }, [connectionConfig, setInstanceConfigured, setStdbConnected, setStdbInitialized, setStdbAuthenticated]);

  return {
    Client: stdbClient,
    Identity: identity,
    Address: address,
    InstanceConfig: config,
    Error: error,
    Disconnected: disconnected,
    Runtime: connectionConfig,
  };
};

export default useStDB;
