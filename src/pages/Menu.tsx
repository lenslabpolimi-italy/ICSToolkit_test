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
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] p-4 font-roboto">
      <h2 className="text-4xl font-palanquin font-semibold text-app-header mb-8 text-center">ICS Toolkit</h2>
      <p className="text-xl text-app-body-text mb-12 text-center max-w-2xl">
        Welcome to your toolkit for practicing Life Cycle Design. Select a section below to get started.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl items-stretch">
        {menuItems.map((item) => (
          <Button 
            asChild 
            key={item.path} 
            className="h-auto p-6 text-lg text-left bg-app-accent hover:bg-app-accent/90 text-white hover:text-app-header font-roboto-condensed flex flex-col justify-between"
          >
            <Link to={item.path} className="whitespace-normal flex-grow flex items-center justify-center text-center">
              {item.label}
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default Menu;