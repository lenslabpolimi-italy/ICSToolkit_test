"use client";

import React from 'react';

const CreditsPage: React.FC = () => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-palanquin font-semibold text-app-header mb-6">Credits</h1>
      <div className="space-y-6 text-app-body-text font-roboto">
        <section>
          <p>The ICS Toolkit was conceived by Prof. Carlo Vezzoli of the Department of Design at Politecnico di Milano, coordinator of the LeNSlab Polimi Research Group, which works on design and system innovation for sustainability.</p>
          <p>Several PhD students, researchers and interns have collaborated on its updating over the years.</p>
          <p>The latest updates for the digital toolkit were made by Razieh Soleimani, and for the functional part they were coordinated by Gabriele Tempesta, with support from Krastyo Kalachev, Luisa Valentina Arosa Cely, Chuyao Xin, Giuseppe Rizzi and María Camila Contreras Bello.</p>
        </section>
      </div>
    </div>
  );
};

export default CreditsPage;