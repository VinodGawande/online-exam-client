import { Navigate } from "react-router-dom";
import { getDefaultRouteForRole, getStoredRole, isUserLoggedIn } from "../utils/auth";

function ProtectedRoute({ children }) {
  const isLoggedIn = isUserLoggedIn();
  const role = getStoredRole();

  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (role !== "student") return <Navigate to={getDefaultRouteForRole(role)} replace />;
  return children;
}

export default ProtectedRoute;
