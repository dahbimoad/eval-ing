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
        console.log("Fetching student questionnaires...");
        const res = await getStudentQuestionnaires();
        console.log("Student questionnaires received:", res.data);
        setQuestionnaires(res.data || []);
      } catch (e) {
        console.error("Error fetching student questionnaires:", e);
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
      console.log("Submitting student answers:", { templateCode, payload });
      await submitStudentAnswers(templateCode, payload);
      toast.success("Réponses envoyées avec succès !");
    } catch (e) {
      console.error("Error submitting student answers:", e);
      toast.error("Échec de la soumission du questionnaire");
      throw e; // Re-throw to handle in component
    }
  };

  return {
    questionnaires,
    loading,
    submitAnswers,
  };
}

