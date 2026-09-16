import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout.jsx";
import Landing from "./pages/Landing.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Equipment from "./pages/Equipment.jsx";
import Schedule from "./pages/Schedule.jsx";
import History from "./pages/History.jsx";
import Operators from "./pages/Operators.jsx";
import Overdue from "./pages/Overdue.jsx";
import Completed from "./pages/Completed.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/equipment" element={<Equipment />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/overdue" element={<Overdue />} />
        <Route path="/completed" element={<Completed />} />
        <Route path="/history" element={<History />} />
        <Route path="/operators" element={<Operators />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
