// useStudentQuestionnaires.js
import { useState, useEffect } from "react";
import { getStudentQuestionnaires, submitStudentAnswers } from "../services/etudiantService";
import { toast } from "react-toastify";

export function useStudentQuestionnaires() {
  const [questionnaires, setQuestionnaires] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getStudentQuestionnaires();
        setQuestionnaires(res.data || []);
      } catch (e) {
        toast.error("Erreur lors du chargement des questionnaires étudiants");
        setQuestionnaires([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const submitAnswers = async (templateCode, payload) => {
    try {
      await submitStudentAnswers(templateCode, payload);
      toast.success("Réponses envoyées avec succès !");
    } catch (e) {
      toast.error("Échec de la soumission du questionnaire");
      throw e;
    }
  };

  return {
    questionnaires,
    loading,
    submitAnswers,
  };
}

