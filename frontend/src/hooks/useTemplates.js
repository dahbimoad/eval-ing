/* ------------------------------------------------------------------ */
/*  Hook : useTemplates                                               */
/*  Place : frontend/src/hooks/useTemplates.js                        */
/* ------------------------------------------------------------------ */
import { useState, useCallback } from "react";
import { toast } from "react-toastify";

import {
  /* ── Template endpoints ────────────────────────────────────────── */
  createTemplate,
  getTemplates,
  updateTemplate,
  deleteTemplate,
  /* ── Section endpoints ─────────────────────────────────────────── */
  createSection,
  /* getSections,   updateSection, deleteSection,   // dispo si besoin */
  /* ── Question endpoints ────────────────────────────────────────── */
  createQuestion,
  /* getQuestions, updateQuestion, deleteQuestion, */
} from "../services/templateService";

/* ================================================================== */
/*  PUBLIC API                                                        */
/* ================================================================== */
export function useTemplates() {
  /* ---------- state ---------- */
  const [templates, setTemplates] = useState([]);      // ← toujours tableau
  const [loading,   setLoading]   = useState(false);

  /* ---------- helpers ---------- */
  const safeArray = obj =>
    Array.isArray(obj)                ? obj :
    Array.isArray(obj?.data)          ? obj.data :
    Array.isArray(obj?.items)         ? obj.items :
    Array.isArray(obj?.templates)     ? obj.templates :
    [];

  /* ---------- fetch all templates ---------- */
  const loadTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await getTemplates();   // Axios response
      const list = safeArray(res.data);
      console.log('🔧 Templates loaded with statuses:', list.map(t => ({ id: t.id, title: t.title, status: t.status })));
      setTemplates(list);
    } catch {
      toast.error("Erreur lors du chargement des templates");
    } finally {
      setLoading(false);
    }
  }, []);

  /* ---------- CRUD : template ---------- */
  const addTemplate = async payload => {
    try {
      await createTemplate(payload);
      await loadTemplates();
      return true; // Return success indicator
    } catch {
      toast.error("Impossible de créer le template");
      return false; // Return failure indicator
    }
  };

  const editTemplate = async (id, payload) => {
    try {
      await updateTemplate(id, payload);
      await loadTemplates();
      toast.success("Template mis à jour");
    } catch {
      toast.error("Échec de la mise à jour");
    }
  };

  const removeTemplate = async id => {
    try {
      console.log('🔧 Deleting template with ID:', id);
      await deleteTemplate(id);
      await loadTemplates();
      toast.success("Template supprimé");
    } catch (error) {
      console.error('❌ Error deleting template:', error);
      console.error('❌ Error details:', error.response?.data);
      toast.error(`Suppression impossible: ${error.response?.data?.message || error.message}`);
    }
  };

  /* ---------- Section & Question helpers (exemples) ---------- */
  const addSection   = (tplId, payload)                 =>
    createSection(tplId, payload);

  const addQuestion  = (tplId, sectionId, payload)      =>
    createQuestion(tplId, sectionId, payload);

  /* ---------- what the hook exposes ---------- */
  return {
    templates,
    loading,

    /* loaders */
    loadTemplates,

    /* template CRUD */
    addTemplate,
    editTemplate,
    removeTemplate,

    /* extras re-exposed if needed in editors */
    addSection,
    addQuestion,
  };
}
