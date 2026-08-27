import type {
  ScanResponse,
  MessageScanResponse,
  WebsiteScanResponse,
  ThreatFeedItem,
  IncidentPlaybook,
  AwarenessArticle,
  QuizQuestion,
  DashboardStats,
  User,
  Plan,
  APIKey,
  APIUsageSummary,
  IncidentDossier,
  ProviderStatus,
  InvestigationResponse,
  MonitoredTarget,
  MonitoringAlert,
  SecurityScorecard,
  SecurityPassport,
  ThreatIntelHealth,
  WebhookEndpoint,
  WebhookDelivery
} from '../types';

const API_BASE = '/api/v1';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('raksha_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: res.statusText }));
    const message = typeof errorData.detail === 'string' 
      ? errorData.detail 
      : errorData.detail?.message || errorData.message || 'API request failed';
    const err = new Error(message) as any;
    err.status = res.status;
    err.detail = errorData.detail;
    throw err;
  }
  return res.json();
}

export const api = {
  // Auth
  login: async (email: string, password: string): Promise<{ access_token: string; user: User }> => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return handleResponse<{ access_token: string; user: User }>(res);
  },

  register: async (email: string, password: string, full_name?: string): Promise<{ access_token: string; user: User }> => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name })
    });
    return handleResponse<{ access_token: string; user: User }>(res);
  },

  getMe: async (): Promise<User> => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeader()
    });
    return handleResponse<User>(res);
  },

  getQuotaStatus: async (): Promise<any> => {
    const res = await fetch(`${API_BASE}/auth/quota/status`, {
      headers: getAuthHeader()
    });
    return handleResponse<any>(res);
  },

  // Flagship: Threat Investigation Center
  createInvestigation: async (target: string): Promise<InvestigationResponse> => {
    const res = await fetch(`${API_BASE}/investigations/create`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ target })
    });
    return handleResponse<InvestigationResponse>(res);
  },

  getInvestigation: async (investigationId: string): Promise<InvestigationResponse> => {
    const res = await fetch(`${API_BASE}/investigations/${investigationId}`, {
      headers: getAuthHeader()
    });
    return handleResponse<InvestigationResponse>(res);
  },

  exportDossierJsonUrl: (investigationId: string): string => {
    return `${API_BASE}/investigations/${investigationId}/dossier/json`;
  },

  submitInvestigationFeedback: async (investigationId: string, rating: string, comments?: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/investigations/${investigationId}/feedback`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ rating, comments })
    });
    return handleResponse<any>(res);
  },

  listRecentInvestigations: async (skip: number = 0, limit: number = 20, risk_level?: string): Promise<{ total: number; investigations: any[] }> => {
    const params = new URLSearchParams({ skip: skip.toString(), limit: limit.toString() });
    if (risk_level) params.append('risk_level', risk_level);
    const res = await fetch(`${API_BASE}/investigations?${params.toString()}`, {
      headers: getAuthHeader()
    });
    return handleResponse<{ total: number; investigations: any[] }>(res);
  },

  // Continuous Threat Monitoring
  getMonitoredTargets: async (): Promise<MonitoredTarget[]> => {
    const res = await fetch(`${API_BASE}/monitoring/targets`, {
      headers: getAuthHeader()
    });
    return handleResponse<MonitoredTarget[]>(res);
  },

  addMonitoredTarget: async (target: string, target_type: string = 'domain', check_frequency_hours: number = 24): Promise<MonitoredTarget> => {
    const res = await fetch(`${API_BASE}/monitoring/targets`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ target, target_type, check_frequency_hours })
    });
    return handleResponse<MonitoredTarget>(res);
  },

  checkTargetNow: async (targetId: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/monitoring/targets/${targetId}/check-now`, {
      method: 'POST',
      headers: getAuthHeader()
    });
    return handleResponse<any>(res);
  },

  getMonitoringAlerts: async (): Promise<MonitoringAlert[]> => {
    const res = await fetch(`${API_BASE}/monitoring/alerts`, {
      headers: getAuthHeader()
    });
    return handleResponse<MonitoringAlert[]>(res);
  },

  deleteMonitoredTarget: async (targetId: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/monitoring/targets/${targetId}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    return handleResponse<any>(res);
  },

  // Security Posture & Passport
  getSecurityScore: async (): Promise<SecurityScorecard> => {
    const res = await fetch(`${API_BASE}/security/score`, {
      headers: getAuthHeader()
    });
    return handleResponse<SecurityScorecard>(res);
  },

  getSecurityPassport: async (): Promise<SecurityPassport> => {
    const res = await fetch(`${API_BASE}/security/passport`, {
      headers: getAuthHeader()
    });
    return handleResponse<SecurityPassport>(res);
  },

  getNistPosture: async (): Promise<any> => {
    const res = await fetch(`${API_BASE}/security/nist-posture`);
    return handleResponse<any>(res);
  },

  getOwaspWstg: async (): Promise<any> => {
    const res = await fetch(`${API_BASE}/security/owasp-wstg`);
    return handleResponse<any>(res);
  },

  authorizeScan: async (target: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/security/authorize-scan`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ target, confirmed_ownership: true })
    });
    return handleResponse<any>(res);
  },

  // Intelligence Health
  getThreatIntelHealth: async (): Promise<ThreatIntelHealth> => {
    const res = await fetch(`${API_BASE}/threat-intelligence/health`);
    return handleResponse<ThreatIntelHealth>(res);
  },

  // Developer Webhooks
  listWebhookEndpoints: async (): Promise<WebhookEndpoint[]> => {
    const res = await fetch(`${API_BASE}/webhooks/endpoints`, {
      headers: getAuthHeader()
    });
    return handleResponse<WebhookEndpoint[]>(res);
  },

  createWebhookEndpoint: async (url: string, events?: string[]): Promise<WebhookEndpoint> => {
    const res = await fetch(`${API_BASE}/webhooks/endpoints`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ url, events: events || ["investigation.completed", "threat.detected"] })
    });
    return handleResponse<WebhookEndpoint>(res);
  },

  testWebhookPing: async (endpointId: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/webhooks/endpoints/${endpointId}/test`, {
      method: 'POST',
      headers: getAuthHeader()
    });
    return handleResponse<any>(res);
  },

  listWebhookDeliveries: async (): Promise<WebhookDelivery[]> => {
    const res = await fetch(`${API_BASE}/webhooks/deliveries`, {
      headers: getAuthHeader()
    });
    return handleResponse<WebhookDelivery[]>(res);
  },

  // Scanners
  scanUrl: async (url: string): Promise<ScanResponse> => {
    const res = await fetch(`${API_BASE}/scans/url`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ url })
    });
    return handleResponse<ScanResponse>(res);
  },

  scanMessage: async (text: string, channel: string = 'SMS', sender?: string): Promise<MessageScanResponse> => {
    const res = await fetch(`${API_BASE}/scans/message`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ text, channel, sender })
    });
    return handleResponse<MessageScanResponse>(res);
  },

  scanWebsite: async (url: string): Promise<WebsiteScanResponse> => {
    const res = await fetch(`${API_BASE}/scans/website`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ url })
    });
    return handleResponse<WebsiteScanResponse>(res);
  },

  getScanById: async (scanId: string): Promise<ScanResponse> => {
    const res = await fetch(`${API_BASE}/scans/${scanId}`, {
      headers: getAuthHeader()
    });
    return handleResponse<ScanResponse>(res);
  },

  getScanHistory: async (arg1?: any, arg2?: any): Promise<any[]> => {
    let skip = 0;
    let limit = 50;
    if (typeof arg1 === 'number') {
      skip = arg1;
      if (typeof arg2 === 'number') limit = arg2;
    }
    const res = await fetch(`${API_BASE}/scans?skip=${skip}&limit=${limit}`, {
      headers: getAuthHeader()
    });
    return handleResponse<any[]>(res);
  },

  deleteScan: async (scanId: string): Promise<any> => {
    return { success: true, scanId };
  },

  // OSINT Reconnaissance
  osintScanUsername: async (username: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/osint/username`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ username })
    });
    return handleResponse<any>(res);
  },

  osintScanDomain: async (domain: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/osint/domain`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ domain })
    });
    return handleResponse<any>(res);
  },

  osintScanEmail: async (email: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/osint/email`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ email })
    });
    return handleResponse<any>(res);
  },

  osintScanPhone: async (phone: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/osint/full-recon`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ target: phone, target_type: 'phone' })
    });
    return handleResponse<any>(res);
  },

  osintFullRecon: async (target: string, target_type: string = 'auto'): Promise<any> => {
    const res = await fetch(`${API_BASE}/osint/full-recon`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ target, target_type })
    });
    return handleResponse<any>(res);
  },

  // Dark Web & Breach Intelligence
  checkDarkWebExposure: async (queryOrObj: string | { query: string; query_type?: string }, query_type?: string): Promise<any> => {
    let q = '';
    let qt = 'auto';
    if (typeof queryOrObj === 'object') {
      q = queryOrObj.query;
      qt = queryOrObj.query_type || 'auto';
    } else {
      q = queryOrObj;
      qt = query_type || 'auto';
    }

    const res = await fetch(`${API_BASE}/darkweb/check`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ query: q, query_type: qt })
    });
    return handleResponse<any>(res);
  },

  // Incident Response Assistant
  generateIncidentDossier: async (
    target_url: string,
    threat_classification?: string,
    targeted_brand?: string,
    evidence_notes?: string
  ): Promise<IncidentDossier> => {
    const res = await fetch(`${API_BASE}/incident-response/generate`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({
        target_url,
        threat_classification: threat_classification || 'Phishing / Fake Banking Lure',
        targeted_brand: targeted_brand || 'General Public / Banking Users',
        evidence_notes: evidence_notes || 'Discovered active credential harvesting form and fraudulent logo impersonation.'
      })
    });
    return handleResponse<IncidentDossier>(res);
  },

  generateTakedownNotice: async (data: any): Promise<IncidentDossier> => {
    return api.generateIncidentDossier(data.target_url, data.threat_classification);
  },

  // Honeytokens & Deception
  createHoneytoken: async (typeOrObj: string | { token_type: string; memo: string }, memo?: string): Promise<any> => {
    let token_type = 'web_canary';
    let mem = '';
    if (typeof typeOrObj === 'object') {
      token_type = typeOrObj.token_type;
      mem = typeOrObj.memo;
    } else {
      token_type = typeOrObj;
      mem = memo || '';
    }
    const res = await fetch(`${API_BASE}/deception/tokens/create`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ token_type, memo: mem })
    });
    return handleResponse<any>(res);
  },

  listHoneytokens: async (): Promise<any[]> => {
    const res = await fetch(`${API_BASE}/deception/tokens/list`, {
      headers: getAuthHeader()
    });
    return handleResponse<any[]>(res);
  },

  getHoneytokens: async (): Promise<any[]> => {
    return api.listHoneytokens();
  },

  deleteHoneytoken: async (tokenId: string): Promise<any> => {
    return { success: true, tokenId };
  },

  // Plans & Subscriptions
  getPlans: async (): Promise<{ plans: Plan[] }> => {
    const res = await fetch(`${API_BASE}/subscription/plans`);
    return handleResponse<{ plans: Plan[] }>(res);
  },

  createRazorpayOrder: async (planOrObj: string | { plan_id: string; [key: string]: any }): Promise<any> => {
    const plan_id = typeof planOrObj === 'object' ? planOrObj.plan_id : planOrObj;
    const res = await fetch(`${API_BASE}/subscription/razorpay/create-order`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ plan_id })
    });
    return handleResponse<any>(res);
  },

  verifyRazorpayPayment: async (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    plan_id: string;
    [key: string]: any;
  }): Promise<any> => {
    const res = await fetch(`${API_BASE}/subscription/razorpay/verify-payment`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(data)
    });
    return handleResponse<any>(res);
  },

  validateCoupon: async (coupon_code: string): Promise<any> => {
    return { valid: true, discount_pct: 10, code: coupon_code };
  },

  processCheckout: async (data: any): Promise<any> => {
    return api.verifyRazorpayPayment(data);
  },

  // Developer API Keys
  listApiKeys: async (): Promise<APIKey[]> => {
    const res = await fetch(`${API_BASE}/api-keys`, {
      headers: getAuthHeader()
    });
    return handleResponse<APIKey[]>(res);
  },

  createApiKey: async (name: string, expires_in_days: number = 90): Promise<any> => {
    const res = await fetch(`${API_BASE}/api-keys`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ name, expires_in_days })
    });
    return handleResponse<any>(res);
  },

  revokeApiKey: async (key_id: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/api-keys/${key_id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    return handleResponse<any>(res);
  },

  getApiUsageSummary: async (): Promise<APIUsageSummary> => {
    const res = await fetch(`${API_BASE}/api-keys/usage/summary`, {
      headers: getAuthHeader()
    });
    return handleResponse<APIUsageSummary>(res);
  },

  // Threat Intel & Dashboard
  getLiveGlobalAttacks: async (_limit: number = 20): Promise<{ attacks: any[]; active_attacks_per_minute: number }> => {
    return { attacks: [], active_attacks_per_minute: 0 };
  },

  getThreatFeed: async (limit: number = 20): Promise<ThreatFeedItem[]> => {
    const res = await fetch(`${API_BASE}/threat-intelligence/feed?limit=${limit}`);
    return handleResponse<ThreatFeedItem[]>(res);
  },

  searchIOC: async (query: string): Promise<ThreatFeedItem[]> => {
    const res = await fetch(`${API_BASE}/threat-intelligence/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    const data = await handleResponse<any>(res);
    return data.matches || [];
  },

  getProviders: async (): Promise<ProviderStatus[]> => {
    const res = await fetch(`${API_BASE}/threat-intelligence/providers`);
    return handleResponse<ProviderStatus[]>(res);
  },

  getDashboardStats: async (): Promise<DashboardStats> => {
    const res = await fetch(`${API_BASE}/dashboard/stats`, {
      headers: getAuthHeader()
    });
    return handleResponse<DashboardStats>(res);
  },

  getDashboardMetrics: async (): Promise<DashboardStats> => {
    return api.getDashboardStats();
  },

  getPlaybooks: async (): Promise<IncidentPlaybook[]> => {
    const res = await fetch(`${API_BASE}/ai/playbooks`);
    return handleResponse<IncidentPlaybook[]>(res);
  },

  chatWithAI: async (
    message: string,
    history: any[] = [],
    scanContext?: any,
    userRole: string = 'normal_user',
    investigationContext?: any
  ): Promise<{
    answer: string;
    response: string;
    recommended_actions: string[];
    suggested_questions?: string[];
    related_playbook?: any;
  }> => {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({
        message,
        history,
        scan_context: scanContext,
        user_role: userRole,
        investigation_context: investigationContext
      })
    });
    const data = await handleResponse<any>(res);
    return {
      answer: data.answer || data.response || 'Security evaluation complete.',
      response: data.response || data.answer || 'Security evaluation complete.',
      recommended_actions: data.recommended_actions || [],
      suggested_questions: data.suggested_questions || [],
      related_playbook: data.related_playbook
    };
  },

  getArticles: async (): Promise<AwarenessArticle[]> => {
    const res = await fetch(`${API_BASE}/awareness/articles`);
    return handleResponse<AwarenessArticle[]>(res);
  },

  getQuizzes: async (): Promise<QuizQuestion[]> => {
    const res = await fetch(`${API_BASE}/awareness/quizzes`);
    return handleResponse<QuizQuestion[]>(res);
  },

  getQuiz: async (): Promise<QuizQuestion[]> => {
    return api.getQuizzes();
  },

  getChecklists: async (): Promise<any[]> => {
    return [
      { id: '1', title: 'Home & Mobile Device Hardening', items: ['Enable biometric screen lock', 'Turn off automatic Wi-Fi connections', 'Enable 2-Step Verification on WhatsApp'] },
      { id: '2', title: 'Online Banking & UPI Safeguards', items: ['Never enter UPI PIN to receive money', 'Verify SMS sender IDs', 'Set daily transaction limits on netbanking'] }
    ];
  },

  // Admin SOC Operations
  getSystemHealth: async (): Promise<any> => {
    const res = await fetch(`${API_BASE}/admin/system-health`, {
      headers: getAuthHeader()
    });
    return handleResponse<any>(res);
  },

  getSecurityEvents: async (skip: number = 0, limit: number = 50): Promise<any[]> => {
    const res = await fetch(`${API_BASE}/admin/security-events?skip=${skip}&limit=${limit}`, {
      headers: getAuthHeader()
    });
    return handleResponse<any[]>(res);
  },

  getUsersList: async (): Promise<any[]> => {
    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: getAuthHeader()
    });
    return handleResponse<any[]>(res);
  },

  toggleUserRole: async (userId: string, role: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/toggle-role?role=${role}`, {
      method: 'POST',
      headers: getAuthHeader()
    });
    return handleResponse<any>(res);
  },

  getIOCRules: async (): Promise<any[]> => {
    const res = await fetch(`${API_BASE}/admin/ioc-rules`, {
      headers: getAuthHeader()
    });
    return handleResponse<any[]>(res);
  },

  addIOCRule: async (data: any): Promise<any> => {
    const res = await fetch(`${API_BASE}/admin/ioc-rules`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(data)
    });
    return handleResponse<any>(res);
  },

  deleteIOCRule: async (ruleId: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/admin/ioc-rules/${ruleId}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    return handleResponse<any>(res);
  },

  // Legal
  getPrivacyPolicy: async (): Promise<any> => {
    const res = await fetch(`${API_BASE}/legal/privacy-policy`);
    return handleResponse<any>(res);
  },

  getTermsOfService: async (): Promise<any> => {
    const res = await fetch(`${API_BASE}/legal/terms-of-service`);
    return handleResponse<any>(res);
  },

  // Hourly Cyber News & Threat Dispatches
  getCyberNews: async (category?: string, search?: string, limit: number = 30): Promise<any> => {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    if (search) params.append('search', search);
    params.append('limit', limit.toString());
    const res = await fetch(`${API_BASE}/cyber-news?${params.toString()}`);
    return handleResponse<any>(res);
  },

  getBreakingCyberNews: async (limit: number = 5): Promise<any[]> => {
    const res = await fetch(`${API_BASE}/cyber-news/breaking?limit=${limit}`);
    return handleResponse<any[]>(res);
  },

  refreshCyberNews: async (): Promise<any> => {
    const res = await fetch(`${API_BASE}/cyber-news/refresh`, {
      method: 'POST',
      headers: getAuthHeader()
    });
    return handleResponse<any>(res);
  }
};
