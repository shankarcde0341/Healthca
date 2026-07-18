import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Landing from "@/pages/Landing";
import AuthPage from "@/pages/auth/AuthPage";
import PatientDashboard from "@/pages/PatientDashboard";
import ReceptionistDashboard from "@/pages/ReceptionistDashboard";
import DoctorDashboard from "@/pages/DoctorDashboard";

const ROLES = ["patient", "receptionist", "doctor"];

function AuthPageRoute({ mode }) {
  const { role } = useParams();
  if (!ROLES.includes(role)) return <Navigate to={`/${mode}/patient`} replace />;
  return <AuthPage role={role} mode={mode} />;
}

function App() {
  return (
    <div className="App" data-testid="app-root">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />

            <Route path="/login/:role" element={<AuthPageRoute mode="login" />} />
            <Route path="/register/:role" element={<AuthPageRoute mode="register" />} />
            <Route path="/login" element={<Navigate to="/login/patient" replace />} />
            <Route path="/register" element={<Navigate to="/register/patient" replace />} />

            <Route
              path="/patient/dashboard"
              element={
                <ProtectedRoute role="patient">
                  <PatientDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/receptionist/dashboard"
              element={
                <ProtectedRoute role="receptionist">
                  <ReceptionistDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/dashboard"
              element={
                <ProtectedRoute role="doctor">
                  <DoctorDashboard />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}

export default App;
