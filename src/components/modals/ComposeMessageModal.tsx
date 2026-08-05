import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Send, Paperclip, UserCheck } from 'lucide-react';
import { UserRole } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultReceiverId?: string;
}

export const ComposeMessageModal: React.FC<Props> = ({ isOpen, onClose, defaultReceiverId }) => {
  const { sendMessage, currentUser, staff, residents } = useApp();

  // Receivers list (Staff, Admin, Relatives)
  const availableReceivers = [
    { id: 'usr-admin-1', name: 'Samantha Itopa (Admin)', role: 'Admin' as UserRole },
    { id: 'usr-staff-1', name: 'Sarah Jenkins, RN (Senior Nurse)', role: 'Staff' as UserRole },
    { id: 'usr-staff-2', name: 'Marcus Vance (Dementia Specialist)', role: 'Staff' as UserRole },
    { id: 'usr-staff-3', name: 'Emily Watson (Child Educator)', role: 'Staff' as UserRole },
    { id: 'usr-relative-1', name: 'David Miller (Son of Eleanor Miller)', role: 'Resident Relative' as UserRole },
    { id: 'usr-relative-2', name: 'Rebecca Wright (Daughter of Thomas Wright)', role: 'Resident Relative' as UserRole },
  ].filter(r => r.id !== currentUser?.id);

  const [receiverId, setReceiverId] = useState(defaultReceiverId || availableReceivers[0]?.id || '');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const target = availableReceivers.find(r => r.id === receiverId) || availableReceivers[0];

    sendMessage({
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      receiverId: target.id,
      receiverName: target.name,
      receiverRole: target.role,
      subject,
      content,
      attachmentName: attachment ? attachment.name : undefined,
    });

    onClose();
    setSubject('');
    setContent('');
    setAttachment(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        
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
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">To (Recipient) *</label>
            <select
              value={receiverId}
              onChange={e => setReceiverId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
            >
              {availableReceivers.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Subject *</label>
            <input
              type="text"
              required
              placeholder="e.g. Care Update / Medication Inquiry"
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
              placeholder="Write your update or question here..."
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
                  className="text-xs text-rose-500 hover:underline"
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
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-sky-700 hover:bg-sky-800 text-white rounded-xl shadow-sm flex items-center gap-1.5"
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
