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

  return (
    <div className="relative min-h-screen flex flex-col items-center">
      {/* Background Atmosphere */}
      <div className={`atmosphere transition-opacity duration-1000 ${isImmersive ? 'opacity-20 translate-y-10' : 'opacity-100'}`} />
      
      <NavigationBar />
      
      <main className={`flex-1 w-full flex flex-col items-center transition-all duration-700 ${
        isImmersive ? 'pt-4 md:pt-8' : 'pt-24 md:pt-32'
      }`}>
        {children}
      </main>

      {!isImmersive && <Footer />}
    </div>
  );
};

export default MainLayout;
