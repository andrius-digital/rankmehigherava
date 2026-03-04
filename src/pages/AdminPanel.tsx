import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import AgencyDashboard from "./AgencyDashboard";
import TeamPortal from "./TeamPortal";
import { getTeamSession } from "./TeamPortal";

const AdminPanel = () => {
  const { user, isLoading, isAdmin } = useAuth();
  const [teamSession, setTeamSession] = useState(getTeamSession());

  useEffect(() => {
    const check = () => setTeamSession(getTeamSession());
    check();
    window.addEventListener("storage", check);
    return () => window.removeEventListener("storage", check);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user && isAdmin) {
    return <AgencyDashboard />;
  }

  return <TeamPortal onLogin={() => setTeamSession(getTeamSession())} />;
};

export default AdminPanel;
