import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import Routers from "./Router/Router";
import "./assets/style/style.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={Routers} />
  </StrictMode>
);