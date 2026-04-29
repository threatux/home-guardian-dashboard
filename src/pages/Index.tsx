import { Navigate } from "react-router-dom";

const Index = () => {
  const token = localStorage.getItem("token");
  return <Navigate to={token ? "/dashboard" : "/login"} replace />;
};

export default Index;
