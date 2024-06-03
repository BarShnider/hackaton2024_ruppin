import { useState } from "react";
import FormScreen from "./Components/FormScreen";
import RoutesScreen from "./Components/RoutesScreen";
import { Routes, Route, Navigate, HashRouter } from "react-router-dom";
import { AppProvider, useData } from "../contexts/AppContext";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <HashRouter>
        <AppProvider>
        <Toaster/>
          <Routes>
            <Route index element={<Navigate replace to="form" />} />
            <Route path="form" element={<FormScreen />} />
            <Route path="routes" element={<RoutesScreen />} />
          </Routes>
        </AppProvider>
      </HashRouter>
    </>
  );
}

export default App;
