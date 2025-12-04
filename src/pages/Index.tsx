// Update this page (the content is just a fallback if you fail to update the page)

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/"); // Redirect to the main menu
  }, [navigate]);

  return (
    <div className="flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Loading Application...</h1>
        <p className="text-xl text-gray-600">
          Please wait while the application loads.
        </p>
      </div>
    </div>
  );
};

export default Index;