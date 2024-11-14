import { useEffect, useRef, useState } from "react";

interface IProps {
  text: string;
  children: any;
}

export const Tooltip = (props: IProps) => {
  const [hovered, setHovered] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState("bottom-full mb-2");
  const tooltipRef = useRef<any>(null);

  useEffect(() => {
    if (hovered) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const isOverflowingRight = tooltipRect.right > window.innerWidth;
      const isOverflowingLeft = tooltipRect.left < 0;

      if (isOverflowingRight) {
        setTooltipPosition("bottom-full mb-2 right-0");
      } else if (isOverflowingLeft) {
        setTooltipPosition("bottom-full mb-2 left-0");
      } else {
        setTooltipPosition("bottom-full mb-2 left-1/2 -translate-x-1/2");
      }
    }
  }, [hovered]);

  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ width: "fit-content", height: "fit-content" }}
    >
      {props.children}
      {hovered && (
        <div
          ref={tooltipRef}
          className={`absolute ${tooltipPosition} px-2 py-1 text-sm  rounded shadow-lg whitespace-nowrap`}
          style={{ backgroundColor: "#82a5ff", color: "#10121a", borderRadius: "10px" }}
        >
          {props.text}
        </div>
      )}
    </div>
  );
};
