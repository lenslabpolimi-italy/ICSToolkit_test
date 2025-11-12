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

  return (
    <div className="min-h-screen flex flex-col bg-white text-app-body-text font-roboto">
      <header className="bg-app-header text-white p-4 shadow-md">
        <div className="container mx-auto flex flex-col md:flex-row items-center md:justify-between">
          <h1 className="text-2xl font-palanquin font-semibold text-app-accent text-center md:text-left mb-2 md:mb-0">ICS Toolkit</h1>
          <nav className="mt-2 md:mt-0">
            <ul className="flex flex-wrap gap-2 md:gap-4 justify-center md:justify-start">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Button asChild variant="ghost" className={cn(
                    "text-white hover:bg-app-accent hover:text-app-header font-roboto-condensed",
                    location.pathname === item.path && "bg-app-accent text-app-header"
                  )}>
                    <Link to={item.path}>{item.label}</Link>
                  </Button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
      <main className="flex-grow container mx-auto p-4 relative">
        {children}
      </main>
      <MadeWithDyad />
    </div>
  );
};

export default Layout;