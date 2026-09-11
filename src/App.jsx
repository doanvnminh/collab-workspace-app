import AppLayout from "./layouts/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";
import DocumentPage from "./pages/DocumentPage";
import LoginPage from "./pages/LoginPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/app" replace />} />

      <Route path="/login" element={<LoginPage />} />

      <Route path="/app" element={<AppLayout title="My workspace" />}>
        <Route index element={<DashboardPage />} />
        <Route path="documents/:documentId" element={<DocumentPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  );

}

export default App;