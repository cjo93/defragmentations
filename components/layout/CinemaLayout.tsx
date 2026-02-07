
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  showNav?: boolean; 
  intensity?: 'low' | 'high';
}

export default function CinemaLayout({ children, showNav = true, intensity = 'low' }: LayoutProps) {
  return (
    <div className="relative min-h-full font-sans selection:bg-amber-900 selection:text-white">
      {/* 
         safe-area-inset logic is critical for iOS.
         'pt-[env(safe-area-inset-top)]' and 'pb-[env(safe-area-inset-bottom)]' ensure 
         content clears the iPhone Notch and Home Indicator.
      */}
      <div className="relative z-10 w-full h-full flex flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
        <div className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
          {children}
        </div>
      </div>
    </div>
  );
};
