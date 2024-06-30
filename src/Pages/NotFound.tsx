import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/");

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};
