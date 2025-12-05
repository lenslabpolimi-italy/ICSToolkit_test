"use client";

import React from 'react';

const HelpPage: React.FC = () => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-palanquin font-semibold text-app-header mb-6">Help & Support</h1>
      <div className="space-y-6 text-app-body-text font-roboto">
        <section>
          <h2 className="text-2xl font-palanquin font-medium text-app-header mb-3">Welcome to the Help Section</h2>
          <p>Here you can find information and guidance on how to use the ICS Toolkit effectively. If you have any questions or encounter issues, please refer to the sections below.</p>
        </section>

        <section>
          <h2 className="text-2xl font-palanquin font-medium text-app-header mb-3">How to Use the Toolkit</h2>
          <ul className="list-disc list-inside ml-4 space-y-2">
            <li><strong>Project Data Sheet:</strong> Start by filling in your project's basic information.</li>
            <li><strong>Qualitative Evaluation:</strong> Evaluate your existing product/system against LCD strategies and set priorities.</li>
            <li><strong>Eco-Ideas Boards:</strong> Brainstorm and generate new eco-ideas based on the strategies.</li>
            <li><strong>Evaluation Checklists:</strong> Assess the implementation of LCD strategies for your concepts (A and B).</li>
            <li><strong>Evaluation Radar:</strong> Visualize the evaluation results and compare your concepts.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-palanquin font-medium text-app-header mb-3">Troubleshooting Common Issues</h2>
          <ul className="list-disc list-inside ml-4 space-y-2">
            <li><strong>Page Not Loading:</strong> Ensure your internet connection is stable. If the issue persists, try refreshing the page or restarting the application.</li>
            <li><strong>Data Not Saving:</strong> The toolkit saves data locally in your browser. If you clear your browser's cache or use a different browser, your data may be lost.</li>
            <li><strong>Unexpected Behavior:</strong> If you experience any bugs or unexpected behavior, please report it to the LeNSlab team.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-palanquin font-medium text-app-header mb-3">Contact Support</h2>
          <p>For further assistance, please visit the <a href="https://www.lens-international.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">LeNSlab website</a> or reach out to our support team.</p>
        </section>
      </div>
    </div>
  );
};

export default HelpPage;