import Selecto from "react-selecto";
import Moveable from "react-moveable";
import { toast } from "react-toastify";
import Elements from "../../module_bindings/elements";
import UpdateGuestSelectedElementReducer from "../../module_bindings/update_guest_selected_element_reducer";

interface IProp {
  moveableRef: React.RefObject<Moveable>;
  selectoRef: React.RefObject<Selecto>;
  selectoTargets: Array<SVGElement | HTMLElement>;
  setSelectoTargets: Function;
  setSelected: Function;
  elements: Elements[];
}

export const SelectoComponent = (props: IProp) => {
  return (
    <Selecto
      ref={props.selectoRef}
      selectableTargets={[".element"]}
      hitRate={0}
      selectByClick={true}
      selectFromInside={false}
      toggleContinueSelect={["shift"]}
      ratio={0}
      onDragStart={(e) => {
        const selectionMenu = document.getElementById("SelectionMenu");
        if (selectionMenu?.contains(e.inputEvent.target)) e.stop();

        const moveable = props.moveableRef.current!;
        const target = e.inputEvent.target;

        if (
          moveable.isMoveableElement(target) ||
          props.selectoTargets.some((t) => t === target || t.contains(target))
        ) {
          e.stop();
        }
      }}
      onSelectEnd={(e) => {
        if (e.selected.length === 0 && props.selectoTargets.length === 0) return;

        const moveable = props.moveableRef.current!;

        if (e.isDragStart) {
          e.inputEvent.preventDefault();
          moveable.waitToChangeTarget().then(() => {
            moveable.dragStart(e.inputEvent);
          });
        }

        const unlockedElements = e.selected.filter(
          (element: any) => element.attributes.getNamedItem("data-locked").value !== "true"
        );

        const anyLockedElements = e.selected.length - unlockedElements.length;

        if (e.selected.length === 1) {
          const selectedElement = props.elements.filter(
            (element: Elements) => element.id === parseInt(e.selected[0].id)
          );

          props.setSelected({
            Elements: selectedElement[0],
            Component: e.selected[0],
          });

          if (document.getElementById(selectedElement[0].id.toString())?.getAttribute("data-locked") !== "true")
            UpdateGuestSelectedElementReducer.call(selectedElement[0].id);
        }

        if (anyLockedElements > 0) {
          toast.warning("One or more selected elements are locked and cannot be selected.", {
            position: "bottom-right",
            autoClose: 1500,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: false,
            progress: undefined,
            theme: "dark",
          });
        }

        props.setSelectoTargets(unlockedElements);
      }}
    />
  );
};
