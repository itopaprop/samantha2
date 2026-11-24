import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Download, Eye, FileText, Loader2, Printer, AlertCircle, ArrowLeft } from 'lucide-react';
import {
  generateResidentAdmissionPdfClient,
  generateCaregiverApplicationPdfClient,
  generateConsultationPdfClient,
  generateInquiryPdfClient,
  triggerBlobDownload,
} from '../lib/clientPdfGenerator';

interface FormViewerPageProps {
  kind: 'application' | 'consultation' | 'inquiry';
  recordId: string;
  onBackHome: () => void;
}

export const FormViewerPage: React.FC<FormViewerPageProps> = ({
  kind,
  recordId,
  onBackHome,
}) => {
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfFilename, setPdfFilename] = useState('Submitted_Form.pdf');
  const [tab, setTab] = useState<'pdf' | 'sheet'>('pdf');

  useEffect(() => {
    let active = true;
    let createdUrl: string | null = null;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        let found: any = null;
        const primaryCollection =
          kind === 'application'
            ? 'applications'
            : kind === 'consultation'
            ? 'consultations'
            : 'messages';

        const snap = await getDoc(doc(db, primaryCollection, recordId));
        if (snap.exists()) {
          found = { ...snap.data(), id: snap.id };
        } else if (kind === 'inquiry') {
          const inqSnap = await getDoc(doc(db, 'inquiries', recordId));
          if (inqSnap.exists()) {
            found = { ...inqSnap.data(), id: inqSnap.id };
          }
        }

        if (!found) {
          // Fallback to API record lookup when Express backend is active
          const apiRoute =
            kind === 'application'
              ? '/api/applications'
              : kind === 'consultation'
              ? '/api/consultations'
              : '/api/messages';
          const listRes = await fetch(apiRoute).catch(() => null);
          if (listRes && listRes.ok) {
            const list = await listRes.json().catch(() => []);
            if (Array.isArray(list)) {
              found = list.find((item: any) => item.id === recordId) || null;
            }
          }
        }

        if (!active) return;
        if (!found) {
          setError('Submitted form record could not be located in Cloud Firestore.');
          setLoading(false);
          return;
        }

        setRecord(found);

        let pdfRes;
        if (kind === 'application') {
          const isRes =
            found.type === 'resident' || found.formType === 'resident_care_admission';
          pdfRes = isRes
            ? await generateResidentAdmissionPdfClient(found)
            : await generateCaregiverApplicationPdfClient(found);
        } else if (kind === 'consultation') {
          pdfRes = await generateConsultationPdfClient(found);
        } else {
          pdfRes = await generateInquiryPdfClient(found);
        }

        if (!active) return;
        createdUrl = URL.createObjectURL(pdfRes.blob);
        setPdfBlob(pdfRes.blob);
        setPdfBlobUrl(createdUrl);
        setPdfFilename(pdfRes.filename);
      } catch (err: any) {
        if (active) {
          setError(err?.message || 'Unable to load form record.');
        }
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [kind, recordId]);

  const handleDownload = () => {
    if (pdfBlob) {
      triggerBlobDownload(pdfBlob, pdfFilename);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <header className="bg-[#0f172a] text-white px-4 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <img
            src="/assets/aistudio/Heart-Care_Medical_Emblem_b4b952cf.png"
            alt="Samanthasappy Care Home"
            className="w-10 h-10 object-contain rounded-lg bg-white p-1"
          />
          <div>
            <h1 className="text-base sm:text-lg font-extrabold">
              Samanthasappy Care Home — Submitted Form Viewer
            </h1>
            <p className="text-xs text-slate-300 font-mono">
              {record?.fullName || record?.applicantName || recordId}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {record && (
            <>
              <div className="flex items-center bg-slate-800 rounded-lg p-0.5 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setTab('pdf')}
                  className={`px-3 py-1.5 rounded-md cursor-pointer flex items-center gap-1.5 ${
                    tab === 'pdf' ? 'bg-sky-600 text-white' : 'text-slate-300'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Editable PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTab('sheet')}
                  className={`px-3 py-1.5 rounded-md cursor-pointer flex items-center gap-1.5 ${
                    tab === 'sheet' ? 'bg-teal-600 text-white' : 'text-slate-300'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Form Sheet</span>
                </button>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
              <button
                type="button"
                onClick={handleDownload}
                disabled={!pdfBlob}
                className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            </>
          )}
          <button
            type="button"
            onClick={onBackHome}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Care Portal</span>
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 flex flex-col">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-600 py-20">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600 mb-3" />
            <p className="text-sm font-bold">Loading submitted form from Cloud Firestore...</p>
          </div>
        ) : error ? (
          <div className="max-w-lg mx-auto my-12 bg-white rounded-2xl border border-rose-200 p-6 text-center space-y-4 shadow-sm">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <h2 className="text-lg font-extrabold text-slate-900">Form Not Available</h2>
            <p className="text-sm text-slate-600">{error}</p>
            <button
              type="button"
              onClick={onBackHome}
              className="px-5 py-2.5 bg-teal-600 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Go to Samanthasappy Care Home
            </button>
          </div>
        ) : tab === 'pdf' && pdfBlobUrl ? (
          <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[78vh] flex flex-col">
            <iframe
              src={pdfBlobUrl}
              title={pdfFilename}
              className="w-full flex-1 min-h-[78vh] border-0"
            />
          </div>
        ) : (
          <div className="max-w-4xl w-full mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900 border-b pb-3">
              Submitted Form Record
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {Object.entries(record || {})
                .filter(
                  ([k, v]) =>
                    v !== null &&
                    v !== undefined &&
                    typeof v !== 'object' &&
                    !String(v).startsWith('data:') &&
                    k !== 'documents'
                )
                .map(([key, val]) => (
                  <div key={key} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <div className="text-[10px] font-extrabold uppercase text-slate-500">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </div>
                    <div className="font-semibold text-slate-900 mt-0.5 wrap-break-word">
                      {String(val)}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
