"use client";

import React from 'react';

const HelpPage: React.FC = () => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md font-roboto">
      <h1 className="text-3xl font-palanquin font-semibold text-app-accent mb-6">How to Use the ICS Toolkit</h1>
      
      <section className="mb-8">
        <h2 className="text-2xl font-palanquin font-medium text-app-header mb-4">Welcome!</h2>
        <p className="text-lg text-app-body-text leading-relaxed">
          This toolkit is designed to help you evaluate and develop sustainable product-service systems (PSS) and circular economy solutions. It provides various tools to guide you through the process.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-palanquin font-medium text-app-header mb-4">Navigation</h2>
        <ul className="list-disc list-inside space-y-2 text-lg text-app-body-text">
          <li><strong>Project Data Sheet:</strong> Start here to input basic information about your project.</li>
          <li><strong>Qualitative Evaluation:</strong> Assess the qualitative aspects of your concepts.</li>
          <li><strong>Eco-Ideas Boards:</strong> Brainstorm and organize your eco-design ideas.</li>
          <li><strong>Evaluation Checklists:</strong> Use structured checklists to evaluate different criteria.</li>
          <li><strong>Radar:</strong> Visualize the performance of your concepts across various dimensions.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-palanquin font-medium text-app-header mb-4">Adding Notes/Ideas</h2>
        <p className="text-lg text-app-body-text leading-relaxed">
          Throughout the application, you'll find a floating "Add Note" button (a circle with a plus icon) at the bottom right of the screen. Click this button to add your ideas, observations, or notes related to the current section. These notes will be saved and can be reviewed later.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-palanquin font-medium text-app-header mb-4">Concepts A & B</h2>
        <p className="text-lg text-app-body-text leading-relaxed">
          The toolkit often distinguishes between "Concept A" (represented by red elements) and "Concept B" (represented by blue elements). This allows you to compare and contrast two different approaches or iterations of your project.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-palanquin font-medium text-app-header mb-4">Need More Help?</h2>
        <p className="text-lg text-app-body-text leading-relaxed">
          If you have further questions or encounter any issues, please refer to the project documentation or contact support.
        </p>
      </section>
    </div>
  );
};

export default HelpPage;