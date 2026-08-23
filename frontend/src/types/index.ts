export type RiskLevel = 'LOW' | 'MODERATE' | 'SUSPICIOUS' | 'HIGH' | 'CRITICAL' | string;
export type TrafficLightVerdict = 'SAFE' | 'CAUTION' | 'DANGER' | string;
export type ConfidenceLevel = 'LOW' | 'MEDIUM' | 'HIGH' | string;
export type ProvenanceType = 'DIRECT_OBSERVATION' | 'THIRD_PARTY_INTEL' | 'HEURISTIC' | 'AI_EXPLANATION' | string;

export interface User {
  id: string;
  email: string;
  full_name?: string;
  role: string;
  subscription_tier: string;
  daily_quota: number;
  scans_today: number;
  osint_quota: number;
  osint_today: number;
  is_active: boolean;
  created_at: string;
  [key: string]: any;
}

export interface EvidenceFinding {
  id?: string;
  category: string;
  title: string;
  severity: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string;
  score_impact: number;
  provenance: ProvenanceType;
  source_name: string;
  rule_id?: string;
  evidence: string;
  explanation?: string;
  [key: string]: any;
}

export interface TimelineStep {
  id?: string;
  step_name: string;
  description: string;
  status: string;
  duration_ms: number;
  timestamp?: string;
  [key: string]: any;
}

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  risk_level?: string;
  [key: string]: any;
}

export interface GraphLink {
  source: string;
  target: string;
  relation: string;
  [key: string]: any;
}

export interface RelationshipGraph {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface InvestigationResponse {
  investigation_id: string;
  target: string;
  target_type: string;
  normalized_target?: string;
  hostname?: string;
  risk_score: number;
  risk_level: TrafficLightVerdict;
  confidence_score: number;
  confidence_level: ConfidenceLevel;
  verdict_summary: string;
  plain_explanation: string;
  recommendations: string[];
  findings: EvidenceFinding[];
  timeline: TimelineStep[];
  scoring_breakdown: Record<string, number>;
  evidence_sources_checked: string[];
  raw_telemetry: Record<string, any>;
  relationship_graph: RelationshipGraph;
  duration_ms: number;
  engine_version: string;
  ruleset_version: string;
  created_at?: string;
  [key: string]: any;
}

export interface MonitoredTarget {
  id: string;
  target: string;
  target_type: string;
  check_frequency_hours: number;
  is_active: boolean;
  last_checked_at?: string;
  last_risk_score: number;
  last_verdict: string;
  last_state_snapshot?: Record<string, any>;
  created_at: string;
  [key: string]: any;
}

export interface MonitoringAlert {
  id: string;
  target_id: string;
  alert_type: string;
  severity: string;
  title: string;
  description: string;
  previous_state: Record<string, any>;
  current_state: Record<string, any>;
  diff_summary?: string;
  is_read: boolean;
  created_at: string;
  [key: string]: any;
}

export interface SecurityScorecard {
  overall_score: number;
  passport_id: string;
  dimensions: {
    account_security: number;
    password_exposure: number;
    browser_protection: number;
    threat_history: number;
    privacy_controls: number;
    [key: string]: number;
  };
  recommendations: string[];
  last_assessed: string;
  [key: string]: any;
}

export interface SecurityPassport {
  passport_id: string;
  holder_tier: string;
  security_score: number;
  posture_status: string;
  verified_dimensions: Array<{
    label: string;
    status: string;
    score: number;
    [key: string]: any;
  }>;
  k_anonymity_verified: boolean;
  issued_at: string;
  verification_url: string;
  [key: string]: any;
}

export interface ThreatIntelHealth {
  overall_status: 'OPERATIONAL' | 'DEGRADED' | 'UNAVAILABLE' | string;
  total_providers: number;
  operational_count: number;
  degraded_count: number;
  unavailable_count: number;
  providers: Array<{
    name: string;
    display_name: string;
    category: string;
    status: string;
    latency_ms: number;
    total_queries: number;
    cache_hits: number;
    last_sync: string;
    is_enabled: boolean;
    last_error?: string;
    [key: string]: any;
  }>;
  checked_at: string;
  [key: string]: any;
}

export interface Plan {
  id: string;
  name: string;
  tier: 'free' | 'pro' | 'business' | 'enterprise' | string;
  price_inr: number;
  billing_period: 'monthly' | 'yearly' | string;
  daily_scan_quota: number;
  osint_daily_quota: number;
  api_monthly_quota: number;
  features: string[];
  is_popular?: boolean;
  description?: string;
  badge?: string;
  [key: string]: any;
}

export interface APIKey {
  id: string;
  name: string;
  key_prefix: string;
  status: string;
  rate_limit_per_min: number;
  created_at: string;
  last_used_at?: string;
  [key: string]: any;
}

export interface APIUsageSummary {
  monthly_limit: number;
  used_this_month: number;
  requests_used_this_month: number;
  remaining: number;
  active_keys_count: number;
  usage_percentage: number;
  rate_limit_per_minute?: number;
  [key: string]: any;
}

export interface WebhookEndpoint {
  id: string;
  url: string;
  secret_key?: string;
  secret_preview?: string;
  subscribed_events: string[];
  is_active: boolean;
  created_at: string;
  [key: string]: any;
}

export interface WebhookDelivery {
  id: string;
  endpoint_id: string;
  event_type: string;
  status_code?: number;
  signature: string;
  duration_ms: number;
  success: boolean;
  created_at: string;
  [key: string]: any;
}

export interface ThreatIndicator {
  name?: string;
  title?: string;
  category?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string;
  detail?: string;
  evidence?: string;
  explanation?: string;
  score_impact: number;
  [key: string]: any;
}

export interface ScanResponse {
  scan_id: string;
  request_id?: string;
  created_at: string;
  url: string;
  target: string;
  target_display: string;
  normalized_url?: string;
  risk_score: number;
  risk_level: RiskLevel;
  verdict: TrafficLightVerdict;
  confidence: ConfidenceLevel;
  summary: string;
  plain_explanation?: string;
  recommendation?: string;
  recommendations?: string[];
  indicators: ThreatIndicator[];
  technical_details?: Record<string, any>;
  scanned_at?: string;
  scan_duration_ms?: number;
  [key: string]: any;
}

export interface MessageScanResponse {
  scan_id: string;
  request_id?: string;
  execution_time_ms?: number;
  channel: string;
  risk_score: number;
  risk_level: RiskLevel;
  verdict: TrafficLightVerdict;
  confidence: ConfidenceLevel;
  summary: string;
  recommendation?: string;
  detected_techniques: any[];
  extracted_urls: string[];
  extracted_phone_numbers: string[];
  indicators: ThreatIndicator[];
  scanned_at: string;
  [key: string]: any;
}

export interface WebsiteScanResponse {
  scan_id: string;
  request_id?: string;
  target_url?: string;
  url: string;
  risk_score: number;
  risk_level: RiskLevel;
  verdict: TrafficLightVerdict;
  confidence: ConfidenceLevel;
  hygiene_rating: string;
  hygiene_score?: number;
  summary: string;
  security_headers: Record<string, any>;
  headers_audit: any[];
  ssl_certificate: Record<string, any>;
  tls_details: Record<string, any>;
  indicators: ThreatIndicator[];
  scanned_at: string;
  [key: string]: any;
}

export interface ThreatFeedItem {
  id: string;
  ioc_type: string;
  ioc_value: string;
  threat_category: string;
  confidence: number;
  source: string;
  description?: string;
  tags: string[];
  first_seen: string;
  [key: string]: any;
}

export interface ProviderStatus {
  name: string;
  display_name: string;
  status: string;
  latency_ms: number;
  total_queries: number;
  cache_hits: number;
  last_sync: string;
  is_enabled: boolean;
  [key: string]: any;
}

export interface IncidentPlaybook {
  id: string;
  title: string;
  description: string;
  severity: string;
  immediate_steps: string[];
  secondary_steps: string[];
  reporting_authorities: Array<{ name: string; contact: string }>;
  [key: string]: any;
}

export interface AwarenessArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  read_time_minutes: number;
  level: string;
  key_takeaways?: string[];
  [key: string]: any;
}

export interface QuizQuestion {
  id: string;
  question: string;
  scenario?: string;
  options: string[];
  correct_option_index?: number;
  correct_index?: number;
  explanation: string;
  [key: string]: any;
}

export interface DashboardStats {
  total_scans: number;
  threats_blocked?: number;
  threats_detected?: number;
  suspicious_targets?: number;
  safe_analyses?: number;
  clean_links?: number;
  caution_links?: number;
  active_rules?: number;
  avg_latency_ms?: number;
  avg_analysis_time_ms?: number;
  active_providers_count?: number;
  risk_distribution: any[];
  threat_categories: any[];
  recent_activity: any[];
  [key: string]: any;
}

export interface IncidentDossier {
  dossier_id: string;
  target_url?: string;
  domain: string;
  threat_classification?: string;
  targeted_brand?: string;
  evidence_digest_sha256?: string;
  sha256_evidence_hash: string;
  generated_at_utc?: string;
  rfc2822_abuse_notice?: string;
  notice?: string;
  cert_in_report_template?: string;
  certin_incident_report: string;
  emergency_helpline_guide?: string;
  cybercrime_1930_guidance?: string;
  registrar_name?: string;
  registrar_abuse_email: string;
  firewall_rules: {
    nginx: string;
    apache: string;
    cloudflare_waf: string;
    windows_hosts: string;
    iptables: string;
    [key: string]: string;
  };
  [key: string]: any;
}
