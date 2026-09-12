import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppShell } from './components/layout/AppShell';
import { FloatingAiAssistant } from './components/common/FloatingAiAssistant';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LandingPage } from './pages/LandingPage';
import { InvestigationCenterPage } from './pages/InvestigationCenterPage';
import { MonitoringPage } from './pages/MonitoringPage';
import { SecurityPosturePage } from './pages/SecurityPosturePage';
import { MessageAnalyzerPage } from './pages/MessageAnalyzerPage';
import { ThreatIntelPage } from './pages/ThreatIntelPage';
import { RakshaAiPage } from './pages/RakshaAiPage';
import { AwarenessPage } from './pages/AwarenessPage';
import { DashboardPage } from './pages/DashboardPage';
import { ScanHistoryPage } from './pages/ScanHistoryPage';
import { AdminPage } from './pages/AdminPage';
import { ApiAccessPage } from './pages/ApiAccessPage';
import { DarkWebMonitorPage } from './pages/DarkWebMonitorPage';
import { DeceptionPage } from './pages/DeceptionPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ScanReportDetailPage } from './pages/ScanReportDetailPage';
import { LegalPages } from './pages/LegalPages';
import { EmergencyDefenseCenterPage } from './pages/EmergencyDefenseCenterPage';
import { ReportsCenterPage } from './pages/ReportsCenterPage';
import { AttackSurfacePage } from './pages/AttackSurfacePage';
import { SecurityAssetGraphPage } from './pages/SecurityAssetGraphPage';
import { VulnerabilityIntelligencePage } from './pages/VulnerabilityIntelligencePage';
import { AlertsCenterPage } from './pages/AlertsCenterPage';
import { IncidentsCenterPage } from './pages/IncidentsCenterPage';
import { OrganizationPage } from './pages/OrganizationPage';
import { CyberNewsPage } from './pages/CyberNewsPage';
import type { ScanResponse } from './types';

const MainApp: React.FC = () => {
  const [activeTab, setActiveTabState] = useState<string>(() => {
    const hash = window.location.hash.replace(/^#\/?/, '');
    return hash || 'landing';
  });
  const [selectedScanId, setSelectedScanId] = useState<string | null>(null);

  const setActiveTab = useCallback((tab: string) => {
    setActiveTabState(tab);
    if (window.location.hash.replace(/^#\/?/, '') !== tab) {
      window.location.hash = tab;
    }
  }, []);

  // Listen for browser back/forward buttons
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (hash && hash !== activeTab) {
        setActiveTabState(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [activeTab]);

  const handleViewReport = (report: ScanResponse) => {
    setSelectedScanId(report.scan_id);
    setActiveTab('report-detail');
  };

  const handleSelectScanFromAnywhere = (scanId: string) => {
    setSelectedScanId(scanId);
    setActiveTab('report-detail');
  };

  const handleAskAIWithScan = (_scanId: string) => {
    setActiveTab('raksha-ai');
  };

  const isLegalTab = ['privacy', 'terms', 'refund', 'security', 'contact'].includes(activeTab);

  return (
    <AppShell activeTab={activeTab} setActiveTab={setActiveTab}>
      <main className="w-full">
        {activeTab === 'landing' && (
          <LandingPage
            setActiveTab={setActiveTab}
            onViewReport={handleViewReport}
          />
        )}
        {activeTab === 'attack-surface' && <AttackSurfacePage />}
        {activeTab === 'security-graph' && <SecurityAssetGraphPage />}
        {activeTab === 'vulnerabilities' && <VulnerabilityIntelligencePage />}
        {activeTab === 'alerts' && <AlertsCenterPage />}
        {activeTab === 'incidents' && <IncidentsCenterPage />}
        {activeTab === 'organization' && <OrganizationPage />}
        {(activeTab === 'investigation-center' || activeTab === 'url-scanner' || activeTab === 'website-scanner' || activeTab === 'osint') && (
          <InvestigationCenterPage onNavigateTab={setActiveTab} />
        )}
        {activeTab === 'security-map' && <SecurityAssetGraphPage />}
        {activeTab === 'emergency-mode' && <EmergencyDefenseCenterPage />}
        {activeTab === 'evidence-vault' && <ReportsCenterPage />}
        {activeTab === 'reports-center' && <ReportsCenterPage />}
        {activeTab === 'monitoring' && <MonitoringPage />}
        {(activeTab === 'security-posture' || activeTab === 'security-radar' || activeTab === 'security-passport' || activeTab === 'trust-center') && (
          <SecurityPosturePage onNavigateTab={setActiveTab} />
        )}
        {activeTab === 'developer-playground' && <ApiAccessPage />}
        {activeTab === 'message-scanner' && (
          <MessageAnalyzerPage onAskAI={handleAskAIWithScan} />
        )}
        {activeTab === 'darkweb' && <DarkWebMonitorPage />}
        {activeTab === 'deception' && <DeceptionPage />}
        {activeTab === 'cyber-news' && (
          <CyberNewsPage onInvestigateThreat={() => setActiveTab('investigation-center')} />
        )}
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
            onSuccess={() => setActiveTab('investigation-center')}
            onSwitchToRegister={() => setActiveTab('register')}
          />
        )}
        {activeTab === 'register' && (
          <RegisterPage
            onSuccess={() => setActiveTab('investigation-center')}
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
        {isLegalTab && (
          <LegalPages
            policyType={activeTab as any}
            onBack={() => setActiveTab('landing')}
          />
        )}
      </main>

      {/* Floating AI Security Copilot Button */}
      <FloatingAiAssistant onOpenFullPage={() => setActiveTab('raksha-ai')} />
    </AppShell>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ErrorBoundary>
          <MainApp />
        </ErrorBoundary>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
