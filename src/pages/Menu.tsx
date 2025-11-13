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
      <h2 className="text-4xl font-palanquin font-semibold text-app-header mb-8 text-center">ICS Toolkit</h2>
      <p className="text-xl text-app-body-text mb-12 text-center max-w-2xl">
        Welcome to your toolkit for practicing Life Cycle Design. Select a section below to get started.
      </p>
      {/* Removed max-w-md and w-full from this div to allow buttons to size based on content */}
      <div className="flex flex-col gap-4 items-center"> 
        {menuItems.map((item) => (
          <Button asChild key={item.path} className="h-auto p-4 text-lg text-center bg-app-accent hover:bg-app-accent/90 text-white font-roboto-condensed max-w-full">
            <Link to={item.path} className="whitespace-normal flex-grow flex items-center justify-center px-4"> {/* Added px-4 for internal padding */}
              {item.label}
            </Link>
          </Button>
        ))}
      </div>

      {/* LeNSlab Logo */}
      <div className="absolute bottom-4 left-4">
        <img
          src="/white- LeNSlab_logo 3-03.png"
          alt="LeNSlab Logo"
          className="h-12" // Adjust height as needed
        />
      </div>

      {/* Creative Commons Logo */}
      <div className="absolute bottom-4 right-4">
        <img
          src="/Creative Commons Logo - CC_by.svg"
          alt="Creative Commons Logo"
          className="h-10" // Adjust height as needed
        />
      </div>
    </div>
  );
};

export default Menu;