import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Atom } from "lucide-react";

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (user === null)
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Atom className="w-10 h-10 text-primary animate-spin" style={{ animationDuration: "2.4s" }} />
          <p className="text-muted-foreground text-sm font-mono-data">Booting PhysicsVerse…</p>
        </div>
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
