import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import Routers from "./component/Routers";
import { ThemeProvider } from "./component/ThemeContext";
import { ToastProvider } from "./component/ToastContext";
import "./assets/style/style.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <RouterProvider router={Routers} />
      </ToastProvider>
    </ThemeProvider>
  </StrictMode>
);