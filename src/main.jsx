import React from "react";
import { createRoot } from "react-dom/client";
import GoldenHoofLogin from "./pages/Login";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoldenHoofLogin />
  </React.StrictMode>
);
