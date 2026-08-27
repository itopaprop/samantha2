import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ServicesPage } from './pages/ServicesPage';
import { FacilitiesPage } from './pages/FacilitiesPage';
import { EventsPage } from './pages/EventsPage';
import { GalleryPage } from './pages/GalleryPage';
import { CareersPage } from './pages/CareersPage';
import { ContactPage } from './pages/ContactPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { RoofingPage } from './pages/RoofingPage';
import { RoofingGalleryPage } from './pages/RoofingGalleryPage';
import { RoofingContactPage } from './pages/RoofingContactPage';
import { BookConsultationModal } from './components/modals/BookConsultationModal';
import { ApplyNowModal } from './components/modals/ApplyNowModal';
import { WelcomePopupModal } from './components/modals/WelcomePopupModal';
import { ToastNotification } from './components/modals/ToastNotification';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled UI exception in App:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('shh_residents');
      localStorage.removeItem('shh_staff');
      localStorage.removeItem('shh_shifts');
    } catch {}
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">Application Auto-Recovery</h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                The care portal encountered an unexpected state. Click below to refresh and clear any corrupted temporary cache.
              </p>
            </div>
            <button
              onClick={this.handleReset}
              className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset & Reload App</span>
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const AppContent: React.FC = () => {
  const { currentPage } = useApp();

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'about':
        return <AboutPage />;
      case 'services':
        return <ServicesPage />;
      case 'facilities':
        return <FacilitiesPage />;
      case 'events':
        return <EventsPage />;
      case 'gallery':
        return <GalleryPage />;
      case 'careers':
        return <CareersPage />;
      case 'contact':
        return <ContactPage />;
      case 'login':
        return <LoginPage />;
      case 'dashboard':
        return <DashboardPage />;
      case 'roofing':
        return <RoofingPage />;
      case 'roofing-gallery':
        return <RoofingGalleryPage />;
      case 'roofing-contact':
        return <RoofingContactPage />;
      default:
        return <HomePage />;
    }
  };

  // Dashboards have their own integrated sidebars and controls
  const isDashboardView = currentPage === 'dashboard';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70 text-slate-800 font-sans antialiased selection:bg-sky-600 selection:text-white bg-grid-pattern relative">
      <Navbar />
      <main className="flex-1">
        {renderPage()}
      </main>
      {!isDashboardView && <Footer />}
      <BookConsultationModal />
      <ApplyNowModal />
      <WelcomePopupModal />
      <ToastNotification />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}

