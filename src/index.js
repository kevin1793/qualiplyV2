import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

// You can set the basename here if you're deploying to /careers
ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter basename="/careers">
    <App />
  </BrowserRouter>
);