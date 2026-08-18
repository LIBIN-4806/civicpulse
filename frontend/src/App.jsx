import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CitizenDashboard from './pages/CitizenDashboard';
import AdminDashboard from './pages/AdminDashboard';
import RiskMapPage from './pages/RiskMapPage';
import AlertsPage from './pages/AlertsPage';
import ReportIncidentPage from './pages/ReportIncidentPage';
import SheltersPage from './pages/SheltersPage';
import MLAnalyticsPage from './pages/MLAnalyticsPage';
import DisasterHistoryPage from './pages/DisasterHistoryPage';
import SettingsPage from './pages/SettingsPage';

function AppContent() {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('landing');
  const [selectedLocationForMap, setSelectedLocationForMap] = useState(null);

  const handleSelectLocationForMap = (loc) => {
    setSelectedLocationForMap(loc);
    setActiveTab('map');
  };

  const renderActivePage = () => {
    switch (activeTab) {
      case 'landing':
        return (
          <LandingPage
            onNavigate={(tab) => setActiveTab(tab)}
            onSelectLocation={handleSelectLocationForMap}
          />
        );
      case 'login':
        return <LoginPage onNavigate={(tab) => setActiveTab(tab)} />;
      case 'register':
        return <RegisterPage onNavigate={(tab) => setActiveTab(tab)} />;
      case 'dashboard':
        return isAdmin ? (
          <AdminDashboard onNavigate={(tab) => setActiveTab(tab)} />
        ) : (
          <CitizenDashboard onNavigate={(tab) => setActiveTab(tab)} />
        );
      case 'map':
        return <RiskMapPage />;
      case 'alerts':
        return <AlertsPage />;
      case 'report':
        return <ReportIncidentPage onNavigate={(tab) => setActiveTab(tab)} />;
      case 'shelters':
        return <SheltersPage />;
      case 'analytics':
        return <MLAnalyticsPage />;
      case 'history':
        return <DisasterHistoryPage />;
      case 'settings':
        return <SettingsPage onNavigate={(tab) => setActiveTab(tab)} />;
      default:
        return <LandingPage onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex flex-col justify-between selection:bg-sky-500 selection:text-white">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 pb-12">
        {renderActivePage()}
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
