import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppShell } from './components/layout/AppShell';
import { FloatingAiAssistant } from './components/common/FloatingAiAssistant';
import { LandingPage } from './pages/LandingPage';
import { InvestigationCenterPage } from './pages/InvestigationCenterPage';
import { MonitoringPage } from './pages/MonitoringPage';
import { SecurityPassportPage } from './pages/SecurityPassportPage';
import { SecurityPosturePage } from './pages/SecurityPosturePage';
import { DeveloperPlaygroundPage } from './pages/DeveloperPlaygroundPage';
import { TrustCenterPage } from './pages/TrustCenterPage';
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
import { DarkWebMonitorPage } from './pages/DarkWebMonitorPage';
import { DeceptionPage } from './pages/DeceptionPage';
import { OsintReconPage } from './pages/OsintReconPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ScanReportDetailPage } from './pages/ScanReportDetailPage';
import { LegalPages } from './pages/LegalPages';
import { DigitalSecurityMap } from './components/visualization/DigitalSecurityMap';
import { EmergencyDefenseCenterPage } from './pages/EmergencyDefenseCenterPage';
import { EvidenceVaultPage } from './pages/EvidenceVaultPage';
import { ReportsCenterPage } from './pages/ReportsCenterPage';
import type { ScanResponse } from './types';

const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [selectedScanId, setSelectedScanId] = useState<string | null>(null);

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
        {activeTab === 'investigation-center' && (
          <InvestigationCenterPage onNavigateTab={setActiveTab} />
        )}
        {activeTab === 'security-map' && <DigitalSecurityMap />}
        {activeTab === 'emergency-mode' && <EmergencyDefenseCenterPage />}
        {activeTab === 'evidence-vault' && <EvidenceVaultPage />}
        {activeTab === 'reports-center' && <ReportsCenterPage />}
        {activeTab === 'monitoring' && <MonitoringPage />}
        {(activeTab === 'security-posture' || activeTab === 'security-radar') && (
          <SecurityPosturePage onNavigateTab={setActiveTab} />
        )}
        {activeTab === 'security-passport' && <SecurityPassportPage />}
        {activeTab === 'developer-playground' && <DeveloperPlaygroundPage />}
        {activeTab === 'trust-center' && <TrustCenterPage />}
        {activeTab === 'osint' && <OsintReconPage />}
        {activeTab === 'url-scanner' && (
          <UrlScannerPage onAskAI={handleAskAIWithScan} />
        )}
        {activeTab === 'message-scanner' && (
          <MessageAnalyzerPage onAskAI={handleAskAIWithScan} />
        )}
        {activeTab === 'website-scanner' && <WebsiteAnalyzerPage />}
        {activeTab === 'darkweb' && <DarkWebMonitorPage />}
        {activeTab === 'deception' && <DeceptionPage />}
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
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
