import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Users,
  MessageSquare,
  Search,
  Plus,
  Trash2,
  UserCheck,
  ExternalLink,
} from 'lucide-react';
import { AdminMember, AdminTicket } from '../types/admin';
import { UserSystemRole, MembershipStatus } from '../types/user';
import {
  getStoredAdminMembers,
  saveStoredAdminMembers,
  getStoredAdminTickets,
  saveStoredAdminTickets,
} from '../data/initialAdminData';

interface AdminCmsModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminEmail?: string;
  onSelectUserToImpersonate?: (member: AdminMember) => void;
}

type TabType = 'members' | 'feedback';

export const AdminCmsModal: React.FC<AdminCmsModalProps> = ({
  isOpen,
  onClose,
  adminEmail = 'mohdzul@gmail.com',
  onSelectUserToImpersonate,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('members');

  // Core Data
  const [members, setMembers] = useState<AdminMember[]>([]);
  const [tickets, setTickets] = useState<AdminTicket[]>([]);

  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [ticketFilter, setTicketFilter] = useState<'all' | 'new' | 'resolved'>('all');

  // Modals & Forms
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<AdminMember | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<AdminTicket | null>(null);
  const [ticketReplyNote, setTicketReplyNote] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Scholar Form
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newInstitution, setNewInstitution] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [newRole, setNewRole] = useState<UserSystemRole>('researcher');

  useEffect(() => {
    if (isOpen) {
      setMembers(getStoredAdminMembers());
      setTickets(getStoredAdminTickets());
    }
  }, [isOpen]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  if (!isOpen) return null;

  // Handlers
  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) {
      showToast('Name and email are required');
      return;
    }

    const initials = newName
      .split(' ')
      .map((p) => p[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const newMember: AdminMember = {
      id: `usr-schol-${Date.now()}`,
      name: newName.trim(),
      email: newEmail.trim().toLowerCase(),
      role: newRole,
      tier: 'Single User',
      status: 'Active',
      institution: newInstitution.trim() || 'Independent Scholar / University',
      department: newDepartment.trim() || 'Faculty of Social & Behavioral Sciences',
      validUntil: 'Universal Open Academic Access',
      joinedDate: 'Today',
      lastActive: 'Just now',
      datasetsCount: 1,
      datasetsLimit: 'Unlimited',
      analysesCount: 0,
      analysesLimit: 'Unlimited',
      aiTokensUsed: 0,
      aiTokensLimit: 'Unlimited',
      avatarInitials: initials || 'SC',
      avatarColor: 'from-blue-600 to-indigo-700',
      notes: 'Registered scholar.',
    };

    const updated = [newMember, ...members];
    setMembers(updated);
    saveStoredAdminMembers(updated);
    setIsAddMemberOpen(false);
    setNewName('');
    setNewEmail('');
    setNewInstitution('');
    setNewDepartment('');
    showToast(`Scholar ${newMember.name} added!`);
  };

  const handleToggleMemberStatus = (memberId: string) => {
    const updated = members.map((m) => {
      if (m.id === memberId) {
        const nextStatus: MembershipStatus = m.status === 'Active' ? 'Suspended' : 'Active';
        return { ...m, status: nextStatus };
      }
      return m;
    });
    setMembers(updated);
    saveStoredAdminMembers(updated);
    showToast('Scholar status updated.');
  };

  const confirmDeleteMember = () => {
    if (!memberToDelete) return;
    const memberId = memberToDelete.id;
    const memberName = memberToDelete.name;
    const updated = members.filter((m) => m.id !== memberId);
    setMembers(updated);
    saveStoredAdminMembers(updated);
    showToast(`Scholar ${memberName} removed.`);
    setMemberToDelete(null);
  };

  const handleUpdateTicketStatus = (ticketId: string, status: 'new' | 'in_progress' | 'resolved') => {
    const updated = tickets.map((t) => (t.ticketId === ticketId ? { ...t, status } : t));
    setTickets(updated);
    saveStoredAdminTickets(updated);
    if (selectedTicket?.ticketId === ticketId) {
      setSelectedTicket({ ...selectedTicket, status });
    }
    showToast(`Status updated to ${status}`);
  };

  const handleAddTicketReply = () => {
    if (!selectedTicket || !ticketReplyNote.trim()) return;
    const updated = tickets.map((t) => {
      if (t.ticketId === selectedTicket.ticketId) {
        return {
          ...t,
          adminNotes: ticketReplyNote.trim(),
          status: 'resolved' as const,
          updatedAt: 'Just now',
        };
      }
      return t;
    });
    setTickets(updated);
    saveStoredAdminTickets(updated);
    setSelectedTicket({
      ...selectedTicket,
      adminNotes: ticketReplyNote.trim(),
      status: 'resolved',
      updatedAt: 'Just now',
    });
    setTicketReplyNote('');
    showToast('Response saved and inquiry resolved.');
  };

  // Filtered lists
  const filteredMembers = members.filter((m) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.institution.toLowerCase().includes(q);
    const matchRole = roleFilter === 'all' || m.role === roleFilter;
    return matchSearch && matchRole;
  });

  const filteredTickets = tickets.filter((t) => {
    if (ticketFilter === 'all') return true;
    if (ticketFilter === 'new') return t.status === 'new' || t.status === 'in_progress';
    if (ticketFilter === 'resolved') return t.status === 'resolved';
    return true;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Simplified Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">Admin CMS</h2>
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                  {adminEmail}
                </span>
              </div>
              <p className="text-xs text-slate-500">Scholar directory and user inquiry management</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {toastMessage && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-emerald-600 text-white animate-in fade-in shadow-xs">
                {toastMessage}
              </span>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Close CMS"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Simplified Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50/70 px-6 gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('members')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'members'
                ? 'border-indigo-600 text-indigo-700 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <Users className="w-4 h-4 text-indigo-600" />
            <span>Scholar Directory</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 font-semibold">
              {members.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('feedback')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'feedback'
                ? 'border-indigo-600 text-indigo-700 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-purple-600" />
            <span>Inquiries & Feedback</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 font-semibold">
              {tickets.length}
            </span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {/* TAB 1: SCHOLAR DIRECTORY */}
          {activeTab === 'members' && (
            <div className="space-y-4">
              {/* Controls Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-2 flex-1 max-w-md">
                  <div className="relative w-full">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search scholars by name, email, institution..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700"
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Administrators</option>
                    <option value="researcher">Researchers</option>
                    <option value="member">Students & Scholars</option>
                  </select>
                </div>

                <button
                  onClick={() => setIsAddMemberOpen(true)}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register Scholar</span>
                </button>
              </div>

              {/* Scholar Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Scholar</th>
                      <th className="py-3 px-4">Institution</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Access Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredMembers.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                              {m.avatarInitials}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{m.name}</div>
                              <div className="text-slate-400 text-2xs">{m.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          <div>{m.institution}</div>
                          {m.department && <div className="text-slate-400 text-2xs">{m.department}</div>}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              m.role === 'admin'
                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                : m.role === 'researcher'
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {m.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                              m.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                m.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'
                              }`}
                            />
                            <span>{m.status === 'Active' ? 'Active Scholar' : 'Suspended'}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {onSelectUserToImpersonate && m.email !== adminEmail && (
                              <button
                                onClick={() => onSelectUserToImpersonate(m)}
                                className="p-1 text-slate-500 hover:text-indigo-600 rounded hover:bg-slate-100 cursor-pointer"
                                title="Inspect scholar workspace view"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleToggleMemberStatus(m.id)}
                              className={`p-1 rounded cursor-pointer ${
                                m.status === 'Active'
                                  ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                                  : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                              }`}
                              title={m.status === 'Active' ? 'Suspend scholar' : 'Activate scholar'}
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                            </button>
                            {m.email !== adminEmail && (
                              <button
                                type="button"
                                onClick={() => setMemberToDelete(m)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 cursor-pointer"
                                title="Delete scholar record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredMembers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                          No scholars found matching your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: INQUIRIES & FEEDBACK */}
          {activeTab === 'feedback' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Ticket List */}
              <div className="lg:col-span-1 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-xs font-bold text-slate-700">Inquiries ({filteredTickets.length})</span>
                  <div className="flex items-center gap-1 text-2xs">
                    <button
                      onClick={() => setTicketFilter('all')}
                      className={`px-2 py-0.5 rounded cursor-pointer ${
                        ticketFilter === 'all' ? 'bg-slate-900 text-white font-bold' : 'text-slate-500'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setTicketFilter('new')}
                      className={`px-2 py-0.5 rounded cursor-pointer ${
                        ticketFilter === 'new' ? 'bg-slate-900 text-white font-bold' : 'text-slate-500'
                      }`}
                    >
                      Open
                    </button>
                    <button
                      onClick={() => setTicketFilter('resolved')}
                      className={`px-2 py-0.5 rounded cursor-pointer ${
                        ticketFilter === 'resolved' ? 'bg-slate-900 text-white font-bold' : 'text-slate-500'
                      }`}
                    >
                      Resolved
                    </button>
                  </div>
                </div>

                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {filteredTickets.map((t) => (
                    <div
                      key={t.ticketId}
                      onClick={() => setSelectedTicket(t)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer text-left ${
                        selectedTicket?.ticketId === t.ticketId
                          ? 'border-indigo-500 bg-indigo-50/40 ring-1 ring-indigo-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-2xs font-mono font-bold text-indigo-600">{t.ticketId}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-semibold uppercase ${
                            t.status === 'resolved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : t.status === 'in_progress'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>
                      <div className="font-semibold text-xs text-slate-800 line-clamp-1">{t.subject}</div>
                      <div className="text-2xs text-slate-500 mt-1">
                        {t.userName} • {t.submittedAt}
                      </div>
                    </div>
                  ))}
                  {filteredTickets.length === 0 && (
                    <div className="py-8 text-center text-slate-400 text-xs">No inquiries found.</div>
                  )}
                </div>
              </div>

              {/* Ticket Details & Action */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
                {selectedTicket ? (
                  <>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-indigo-600">
                            {selectedTicket.ticketId}
                          </span>
                          <span className="text-2xs px-2 py-0.5 bg-slate-100 rounded text-slate-600 font-semibold uppercase">
                            {selectedTicket.category}
                          </span>
                        </div>
                        <h3 className="font-bold text-sm text-slate-900 mt-1">{selectedTicket.subject}</h3>
                        <p className="text-2xs text-slate-500">
                          From {selectedTicket.userName} ({selectedTicket.userEmail}) • {selectedTicket.submittedAt}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleUpdateTicketStatus(selectedTicket.ticketId, 'resolved')}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-md text-xs font-semibold cursor-pointer"
                        >
                          Mark Resolved
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100 text-xs text-slate-700 leading-relaxed">
                      {selectedTicket.description}
                    </div>

                    {selectedTicket.adminNotes && (
                      <div className="p-3 bg-indigo-50/60 rounded-lg border border-indigo-100 text-xs space-y-1">
                        <span className="font-bold text-indigo-900 text-2xs uppercase">Admin Resolution Note:</span>
                        <p className="text-slate-700">{selectedTicket.adminNotes}</p>
                      </div>
                    )}

                    <div className="space-y-2 pt-2">
                      <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500">
                        Reply or Add Administrative Note
                      </label>
                      <textarea
                        rows={3}
                        value={ticketReplyNote}
                        onChange={(e) => setTicketReplyNote(e.target.value)}
                        placeholder="Write resolution steps or reply..."
                        className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddTicketReply}
                        className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        Save & Resolve Inquiry
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    Select an inquiry from the list to view details and respond.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Simplified Footer */}
        <div className="px-6 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-2xs text-slate-500 shrink-0">
          <span>Admin Console • StatAssist AI</span>
          <span className="text-slate-400">{members.length} Registered Scholars</span>
        </div>
      </div>

      {/* Add Scholar Modal */}
      {isAddMemberOpen && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
          onClick={() => setIsAddMemberOpen(false)}
        >
          <div
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Register Scholar</h3>
              <button
                type="button"
                onClick={() => setIsAddMemberOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-3">
              <div>
                <label className="block text-2xs font-bold uppercase text-slate-600 mb-1">Scholar Full Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Dr. Siti Aminah"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-2xs font-bold uppercase text-slate-600 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. sitiaminah@unimas.my"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-2xs font-bold uppercase text-slate-600 mb-1">University / Institution</label>
                <input
                  type="text"
                  value={newInstitution}
                  onChange={(e) => setNewInstitution(e.target.value)}
                  placeholder="e.g. Universiti Malaysia Sarawak (UNIMAS)"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-2xs font-bold uppercase text-slate-600 mb-1">Faculty / Department</label>
                <input
                  type="text"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  placeholder="e.g. Faculty of Cognitive Sciences"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-2xs font-bold uppercase text-slate-600 mb-1">Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserSystemRole)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
                >
                  <option value="researcher">Researcher / Lecturer</option>
                  <option value="member">Postgraduate / Student</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddMemberOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer shadow-2xs"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {memberToDelete && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-2xs animate-in fade-in duration-150"
          onClick={() => setMemberToDelete(null)}
        >
          <div
            className="bg-white rounded-xl border border-slate-200 shadow-2xl p-5 max-w-sm w-full space-y-3.5 text-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5 text-rose-600 font-bold text-sm">
              <div className="p-2 rounded-lg bg-rose-50 border border-rose-100">
                <Trash2 className="w-4 h-4" />
              </div>
              <span>Delete Scholar Record</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to remove <strong className="text-slate-900">{memberToDelete.name}</strong> ({memberToDelete.email}) from the directory?
            </p>
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setMemberToDelete(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteMember}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer shadow-2xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
