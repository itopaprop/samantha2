import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ServicesPage } from './pages/ServicesPage';
import { FacilitiesPage } from './pages/FacilitiesPage';
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
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
