import { useState, useEffect } from "react";
import { getProfessionalQuestionnaires, submitProfessionalAnswers } from "../services/professionelService";
import { toast } from "react-toastify";

export function useProfessionalQuestionnaires() {
  const [questionnaires, setQuestionnaires] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getProfessionalQuestionnaires();
        setQuestionnaires(res.data);
      } catch (e) {
        toast.error("Erreur lors du chargement des questionnaires professionnels");
        console.error("Error fetching professional questionnaires:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const submitAnswers = async (templateCode, payload) => {
    try {
      await submitProfessionalAnswers(templateCode, payload);
      toast.success("Réponses envoyées avec succès !");
    } catch (e) {
      toast.error("Échec de la soumission du questionnaire");
      console.error("Error submitting professional answers:", e);
      throw e; // Re-throw to handle in component
    }
  };

  return {
    questionnaires,
    loading,
    submitAnswers,
  };
}