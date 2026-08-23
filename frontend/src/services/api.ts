import type {
  ScanResponse,
  MessageScanResponse,
  WebsiteScanResponse,
  ThreatFeedItem,
  IncidentPlaybook,
  AwarenessArticle,
  QuizQuestion,
  DashboardStats,
  User
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
    throw new Error(errorData.detail || errorData.message || 'API request failed');
  }
  return res.json();
}

export const api = {
  // Scanners
  scanUrl: (url: string, forceFresh: boolean = false): Promise<ScanResponse> =>
    fetch(`${API_BASE}/scans/url`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ url, force_fresh: forceFresh })
    }).then(handleResponse<ScanResponse>),

  scanMessage: (content: string, channel: string = 'sms', sender?: string): Promise<MessageScanResponse> =>
    fetch(`${API_BASE}/scans/message`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ content, channel, sender })
    }).then(handleResponse<MessageScanResponse>),

  scanWebsite: (url: string): Promise<WebsiteScanResponse> =>
    fetch(`${API_BASE}/scans/website`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ url })
    }).then(handleResponse<WebsiteScanResponse>),

  getScanReport: (scanId: string): Promise<ScanResponse> =>
    fetch(`${API_BASE}/scans/${scanId}`, {
      headers: getAuthHeader()
    }).then(handleResponse<ScanResponse>),

  getScanById: (scanId: string): Promise<ScanResponse> =>
    fetch(`${API_BASE}/scans/${scanId}`, {
      headers: getAuthHeader()
    }).then(handleResponse<ScanResponse>),

  getScanHistory: (params?: { scan_type?: string; risk_level?: string; limit?: number }): Promise<any[]> => {
    const query = new URLSearchParams();
    if (params?.scan_type) query.append('scan_type', params.scan_type);
    if (params?.risk_level) query.append('risk_level', params.risk_level);
    if (params?.limit) query.append('limit', params.limit.toString());
    return fetch(`${API_BASE}/scans/history/my?${query.toString()}`, {
      headers: getAuthHeader()
    }).then(handleResponse<any[]>);
  },

  deleteScan: (scanId: string): Promise<{ message: string }> =>
    fetch(`${API_BASE}/scans/${scanId}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    }).then(handleResponse<{ message: string }>),

  // Dashboard
  getDashboardMetrics: (): Promise<DashboardStats> =>
    fetch(`${API_BASE}/dashboard`, {
      headers: getAuthHeader()
    }).then(handleResponse<DashboardStats>),

  // Threat Intel
  searchIOC: (query: string): Promise<any> =>
    fetch(`${API_BASE}/threat-intelligence/search`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ query })
    }).then(handleResponse<any>),

  getThreatFeed: (limit: number = 20): Promise<ThreatFeedItem[]> =>
    fetch(`${API_BASE}/threat-intelligence/feed?limit=${limit}`, {
      headers: getAuthHeader()
    }).then(handleResponse<ThreatFeedItem[]>),

  getLiveGlobalAttacks: (): Promise<any> =>
    fetch(`${API_BASE}/threat-intelligence/live-global-attacks`, {
      headers: getAuthHeader()
    }).then(handleResponse<any>),

  getProviders: (): Promise<any[]> =>
    Promise.resolve([
      { name: 'URLhaus', display_name: 'abuse.ch URLhaus Feed', status: 'ACTIVE', latency_ms: 12.4 },
      { name: 'VirusTotal', display_name: 'VirusTotal Intelligence API', status: 'ACTIVE', latency_ms: 45.1 },
      { name: 'AbuseIPDB', display_name: 'AbuseIPDB Network Blacklist', status: 'ACTIVE', latency_ms: 18.2 }
    ]),

  // Raksha AI
  chatWithAI: (message: string, contextScanId?: string, history: Array<{ role: string; content: string }> = []): Promise<any> =>
    fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ message, context_scan_id: contextScanId, history })
    }).then(handleResponse<any>),

  getPlaybooks: (): Promise<IncidentPlaybook[]> =>
    fetch(`${API_BASE}/ai/playbooks`, {
      headers: getAuthHeader()
    }).then(handleResponse<IncidentPlaybook[]>),

  // Awareness
  getArticles: (): Promise<AwarenessArticle[]> =>
    fetch(`${API_BASE}/awareness/articles`, {
      headers: getAuthHeader()
    }).then(handleResponse<AwarenessArticle[]>),

  getArticleBySlug: (slug: string): Promise<AwarenessArticle> =>
    fetch(`${API_BASE}/awareness/articles/${slug}`, {
      headers: getAuthHeader()
    }).then(handleResponse<AwarenessArticle>),

  getQuiz: (): Promise<QuizQuestion[]> =>
    fetch(`${API_BASE}/awareness/quiz`, {
      headers: getAuthHeader()
    }).then(handleResponse<QuizQuestion[]>),

  getChecklists: (): Promise<any[]> =>
    fetch(`${API_BASE}/awareness/checklists`, {
      headers: getAuthHeader()
    }).then(handleResponse<any[]>),

  // Auth
  login: (email: string, password: string): Promise<{ access_token: string; user: User }> =>
    fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    }).then(handleResponse<{ access_token: string; user: User }>),

  register: (email: string, password: string, fullName?: string): Promise<{ access_token: string; user: User }> =>
    fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name: fullName })
    }).then(handleResponse<{ access_token: string; user: User }>),

  getMe: (): Promise<User> =>
    fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeader()
    }).then(handleResponse<User>),

  regenerateApiKey: (): Promise<{ api_key: string; message: string }> =>
    fetch(`${API_BASE}/auth/api-key/regenerate`, {
      method: 'POST',
      headers: getAuthHeader()
    }).then(handleResponse<{ api_key: string; message: string }>),

  getQuotaStatus: (): Promise<any> =>
    fetch(`${API_BASE}/auth/quota/status`, {
      headers: getAuthHeader()
    }).then(handleResponse<any>),

  requestQuotaUpgrade: (reason?: string): Promise<any> =>
    fetch(`${API_BASE}/auth/quota/request-upgrade?reason=${encodeURIComponent(reason || 'Pro Upgrade')}`, {
      method: 'POST',
      headers: getAuthHeader()
    }).then(handleResponse<any>),

  // Subscriptions & Monetization
  getSubscriptionPlans: (): Promise<any> =>
    fetch(`${API_BASE}/subscription/plans`, {
      headers: getAuthHeader()
    }).then(handleResponse<any>),

  getMySubscription: (): Promise<any> =>
    fetch(`${API_BASE}/subscription/my`, {
      headers: getAuthHeader()
    }).then(handleResponse<any>),

  validateCoupon: (code: string): Promise<any> =>
    fetch(`${API_BASE}/subscription/validate-coupon?code=${encodeURIComponent(code)}`, {
      method: 'POST',
      headers: getAuthHeader()
    }).then(handleResponse<any>),

  createRazorpayOrder: (data: { plan_id: string; billing_cycle?: string; coupon_code?: string }): Promise<any> =>
    fetch(`${API_BASE}/subscription/razorpay/create-order`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(data)
    }).then(handleResponse<any>),

  verifyRazorpayPayment: (data: { plan_id: string; billing_cycle?: string; razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string; coupon_code?: string }): Promise<any> =>
    fetch(`${API_BASE}/subscription/razorpay/verify-payment`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(data)
    }).then(handleResponse<any>),

  createStripeSession: (data: { plan_id: string; billing_cycle?: string; coupon_code?: string }): Promise<any> =>
    fetch(`${API_BASE}/subscription/stripe/create-session`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(data)
    }).then(handleResponse<any>),

  processCheckout: (data: { plan_id: string; billing_cycle?: string; payment_method?: string; coupon_code?: string; payment_details?: any }): Promise<any> =>
    fetch(`${API_BASE}/subscription/checkout`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(data)
    }).then(handleResponse<any>),

  instantUpgrade: (planId: string = 'pro'): Promise<any> =>
    fetch(`${API_BASE}/subscription/instant-upgrade?plan_id=${encodeURIComponent(planId)}`, {
      method: 'POST',
      headers: getAuthHeader()
    }).then(handleResponse<any>),

  // Admin Portal
  getSystemHealth: (): Promise<any> =>
    fetch(`${API_BASE}/admin/system-health`, {
      headers: getAuthHeader()
    }).then(handleResponse<any>),

  getSecurityEvents: (): Promise<any[]> =>
    fetch(`${API_BASE}/admin/security-events`, {
      headers: getAuthHeader()
    }).then(handleResponse<any[]>),

  getUsersList: (): Promise<any[]> =>
    fetch(`${API_BASE}/admin/users`, {
      headers: getAuthHeader()
    }).then(handleResponse<any[]>),

  toggleUserRole: (userId: string, role: string): Promise<any> =>
    fetch(`${API_BASE}/admin/users/${userId}/toggle-role?role=${role}`, {
      method: 'POST',
      headers: getAuthHeader()
    }).then(handleResponse<any>),

  getIOCRules: (): Promise<any[]> =>
    fetch(`${API_BASE}/admin/ioc-rules`, {
      headers: getAuthHeader()
    }).then(handleResponse<any[]>),

  addIOCRule: (data: { ioc_type: string; ioc_value: string; threat_category: string; confidence?: number; description?: string }): Promise<any> =>
    fetch(`${API_BASE}/admin/ioc-rules`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(data)
    }).then(handleResponse<any>),

  deleteIOCRule: (iocId: string): Promise<any> =>
    fetch(`${API_BASE}/admin/ioc-rules/${iocId}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    }).then(handleResponse<any>),

  // Dark Web & Breach Intelligence
  checkDarkWebExposure: (data: { query: string; query_type?: string }): Promise<any> =>
    fetch(`${API_BASE}/darkweb/check`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(data)
    }).then(handleResponse<any>),

  // Autonomous AI Takedown Swarm
  generateTakedownNotice: (data: { target_url: string; threat_classification?: string; targeted_brand?: string; evidence_notes?: string }): Promise<any> =>
    fetch(`${API_BASE}/takedown/generate`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(data)
    }).then(handleResponse<any>),

  // Honeytoken & Active Deception
  createHoneytoken: (data: { token_type: string; memo: string; alert_email?: string }): Promise<any> =>
    fetch(`${API_BASE}/deception/tokens/create`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(data)
    }).then(handleResponse<any>),

  getHoneytokens: (): Promise<any[]> =>
    fetch(`${API_BASE}/deception/tokens/list`, {
      headers: getAuthHeader()
    }).then(handleResponse<any[]>),

  deleteHoneytoken: (tokenId: string): Promise<any> =>
    fetch(`${API_BASE}/deception/tokens/${tokenId}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    }).then(handleResponse<any>),

  // OSINT Reconnaissance & Threat Graph
  osintScanUsername: (username: string): Promise<any> =>
    fetch(`${API_BASE}/osint/username`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ username })
    }).then(handleResponse<any>),

  osintScanDomain: (domain: string): Promise<any> =>
    fetch(`${API_BASE}/osint/domain`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ domain })
    }).then(handleResponse<any>),

  osintScanEmail: (email: string): Promise<any> =>
    fetch(`${API_BASE}/osint/email`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ email })
    }).then(handleResponse<any>),

  osintScanPhone: (phone: string): Promise<any> =>
    fetch(`${API_BASE}/osint/phone`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ phone })
    }).then(handleResponse<any>),

  osintFullRecon: (target: string, target_type: string = 'auto'): Promise<any> =>
    fetch(`${API_BASE}/osint/full-recon`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ target, target_type })
    }).then(handleResponse<any>)
};
