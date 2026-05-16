import { useState, useEffect } from 'react';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import CompetitionDetail from './components/dashboard/CompetitionDetail';
import { User, Competition } from './types/fortnite';
import { db } from './utils/db';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoginView, setIsLoginView] = useState(true);
  const [loading, setLoading] = useState(true);
  
  const [userCompetitions, setUserCompetitions] = useState<Competition[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);

  useEffect(() => {
    // Session check
    const savedUser = localStorage.getItem('fortnite_user_session');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      // Load competitions from DB for this user
      setUserCompetitions(db.competitions.getForUser(user.email));
    }
    setLoading(false);
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('fortnite_user_session', JSON.stringify(user));
    setUserCompetitions(db.competitions.getForUser(user.email));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('fortnite_user_session');
    setSelectedCompetition(null);
  };

  const handleAddCompetition = (comp: Competition) => {
    db.competitions.create(comp);
    setUserCompetitions(db.competitions.getForUser(currentUser?.email || ''));
  };

  const handleUpdateCompetitions = (newList: Competition[]) => {
    db.competitions.update(newList);
    setUserCompetitions(db.competitions.getForUser(currentUser?.email || ''));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#00df82] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!currentUser) {
    return isLoginView ? (
      <Login onLoginSuccess={handleLogin} onToggleAuth={() => setIsLoginView(false)} />
    ) : (
      <Register onRegisterSuccess={handleLogin} onToggleAuth={() => setIsLoginView(true)} />
    );
  }

  if (selectedCompetition) {
    return (
      <CompetitionDetail 
        competition={selectedCompetition} 
        onBack={() => setSelectedCompetition(null)} 
      />
    );
  }

  return (
    <Dashboard 
      user={currentUser} 
      onLogout={handleLogout} 
      competitions={userCompetitions}
      onAddCompetition={handleAddCompetition}
      onUpdateCompetitions={handleUpdateCompetitions}
      onSelectCompetition={setSelectedCompetition}
    />
  );
}
