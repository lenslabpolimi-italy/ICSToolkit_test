"use client";

import React from 'react';
import WipeContentButton from '@/components/WipeContentButton';
import { useLcd } from '@/context/LcdContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const ProjectDataSheet: React.FC = () => {
  const { projectData, setProjectData } = useLcd();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setProjectData(prev => ({ ...prev, [id]: value }));
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md relative min-h-[calc(100vh-200px)] font-roboto">
      <h2 className="text-3xl font-palanquin font-semibold text-app-header mb-6">Project Data Sheet</h2>
      <p className="text-app-body-text mb-8">
        Record essential project information here.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <Label htmlFor="projectName" className="text-app-body-text">Project Name</Label>
          <Input id="projectName" value={projectData.projectName} onChange={handleChange} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="company" className="text-app-body-text">Company</Label>
          <Input id="company" value={projectData.company} onChange={handleChange} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="designer" className="text-app-body-text">Designer</Label>
          <Input id="designer" value={projectData.designer} onChange={handleChange} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="functionalUnit" className="text-app-body-text">Functional Unit</Label>
          <Input id="functionalUnit" value={projectData.functionalUnit} onChange={handleChange} className="mt-1" />
        </div>
      </div>

      <div className="mb-8">
        <Label htmlFor="descriptionExistingProduct" className="text-app-body-text">Description of Existing Product</Label>
        <Textarea
          id="descriptionExistingProduct"
          value={projectData.descriptionExistingProduct}
          onChange={handleChange}
          rows={5}
          className="mt-1"
        />
      </div>

      <WipeContentButton sectionKey="projectData" />
    </div>
  );
};

export default ProjectDataSheet;