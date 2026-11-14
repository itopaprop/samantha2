import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { INITIAL_JOB_VACANCIES, INITIAL_TRAINING_PROGRAMS } from '../data/initialData';
import { 
  Briefcase, 
  GraduationCap, 
  CheckCircle2, 
  MapPin, 
  Send, 
  BookOpen,
  Loader2
} from 'lucide-react';
import {
  CareerApplicationFields,
  CareerFormState,
  createInitialCareerFormState,
} from '../components/forms/CareerApplicationFields';

export const CareersPage: React.FC = () => {
  const { showToast, jobs, submitApplication, syncDatabase } = useApp();

  // Auto-fetch latest live jobs on mount
  React.useEffect(() => {
    if (syncDatabase) {
      syncDatabase().catch(() => {});
    }
  }, [syncDatabase]);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<CareerFormState>(() =>
    createInitialCareerFormState('Senior Care Assistant')
  );

  const positionOptions = React.useMemo(() => {
    const jobTitles = jobs.map((j) => j.title);
    const trainingTitles = INITIAL_TRAINING_PROGRAMS.map((p) => `Trainee - ${p.title}`);
    return [
      ...jobTitles,
      'Caregiver',
      'Senior Care Assistant',
      'Child Care Assistant',
      'Registered Nurse (RN)',
      'Healthcare Administrator',
      ...trainingTitles,
    ];
  }, [jobs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.passportPhoto?.url) {
      showToast('Please upload your Recent Passport Photograph in Section 4.');
      return;
    }
    if (!form.cv?.url) {
      showToast('Please attach your Curriculum Vitae (CV) in Section 4.');
      return;
    }

    const formattedRefs = [form.ref1, form.ref2]
      .filter(r => r.name.trim() !== '')
      .map(r => ({
        name: r.name.trim(),
        relationship: r.relationship.trim(),
        organisation: r.organisation.trim() || undefined,
        phone: r.phone.trim(),
        email: r.email.trim() || undefined,
        photoUrl: r.photoUrl || undefined,
      }));

    try {
      setIsSubmitting(true);
      await submitApplication({
        type: 'caregiver',
        fullName: form.fullName.trim() || 'Job Applicant',
        email: form.email.trim(),
        phone: form.phone.trim(),
        dateOfBirth: form.dateOfBirth,
        gender: form.gender || undefined,
        whatsappNumber: form.whatsappNumber.trim() || undefined,
        residentialAddress: form.residentialAddress.trim(),
        cityState: form.cityState.trim(),
        nationality: form.nationality.trim() || undefined,
        highestQualification: form.highestQualification,
        institutionName: form.institutionName.trim(),
        courseOfStudy: form.courseOfStudy.trim(),
        graduationYear: form.graduationYear.trim(),
        professionalQualifications: form.professionalQualifications.trim() || undefined,
        relevantCertifications: form.relevantCertifications.trim() || undefined,
        hasPreviousCareExperience: form.hasPreviousCareExperience,
        previousEmployer: form.previousEmployer.trim() || undefined,
        previousJobTitle: form.previousJobTitle.trim() || undefined,
        yearsOfExperience: form.yearsOfExperience.trim() || undefined,
        previousResponsibilities: form.previousResponsibilities.trim() || undefined,
        reasonForLeaving: form.reasonForLeaving.trim() || undefined,
        photoUrl: form.passportPhoto?.url,
        cvUrl: form.cv?.url,
        cvName: form.cv?.name,
        documents: {
          ...(form.passportPhoto ? { passportPhoto: form.passportPhoto } : {}),
          ...(form.cv ? { cv: form.cv } : {}),
          ...(form.educationalCertificates ? { educationalCertificates: form.educationalCertificates } : {}),
          ...(form.professionalCertificates ? { professionalCertificates: form.professionalCertificates } : {}),
          ...(form.trainingCertificates ? { trainingCertificates: form.trainingCertificates } : {}),
          ...(form.validId ? { validId: form.validId } : {}),
        },
        positionOrCategory: form.position,
        notesOrStatement: form.coverLetter.trim() || form.previousResponsibilities.trim() || undefined,
        references: formattedRefs,
      });

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setForm(createInitialCareerFormState('Senior Care Assistant'));
      }, 3500);
    } catch (err: any) {
      console.error('Submission error:', err);
      showToast(err?.message || 'Error submitting application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
            <form onSubmit={handleSubmit} className="space-y-5">
              <CareerApplicationFields
                form={form}
                setForm={setForm}
                positionOptions={positionOptions}
                onFileError={(msg) => showToast(msg)}
              />

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-sky-700 hover:bg-sky-800 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting Application...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Application</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

    </div>
  );
};
