import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/authContext";
import "./App.css";

import LandingPage from "./pages/LandingPage";
import AuthController from "./pages/AuthController";
import Home from "./pages/Home";
import ProtectedRoute from "./routes/ProtectedRoute";

import VideoMeet from "./pages/VideoMeet";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthController />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<Home />} />
            <Route path="/meet/:code" element={<VideoMeet />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;