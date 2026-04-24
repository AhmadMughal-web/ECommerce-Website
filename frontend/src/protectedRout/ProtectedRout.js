import { Navigate } from "react-router-dom";

const ProtectedRout = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRout;
