import { useState, useEffect } from "react";
import { getTemplateDetails } from "../services/professorService";
import { toast } from "react-toastify";

export function useProfessorQuestionnaireDetails(templateCode) {
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDetails = async () => {
      try {
        const res = await getTemplateDetails(templateCode);
        setTemplate(res.data);
      } catch (e) {
        toast.error("Impossible de charger le questionnaire.");
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [templateCode]);

  return { template, loading };
}
