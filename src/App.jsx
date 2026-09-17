import AppLayout from "./layouts/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";
import DocumentPage from "./pages/DocumentPage";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import RegisterPage from "./pages/RegisterPage";
import ContributorsPage from "./pages/ContributorsPage";
import NotificationsPage from "./pages/NotificationsPage";
import SettingPage from "./pages/SettingPage";
import CollaborationTestPage from "./pages/CollaborationTestPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/app" replace />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<AppLayout title="My workspace" />}>
          <Route index element={<DashboardPage />} />
          <Route path="documents/:documentId" element={<DocumentPage />} />
          <Route path="contributors" element={<ContributorsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="settings" element={<SettingPage />} />
          <Route
            path="collaboration-test"
            element={<CollaborationTestPage />}
          />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  );

}

export default App;