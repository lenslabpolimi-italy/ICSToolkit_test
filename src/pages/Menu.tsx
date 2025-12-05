"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Menu: React.FC = () => {
  const menuItems = [
    { path: '/project-data', label: 'Project Data Sheet' },
    { path: '/qualitative-evaluation', label: 'Qualitative Evaluation of Existing Products/Systems and Strategic Priorities' },
    { path: '/eco-ideas', label: 'Eco-Ideas Boards' },
    { path: '/evaluation-checklists', label: 'Evaluation of the Implementation of Life Cycle Design Strategies' },
    { path: '/evaluation-radar', label: 'Evaluation Radar' },
  ];

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-160px)] p-4 font-roboto">
      <h2 className="text-6xl font-palanquin font-extrabold text-white mb-8 text-center">ICS Toolkit</h2>
      <p className="text-xl text-white mb-12 text-center max-w-2xl">
        Welcome to your toolkit for practicing Life Cycle Design.<br />Select a section below to get started.
      </p>
      {/* This outer div centers the entire block of buttons */}
      <div className="flex flex-col gap-4 items-center"> 
        {/* This inner div will size itself to the widest button, and its children (buttons) will fill it */}
        <div className="flex flex-col gap-4 w-full max-w-fit"> 
          {menuItems.map((item) => (
            <Button asChild key={item.path} className="h-auto p-4 text-lg text-center bg-app-accent hover:bg-app-accent/90 text-white font-roboto-condensed w-full">
              <Link to={item.path} className="whitespace-normal flex-grow flex items-center justify-content px-4">
                {item.label}
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Menu;