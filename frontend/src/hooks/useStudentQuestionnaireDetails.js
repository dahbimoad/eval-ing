// useStudentQuestionnaireDetails.js
import { useState, useEffect } from "react";
import { getStudentTemplateDetails } from "../services/etudiantService";
import { toast } from "react-toastify";

export function useStudentQuestionnaireDetails(templateCode) {
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!templateCode) {
      console.warn("No templateCode provided to useStudentQuestionnaireDetails");
      setLoading(false);
      setError("Template code is required");
      return;
    }

    const loadDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("Fetching student questionnaire details for:", templateCode);
        const res = await getStudentTemplateDetails(templateCode);
        console.log("Student questionnaire details received:", res.data);
        
        setTemplate(res.data);
      } catch (e) {
        console.error("Error fetching student questionnaire details:", e);
        const errorMessage = e.response?.data?.message || e.message || "Impossible de charger le questionnaire étudiant.";
        
        setError(errorMessage);
        setTemplate(null);
        
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [templateCode]);

  // Function to refresh the template details
  const refreshTemplate = async () => {
    if (!templateCode) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const res = await getStudentTemplateDetails(templateCode);
      setTemplate(res.data);
      console.log("Template refreshed successfully");
    } catch (e) {
      console.error("Error refreshing template:", e);
      const errorMessage = e.response?.data?.message || e.message || "Erreur lors du rafraîchissement";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { 
    template, 
    loading, 
    error,
    refreshTemplate 
  };
}