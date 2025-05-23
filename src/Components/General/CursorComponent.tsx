import { useContext, useEffect, useRef, useState } from "react";
import CssFilterConverter from "css-filter-converter";
import Guests from "../../module_bindings/guests";
import { SettingsContext } from "../../Contexts/SettingsContext";
import { GetCoordsFromTransform, GetTransformFromCoords } from "../../Utility/ConvertCoordinates";
import { useTransformContext, useTransformEffect } from "react-zoom-pan-pinch";

interface IProp {
  guest: Guests;
}

export const CursorComponent = (props: IProp) => {
  const mouse = useRef<any>();
  const { settings } = useContext(SettingsContext);

  const result = CssFilterConverter.hexToFilter(props.guest.color);

  const [scale, setScale] = useState<number>(useTransformContext().transformState.scale);

  useTransformEffect(({ state }) => {
    if (state.scale === scale) return;

    const cursorDiv = document.getElementById(`${props.guest.nickname}_cursor`);
    if (!cursorDiv) return;

    const positionX = cursorDiv.getAttribute("data-raw-positionX");
    const positionY = cursorDiv.getAttribute("data-raw-positionY");
    if (!positionX || !positionY) return;

    cursorDiv.style.transform = GetTransformFromCoords(
      parseFloat(positionX) * state.scale,
      parseFloat(positionY) * state.scale,
      0,
      false,
      false,
      null,
      null
    );

    setScale(state.scale);
  });

  return (
    <>
      <div
        id={`${props.guest.nickname}_cursor`}
        style={{ position: "fixed", zIndex: 20000000, scale: `${1 / scale || 1}` }}
      >
        <img
          ref={mouse}
          style={{
            width: "15px",
            height: "22px",
            position: "fixed",
            filter: `${result.color}`,
          }}
          src="./assets/cursor.png"
          alt="cursor"
        />
        {settings.cursorName || true ? (
          <>
            <p
              style={{
                position: "fixed",
                left: "8px",
                top: "4px",
                filter: `${result.color}`,
                fontSize: "10px",
              }}
            >
              {props.guest.nickname}
            </p>
          </>
        ) : (
          <></>
        )}
      </div>
    </>
  );
};
