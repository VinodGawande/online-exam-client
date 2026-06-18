import { Navigate } from "react-router-dom";
import { getDefaultRouteForRole, getStoredRole, isUserLoggedIn } from "../utils/auth";

function AdminProtectedRoute({ children }) {
  const isLoggedIn = isUserLoggedIn();
  const role = getStoredRole();

  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (role !== "admin") return <Navigate to={getDefaultRouteForRole(role)} replace />;
  return children;
}

export default AdminProtectedRoute;
