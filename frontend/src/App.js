import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import Landing from "@/pages/Landing";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import PhysicsUniverse from "@/pages/PhysicsUniverse";
import TopicView from "@/pages/TopicView";
import SimulationView from "@/pages/SimulationView";
import VirtualLab from "@/pages/VirtualLab";
import GraphStudio from "@/pages/GraphStudio";
import AITutor from "@/pages/AITutor";
import Practice from "@/pages/Practice";
import Notes from "@/pages/Notes";
import Analytics from "@/pages/Analytics";
import TeacherStudio from "@/pages/TeacherStudio";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Auth mode="login" />} />
            <Route path="/register" element={<Auth mode="register" />} />
            <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="universe" element={<PhysicsUniverse />} />
              <Route path="topic/:topicId" element={<TopicView />} />
              <Route path="sim/:simId" element={<SimulationView />} />
              <Route path="lab" element={<VirtualLab />} />
              <Route path="graphs" element={<GraphStudio />} />
              <Route path="tutor" element={<AITutor />} />
              <Route path="practice" element={<Practice />} />
              <Route path="notes" element={<Notes />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="teacher" element={<TeacherStudio />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </div>
  );
}

export default App;
