import React from "react";
import ReactDOM from "react-dom/client";

import "@fontsource/ibm-plex-sans-thai/300.css";
import "@fontsource/ibm-plex-sans-thai/400.css";
import "@fontsource/ibm-plex-sans-thai/500.css";
import "@fontsource/ibm-plex-sans-thai/600.css";
import "@fontsource/ibm-plex-sans-thai/700.css";

import App from "./App.tsx";
import AdminPage from "./pages/Adminpage.tsx";
import "./styles/globals.css";

document.documentElement.classList.add("dark");

const isAdmin = window.location.pathname === "/admin";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>{isAdmin ? <AdminPage /> : <App />}</React.StrictMode>,
);
