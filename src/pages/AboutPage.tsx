"use client";

import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-palanquin font-semibold text-app-accent mb-6">About the ICS Toolkit & Licensing</h1>
      <div className="space-y-6 text-app-body-text font-roboto">
        <section>
          <h2 className="text-2xl font-palanquin font-medium text-app-header mb-3">About the ICS Toolkit</h2>
          <p>The ICS Toolkit is developed by LeNSlab to support the design and evaluation of innovative circular economy solutions and product-service systems. It provides a structured approach to guide users through various stages of project development, from initial data collection to qualitative evaluation and idea generation.</p>
          <p>Our goal is to foster sustainable innovation by providing accessible tools and methodologies for designers, researchers, and practitioners.</p>
        </section>

        <section>
          <h2 className="text-2xl font-palanquin font-medium text-app-header mb-3">Creative Commons License</h2>
          <p>This work is licensed under a <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Creative Commons Attribution 4.0 International License</a>.</p>
          <p>This means you are free to:</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li><strong>Share</strong> — copy and redistribute the material in any medium or format.</li>
            <li><strong>Adapt</strong> — remix, transform, and build upon the material for any purpose, even commercially.</li>
          </ul>
          <p>Under the following terms:</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li><strong>Attribution</strong> — You must give appropriate credit, provide a link to the license, and indicate if changes were made. You may do so in any reasonable manner, but not in any way that suggests the licensor endorses you or your use.</li>
          </ul>
          <p>For more details, please visit the official Creative Commons website.</p>
        </section>

        <section>
          <h2 className="text-2xl font-palanquin font-medium text-app-header mb-3">Contact & Support</h2>
          <p>For inquiries or support, please visit the LeNSlab website or contact us through the provided channels.</p>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;