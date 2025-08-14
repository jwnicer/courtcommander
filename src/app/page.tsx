import { Header } from "@/components/layout/Header";
import SessionManager from "@/components/session/SessionManager";

export default function Home() {
  // Hardcoded IDs for this example, as specified in the proposal.
  // In a real application, these would be dynamic.
  const orgId = "org_abc";
  const venueId = "downtown_gym";
  const sessionId = "session_20250820";
  
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <SessionManager 
          orgId={orgId} 
          venueId={venueId} 
          sessionId={sessionId} 
        />
      </main>
    </div>
  );
}
