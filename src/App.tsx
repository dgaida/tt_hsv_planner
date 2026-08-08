import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import PasswordGate from './components/PasswordGate';
import AuthScreen from './components/AuthScreen';
import TeamTabView from './components/TeamTabView';
import TeamMatrixView from './components/TeamMatrixView';
import GesamtUebersichtView from './components/GesamtUebersichtView';
import AdminDashboard from './components/AdminDashboard';
import { Shield, LogOut, User as UserIcon, Calendar, Grid, Award, Eye } from 'lucide-react';

export default function App() {
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);

  // Tab-state
  // 'team-{teamId}' or 'gesamt' or 'admin'
  const [activeTab, setActiveTab] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Load user profile and active teams
  const loadProfileAndTeams = async (user: any) => {
    try {
      if (user) {
        // Fetch profile
        const { data: prof, error: profErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profErr) {
          console.error('Error loading profile:', profErr);
        } else {
          setProfile(prof);
        }
      }

      // Fetch active teams
      const { data: teamsData, error: teamsErr } = await supabase
        .from('teams')
        .select('*')
        .eq('active', true)
        .order('name');

      if (teamsErr) {
        console.error('Error loading teams:', teamsErr);
      } else {
        const activeTeams = teamsData || [];
        setTeams(activeTeams);

        // Default to first team if active tab is empty
        if (activeTeams.length > 0) {
          setActiveTab(`team-${activeTeams[0].id}`);
        } else {
          setActiveTab('gesamt');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if password has already been verified previously
    const verified = localStorage.getItem('club_password');
    if (verified) {
      setIsPasswordVerified(true);
    }

    // Auth subscription listener
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadProfileAndTeams(session.user);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        loadProfileAndTeams(session.user);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isPasswordVerified]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const clearClubPassword = () => {
    localStorage.removeItem('club_password');
    setIsPasswordVerified(false);
  };

  if (!isPasswordVerified) {
    return <PasswordGate onVerified={() => setIsPasswordVerified(true)} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-600 mx-auto"></div>
          <p className="text-sm font-semibold text-gray-500">Lade Spieldaten...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <AuthScreen onSessionChange={() => {}} />;
  }

  const isClubAdmin = profile?.role === 'club_admin';
  const isManagerOrAdmin = profile?.role === 'team_manager' || isClubAdmin;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 1. Header Bar */}
      <header className="bg-white border-b border-gray-150 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏓</span>
            <div>
              <h1 className="text-base sm:text-lg font-black text-gray-800 tracking-tight">TTV Spielplaner</h1>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Spielbereitschaft</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-gray-700">{profile?.name || session.user.email}</span>
              <span className="text-[9px] font-extrabold text-teal-700 uppercase tracking-widest">{profile?.role || 'Spieler'}</span>
            </div>

            <div className="h-8 w-8 bg-teal-50 border border-teal-200 text-teal-700 rounded-full flex items-center justify-center font-bold text-sm" title={profile?.name}>
              {profile?.name?.substring(0, 2).toUpperCase() || 'P'}
            </div>

            <button
              onClick={handleLogout}
              className="p-2 bg-gray-100 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-colors text-gray-600"
              title="Abmelden"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Horizontal Scrollable Navigation Tabs (Mobile-friendly, Requirement 9, 18) */}
      <nav className="bg-white border-b border-gray-100 sticky top-[57px] z-40 overflow-x-auto no-scrollbar shadow-sm">
        <div className="max-w-6xl mx-auto px-4 flex gap-1.5 py-2.5">
          {teams.map((team) => (
            <button
              key={team.id}
              onClick={() => setActiveTab(`team-${team.id}`)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all border shrink-0 ${
                activeTab === `team-${team.id}`
                  ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-150'
              }`}
            >
              🏅 {team.name}
            </button>
          ))}

          <button
            onClick={() => setActiveTab('gesamt')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all border shrink-0 ${
              activeTab === 'gesamt'
                ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                : 'bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-150'
            }`}
          >
            🗓️ Gesamtübersicht
          </button>

          {isClubAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all border shrink-0 ${
                activeTab === 'admin'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
              }`}
            >
              🛡️ Admin
            </button>
          )}
        </div>
      </nav>

      {/* 3. Main tab content area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 pb-24">
        {activeTab.startsWith('team-') && (
          <div className="space-y-8">
            {/* Team Matches Feed */}
            <TeamTabView
              teamId={activeTab.replace('team-', '')}
              userId={session.user.id}
              userRole={profile?.role}
              isClubAdmin={isClubAdmin}
            />

            {/* Matrix View (Manager / Admin View, Requirement 12) */}
            <TeamMatrixView
              teamId={activeTab.replace('team-', '')}
              isManagerOrAdmin={isManagerOrAdmin}
            />
          </div>
        )}

        {activeTab === 'gesamt' && <GesamtUebersichtView />}

        {activeTab === 'admin' && isClubAdmin && <AdminDashboard />}
      </main>

      {/* 4. Footer */}
      <footer className="bg-white border-t border-gray-150 py-4 text-center text-xs text-gray-400 mt-auto">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} TTV Spielbereitschafts-Planer</p>
          <div className="flex gap-4">
            <button onClick={clearClubPassword} className="hover:text-rose-600 font-semibold underline">
              Sicherheit: Passwort-Gate zurücksetzen
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
