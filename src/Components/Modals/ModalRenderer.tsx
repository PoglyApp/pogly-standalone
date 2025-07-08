import React, { memo, useContext } from "react";
import { ModalContext } from "../../Contexts/ModalContext";

const ModalRenderer = React.memo(() => {
  const { modals } = useContext(ModalContext);
  return <>{modals.map((modal: any) => modal)}</>;
});

export default memo(ModalRenderer);
