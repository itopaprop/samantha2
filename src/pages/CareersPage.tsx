import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { INITIAL_JOB_VACANCIES, INITIAL_TRAINING_PROGRAMS } from '../data/initialData';
import { 
  Briefcase, 
  GraduationCap, 
  CheckCircle2, 
  MapPin, 
  Clock, 
  Send, 
  Paperclip, 
  Award,
  BookOpen,
  Upload,
  Image as ImageIcon,
  Trash2,
  Users
} from 'lucide-react';

export const CareersPage: React.FC = () => {
  const { showToast, jobs } = useApp();
  const [selectedPosition, setSelectedPosition] = useState<string>('Senior Care Assistant');
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    position: 'Senior Care Assistant',
    coverLetter: '',
    cvFile: null as File | null,
    photoUrl: null as string | null,
    ref1: { name: '', relationship: '', phone: '', email: '', photoUrl: null as string | null },
    ref2: { name: '', relationship: '', phone: '', email: '', photoUrl: null as string | null },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    showToast(`Application submitted for ${form.position}!`);
    setTimeout(() => {
      setSubmitted(false);
      setForm({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        position: 'Senior Care Assistant',
        coverLetter: '',
        cvFile: null,
        photoUrl: null,
        ref1: { name: '', relationship: '', phone: '', email: '', photoUrl: null },
        ref2: { name: '', relationship: '', phone: '', email: '', photoUrl: null },
      });
    }, 3000);
  };

  return (
    <div className="space-y-16 pb-16">
      
      {/* Header Banner */}
      <section className="bg-slate-900 text-white py-16 text-center space-y-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Careers & Accredited Training
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-2">
            Build a Fulfilling Career in Healthcare
          </h1>
          <p className="text-slate-300 text-base max-w-2xl mx-auto leading-relaxed">
            Join our dedicated team of nurses and care assistants, or enroll in our CPD accredited caregiver training diplomas.
          </p>
        </div>
      </section>

      {/* Career Vacancies Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sky-700 font-bold text-xs uppercase tracking-wider">
            <Briefcase className="w-4 h-4" /> Current Vacancies
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Open Employment Positions</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-md uppercase border border-amber-100">
                      {job.department}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 mt-1">{job.title}</h3>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 shrink-0">
                    {job.type}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-sky-600" /> {job.location}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {job.description}
                </p>

                <div className="pt-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Requirements:</div>
                  <ul className="space-y-1 text-xs text-slate-700">
                    {job.requirements.map((req, ridx) => (
                      <li key={ridx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <button
                  onClick={() => {
                    setForm({ ...form, position: job.title });
                    const formElement = document.getElementById('apply-form');
                    formElement?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-colors cursor-pointer"
                >
                  Apply for {job.title}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Training Programs Section */}
      <section className="bg-slate-50 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="space-y-2 text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 text-teal-700 font-bold text-xs uppercase tracking-wider bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
              <GraduationCap className="w-4 h-4" /> Professional Development
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">CPD Accredited Training Programs</h2>
            <p className="text-slate-600 text-sm">
              Develop certified healthcare skills in dementia care, child protection, first aid, and safeguarding.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {INITIAL_TRAINING_PROGRAMS.map((prog) => (
              <div key={prog.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{prog.title}</h3>
                  <div className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md inline-block">
                    {prog.duration} • {prog.certification}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {prog.description}
                  </p>

                  <div className="pt-2">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Course Modules:</div>
                    <ul className="space-y-1 text-xs text-slate-700">
                      {prog.modules.map((m, midx) => (
                        <li key={midx} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setForm({ ...form, position: `Trainee - ${prog.title}` });
                      const formElement = document.getElementById('apply-form');
                      formElement?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-colors cursor-pointer"
                  >
                    Enroll in Training Program
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Apply Form Section */}
      <section id="apply-form" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-sky-700 uppercase tracking-wider bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
              Career & Training Application
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Apply to Join Samanthasappy Home</h2>
            <p className="text-sm text-slate-600">
              Submit your CV and details. Our recruitment team responds within 48 hours.
            </p>
          </div>

          {submitted ? (
            <div className="p-8 text-center space-y-3 bg-emerald-50 rounded-2xl border border-emerald-200">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-xl font-bold text-slate-900">Application Received!</h3>
              <p className="text-sm text-slate-700">
                Thank you, <span className="font-semibold">{form.fullName}</span>. Your application for <span className="font-semibold">{form.position}</span> has been saved safely into our hiring pipeline.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Applicant Photo / Image Holder */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-800 mb-2">Applicant Photo / Passport ID *</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center overflow-hidden shrink-0 relative group">
                    {form.photoUrl ? (
                      <>
                        <img src={form.photoUrl} alt="Applicant photo preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, photoUrl: null })}
                          className="absolute inset-0 bg-slate-900/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                          title="Remove photo"
                        >
                          <Trash2 className="w-5 h-5 text-red-400" />
                        </button>
                      </>
                    ) : (
                      <div className="text-center p-2 text-slate-400">
                        <ImageIcon className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                        <span className="text-[10px]">No Photo</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-1.5 bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                      {form.photoUrl && (
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, photoUrl: null })}
                          className="px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-xl border border-red-200 cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Upload your recent passport-sized photograph or ID image (PNG, JPG). Max 5MB.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Eleanor Davis"
                    value={form.fullName}
                    onChange={e => setForm({ ...form, fullName: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="eleanor@example.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+44 7700 900123"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Position Applied For *</label>
                  <select
                    value={form.position}
                    onChange={e => setForm({ ...form, position: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="Caregiver">Caregiver</option>
                    <option value="Senior Care Assistant">Senior Care Assistant</option>
                    <option value="Child Care Assistant">Child Care Assistant</option>
                    <option value="Registered Nurse (RN)">Nurse (RN)</option>
                    <option value="Administrator">Healthcare Administrator</option>
                    <option value="Trainee - Professional Caregiver Certification">Trainee - Professional Caregiver Certification</option>
                    <option value="Trainee - Dementia Care Specialist">Trainee - Dementia Care Specialist</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Residential Address *</label>
                <input
                  type="text"
                  required
                  placeholder="Street address, City, Postcode"
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Upload CV / Resume (PDF / Word) *</label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium border border-slate-200">
                    <Paperclip className="w-4 h-4 text-sky-600" />
                    <span>{form.cvFile ? form.cvFile.name : 'Choose File to Attach'}</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={e => setForm({ ...form, cvFile: e.target.files ? e.target.files[0] : null })}
                      className="hidden"
                    />
                  </label>
                  {form.cvFile && (
                    <span className="text-xs text-emerald-600 font-medium">CV Attached</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Cover Letter & Care Motivation</label>
                <textarea
                  rows={3}
                  placeholder="Share why you are passionate about joining Samanthasappy Home..."
                  value={form.coverLetter}
                  onChange={e => setForm({ ...form, coverLetter: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
                ></textarea>
              </div>

              {/* 2 References Section */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider text-sky-800">
                  <Users className="w-4 h-4 text-sky-600" /> Professional & Character References (2 Required)
                </h4>

                {/* Reference 1 */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2.5">
                  <span className="text-[11px] font-bold text-sky-700 block">Reference 1 (Primary Employer / Line Manager)</span>
                  
                  {/* Reference 1 Image Holder */}
                  <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg border border-slate-200/80">
                    <div className="w-12 h-12 rounded-lg border border-dashed border-slate-300 bg-white flex items-center justify-center overflow-hidden shrink-0 relative group">
                      {form.ref1.photoUrl ? (
                        <>
                          <img src={form.ref1.photoUrl} alt="Ref 1" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, ref1: { ...form.ref1, photoUrl: null } })}
                            className="absolute inset-0 bg-slate-900/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                            title="Remove photo"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        </>
                      ) : (
                        <ImageIcon className="w-4 h-4 text-slate-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-md border border-sky-200 transition-colors">
                          <Upload className="w-3 h-3 text-sky-600" />
                          <span>{form.ref1.photoUrl ? 'Change Photo/Doc' : 'Attach Ref Photo / Letter ID'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => setForm(f => ({ ...f, ref1: { ...f.ref1, photoUrl: reader.result as string } }));
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                        {form.ref1.photoUrl && (
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, ref1: { ...form.ref1, photoUrl: null } })}
                            className="text-[10px] text-red-600 hover:underline"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">Attach referee ID photo, passport copy or reference letter image</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Referee Full Name *"
                      value={form.ref1.name}
                      onChange={e => setForm({ ...form, ref1: { ...form.ref1, name: e.target.value } })}
                      className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-sky-500"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Relationship / Role (e.g. Ward Manager) *"
                      value={form.ref1.relationship}
                      onChange={e => setForm({ ...form, ref1: { ...form.ref1, relationship: e.target.value } })}
                      className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Phone Number *"
                      value={form.ref1.phone}
                      onChange={e => setForm({ ...form, ref1: { ...form.ref1, phone: e.target.value } })}
                      className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-sky-500"
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={form.ref1.email}
                      onChange={e => setForm({ ...form, ref1: { ...form.ref1, email: e.target.value } })}
                      className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                </div>

                {/* Reference 2 */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2.5">
                  <span className="text-[11px] font-bold text-sky-700 block">Reference 2 (Secondary Employer / Academic / Character Referee)</span>
                  
                  {/* Reference 2 Image Holder */}
                  <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg border border-slate-200/80">
                    <div className="w-12 h-12 rounded-lg border border-dashed border-slate-300 bg-white flex items-center justify-center overflow-hidden shrink-0 relative group">
                      {form.ref2.photoUrl ? (
                        <>
                          <img src={form.ref2.photoUrl} alt="Ref 2" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, ref2: { ...form.ref2, photoUrl: null } })}
                            className="absolute inset-0 bg-slate-900/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                            title="Remove photo"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        </>
                      ) : (
                        <ImageIcon className="w-4 h-4 text-slate-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-md border border-sky-200 transition-colors">
                          <Upload className="w-3 h-3 text-sky-600" />
                          <span>{form.ref2.photoUrl ? 'Change Photo/Doc' : 'Attach Ref Photo / Letter ID'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => setForm(f => ({ ...f, ref2: { ...f.ref2, photoUrl: reader.result as string } }));
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                        {form.ref2.photoUrl && (
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, ref2: { ...form.ref2, photoUrl: null } })}
                            className="text-[10px] text-red-600 hover:underline"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">Attach referee ID photo, passport copy or reference letter image</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Referee Full Name *"
                      value={form.ref2.name}
                      onChange={e => setForm({ ...form, ref2: { ...form.ref2, name: e.target.value } })}
                      className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-sky-500"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Relationship / Role (e.g. Tutor / Former Employer) *"
                      value={form.ref2.relationship}
                      onChange={e => setForm({ ...form, ref2: { ...form.ref2, relationship: e.target.value } })}
                      className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Phone Number *"
                      value={form.ref2.phone}
                      onChange={e => setForm({ ...form, ref2: { ...form.ref2, phone: e.target.value } })}
                      className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-sky-500"
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={form.ref2.email}
                      onChange={e => setForm({ ...form, ref2: { ...form.ref2, email: e.target.value } })}
                      className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-sky-700 hover:bg-sky-800 text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  Submit Application
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

    </div>
  );
};
