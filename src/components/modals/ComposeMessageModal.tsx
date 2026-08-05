import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Send, Paperclip, UserCheck, Heart, Users } from 'lucide-react';
import { UserRole } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultReceiverId?: string;
}

export const ComposeMessageModal: React.FC<Props> = ({ isOpen, onClose, defaultReceiverId }) => {
  const { sendMessage, currentUser, staff, residents, users } = useApp();

  const [recipientCategory, setRecipientCategory] = useState<'Staff' | 'Relative'>('Staff');
  const [receiverId, setReceiverId] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);

  // Build Staff receiver options
  const staffOptions: { id: string; name: string; role: UserRole }[] = [];
  const staffIdsSeen = new Set<string>();

  (staff || []).forEach(s => {
    if (s.id !== currentUser?.id && !staffIdsSeen.has(s.id)) {
      staffIdsSeen.add(s.id);
      staffOptions.push({
        id: s.id,
        name: `${s.name} (${s.position})`,
        role: 'Staff' as UserRole,
      });
    }
  });

  (users || []).filter(u => u.role === 'Staff').forEach(u => {
    if (u.id !== currentUser?.id && !staffIdsSeen.has(u.id)) {
      staffIdsSeen.add(u.id);
      staffOptions.push({
        id: u.id,
        name: `${u.name} (${u.position || 'Care Specialist'})`,
        role: 'Staff' as UserRole,
      });
    }
  });

  if (staffOptions.length === 0) {
    staffOptions.push(
      { id: 'usr-staff-1', name: 'Sarah Jenkins, RN (Senior Nurse & Care Lead)', role: 'Staff' },
      { id: 'usr-staff-2', name: 'Marcus Vance (Dementia Specialist)', role: 'Staff' },
      { id: 'usr-staff-3', name: 'Emily Watson (Child Educator)', role: 'Staff' }
    );
  }

  // Build Relative receiver options
  const relativeOptions: { id: string; name: string; role: UserRole }[] = [];
  const relativeIdsSeen = new Set<string>();

  (users || []).filter(u => u.role === 'Resident Relative').forEach(u => {
    if (u.id !== currentUser?.id && !relativeIdsSeen.has(u.id)) {
      relativeIdsSeen.add(u.id);
      relativeOptions.push({
        id: u.id,
        name: `${u.name} (${u.relationship || 'Resident Relative'})`,
        role: 'Resident Relative' as UserRole,
      });
    }
  });

  if (relativeOptions.length === 0) {
    relativeOptions.push(
      { id: 'usr-relative-1', name: 'David Miller (Son of Eleanor Miller)', role: 'Resident Relative' },
      { id: 'usr-relative-2', name: 'Rebecca Wright (Daughter of Thomas Wright)', role: 'Resident Relative' }
    );
  }

  // Determine active receiver list based on selected category or relative role
  let availableReceivers: { id: string; name: string; role: UserRole; isAssigned?: boolean }[] = [];

  if (currentUser?.role === 'Resident Relative') {
    const relativeResidents = residents.filter(r => 
      r.id === currentUser.residentLinkedId || 
      (currentUser.relationship && r.fullName.toLowerCase().includes(currentUser.relationship.toLowerCase().split(' ')[1] || 'xyz'))
    );
    const targetResidents = relativeResidents.length > 0 ? relativeResidents : residents;

    const assignedStaffIds = Array.from(new Set(targetResidents.map(r => r.assignedStaffId).filter(Boolean)));
    const assignedStaffNames = Array.from(new Set(targetResidents.map(r => r.assignedStaffName).filter(Boolean)));

    const caregiverOptions = staff
      .filter(s => assignedStaffIds.includes(s.id) || assignedStaffNames.includes(s.name))
      .map(s => ({
        id: s.id,
        name: `${s.name} (${s.position}) - Assigned Caregiver`,
        role: 'Staff' as UserRole,
        isAssigned: true,
      }));

    const adminOptions = (users || [])
      .filter(u => u.role === 'Admin')
      .map(u => ({
        id: u.id,
        name: `${u.name} (Managing Director / Admin)`,
        role: 'Admin' as UserRole,
        isAssigned: false,
      }));

    if (adminOptions.length === 0) {
      adminOptions.push({
        id: 'usr-admin-1',
        name: 'Folashade Sonyaolu (Managing Director / Admin)',
        role: 'Admin' as UserRole,
        isAssigned: false,
      });
    }

    availableReceivers = [...caregiverOptions, ...adminOptions].filter(r => r.id !== currentUser.id);

    if (availableReceivers.length === 0) {
      availableReceivers = [
        { id: 'usr-staff-1', name: 'Sarah Jenkins, RN (Assigned Caregiver)', role: 'Staff' as UserRole, isAssigned: true },
        { id: 'usr-admin-1', name: 'Folashade Sonyaolu (Admin)', role: 'Admin' as UserRole, isAssigned: false },
      ];
    }
  } else {
    // Admin / Staff user: toggle between Staff & Relative
    availableReceivers = recipientCategory === 'Staff' ? staffOptions : relativeOptions;
  }

  // Auto-select receiver when category or receivers change
  useEffect(() => {
    if (isOpen && availableReceivers.length > 0) {
      if (defaultReceiverId && availableReceivers.some(r => r.id === defaultReceiverId)) {
        setReceiverId(defaultReceiverId);
      } else if (!availableReceivers.some(r => r.id === receiverId)) {
        setReceiverId(availableReceivers[0].id);
      }
    }
  }, [isOpen, defaultReceiverId, recipientCategory, availableReceivers.length]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const target = availableReceivers.find(r => r.id === receiverId) || availableReceivers[0];

    let attachmentUrl: string | undefined = undefined;
    let attachmentName: string | undefined = undefined;

    if (attachment) {
      attachmentName = attachment.name;
      try {
        attachmentUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (evt) => {
            resolve((evt.target?.result as string) || '');
          };
          reader.onerror = () => {
            resolve(URL.createObjectURL(attachment));
          };
          reader.readAsDataURL(attachment);
        });
      } catch {
        attachmentUrl = URL.createObjectURL(attachment);
      }
    }

    sendMessage({
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      receiverId: target.id,
      receiverName: target.name.split(' - ')[0].split(' (')[0],
      receiverRole: target.role,
      subject,
      content,
      attachmentName,
      attachmentUrl,
    });

    onClose();
    setSubject('');
    setContent('');
    setAttachment(null);
  };

  const isRelativeUser = currentUser?.role === 'Resident Relative';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-600 flex items-center justify-center">
              <Send className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">Compose Internal Message</h2>
              <p className="text-xs text-slate-400">Secure family & care team communication</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Top 2 options: Staff or Relative Selector for Admin/Staff */}
          {!isRelativeUser && (
            <div className="space-y-1.5 pb-2 border-b border-slate-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Select Recipient Type *
              </label>
              <div className="grid grid-cols-2 gap-2.5 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setRecipientCategory('Staff');
                    if (staffOptions.length > 0) setReceiverId(staffOptions[0].id);
                  }}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    recipientCategory === 'Staff'
                      ? 'bg-sky-700 text-white shadow-sm ring-2 ring-sky-500/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Staff Member</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRecipientCategory('Relative');
                    if (relativeOptions.length > 0) setReceiverId(relativeOptions[0].id);
                  }}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    recipientCategory === 'Relative'
                      ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-500/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                  }`}
                >
                  <Heart className="w-4 h-4" />
                  <span>Resident Relative</span>
                </button>
              </div>
            </div>
          )}

          {isRelativeUser && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
              <UserCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Auto-Detected Care Team:</span> You can message your relative's assigned caregiver or the Admin. All messages with caregivers are automatically copied to Admin for quality assurance.
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">To (Recipient) *</label>
            <select
              value={receiverId}
              onChange={e => setReceiverId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 font-medium bg-slate-50/50"
            >
              {availableReceivers.map(r => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Subject *</label>
            <input
              type="text"
              required
              placeholder="e.g. Care Update / Shift Coordination"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Message Content *</label>
            <textarea
              required
              rows={4}
              placeholder="Write your update or message here..."
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Attach File / Photo / Care Log (Optional)</label>
            <div className="flex items-center gap-2">
              <label className="cursor-pointer flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium border border-slate-200">
                <Paperclip className="w-3.5 h-3.5" />
                <span>{attachment ? attachment.name : 'Choose File'}</span>
                <input
                  type="file"
                  onChange={e => setAttachment(e.target.files ? e.target.files[0] : null)}
                  className="hidden"
                />
              </label>
              {attachment && (
                <button
                  type="button"
                  onClick={() => setAttachment(null)}
                  className="text-xs text-rose-500 hover:underline cursor-pointer"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-sky-700 hover:bg-sky-800 text-white rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Send Message
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

