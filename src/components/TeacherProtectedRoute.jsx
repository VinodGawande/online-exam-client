import { Navigate } from "react-router-dom";
import { getDefaultRouteForRole, getStoredRole, isUserLoggedIn } from "../utils/auth";

function TeacherProtectedRoute({ children }) {
  const isLoggedIn = isUserLoggedIn();
  const role = getStoredRole();

  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (role !== "teacher") return <Navigate to={getDefaultRouteForRole(role)} replace />;
  return children;
}

export default TeacherProtectedRoute;
