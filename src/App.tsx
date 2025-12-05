import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LcdProvider } from "./context/LcdContext";
import Layout from "./components/Layout";
import Menu from "./pages/Menu";
import ProjectDataSheet from "./pages/ProjectDataSheet";
import QualitativeEvaluation from "./pages/QualitativeEvaluation";
import EcoIdeasBoards from "./pages/EcoIdeasBoards";
import EvaluationChecklists from "./pages/EvaluationChecklists";
import EvaluationRadar from "./pages/EvaluationRadar";
import ImprovementRadar from "./pages/ImprovementRadar";
import HelpPage from "./pages/HelpPage"; // NEW: Import HelpPage
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <LcdProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Menu />} />
              <Route path="/project-data" element={<ProjectDataSheet />} />
              <Route path="/qualitative-evaluation" element={<QualitativeEvaluation />} />
              <Route path="/eco-ideas" element={<EcoIdeasBoards />} />
              <Route path="/evaluation-checklists" element={<EvaluationChecklists />} />
              <Route path="/evaluation-radar" element={<EvaluationRadar />} />
              <Route path="/improvement-radar" element={<ImprovementRadar />} />
              <Route path="/help" element={<HelpPage />} /> {/* NEW: Add route for HelpPage */}
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </LcdProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;