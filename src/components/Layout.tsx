"use client";

import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { MadeWithDyad } from './made-with-dyad';

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/project-data', label: 'Project Data Sheet' },
  { path: '/qualitative-evaluation', label: 'Qualitative Evaluation' },
  { path: '/eco-ideas', label: 'Eco-Ideas Boards' },
  { path: '/evaluation-checklists', label: 'Evaluation Checklists' },
  { path: '/evaluation-radar', label: 'Evaluation Radar' },
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  // Combine "ICS Toolkit" with other nav items for consistent button styling
  const headerNavItems = [
    { path: '/', label: 'ICS Toolkit' }, // Keep this here for rendering order
    ...navItems,
  ];

  return (
    <div className="min-h-screen flex flex-col bg-app-page-background text-app-body-text font-roboto">
      <header className="bg-white text-app-header p-4 shadow-md sticky top-0 z-50">
        <div className="container mx-auto flex flex-col md:flex-row items-center md:justify-between">
          {/* LeNSlab Logo */}
          <div className="flex items-center mb-2 md:mb-0">
            <img
              src="/white- LeNSlab_logo 3-03.png"
              alt="LeNSlab Logo"
              className="h-12 mr-4 drop-shadow-sm" // Increased height to h-12
            />
          </div>
          <nav className="mt-2 md:mt-0">
            <ul className="flex flex-wrap gap-2 md:gap-4 justify-center md:justify-start">
              {headerNavItems.map((item) => (
                <li key={item.path}>
                  {item.path === '/' ? (
                    // Render "ICS Toolkit" as a clickable title
                    <Link to={item.path} className="text-app-accent text-2xl font-palanquin font-semibold hover:text-app-accent/90 transition-colors px-4 py-2">
                      {item.label}
                    </Link>
                  ) : (
                    // Render other nav items as buttons
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
      <main className="flex-grow container mx-auto p-4 pb-28 relative pt-52">
        {children}
      </main>
      <footer className="relative w-full">
        <MadeWithDyad />
        {/* Creative Commons Logo - Adjusted position */}
        <div className="absolute bottom-4 right-4">
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