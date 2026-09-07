import { useState } from "react";
import Header from "./components/Header.jsx";
import Disclaimer from "./components/Disclaimer.jsx";
import Footer from "./components/Footer.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import TriagePage from "./pages/TriagePage.jsx";
import DirectoryPage from "./pages/DirectoryPage.jsx";
import { loadActiveProfile } from "./lib/storage.js";

export default function App() {
  const [profile, setProfile] = useState(() => loadActiveProfile());
  const [page, setPage] = useState(() => (loadActiveProfile() ? "triage" : "profile"));

  // Called whenever the active profile changes — switched, created, saved, or deleted.
  // `opts.saved` marks an explicit "Save Changes", which also advances to triage.
  function handleProfileChange(nextProfile, opts = {}) {
    setProfile(nextProfile);
    if (opts.saved && nextProfile) setPage("triage");
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <Header page={page} onNavigate={setPage} />
      <Disclaimer />

      <main className="max-w-4xl mx-auto w-full px-4">
        {page === "profile" && <ProfilePage profile={profile} onProfileChange={handleProfileChange} />}
        {page === "triage" && <TriagePage profile={profile} />}
        {page === "directory" && <DirectoryPage />}
      </main>

      <Footer />
    </div>
  );
}
