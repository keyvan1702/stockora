import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import Routers from "./component/Routers";
import { ThemeProvider } from "./component/ThemeContext";
import "./assets/style/style.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <RouterProvider router={Routers} />
    </ThemeProvider>
  </StrictMode>
);