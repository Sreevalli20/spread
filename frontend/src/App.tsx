import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppShell from "./components/AppShell";
import LandingPage from "./pages/LandingPage";
import UploadPage from "./pages/UploadPage";
import DashboardPage from "./pages/DashboardPage";
import ReportPage from "./pages/ReportPage";
import AskPage from "./pages/AskPage";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route 
          path="/analyze" 
          element={
            <AppShell showSidebar={true}>
              <UploadPage />
            </AppShell>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <AppShell showSidebar={true}>
              <DashboardPage />
            </AppShell>
          } 
        />
        <Route 
          path="/ask" 
          element={
            <AppShell showSidebar={true}>
              <AskPage />
            </AppShell>
          } 
        />
        <Route 
          path="/report" 
          element={
            <AppShell showSidebar={true}>
              <ReportPage />
            </AppShell>
          } 
        />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
