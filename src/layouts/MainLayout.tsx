import React from 'react';
import { useLocation } from 'react-router-dom';
import { NavigationBar } from '../components/layout/NavigationBar';
import { Footer } from '../components/layout/Footer';
import { useAppContext } from '../context/AppContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { isImmersive } = useAppContext();
  const location = useLocation();
  const hideFooter = isImmersive || location.pathname === '/test' || location.pathname === '/test-plus';

  return (
    <div className="relative min-h-screen w-[90vw] max-w-[90vw] mx-auto flex flex-col items-center">
      {/* Background Atmosphere */}
      <div className={`atmosphere transition-opacity duration-1000 ${isImmersive ? 'opacity-20 translate-y-10' : 'opacity-100'}`} />
      
      <NavigationBar />
      
      <main className="flex-1 w-full flex flex-col items-center pt-24 md:pt-28 transition-all duration-700">
        {children}
      </main>

      {!hideFooter && <Footer />}
    </div>
  );
};

export default MainLayout;
