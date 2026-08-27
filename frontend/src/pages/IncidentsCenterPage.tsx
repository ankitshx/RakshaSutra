import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Send,
  Flame,
  RefreshCw
} from 'lucide-react';

interface Incident {
  id: string;
  title: string;
  classification: string;
  severity: string;
  status: string;
  summary: string;
  affected_assets: string[];
  ioc_indicators: string[];
  defensive_playbook_id?: string;
  alerts_count: number;
  timeline_events_count: number;
  created_at?: string;
  contained_at?: string;
  closed_at?: string;
}

interface IncidentDetail extends Incident {
  containment_checklist: { step: string; completed: boolean }[];
  analyst_notes?: string;
  lessons_learned?: string;
  timeline: {
    id: string;
    event_type: string;
    title: string;
    details?: string;
    created_at?: string;
  }[];
}

export const IncidentsCenterPage: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [sevFilter, setSevFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [selectedIncident, setSelectedIncident] = useState<IncidentDetail | null>(null);
  const [isDeclareModalOpen, setIsDeclareModalOpen] = useState<boolean>(false);
  const [newNote, setNewNote] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newClassification, setNewClassification] = useState('Phishing Attempt');
  const [newSeverity, setNewSeverity] = useState('HIGH');
  const [newSummary, setNewSummary] = useState('');
  const [newAssets, setNewAssets] = useState('');
  const [newIocs, setNewIocs] = useState('');

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/incidents');
      if (res.ok) {
        const data = await res.json();
        setIncidents(data);
      }
    } catch (err) {
      console.error('Failed to fetch incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidentDetail = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/incidents/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedIncident(data);
      }
    } catch (err) {
      console.error('Fetch incident detail error:', err);
    }
  };

  const handleDeclareIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      const res = await fetch('/api/v1/incidents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          title: newTitle,
          classification: newClassification,
          severity: newSeverity,
          summary: newSummary,
          affected_assets: newAssets.split(',').map(s => s.trim()).filter(Boolean),
          ioc_indicators: newIocs.split(',').map(s => s.trim()).filter(Boolean)
        })
      });
      if (res.ok) {
        const data = await res.json();
        setIsDeclareModalOpen(false);
        setNewTitle('');
        setNewSummary('');
        fetchIncidents();
        fetchIncidentDetail(data.id);
      }
    } catch (err) {
      console.error('Declare incident error:', err);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident || !newNote.trim()) return;
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      const res = await fetch(`/api/v1/incidents/${selectedIncident.id}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ note: newNote })
      });
      if (res.ok) {
        setNewNote('');
        fetchIncidentDetail(selectedIncident.id);
      }
    } catch (err) {
      console.error('Add note error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedIncident) return;
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      const res = await fetch(`/api/v1/incidents/${selectedIncident.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchIncidentDetail(selectedIncident.id);
        fetchIncidents();
      }
    } catch (err) {
      console.error('Update incident status error:', err);
    }
  };

  const filteredIncidents = incidents.filter(i => {
    const matchesSearch =
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.classification.toLowerCase().includes(search.toLowerCase()) ||
      i.summary.toLowerCase().includes(search.toLowerCase());
    const matchesSev = sevFilter === 'all' || i.severity === sevFilter;
    const matchesStatus = statusFilter === 'all' || i.status === statusFilter;
    return matchesSearch && matchesSev && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0c121e] border border-white/10 shadow-2xl backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <Flame className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
              SOC Incident Response Center
            </h1>
          </div>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-400 font-sans max-w-2xl">
            Coordinated incident management, containment checklists, forensic chronological logs, analyst notes, and CERT-In / 1930 escalation playbooks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDeclareModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white font-mono text-xs font-bold transition-all cursor-pointer shadow-sutra-glow"
          >
            <Plus className="w-4 h-4" />
            <span>Declare Incident</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0c121e] border border-white/10">
          <span className="text-[11px] font-mono text-slate-400">TOTAL INCIDENTS</span>
          <p className="text-2xl font-mono font-bold text-white mt-1">{incidents.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-[#0c121e] border border-white/10">
          <span className="text-[11px] font-mono text-rose-400">ACTIVE OPEN</span>
          <p className="text-2xl font-mono font-bold text-rose-300 mt-1">
            {incidents.filter(i => i.status === 'OPEN' || i.status === 'INVESTIGATING').length}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-[#0c121e] border border-white/10">
          <span className="text-[11px] font-mono text-amber-400">CONTAINED</span>
          <p className="text-2xl font-mono font-bold text-amber-300 mt-1">
            {incidents.filter(i => i.status === 'CONTAINED').length}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-[#0c121e] border border-white/10">
          <span className="text-[11px] font-mono text-emerald-400">CLOSED / RESOLVED</span>
          <p className="text-2xl font-mono font-bold text-emerald-300 mt-1">
            {incidents.filter(i => i.status === 'CLOSED' || i.status === 'REMEDIATED').length}
          </p>
        </div>
      </div>

      {/* Split Workspace: Incident List & Selected Incident Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Incidents List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex gap-2 items-center p-3 rounded-xl bg-[#0c121e] border border-white/10">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search incidents..."
                className="w-full pl-8 pr-2 py-1.5 rounded-lg bg-[#030508] border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-rose-500/50"
              />
            </div>
            <select
              value={sevFilter}
              onChange={(e) => setSevFilter(e.target.value)}
              className="px-2 py-1.5 rounded-lg bg-[#030508] border border-white/10 text-[11px] font-mono text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="all">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2 py-1.5 rounded-lg bg-[#030508] border border-white/10 text-[11px] font-mono text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="CONTAINED">Contained</option>
              <option value="CLOSED">Closed</option>
            </select>
            <button
              onClick={fetchIncidents}
              className="p-1.5 rounded-lg bg-[#030508] border border-white/10 text-slate-400 hover:text-white cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
            {filteredIncidents.length === 0 ? (
              <div className="p-8 text-center text-slate-500 font-mono text-xs rounded-xl bg-[#0c121e] border border-white/10">
                No incidents declared.
              </div>
            ) : (
              filteredIncidents.map(inc => (
                <div
                  key={inc.id}
                  onClick={() => fetchIncidentDetail(inc.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer shadow-md space-y-2 ${
                    selectedIncident?.id === inc.id
                      ? 'bg-rose-950/30 border-rose-500/50'
                      : 'bg-[#0c121e] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-rose-400">{inc.id}</span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      inc.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-300' :
                      inc.severity === 'HIGH' ? 'bg-amber-950 text-amber-300' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {inc.severity}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold font-mono text-white line-clamp-1">{inc.title}</h4>
                  <p className="text-[11px] text-slate-400 font-sans line-clamp-2">{inc.summary}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] font-mono text-slate-500">
                    <span>{inc.classification}</span>
                    <span className="uppercase font-bold text-slate-300">{inc.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Incident Full Dossier */}
        <div className="lg:col-span-7 rounded-2xl bg-[#0c121e] border border-white/10 p-6 shadow-2xl space-y-6">
          {selectedIncident ? (
            <div className="space-y-6 text-xs font-mono">
              
              {/* Top Summary */}
              <div className="flex items-start justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider">
                    {selectedIncident.id} • {selectedIncident.classification}
                  </span>
                  <h3 className="text-lg font-bold font-mono text-white mt-1">{selectedIncident.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  {selectedIncident.status !== 'CONTAINED' && selectedIncident.status !== 'CLOSED' && (
                    <button
                      onClick={() => handleUpdateStatus('CONTAINED')}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 cursor-pointer font-bold"
                    >
                      Contain Incident
                    </button>
                  )}
                  {selectedIncident.status !== 'CLOSED' && (
                    <button
                      onClick={() => handleUpdateStatus('CLOSED')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 cursor-pointer font-bold"
                    >
                      Close Incident
                    </button>
                  )}
                </div>
              </div>

              {/* Summary description */}
              <div className="p-4 rounded-xl bg-[#030508] border border-white/10 text-slate-300 font-sans leading-relaxed">
                {selectedIncident.summary}
              </div>

              {/* Containment Checklist */}
              <div>
                <span className="text-slate-400 font-bold block mb-2">CONTAINMENT CHECKLIST</span>
                <div className="space-y-2">
                  {selectedIncident.containment_checklist.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#030508] border border-white/5">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        readOnly
                        className="rounded bg-slate-900 border-white/20 text-emerald-500 focus:ring-0"
                      />
                      <span className={`text-xs ${item.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                        {item.step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chronological Timeline */}
              <div>
                <span className="text-slate-400 font-bold block mb-2">CHRONOLOGICAL TIMELINE & EVIDENCE</span>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedIncident.timeline && selectedIncident.timeline.map((ev) => (
                    <div key={ev.id} className="p-2.5 rounded-xl bg-[#030508] border border-white/5 space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span className="text-amber-400 font-bold">{ev.event_type}</span>
                        <span>{ev.created_at?.split('T')[0]}</span>
                      </div>
                      <p className="text-white font-bold text-xs">{ev.title}</p>
                      {ev.details && <p className="text-slate-400 text-[11px] font-sans">{ev.details}</p>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Analyst Notes Log */}
              <div>
                <span className="text-slate-400 font-bold block mb-2">ANALYST INVESTIGATION NOTES</span>
                <div className="p-3 rounded-xl bg-[#030508] border border-white/10 font-mono text-[11px] text-slate-300 max-h-36 overflow-y-auto whitespace-pre-wrap">
                  {selectedIncident.analyst_notes || 'No notes added yet.'}
                </div>

                <form onSubmit={handleAddNote} className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Append technical analyst note or forensic finding..."
                    className="flex-1 px-3 py-2 rounded-xl bg-[#030508] border border-white/10 text-white text-xs focus:outline-none focus:border-rose-500/50"
                  />
                  <button
                    type="submit"
                    disabled={actionLoading || !newNote.trim()}
                    className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>

            </div>
          ) : (
            <div className="py-32 text-center text-slate-500 font-mono text-xs">
              Select an incident from the list to inspect timeline, containment steps, and analyst notes.
            </div>
          )}
        </div>

      </div>

      {/* Declare Incident Modal */}
      {isDeclareModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0c121e] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold font-mono text-white">Declare Security Incident</h3>
            <form onSubmit={handleDeclareIncident} className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1">Incident Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Credential Harvesting Campaign on API Gateway"
                  className="w-full px-3 py-2 rounded-xl bg-[#030508] border border-white/10 text-white focus:outline-none focus:border-rose-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Classification</label>
                  <select
                    value={newClassification}
                    onChange={(e) => setNewClassification(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#030508] border border-white/10 text-white focus:outline-none"
                  >
                    <option value="Phishing Attempt">Phishing Attempt</option>
                    <option value="Account Takeover">Account Takeover</option>
                    <option value="Credential Compromise">Credential Compromise</option>
                    <option value="Data Exposure">Data Exposure</option>
                    <option value="Ransomware Threat">Ransomware Threat</option>
                    <option value="Malware C2">Malware C2</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Severity</label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#030508] border border-white/10 text-white focus:outline-none"
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Executive Summary *</label>
                <textarea
                  required
                  rows={3}
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  placeholder="Describe initial discovery, scope of impact, and threat vector..."
                  className="w-full px-3 py-2 rounded-xl bg-[#030508] border border-white/10 text-white focus:outline-none font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Affected Assets (Comma-sep)</label>
                  <input
                    type="text"
                    value={newAssets}
                    onChange={(e) => setNewAssets(e.target.value)}
                    placeholder="e.g. auth.rakshasutra.org, API Gateway"
                    className="w-full px-3 py-2 rounded-xl bg-[#030508] border border-white/10 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Malicious IOCs (Comma-sep)</label>
                  <input
                    type="text"
                    value={newIocs}
                    onChange={(e) => setNewIocs(e.target.value)}
                    placeholder="e.g. 198.51.100.99, phish.xyz"
                    className="w-full px-3 py-2 rounded-xl bg-[#030508] border border-white/10 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsDeclareModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#030508] border border-white/10 text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold cursor-pointer"
                >
                  Declare & Initialize
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
