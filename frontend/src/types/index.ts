export type RiskLevel = 'LOW' | 'MODERATE' | 'SUSPICIOUS' | 'HIGH';
export type IndicatorSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export interface ThreatIndicator {
  category: string;
  severity: IndicatorSeverity;
  title: string;
  evidence: string;
  explanation: string;
  score_impact: number;
}

export interface TechnicalDetails {
  normalized_url: string;
  domain: string;
  subdomain?: string;
  tld: string;
  ip_addresses: string[];
  redirect_chain: Array<{ url: string; status_code: number; ip?: string }>;
  https_enabled: boolean;
  status_code?: number;
  brand_impersonated?: string;
  levenshtein_distance?: number;
  tld_reputation_tier: string;
  threat_intel_hits: any[];
  dns_records: {
    has_a_record?: boolean;
    has_mx_record?: boolean;
    has_ns_record?: boolean;
    mx_servers?: string[];
    name_servers?: string[];
  };
  rdap_info?: Record<string, any>;
}

export interface ScanResponse {
  scan_id: string;
  scan_type: 'url' | 'message' | 'website';
  target: string;
  target_display: string;
  risk_score: number;
  risk_level: RiskLevel;
  summary: string;
  recommendation: string;
  indicators: ThreatIndicator[];
  technical_details: TechnicalDetails;
  execution_time_ms: number;
  request_id: string;
  created_at: string;
}

export interface DetectedTechnique {
  category: string;
  name: string;
  confidence: number;
  matched_phrase: string;
  description: string;
}

export interface MessageScanResponse {
  scan_id: string;
  channel: string;
  sender?: string;
  risk_score: number;
  risk_level: RiskLevel;
  summary: string;
  recommendation: string;
  detected_techniques: DetectedTechnique[];
  indicators: ThreatIndicator[];
  extracted_urls: string[];
  embedded_url_analyses: any[];
  execution_time_ms: number;
  request_id: string;
  created_at: string;
}

export interface SecurityHeaderAudit {
  name: string;
  present: boolean;
  value?: string;
  rating: 'PASS' | 'WARN' | 'FAIL';
  importance: string;
  recommendation: string;
}

export interface TLSDetails {
  enabled: boolean;
  version?: string;
  issuer?: string;
  valid_until?: string;
  days_remaining?: number;
  hsts_active: boolean;
}

export interface WebsiteScanResponse {
  scan_id: string;
  target_url: string;
  final_url: string;
  status_code?: number;
  hygiene_score: number;
  hygiene_rating: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  risk_level: RiskLevel;
  summary: string;
  recommendation: string;
  tls_details: TLSDetails;
  headers_audit: SecurityHeaderAudit[];
  cookie_security: Record<string, any>;
  indicators: ThreatIndicator[];
  execution_time_ms: number;
  request_id: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  role: 'user' | 'analyst' | 'admin';
  is_active: boolean;
  api_key?: string;
  created_at: string;
}

export interface ProviderStatus {
  name: string;
  display_name: string;
  status: 'ACTIVE' | 'FALLBACK_LOCAL' | 'OFFLINE';
  latency_ms: number;
  total_queries: number;
  cache_hits: number;
  last_sync: string;
  is_enabled: boolean;
}

export interface ThreatFeedItem {
  id: string;
  ioc_type: string;
  ioc_value: string;
  threat_category: string;
  confidence: number;
  source: string;
  description?: string;
  tags?: string[];
  first_seen: string;
}

export interface IncidentPlaybook {
  id: string;
  title: string;
  description: string;
  severity: string;
  immediate_steps: string[];
  secondary_steps: string[];
  reporting_authorities: Array<{ name: string; contact: string }>;
}

export interface DashboardStats {
  total_scans: number;
  threats_detected: number;
  suspicious_targets: number;
  safe_analyses: number;
  avg_analysis_time_ms: number;
  active_providers_count: number;
  risk_distribution: Array<{ level: string; count: number; percentage: number; color: string }>;
  threat_categories: Array<{ category: string; count: number }>;
  recent_activity: Array<{
    id: string;
    type: string;
    target: string;
    risk_score: number;
    risk_level: RiskLevel;
    timestamp: string;
    summary: string;
  }>;
}

export interface QuizQuestion {
  id: string;
  scenario: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export interface AwarenessArticle {
  id: string;
  slug: string;
  title: string;
  category: string;
  difficulty: string;
  read_time_minutes: number;
  summary: string;
  content: string;
  key_takeaways: string[];
}
