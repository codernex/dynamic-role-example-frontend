import useIsAuthenticated from "react-auth-kit/hooks/useIsAuthenticated";
import { Navigate, Outlet } from "react-router-dom";

export const ProtectedLayout: React.FC<{ fallback: string }> = ({
  fallback,
}) => {
  const isAuth = useIsAuthenticated();
  if (!isAuth()) {
    return <Navigate to={fallback} replace />;
  }
  return <Outlet />;
};
