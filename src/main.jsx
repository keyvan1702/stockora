import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import Routers from "./component/Routers";
import { ThemeProvider } from "./component/ThemeContext";
import { ToastProvider } from "./component/ToastContext";
import { AuthProvider } from "./component/AuthContext";
import "./assets/style/style.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <RouterProvider router={Routers} />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  </StrictMode>
);