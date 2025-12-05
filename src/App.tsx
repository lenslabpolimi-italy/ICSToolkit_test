"use client";

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import IndexPage from './pages/Index';
import ProjectDataSheet from './pages/ProjectDataSheet';
import QualitativeEvaluation from './pages/QualitativeEvaluation';
import EcoIdeasBoards from './pages/EcoIdeasBoards';
import EvaluationChecklists from './pages/EvaluationChecklists';
import EvaluationRadar from './pages/EvaluationRadar';
import HelpPage from './pages/HelpPage';
import AboutPage from './pages/AboutPage'; // Import the new AboutPage

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<IndexPage />} />
          <Route path="/project-data" element={<ProjectDataSheet />} />
          <Route path="/qualitative-evaluation" element={<QualitativeEvaluation />} />
          <Route path="/eco-ideas" element={<EcoIdeasBoards />} />
          <Route path="/evaluation-checklists" element={<EvaluationChecklists />} />
          <Route path="/evaluation-radar" element={<EvaluationRadar />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/about" element={<AboutPage />} /> {/* New route for AboutPage */}
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;