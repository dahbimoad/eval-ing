import { useState, useEffect } from "react";
import { getTemplateDetails } from "../services/professionelService";
import { toast } from "react-toastify";

export function useProfessionalQuestionnaireDetails(templateCode) {
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!templateCode) {
      setLoading(false);
      return;
    }

    const loadDetails = async () => {
      try {
        const res = await getTemplateDetails(templateCode);
        setTemplate(res.data);
      } catch (e) {
        toast.error("Impossible de charger le questionnaire professionnel.");
        console.error("Error fetching professional questionnaire details:", e);
        setTemplate(null);
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [templateCode]);

  return { template, loading };
}