import { useState, useEffect } from "react";
import { getProfessorQuestionnaires, submitProfessorAnswers } from "../services/professorService";
import { toast } from "react-toastify";

export function useProfessorQuestionnaires() {
  const [questionnaires, setQuestionnaires] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getProfessorQuestionnaires();
        setQuestionnaires(res.data);
      } catch (e) {
        toast.error("Erreur lors du chargement des questionnaires");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const submitAnswers = async (templateCode, payload) => {
    try {
      await submitProfessorAnswers(templateCode, payload);
      toast.success("Réponses envoyées !");
    } catch (e) {
      toast.error("Échec de la soumission");
    }
  };

  return {
    questionnaires,
    loading,
    submitAnswers,
  };
}
