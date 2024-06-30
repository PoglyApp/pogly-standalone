import { Identity } from "@clockworklabs/spacetimedb-sdk";
import Guests from "../module_bindings/guests";

const handleElementBorder = (identity: Identity, elementID: string) => {
  const element = document.getElementById(elementID);

  if (!element) return;

  const guestsWithElementSelected = Array.from(
    Guests.filterBySelectedElementId(parseInt(elementID))
  ).filter((g: Guests) => g.identity.toHexString() !== identity.toHexString());

  element.style.borderStyle = "solid";
  element.style.borderColor = "transparent"
  element.style.borderWidth = "1px";

  if (!window.location.href.includes("/overlay")) {
    switch (true) {
      // If no one has the element selected
      case guestsWithElementSelected.length === 0:
        element.style.borderColor = "transparent";
        break;
  
      // If 1 person has the element selected
      case guestsWithElementSelected.length === 1:
        element.style.borderColor = guestsWithElementSelected[0].color;
        break;
  
      // If more than 1 has the element selected
      case guestsWithElementSelected.length > 1:
        const gradient = guestsWithElementSelected
          .map((g: Guests) => {
            return g.color;
          })
          .join(",");
  
        element.style.borderColor = "";
        element.style.borderImage = `linear-gradient(to bottom right, ${gradient}) 1`;
        break;
    }
  }
};

export default handleElementBorder;
