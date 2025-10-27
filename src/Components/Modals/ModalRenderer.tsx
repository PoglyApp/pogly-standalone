import React, { memo, useContext } from "react";
import { ModalContext } from "../../Contexts/ModalContext";

const ModalRenderer = React.memo(() => {
  const { modals } = useContext(ModalContext);
  return <div className="canvas-font">{modals.map((modal: any) => modal)}</div>;
});

export default memo(ModalRenderer);
