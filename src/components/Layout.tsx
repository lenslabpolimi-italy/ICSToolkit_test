"use client";

import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { MadeWithDyad } from './made-with-dyad';
import { Info, HelpCircle } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/project-data', label: 'Project Data Sheet' },
  { path: '/qualitative-evaluation', label: 'Qualitative Evaluation' },
  { path: '/eco-ideas', label: 'Eco-Ideas Boards' },
  { path: '/evaluation-checklists', label: 'Evaluation Checklists' },
  { path: '/evaluation-radar', label: 'Radar' },
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const isHomePage = location.pathname === '/';

  // Combine "ICS Toolkit" with other nav items for consistent button styling
  const headerNavItems = [
    { path: '/', label: 'ICS Toolkit' },
    ...navItems,
  ];

  return (
    <div className={cn(
      "min-h-screen flex flex-col text-app-body-text font-roboto",
      isHomePage ? "bg-app-concept-b-dark" : "bg-app-page-background"
    )}>
      <header className="bg-white text-app-header p-4 shadow-md sticky top-0 z-[999]">
        <div className="container mx-auto flex flex-col md:flex-row items-center md:justify-between">
          {/* LeNSlab Logo */}
          <div className="flex items-center mb-2 md:mb-0">
            <img
              src="/white- LeNSlab_logo 3-03.png"
              alt="LeNSlab Logo"
              className="h-12 mr-4 drop-shadow-sm"
            />
          </div>
          <nav className="mt-2 md:mt-0">
            <ul className="flex flex-wrap gap-2 md:gap-4 justify-center md:justify-start">
              {headerNavItems.map((item) => (
                <li key={item.path}>
                  {item.path === '/' ? (
                    // Render "ICS Toolkit" as a clickable title with app-accent text
                    <Link to={item.path} className="text-app-accent text-2xl font-palanquin font-semibold hover:text-app-accent/90 transition-colors px-4 py-2">
                      {item.label}
                    </Link>
                  ) : (
                    // Render other nav items as buttons with app-accent hover/active states
                    <Button asChild variant="ghost" className={cn(
                      "text-app-header hover:bg-app-accent hover:text-white font-roboto-condensed",
                      location.pathname === item.path && "bg-app-accent text-white"
                    )}>
                      <Link to={item.path}>{item.label}</Link>
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
      <main className="flex-grow container mx-auto p-4 pb-28 relative pt-12">
        {children}
      </main>
      <footer className="relative w-full py-4">
        <MadeWithDyad />
        
        {/* HelpCircle icon on the left */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-app-accent flex items-center justify-center text-white cursor-pointer hover:bg-app-accent/90 transition-colors">
            <HelpCircle size={20} />
          </div>
        </div>

        {/* Creative Commons Logo and Info icon - Adjusted position */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-app-accent flex items-center justify-center text-white cursor-pointer hover:bg-app-accent/90 transition-colors">
            <Info size={20} />
          </div>
          <img
            src="/Creative Commons Logo - CC_by.svg"
            alt="Creative Commons Logo"
            className="h-9"
          />
        </div>
      </footer>
    </div>
  );
};

export default Layout;