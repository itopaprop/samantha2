import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Calendar, Clock, User, Mail, Phone, HeartHandshake, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

export const BookConsultationModal: React.FC = () => {
  const { isConsultationModalOpen, setIsConsultationModalOpen, bookConsultation } = useApp();
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const submitLockRef = useRef(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    preferredDate: '',
    preferredTime: '10:00 AM',
    serviceInterest: 'Residential Elderly Care',
    notes: '',
  });

  if (!isConsultationModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitLockRef.current || isSubmitting) return;

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setErrorMsg('Please fill in your full name, email address, and phone number.');
      return;
    }

    setErrorMsg(null);
    submitLockRef.current = true;
    setIsSubmitting(true);

    try {
      await bookConsultation({
        ...formData,
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        notes: formData.notes.trim() || undefined,
        formType: 'consultation_booking',
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setIsConsultationModalOpen(false);
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          preferredDate: '',
          preferredTime: '10:00 AM',
          serviceInterest: 'Residential Elderly Care',
          notes: '',
        });
      }, 2400);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to save consultation request right now. Please try again.');
    } finally {
      setIsSubmitting(false);
      submitLockRef.current = false;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-sky-700 via-teal-700 to-sky-800 px-5 sm:px-6 py-4 sm:py-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <HeartHandshake className="w-5 h-5 text-sky-200" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Book a Family Consultation</h2>
              <p className="text-xs text-sky-100 font-medium">Schedule a home visit or tour with our care specialists</p>
            </div>
          </div>
          <button 
            onClick={() => setIsConsultationModalOpen(false)}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {submitted ? (
            <div className="py-12 text-center space-y-3">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
              <h3 className="text-xl font-bold text-slate-900">Consultation Scheduled!</h3>
              <p className="text-sm text-slate-600 max-w-sm mx-auto">
                Thank you, <span className="font-semibold text-slate-800">{formData.fullName}</span>. Your booking is saved and our Lead Care Coordinator will confirm your appointment on <span className="font-semibold text-slate-800">{formData.preferredDate || 'your selected date'}</span>.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Full Name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="david@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      placeholder="+234..."
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Service of Interest *</label>
                <select
                  value={formData.serviceInterest}
                  onChange={(e) => setFormData({ ...formData, serviceInterest: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="Residential Elderly Care">Residential Elderly Care</option>
                  <option value="Dementia Support">Dementia Support</option>
                  <option value="Child Care Services">Child Care & Daycare Services</option>
                  <option value="Domiciliary Care">Domiciliary Care (Home Visits)</option>
                  <option value="Vulnerable Adult Support">Vulnerable Adult Support</option>
                  <option value="Caregiver Training Courses">Caregiver Training Courses</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Date *</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="date"
                      required
                      value={formData.preferredDate}
                      onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Time Slot *</label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <select
                      value={formData.preferredTime}
                      onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="09:00 AM">09:00 AM - 10:30 AM</option>
                      <option value="11:00 AM">11:00 AM - 12:30 PM</option>
                      <option value="02:00 PM">02:00 PM - 03:30 PM</option>
                      <option value="04:30 PM">04:30 PM - 06:00 PM</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Additional Care Notes (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Tell us about your loved one's specific needs, mobility, or preferences..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsConsultationModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-xs font-semibold bg-sky-700 hover:bg-sky-800 disabled:bg-slate-400 disabled:cursor-not-allowed text-white rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Booking...</span>
                    </>
                  ) : (
                    <span>Confirm Consultation Request</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
