"use client";

import React from 'react';

const HelpPage: React.FC = () => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-palanquin font-semibold text-app-accent mb-6">How to Use the ICS Toolkit</h1>
      <div className="space-y-6 text-app-body-text font-roboto">
        <section>
          <h2 className="text-2xl font-palanquin font-medium text-app-header mb-3">Welcome to the ICS Toolkit!</h2>
          <p>This toolkit is designed to help you evaluate and develop sustainable product-service systems (PSS) and circular economy solutions. It guides you through various stages of project development and evaluation.</p>
        </section>

        <section>
          <h2 className="text-2xl font-palanquin font-medium text-app-header mb-3">Navigation</h2>
          <p>The navigation bar at the top allows you to access different sections of the toolkit:</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li><strong>ICS Toolkit (Home):</strong> Returns you to the main dashboard or landing page.</li>
            <li><strong>Project Data Sheet:</strong> Input and manage core data about your project.</li>
            <li><strong>Qualitative Evaluation:</strong> Conduct qualitative assessments of your project's aspects.</li>
            <li><strong>Eco-Ideas Boards:</strong> Brainstorm and organize eco-friendly ideas for your concepts.</li>
            <li><strong>Evaluation Checklists:</strong> Use structured checklists to ensure comprehensive evaluation.</li>
            <li><strong>Radar:</strong> Visualize your project's performance across various criteria using a radar chart.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-palanquin font-medium text-app-header mb-3">Key Features</h2>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li><strong>Concept A & Concept B:</strong> The toolkit often distinguishes between two concepts (A and B) to allow for comparative analysis. You'll see color-coded elements (red for Concept A, blue for Concept B) to help differentiate them.</li>
            <li><strong>Add Notes/Ideas:</strong> On pages like the Eco-Ideas Boards, you'll find a floating "+" button (red for Concept A, blue for Concept B) at the bottom right. Click this to add new ideas or notes related to the current concept.</li>
            <li><strong>Interactive Elements:</strong> Many sections feature interactive forms, sliders, and input fields to capture your data and insights.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-palanquin font-medium text-app-header mb-3">Getting Started</h2>
          <ol className="list-decimal list-inside ml-4 space-y-1">
            <li>Start by filling out the <strong>Project Data Sheet</strong> to establish your project's foundation.</li>
            <li>Move to <strong>Qualitative Evaluation</strong> to assess different aspects.</li>
            <li>Use the <strong>Eco-Ideas Boards</strong> to generate and organize sustainable ideas.</li>
            <li>Utilize <strong>Evaluation Checklists</strong> to systematically review your progress.</li>
            <li>Finally, review your project's overall performance on the <strong>Radar</strong> page.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-palanquin font-medium text-app-header mb-3">Need More Help?</h2>
          <p>If you have further questions or encounter any issues, please refer to the specific section documentation or contact support.</p>
        </section>
      </div>
    </div>
  );
};

export default HelpPage;