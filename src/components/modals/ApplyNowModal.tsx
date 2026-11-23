import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Send, 
  UserCheck, 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  CheckCircle2, 
  Stethoscope,
  HeartHandshake,
  Building2,
  Copy,
  Check,
  MessageCircle,
  Paperclip,
  Receipt,
  FileCheck,
  AlertCircle,
  Banknote,
  Loader2
} from 'lucide-react';

import {
  CareerApplicationFields,
  CareerFormState,
  createInitialCareerFormState,
} from '../forms/CareerApplicationFields';
import {
  ResidentAdmissionFields,
  ResidentAdmissionFormState,
  createInitialResidentFormState,
  normalizeInternationalWhatsAppNumber,
} from '../forms/ResidentAdmissionFields';

export const ApplyNowModal: React.FC = () => {
  const { isApplyModalOpen, setIsApplyModalOpen, showToast, submitApplication, jobs } = useApp();
  const [appType, setAppType] = useState<'caregiver' | 'resident'>('caregiver');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const submitLockRef = useRef(false);
  const [payLaterWhatsApp, setPayLaterWhatsApp] = useState(false);
  const [copiedAcc, setCopiedAcc] = useState<number | null>(null);

  // Fee Notice Popup State for Resident Care Admission (Auto disappears in 25s)
  const [showFeeNotice, setShowFeeNotice] = useState(false);
  const [feeTimeLeft, setFeeTimeLeft] = useState(25);
  const feeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const feeCountdownRef = useRef<NodeJS.Timeout | null>(null);

  // Applicant Photo State (Resident Care Admission)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Receipt Attachment State (Resident Care Admission)
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [receiptFileName, setReceiptFileName] = useState<string | null>(null);
  const [receiptFileType, setReceiptFileType] = useState<string | null>(null);

  // Resident Care Admission State (Sections 1–4; Section 5 is Admin/Staff-Only)
  const [residentForm, setResidentForm] = useState<ResidentAdmissionFormState>(() =>
    createInitialResidentFormState()
  );

  // Caregiver / Staff 5-Section Application State
  const [careerForm, setCareerForm] = useState<CareerFormState>(() =>
    createInitialCareerFormState('Senior Care Assistant')
  );

  const caregiverPositionOptions = React.useMemo(() => {
    const jobTitles = (jobs || []).map((j) => j.title);
    return [
      ...jobTitles,
      'Senior Care Assistant',
      'Registered General Nurse (RGN)',
      'Night Care Specialist',
      'Dementia Care Specialist',
      'Activities & Wellbeing Lead',
      'Healthcare Support Worker',
      'Caregiver',
      'Child Care Assistant',
      'Healthcare Administrator',
    ];
  }, [jobs]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFileName(file.name);
      setReceiptFileType(file.type);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string);
        showToast('Payment receipt attached successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const startFeeNoticeTimer = () => {
    if (feeTimerRef.current) clearTimeout(feeTimerRef.current);
    if (feeCountdownRef.current) clearInterval(feeCountdownRef.current);
    
    setShowFeeNotice(true);
    setFeeTimeLeft(25);

    feeCountdownRef.current = setInterval(() => {
      setFeeTimeLeft((prev) => {
        if (prev <= 1) {
          if (feeCountdownRef.current) clearInterval(feeCountdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    feeTimerRef.current = setTimeout(() => {
      setShowFeeNotice(false);
    }, 25000);
  };

  const closeFeeNotice = () => {
    if (feeTimerRef.current) clearTimeout(feeTimerRef.current);
    if (feeCountdownRef.current) clearInterval(feeCountdownRef.current);
    setShowFeeNotice(false);
  };

  useEffect(() => {
    return () => {
      if (feeTimerRef.current) clearTimeout(feeTimerRef.current);
      if (feeCountdownRef.current) clearInterval(feeCountdownRef.current);
    };
  }, []);

  const handleSelectAppType = (type: 'caregiver' | 'resident') => {
    setAppType(type);
    if (type === 'resident') {
      startFeeNoticeTimer();
    } else {
      closeFeeNotice();
    }
  };

  const resetForm = () => {
    closeFeeNotice();
    setResidentForm(createInitialResidentFormState());
    setPhotoPreview(null);
    setReceiptPreview(null);
    setReceiptFileName(null);
    setReceiptFileType(null);
    setPayLaterWhatsApp(false);
    setCareerForm(createInitialCareerFormState('Senior Care Assistant'));
    submitLockRef.current = false;
    setIsSubmitting(false);
    setSubmitError(null);
    setSubmitted(false);
  };

  const handleCopyAccount = (textToCopy: string, accIdx: number) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedAcc(accIdx);
    if (textToCopy.toLowerCase().includes('samanthasappy')) {
      showToast('Account name "Samanthasappy world concept" copied!');
    } else {
      showToast(`Account number ${textToCopy} copied to clipboard!`);
    }
    setTimeout(() => setCopiedAcc(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitLockRef.current || isSubmitting || submitted) {
      return;
    }
    setSubmitError(null);

    let normalizedResidentWhatsApp = '';

    if (appType === 'resident') {
      if (!residentForm.fullName.trim()) {
        const msg = "Please enter the resident's Full Name in Section 1.";
        setSubmitError(msg);
        showToast(msg);
        return;
      }
      if (!residentForm.dateOfBirth || !residentForm.gender || !residentForm.maritalStatus || !residentForm.residentialAddress.trim()) {
        const msg = 'Please complete all required fields in Section 1 (Personal Information).';
        setSubmitError(msg);
        showToast(msg);
        return;
      }
      if (!residentForm.careTypeRequired || !residentForm.mobilityStatus || !residentForm.reasonForAdmission.trim()) {
        const msg = 'Please complete all required fields in Section 2 (Care Information).';
        setSubmitError(msg);
        showToast(msg);
        return;
      }
      if (!residentForm.nextOfKinName.trim() || !residentForm.nextOfKinRelationship || !residentForm.nextOfKinPhone.trim()) {
        const msg = 'Please complete Next of Kin Name, Relationship, and Phone Number in Section 3.';
        setSubmitError(msg);
        showToast(msg);
        return;
      }
      const parsedWhatsApp = normalizeInternationalWhatsAppNumber(residentForm.applicantWhatsApp);
      if (!parsedWhatsApp) {
        const msg = 'Please enter a valid required Applicant WhatsApp Number (international format supported, e.g. +234 801 234 5678).';
        setSubmitError(msg);
        showToast(msg);
        return;
      }
      normalizedResidentWhatsApp = parsedWhatsApp;

      const emailTrimmed = residentForm.nextOfKinEmail.trim();
      if (!emailTrimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
        const msg = 'Please enter a valid Email Address in Section 3.';
        setSubmitError(msg);
        showToast(msg);
        return;
      }
      if (residentForm.consentInfoAccurate !== true || residentForm.consentContactPermitted !== true) {
        const msg = 'Please confirm both Admission Consent checkboxes in Section 4.';
        setSubmitError(msg);
        showToast(msg);
        return;
      }
      if (residentForm.whatsappConsent !== true) {
        const msg = 'Please agree to receive WhatsApp notifications concerning this admission application in Section 4.';
        setSubmitError(msg);
        showToast(msg);
        return;
      }
      if (!residentForm.applicantGuardianName.trim() || !residentForm.applicantSignature.trim() || !residentForm.consentDate) {
        const msg = 'Please enter Name of Applicant / Guardian, Signature, and Date in Section 4.';
        setSubmitError(msg);
        showToast(msg);
        return;
      }
      if (!receiptPreview && !payLaterWhatsApp) {
        const msg = 'Please attach your payment receipt or select the WhatsApp payment verification option.';
        setSubmitError(msg);
        showToast(msg);
        return;
      }
    }

    if (appType === 'caregiver') {
      if (!careerForm.passportPhoto?.url) {
        showToast('Please upload your Recent Passport Photograph in Section 4.');
        return;
      }
      if (!careerForm.cv?.url) {
        showToast('Please attach your Curriculum Vitae (CV) in Section 4.');
        return;
      }
    }

    submitLockRef.current = true;
    try {
      setIsSubmitting(true);
      if (appType === 'caregiver') {
        const formattedRefs = [careerForm.ref1, careerForm.ref2]
          .filter((r) => r.name.trim() !== '')
          .map((r) => ({
            name: r.name.trim(),
            relationship: r.relationship.trim(),
            organisation: r.organisation.trim() || undefined,
            phone: r.phone.trim(),
            email: r.email.trim() || undefined,
            photoUrl: r.photoUrl || undefined,
          }));

        await submitApplication({
          type: 'caregiver',
          formType: 'caregiver_job_application',
          applicantName: careerForm.fullName.trim() || 'Caregiver Applicant',
          fullName: careerForm.fullName.trim() || 'Caregiver Applicant',
          email: careerForm.email.trim(),
          phone: careerForm.phone.trim(),
          dateOfBirth: careerForm.dateOfBirth,
          gender: careerForm.gender || undefined,
          whatsappNumber: careerForm.whatsappNumber.trim() || undefined,
          residentialAddress: careerForm.residentialAddress.trim(),
          cityState: careerForm.cityState.trim(),
          nationality: careerForm.nationality.trim() || undefined,
          highestQualification: careerForm.highestQualification,
          institutionName: careerForm.institutionName.trim(),
          courseOfStudy: careerForm.courseOfStudy.trim(),
          graduationYear: careerForm.graduationYear.trim(),
          professionalQualifications: careerForm.professionalQualifications.trim() || undefined,
          relevantCertifications: careerForm.relevantCertifications.trim() || undefined,
          hasPreviousCareExperience: careerForm.hasPreviousCareExperience,
          previousEmployer: careerForm.previousEmployer.trim() || undefined,
          previousJobTitle: careerForm.previousJobTitle.trim() || undefined,
          yearsOfExperience: careerForm.yearsOfExperience.trim() || undefined,
          previousResponsibilities: careerForm.previousResponsibilities.trim() || undefined,
          reasonForLeaving: careerForm.reasonForLeaving.trim() || undefined,
          photoUrl: careerForm.passportPhoto?.url,
          cvUrl: careerForm.cv?.url,
          cvName: careerForm.cv?.name,
          documents: {
            ...(careerForm.passportPhoto ? { passportPhoto: careerForm.passportPhoto } : {}),
            ...(careerForm.cv ? { cv: careerForm.cv } : {}),
            ...(careerForm.educationalCertificates ? { educationalCertificates: careerForm.educationalCertificates } : {}),
            ...(careerForm.professionalCertificates ? { professionalCertificates: careerForm.professionalCertificates } : {}),
            ...(careerForm.trainingCertificates ? { trainingCertificates: careerForm.trainingCertificates } : {}),
            ...(careerForm.validId ? { validId: careerForm.validId } : {}),
          },
          positionOrCategory: careerForm.position,
          notesOrStatement: careerForm.coverLetter.trim() || careerForm.previousResponsibilities.trim() || undefined,
          references: formattedRefs,
        });
      } else {
        const baseReason = residentForm.reasonForAdmission.trim() || 'Resident Care Admission Request';
        const applicantFullName = residentForm.applicantGuardianName.trim() || residentForm.fullName.trim();
        await submitApplication({
          type: 'resident',
          formType: 'resident_care_admission',
          applicantName: applicantFullName,
          applicantWhatsApp: normalizedResidentWhatsApp,
          whatsappNumber: normalizedResidentWhatsApp,
          whatsappConsent: Boolean(residentForm.whatsappConsent),
          fullName: residentForm.fullName.trim(),
          email: residentForm.nextOfKinEmail.trim(),
          phone: residentForm.nextOfKinPhone.trim(),
          dateOfBirth: residentForm.dateOfBirth,
          gender: residentForm.gender,
          maritalStatus: residentForm.maritalStatus,
          residentialAddress: residentForm.residentialAddress.trim(),
          careTypeRequired: residentForm.careTypeRequired || 'Long-term care',
          reasonForAdmission: residentForm.reasonForAdmission.trim(),
          existingMedicalConditions: residentForm.existingMedicalConditions.trim() || undefined,
          currentMedications: residentForm.currentMedications.trim() || undefined,
          specialCareRequirements: residentForm.specialCareRequirements.trim() || undefined,
          mobilityStatus: residentForm.mobilityStatus,
          nextOfKinName: residentForm.nextOfKinName.trim(),
          nextOfKinRelationship: residentForm.nextOfKinRelationship,
          nextOfKinPhone: residentForm.nextOfKinPhone.trim(),
          nextOfKinAltPhone: residentForm.nextOfKinAltPhone.trim() || undefined,
          nextOfKinEmail: residentForm.nextOfKinEmail.trim(),
          consentInfoAccurate: Boolean(residentForm.consentInfoAccurate),
          consentContactPermitted: Boolean(residentForm.consentContactPermitted),
          applicantGuardianName: residentForm.applicantGuardianName.trim(),
          applicantSignature: residentForm.applicantSignature.trim(),
          consentDate: residentForm.consentDate,
          photoUrl: photoPreview || undefined,
          receiptUrl: receiptPreview || undefined,
          receiptName: receiptFileName || (payLaterWhatsApp ? 'Payment Confirmation via WhatsApp (+234 706 933 2193)' : undefined),
          positionOrCategory: residentForm.careTypeRequired || 'Long-term care',
          notesOrStatement: payLaterWhatsApp
            ? `${baseReason}\n[Payment receipt will be shared via WhatsApp / In-person verification]`
            : baseReason,
          sponsorName: residentForm.nextOfKinName.trim()
            ? `${residentForm.nextOfKinName.trim()}${residentForm.nextOfKinRelationship ? ` (${residentForm.nextOfKinRelationship})` : ''}`
            : undefined,
          references: [],
        });
      }

      // Only show success after Firestore confirms save in submitApplication
      setSubmitted(true);
      showToast('Application saved and confirmed in Firestore!');
      if (appType === 'caregiver') {
        setTimeout(() => {
          setIsApplyModalOpen(false);
          resetForm();
        }, 3000);
      }
    } catch (err: any) {
      console.error('Submission error:', err);
      const errMessage = err?.message || 'Failed to save your application to Firestore. Please try again.';
      setSubmitError(errMessage);
      showToast(errMessage);
    } finally {
      submitLockRef.current = false;
      setIsSubmitting(false);
    }
  };

  if (!isApplyModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-100 max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-sky-800 via-teal-800 to-sky-900 px-5 sm:px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
              <UserCheck className="w-5 h-5 text-sky-200" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {submitted && appType === 'resident' ? 'Resident Care Payment Details' : 'Care Portal Application'}
              </h2>
              <p className="text-xs text-sky-100/90 font-medium">
                {submitted && appType === 'resident' ? 'Official Samanthasappy Bank Accounts' : 'Apply as a Caregiver or Request Resident Admission'}
              </p>
            </div>
          </div>
          <button 
            onClick={() => { setIsApplyModalOpen(false); resetForm(); }}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {submitted ? (
            <div className="py-4 space-y-5">
              <div className="text-center space-y-2">
                <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto animate-bounce" />
                <h3 className="text-xl font-extrabold text-slate-900">
                  {appType === 'resident' ? 'Resident Care Application Submitted Successfully!' : 'Caregiver Application Submitted!'}
                </h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Thank you, <span className="font-semibold text-slate-900">{appType === 'caregiver' ? careerForm.fullName : residentForm.fullName}</span>. Your {appType === 'caregiver' ? 'caregiver job application' : 'resident care admission request'} has been safely logged with our admin team.
                </p>

                {/* Dispatch Status Badges */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 border border-teal-200 text-teal-800 rounded-full text-xs font-semibold">
                    <Check className="w-3.5 h-3.5 text-teal-600" />
                    <span>Confirmed Saved in Cloud Firestore</span>
                  </div>
                  {appType === 'resident' && residentForm.whatsappConsent && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-xs font-semibold">
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp Notifications Enabled</span>
                    </div>
                  )}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-50 border border-sky-200 text-sky-800 rounded-full text-xs font-semibold">
                    <Check className="w-3.5 h-3.5 text-sky-600" />
                    <span>Admin Dashboard Inbox Notified</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-xs font-semibold">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Email Sent to Admin (samanthasappy@gmail.com)</span>
                  </div>
                </div>
              </div>

              {/* Samanthasappy Account Details Popup Card */}
              {appType === 'resident' && (
                <div className="bg-gradient-to-br from-slate-50 to-sky-50/50 rounded-2xl p-5 border border-sky-100 space-y-4 shadow-sm animate-in zoom-in-95 duration-200">
                  <div className="flex items-center gap-2.5 pb-2.5 border-b border-sky-200/60">
                    <div className="w-8 h-8 rounded-lg bg-sky-700 text-white flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Samanthasappy Bank Account Details</h4>
                      <p className="text-[11px] text-slate-500">Official accounts for resident care registration & admission fees</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Account 1 */}
                    <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2 relative hover:border-sky-300 transition-colors">
                      <div className="text-xs font-extrabold text-sky-800 uppercase tracking-wider flex items-center justify-between">
                        <span>Stanbic IBTC</span>
                        <span className="text-[10px] px-2 py-0.5 bg-sky-50 text-sky-700 rounded-full font-bold">Account 1</span>
                      </div>
                      <div>
                        <div className="text-[11px] text-slate-500 font-medium">Account Name</div>
                        <div className="text-xs font-bold text-slate-900">SAMANTHASAPP WORLD CONCEPT</div>
                      </div>
                      <div className="pt-1 flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <div>
                          <div className="text-[10px] text-slate-400 font-semibold uppercase">Account No</div>
                          <div className="text-base font-extrabold text-slate-900 tracking-wider font-mono">0005392596</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyAccount('0005392596', 1)}
                          className="px-2.5 py-1 text-xs bg-sky-700 hover:bg-sky-800 text-white rounded-lg flex items-center gap-1 font-bold transition-all cursor-pointer shadow-2xs"
                        >
                          {copiedAcc === 1 ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedAcc === 1 ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Account 2 */}
                    <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2 relative hover:border-teal-300 transition-colors">
                      <div className="text-xs font-extrabold text-teal-800 uppercase tracking-wider flex items-center justify-between">
                        <span>WEMA BANK</span>
                        <span className="text-[10px] px-2 py-0.5 bg-teal-50 text-teal-700 rounded-full font-bold">Account 2</span>
                      </div>
                      <div>
                        <div className="text-[11px] text-slate-500 font-medium">Account Name</div>
                        <div className="text-xs font-bold text-slate-900">SAMANTHASAPP WORLD CONCEPT</div>
                      </div>
                      <div className="pt-1 flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <div>
                          <div className="text-[10px] text-slate-400 font-semibold uppercase">Account No</div>
                          <div className="text-base font-extrabold text-slate-900 tracking-wider font-mono">0229796137</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyAccount('0229796137', 2)}
                          className="px-2.5 py-1 text-xs bg-teal-700 hover:bg-teal-800 text-white rounded-lg flex items-center gap-1 font-bold transition-all cursor-pointer shadow-2xs"
                        >
                          {copiedAcc === 2 ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedAcc === 2 ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Written below account details */}
                  <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 space-y-3">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-2 border-b border-emerald-200/70">
                      <div className="space-y-0.5 text-center sm:text-left">
                        <p className="text-xs font-bold text-emerald-900 capitalize tracking-tight flex items-center justify-center sm:justify-start gap-1.5">
                          <Receipt className="w-4 h-4 text-emerald-700" />
                          <span>Send Receipt via WhatsApp or Attach Here</span>
                        </p>
                        <p className="text-[11px] text-emerald-700 font-medium">
                          {receiptPreview ? (
                            <span className="font-bold text-emerald-800 flex items-center gap-1 mt-0.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
                              Receipt Attached: {receiptFileName || 'Proof of Payment'} (Logged with Admin)
                            </span>
                          ) : (
                            'Send proof of payment directly to our lead care administrator via WhatsApp (+234 706 933 2193) or attach below'
                          )}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {!receiptPreview && (
                          <label className="cursor-pointer px-3 py-2 bg-white hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-300 shadow-2xs transition-all flex items-center gap-1.5">
                            <Upload className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Attach Receipt</span>
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={handleReceiptUpload}
                              className="hidden"
                            />
                          </label>
                        )}
                        <a
                          href="https://wa.me/2347069332193?text=Hello%20Samanthasappy%20Care%20Home,%20I%20have%20submitted%20a%20Resident%20Care%20Application%20and%20completed%20the%20payment.%20Here%20is%20my%20payment%20receipt."
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Send via WhatsApp</span>
                        </a>
                      </div>
                    </div>

                    <p className="text-[10px] text-emerald-800/80 text-center sm:text-left italic">
                      Official Reference: SAMANTHASAPP WORLD CONCEPT • stanbic ibtc: 0005392596 | wema bank: 0229796137
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-center pt-2">
                <button
                  type="button"
                  onClick={() => { setIsApplyModalOpen(false); resetForm(); }}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all"
                >
                  Done & Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Toggle Category */}
              <div className="p-1.5 bg-slate-100/90 rounded-2xl flex items-center gap-2 border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => handleSelectAppType('caregiver')}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    appType === 'caregiver'
                      ? 'bg-sky-700 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <Stethoscope className="w-4 h-4" />
                  <span>Caregiver / Staff Job Application</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectAppType('resident')}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    appType === 'resident'
                      ? 'bg-teal-700 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <HeartHandshake className="w-4 h-4" />
                  <span>Resident Care Admission</span>
                </button>
              </div>

              {/* Popup Card: Resident Application fee is N10,000.00 (Disappears after 25s or when cancelled) */}
              {showFeeNotice && appType === 'resident' && (
                <div className="relative p-4 bg-gradient-to-r from-emerald-950 via-teal-900 to-sky-950 text-white rounded-2xl shadow-xl border-2 border-emerald-400/60 animate-in fade-in slide-in-from-top-2 duration-300 overflow-hidden">
                  {/* Progress bar countdown indicator (25s) */}
                  <div 
                    className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-300 transition-all duration-1000 ease-linear rounded-full"
                    style={{ width: `${(feeTimeLeft / 25) * 100}%` }}
                  />

                  <div className="flex items-start justify-between gap-3 relative z-10">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0 text-emerald-300 shadow-inner">
                        <Banknote className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-400/20 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-400/30">
                            Admission Notice
                          </span>
                          <span className="text-[11px] text-emerald-200/90 font-medium">
                            Auto-closes in {feeTimeLeft}s
                          </span>
                        </div>
                        <h4 className="text-sm sm:text-base font-extrabold text-white tracking-tight flex items-center gap-1.5">
                          <span>Resident Application fee is N10,000.00</span>
                        </h4>
                        <p className="text-xs text-slate-200 leading-relaxed">
                          Please note that a processing fee of <span className="font-bold text-emerald-300">₦10,000.00 (N10,000.00)</span> applies for resident admission. Kindly make payment using the official bank details below and attach the payment receipt to proceed.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={closeFeeNotice}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-colors shrink-0 cursor-pointer"
                      title="Cancel / Close notice"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Caregiver 5-Section Application vs Resident Care Admission */}
              {appType === 'caregiver' ? (
                <CareerApplicationFields
                  form={careerForm}
                  setForm={setCareerForm}
                  positionOptions={caregiverPositionOptions}
                  compact
                  onFileError={(msg) => showToast(msg)}
                />
              ) : (
                <>
                  {/* Photo Upload Section & Mini Bank Account Details Card */}
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-stretch">
                      {/* Left: Resident Photograph / ID */}
                      <div className="md:col-span-6 flex flex-col justify-between space-y-2">
                        <label className="block text-xs font-bold text-slate-800">
                          Resident Photograph / ID *
                        </label>
                        <div className="flex items-center gap-3">
                          <div className="w-18 h-18 rounded-2xl border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center overflow-hidden shrink-0 relative group">
                            {photoPreview ? (
                              <>
                                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => setPhotoPreview(null)}
                                  className="absolute inset-0 bg-slate-900/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                  title="Remove photo"
                                >
                                  <Trash2 className="w-4 h-4 text-red-400" />
                                </button>
                              </>
                            ) : (
                              <div className="text-center p-1.5 text-slate-400">
                                <ImageIcon className="w-5 h-5 mx-auto mb-0.5 text-slate-300" />
                                <span className="text-[9px]">No Photo</span>
                              </div>
                            )}
                          </div>

                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors">
                                <Upload className="w-3.5 h-3.5" />
                                <span>Attach Photograph</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handlePhotoUpload}
                                  className="hidden"
                                />
                              </label>
                              {photoPreview && (
                                <button
                                  type="button"
                                  onClick={() => setPhotoPreview(null)}
                                  className="px-2 py-1 text-[11px] text-red-600 hover:bg-red-50 rounded-lg border border-red-200 cursor-pointer"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-500 leading-tight">
                              Upload recent passport photograph or ID photo (PNG, JPG). Max 5MB.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Right: Mini Bank Account Details Card */}
                      <div className="md:col-span-6 p-3 bg-gradient-to-br from-amber-50/95 via-orange-50/60 to-amber-50/90 rounded-xl border border-amber-200/90 shadow-2xs space-y-2 flex flex-col justify-center">
                        <div className="flex items-center justify-between gap-1 border-b border-amber-200/80 pb-1.5">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Building2 className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                            <span className="text-[11px] font-bold text-amber-950 uppercase tracking-wide">
                              Official Bank Account Details
                            </span>
                          </div>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-200/80 text-amber-900 rounded-md shrink-0">
                            Verified
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          {/* Account Name */}
                          <div className="flex items-center justify-between gap-2 p-1.5 bg-white/95 rounded-lg border border-amber-200/80 shadow-2xs">
                            <div className="min-w-0">
                              <div className="text-[10px] font-semibold text-slate-500">Account Details / Name:</div>
                              <div className="text-xs font-extrabold text-amber-950 truncate tracking-tight">Samanthasappy world concept</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopyAccount('Samanthasappy world concept', 100)}
                              className="px-2.5 py-1 bg-amber-800 hover:bg-amber-900 text-white rounded-md text-[10px] font-bold flex items-center gap-1 shrink-0 transition-colors shadow-2xs cursor-pointer"
                              title="Copy Account Name"
                            >
                              {copiedAcc === 100 ? <Check className="w-3 h-3 text-emerald-200" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedAcc === 100 ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>

                          {/* Stanbic IBTC */}
                          <div className="flex items-center justify-between gap-2 p-1.5 bg-white/95 rounded-lg border border-amber-200/70 shadow-2xs">
                            <div className="min-w-0">
                              <div className="text-[10px] font-semibold text-slate-600 truncate">Bank Stanbic IBTC account number:</div>
                              <div className="text-xs font-extrabold font-mono text-slate-900 tracking-wide">0005392596</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopyAccount('0005392596', 101)}
                              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-[10px] font-bold flex items-center gap-1 shrink-0 transition-colors shadow-2xs cursor-pointer"
                              title="Copy Stanbic IBTC Account Number"
                            >
                              {copiedAcc === 101 ? <Check className="w-3 h-3 text-emerald-200" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedAcc === 101 ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>

                          {/* Wema Bank */}
                          <div className="flex items-center justify-between gap-2 p-1.5 bg-white/95 rounded-lg border border-amber-200/70 shadow-2xs">
                            <div className="min-w-0">
                              <div className="text-[10px] font-semibold text-slate-600 truncate">Wema bank Account number:</div>
                              <div className="text-xs font-extrabold font-mono text-slate-900 tracking-wide">0229796137</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopyAccount('0229796137', 102)}
                              className="px-2.5 py-1 bg-amber-700 hover:bg-amber-800 text-white rounded-md text-[10px] font-bold flex items-center gap-1 shrink-0 transition-colors shadow-2xs cursor-pointer"
                              title="Copy Wema Bank Account Number"
                            >
                              {copiedAcc === 102 ? <Check className="w-3 h-3 text-emerald-200" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedAcc === 102 ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Rebuilt Resident Care Admission Form (Sections 1–4) */}
                  <ResidentAdmissionFields
                    form={residentForm}
                    setForm={setResidentForm}
                  />
                </>
              )}

              {appType === 'resident' && (
                <div className="space-y-4">

                  {/* Attachment Button / Box for Receipt under Resident Care Admission */}
                  <div className={`p-4 rounded-2xl border transition-all space-y-3 ${receiptPreview ? 'bg-emerald-50/70 border-emerald-300' : 'bg-rose-50/50 border-rose-200'}`}>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
                        <Receipt className={`w-4 h-4 ${receiptPreview ? 'text-emerald-700' : 'text-rose-600'}`} />
                        <span>Attach Payment Receipt / Proof of Transfer *</span>
                      </label>
                      <span className="text-[10px] font-extrabold text-rose-700 bg-rose-100/90 px-2.5 py-0.5 rounded-full border border-rose-300 tracking-wider uppercase">
                        Mandatory
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Attach your bank transfer slip or deposit receipt for resident care admission processing. <span className="font-semibold text-rose-700">A receipt must be attached to enable form submission.</span>
                    </p>

                    {receiptPreview ? (
                      <div className="p-3 bg-white rounded-xl border border-emerald-200 shadow-2xs flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-lg border border-emerald-200 bg-emerald-50 flex items-center justify-center overflow-hidden shrink-0">
                            {receiptPreview.startsWith('data:image') || receiptFileType?.startsWith('image') ? (
                              <img src={receiptPreview} alt="Receipt Preview" className="w-full h-full object-cover" />
                            ) : (
                              <FileCheck className="w-6 h-6 text-emerald-600" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-900 truncate max-w-[200px] sm:max-w-[280px]">
                                {receiptFileName || 'payment_receipt.jpg'}
                              </span>
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                Attached & Verified
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500">Ready to submit with your application</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <label className="cursor-pointer px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-lg border border-emerald-200 transition-colors inline-flex items-center gap-1">
                            <Upload className="w-3 h-3 text-emerald-600" />
                            <span>Change</span>
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={handleReceiptUpload}
                              className="hidden"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => { setReceiptPreview(null); setReceiptFileName(null); setReceiptFileType(null); }}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors cursor-pointer"
                            title="Remove Receipt"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white/95 rounded-xl border border-dashed border-rose-300 shadow-2xs">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                            <Paperclip className="w-4 h-4" />
                          </div>
                          <div className="text-left">
                            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <span>Attach Bank Transfer Receipt / Slip</span>
                              <span className="text-rose-600 text-xs font-bold">*</span>
                            </div>
                            <div className="text-[10px] text-slate-500">PNG, JPG, PDF document (Max 10MB)</div>
                          </div>
                        </div>

                        <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all shrink-0">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Attach Receipt</span>
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={handleReceiptUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Inline Validation / Firestore Error Banner */}
              {submitError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Submit Controls */}
              <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
                {appType === 'resident' && (
                  <div className="w-full bg-amber-50/80 border border-amber-200 rounded-xl p-2.5 mb-2">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={payLaterWhatsApp}
                        onChange={(e) => setPayLaterWhatsApp(e.target.checked)}
                        className="mt-0.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                      />
                      <span className="text-[11px] text-slate-700 leading-snug">
                        <strong>WhatsApp / Direct Confirmation:</strong> I will forward my bank payment proof via WhatsApp to <strong>+234 706 933 2193</strong> or provide it upon physical admission.
                      </span>
                    </label>
                  </div>
                )}

                {appType === 'resident' && !receiptPreview && !payLaterWhatsApp ? (
                  <p className="text-[11px] text-rose-600 font-bold flex items-center gap-1.5 text-center sm:text-left">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>Attach receipt or check the WhatsApp option above to enable submission</span>
                  </p>
                ) : (
                  <div className="hidden sm:block" />
                )}

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => { setIsApplyModalOpen(false); resetForm(); }}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || (appType === 'resident' && !receiptPreview && !payLaterWhatsApp)}
                    className="px-6 py-2.5 text-xs font-bold bg-sky-700 hover:bg-sky-800 text-white rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none"
                    title={appType === 'resident' && !receiptPreview && !payLaterWhatsApp ? 'Please attach a payment receipt or select the WhatsApp verification option' : undefined}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Submitting Application...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>{appType === 'caregiver' ? 'Submit Caregiver Application' : 'Submit Resident Care Application'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
