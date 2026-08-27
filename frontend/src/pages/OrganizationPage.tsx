import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  Lock,
  UserPlus,
  RefreshCw
} from 'lucide-react';

interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  permissions: string[];
  joined_at?: string;
  email?: string;
}

interface OrganizationData {
  is_personal: boolean;
  organization: {
    id: string;
    name: string;
    domain?: string;
    tier: string;
    max_seats: number;
    members_count: number;
  };
  user_role: string;
  permissions: string[];
  members: TeamMember[];
}

export const OrganizationPage: React.FC = () => {
  const [orgData, setOrgData] = useState<OrganizationData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [matrixData, setMatrixData] = useState<any>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('analyst');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const fetchOrgData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      const res = await fetch('/api/v1/organizations/current', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setOrgData(data);
      }

      const matrixRes = await fetch('/api/v1/organizations/roles/permissions-matrix');
      if (matrixRes.ok) {
        const mData = await matrixRes.json();
        setMatrixData(mData);
      }
    } catch (err) {
      console.error('Failed to load organization info:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgData();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0c121e] border border-white/10 shadow-2xl backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <Building2 className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
              Organization & Multi-Tenancy RBAC 2.0
            </h1>
          </div>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-400 font-sans max-w-2xl">
            Multi-tenant organizational isolation, team seats management, and granular permission enforcement across SOC analyst, engineer, and executive roles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrgData}
            className="p-2.5 rounded-xl bg-[#030508] border border-white/10 text-slate-400 hover:text-white cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white font-mono text-xs font-bold transition-all cursor-pointer shadow-sutra-glow"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite Team Member</span>
          </button>
        </div>
      </div>

      {orgData && (
        <>
          {/* Workspace Summary Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#0c121e] border border-white/10">
              <span className="text-[11px] font-mono text-slate-400">WORKSPACE NAME</span>
              <p className="text-lg font-mono font-bold text-white mt-1 truncate">{orgData.organization.name}</p>
            </div>
            <div className="p-4 rounded-xl bg-[#0c121e] border border-white/10">
              <span className="text-[11px] font-mono text-purple-400">SUBSCRIPTION TIER</span>
              <p className="text-lg font-mono font-bold text-purple-300 mt-1 uppercase">{orgData.organization.tier}</p>
            </div>
            <div className="p-4 rounded-xl bg-[#0c121e] border border-white/10">
              <span className="text-[11px] font-mono text-amber-400">TEAM SEATS ALLOCATION</span>
              <p className="text-lg font-mono font-bold text-amber-300 mt-1">
                {orgData.organization.members_count} / {orgData.organization.max_seats} Seats
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#0c121e] border border-white/10">
              <span className="text-[11px] font-mono text-emerald-400">YOUR ROLE</span>
              <p className="text-lg font-mono font-bold text-emerald-300 mt-1 uppercase">{orgData.user_role}</p>
            </div>
          </div>

          {/* Members Table */}
          <div className="rounded-2xl bg-[#0c121e] border border-white/10 p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              <span>Team Members & Roles</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#030508]/80 text-slate-400 border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">USER ID / EMAIL</th>
                    <th className="py-3 px-4">ROLE</th>
                    <th className="py-3 px-4">PERMISSIONS COUNT</th>
                    <th className="py-3 px-4">JOINED DATE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {orgData.members.map((member, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white">
                        {member.email || member.user_id}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-purple-950/80 text-purple-300 border border-purple-500/40">
                          {member.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {member.permissions ? member.permissions.length : 0} Granular Perms
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {member.joined_at?.split('T')[0] || 'Active'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* RBAC 2.0 Role-to-Permissions Matrix */}
          {matrixData && (
            <div className="rounded-2xl bg-[#0c121e] border border-white/10 p-6 space-y-4 shadow-xl">
              <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>RBAC 2.0 Standard Permissions Matrix</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(matrixData.matrix).map(([role, perms]: [string, any]) => (
                  <div key={role} className="p-4 rounded-xl bg-[#030508] border border-white/10 space-y-2">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="font-mono font-bold text-xs uppercase text-purple-400">{role}</span>
                      <span className="text-[10px] font-mono text-slate-400">{perms.length} actions</span>
                    </div>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {perms.map((p: string, i: number) => (
                        <span key={i} className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-slate-300 border border-white/5">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0c121e] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold font-mono text-white">Invite Team Member</h3>
            <form onSubmit={(e) => { e.preventDefault(); setIsInviteModalOpen(false); alert(`Invitation sent to ${inviteEmail}`); }} className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="analyst@organization.com"
                  className="w-full px-3 py-2 rounded-xl bg-[#030508] border border-white/10 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Assigned Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#030508] border border-white/10 text-white focus:outline-none"
                >
                  <option value="analyst">Security Analyst</option>
                  <option value="developer">Developer</option>
                  <option value="admin">Administrator</option>
                  <option value="viewer">Auditor / Viewer</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#030508] border border-white/10 text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold cursor-pointer"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
