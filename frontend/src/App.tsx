import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ThreatTicker } from './components/common/ThreatTicker';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { FloatingAiAssistant } from './components/common/FloatingAiAssistant';
import { LandingPage } from './pages/LandingPage';
import { UrlScannerPage } from './pages/UrlScannerPage';
import { MessageAnalyzerPage } from './pages/MessageAnalyzerPage';
import { WebsiteAnalyzerPage } from './pages/WebsiteAnalyzerPage';
import { ThreatIntelPage } from './pages/ThreatIntelPage';
import { RakshaAiPage } from './pages/RakshaAiPage';
import { AwarenessPage } from './pages/AwarenessPage';
import { DashboardPage } from './pages/DashboardPage';
import { ScanHistoryPage } from './pages/ScanHistoryPage';
import { AdminPage } from './pages/AdminPage';
import { ApiAccessPage } from './pages/ApiAccessPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ScanReportDetailPage } from './pages/ScanReportDetailPage';
import type { ScanResponse } from './types';

const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [selectedScanId, setSelectedScanId] = useState<string | null>(null);

  const handleViewReport = (report: ScanResponse) => {
    setSelectedScanId(report.scan_id);
  };

  const handleSelectScanFromAnywhere = (scanId: string) => {
    setSelectedScanId(scanId);
    setActiveTab('report-detail');
  };

  const handleAskAIWithScan = (_scanId: string) => {
    setActiveTab('raksha-ai');
  };

  return (
    <div className="min-h-screen flex flex-col bg-cyber-bg dark:bg-cyber-bg bg-slate-50 text-slate-100 dark:text-slate-100 text-slate-900 font-sans selection:bg-cyan-500 selection:text-slate-950 transition-colors duration-200">
      {/* Top Real-time Security Ticker */}
      <ThreatTicker />

      {/* Main Glassmorphic Navigation Bar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Body */}
      <main className="flex-1">
        {activeTab === 'landing' && (
          <LandingPage
            setActiveTab={setActiveTab}
            onViewReport={handleViewReport}
          />
        )}
        {activeTab === 'url-scanner' && (
          <UrlScannerPage onAskAI={handleAskAIWithScan} />
        )}
        {activeTab === 'message-scanner' && (
          <MessageAnalyzerPage onAskAI={handleAskAIWithScan} />
        )}
        {activeTab === 'website-scanner' && <WebsiteAnalyzerPage />}
        {activeTab === 'threat-intel' && <ThreatIntelPage />}
        {activeTab === 'raksha-ai' && <RakshaAiPage />}
        {activeTab === 'awareness' && <AwarenessPage />}
        {activeTab === 'dashboard' && (
          <DashboardPage onSelectScan={handleSelectScanFromAnywhere} />
        )}
        {activeTab === 'api-access' && <ApiAccessPage />}
        {activeTab === 'history' && (
          <ScanHistoryPage onSelectScan={handleSelectScanFromAnywhere} />
        )}
        {activeTab === 'admin' && <AdminPage />}
        {activeTab === 'login' && (
          <LoginPage
            onSuccess={() => setActiveTab('dashboard')}
            onSwitchToRegister={() => setActiveTab('register')}
          />
        )}
        {activeTab === 'register' && (
          <RegisterPage
            onSuccess={() => setActiveTab('dashboard')}
            onSwitchToLogin={() => setActiveTab('login')}
          />
        )}
        {activeTab === 'report-detail' && selectedScanId && (
          <ScanReportDetailPage
            scanId={selectedScanId}
            onBack={() => setActiveTab('dashboard')}
            onAskAI={handleAskAIWithScan}
          />
        )}
      </main>

      {/* Persistent Floating AI Threat Assistant & Emergency Playbook */}
      <FloatingAiAssistant onOpenFullPage={() => setActiveTab('raksha-ai')} />

      {/* Footer */}
      <Footer setActiveTab={setActiveTab} />
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
