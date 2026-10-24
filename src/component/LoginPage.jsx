import React from "react";
import { useNavigate } from "react-router-dom";
import Login from "./Login";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();

  const handleSuccess = async (user) => {
    await login({ username: user?.name });
    toast.success(`خوش آمدید ${user?.name || ""}!`);
    navigate("/", { replace: true });
  };

  return <Login onSuccess={handleSuccess} />;
};

export default LoginPage;