import React, { useState } from 'react';
import { CommunityEvent } from '../../types';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  Download, 
  Mail, 
  Send,
  MessageCircle,
  ExternalLink,
  Smartphone,
  Sparkles
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  event: CommunityEvent | null;
}

export const ShareEventModal: React.FC<Props> = ({ isOpen, onClose, event }) => {
  const { showToast } = useApp();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !event) return null;

  const currentUrl = window.location.href;
  const eventTitle = event.title;
  const eventDate = `${event.date}${event.time ? ` (${event.time})` : ''}`;
  const shareText = `🎉 Event: ${eventTitle}\n📅 Date: ${eventDate}\n📍 Location: ${event.location}\n\n${event.description}\n\nCheck out the flyer here: ${currentUrl}`;

  // WhatsApp
  const handleWhatsApp = () => {
    const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  // Facebook
  const handleFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
    window.open(fbUrl, '_blank', 'noopener,noreferrer');
  };

  // Twitter / X
  const handleTwitter = () => {
    const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this event: ${eventTitle} on ${event.date}!`)}&url=${encodeURIComponent(currentUrl)}`;
    window.open(xUrl, '_blank', 'noopener,noreferrer');
  };

  // Email
  const handleEmail = () => {
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(`Invitation: ${eventTitle}`)}&body=${encodeURIComponent(shareText)}`;
    window.location.href = mailtoUrl;
  };

  // Device Native Share (Triggers Bluetooth, Xender, Nearby Share, Messages, WhatsApp, etc. on supported devices)
  const handleNativeDeviceShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: eventTitle,
          text: `Join us for ${eventTitle} on ${eventDate} at ${event.location}`,
          url: currentUrl,
        });
        showToast('Event shared successfully!');
        onClose();
      } catch (err) {
        // User closed or cancelled share
      }
    } else {
      showToast('Native device sharing is not supported on this browser. Use WhatsApp or Copy Link below!');
    }
  };

  // Download / View Image directly
  const handleDownloadImage = () => {
    if (event.imageUrl) {
      window.open(event.imageUrl, '_blank', 'noopener,noreferrer');
      showToast('Opening flyer image in new tab for download!');
    } else {
      showToast('No flyer image URL available for download.');
    }
  };

  // Copy Link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      showToast('Event link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      showToast('Failed to copy link');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl text-white relative space-y-6 animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white leading-tight">Share Event Flyer</h3>
              <p className="text-xs text-slate-400 font-medium">Spread the word with family & friends</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Event Preview Badge */}
        <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 flex items-center gap-3">
          {event.imageUrl ? (
            <img 
              src={event.imageUrl} 
              alt={event.title} 
              className="w-12 h-12 object-cover rounded-xl border border-slate-700 shrink-0" 
            />
          ) : (
            <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center font-bold shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-white truncate">{event.title}</h4>
            <p className="text-[11px] text-slate-400 truncate">📅 {event.date} • 📍 {event.location}</p>
          </div>
        </div>

        {/* Share Channels Grid */}
        <div className="space-y-3">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Select Share Option
          </label>

          <div className="grid grid-cols-2 gap-2.5">
            {/* WhatsApp */}
            <button
              onClick={handleWhatsApp}
              className="p-3 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60 rounded-2xl transition-all flex items-center gap-2.5 cursor-pointer text-xs font-bold shadow-xs group"
            >
              <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl group-hover:scale-110 transition-transform">
                <MessageCircle className="w-4 h-4" />
              </div>
              <span>WhatsApp</span>
            </button>

            {/* Device Native / Bluetooth / Xender */}
            <button
              onClick={handleNativeDeviceShare}
              className="p-3 bg-sky-950/40 hover:bg-sky-900/60 text-sky-300 border border-sky-800/60 rounded-2xl transition-all flex items-center gap-2.5 cursor-pointer text-xs font-bold shadow-xs group"
            >
              <div className="p-2 bg-sky-500/20 text-sky-400 rounded-xl group-hover:scale-110 transition-transform">
                <Smartphone className="w-4 h-4" />
              </div>
              <span className="truncate">Device / Bluetooth</span>
            </button>

            {/* Facebook */}
            <button
              onClick={handleFacebook}
              className="p-3 bg-blue-950/40 hover:bg-blue-900/60 text-blue-300 border border-blue-800/60 rounded-2xl transition-all flex items-center gap-2.5 cursor-pointer text-xs font-bold shadow-xs group"
            >
              <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl group-hover:scale-110 transition-transform">
                <Send className="w-4 h-4" />
              </div>
              <span>Facebook</span>
            </button>

            {/* Email */}
            <button
              onClick={handleEmail}
              className="p-3 bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border border-amber-800/60 rounded-2xl transition-all flex items-center gap-2.5 cursor-pointer text-xs font-bold shadow-xs group"
            >
              <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl group-hover:scale-110 transition-transform">
                <Mail className="w-4 h-4" />
              </div>
              <span>Email</span>
            </button>
          </div>

          {/* Download & Copy Links Bar */}
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={handleDownloadImage}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Download / Open Full Flyer Image</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="w-full py-2.5 px-4 bg-slate-800/70 hover:bg-slate-800 text-slate-300 border border-slate-700/80 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-400" />
                  <span>Copy Flyer Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 text-center">
          <button
            onClick={onClose}
            className="text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
