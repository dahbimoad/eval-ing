// src/services/templateService.js
import qApi from "../api/questionnaireApi";

/* ────────────────  TEMPLATES  ──────────────── */
export const createTemplate = data =>
  qApi.post("/template/create", data);

export const getTemplates = () =>
  qApi.get("/template/all");

export const updateTemplate = (id, data) =>
  qApi.put(`/template/update/${id}`, data);

export const deleteTemplate = id =>
  qApi.delete(`/template/delete/${id}`);

/* ────────────────  SECTIONS  ──────────────── */
export const createSection = (templateId, data) =>
  qApi.post(`/template/${templateId}/sections`, data);

export const getSections = templateId =>
  qApi.get(`/template/${templateId}/sections`);

export const updateSection = (templateId, id, data) =>
  qApi.put(`/template/${templateId}/sections/${id}`, data);

export const deleteSection = (templateId, id) =>
  qApi.delete(`/template/${templateId}/sections/${id}`);

/* ────────────────  QUESTIONS  ──────────────── */
export const createQuestion = (templateId, sectionId, data) =>
  qApi.post(
    `/template/${templateId}/section/${sectionId}/question/create`,
    data
  );

export const getQuestions = (templateId, sectionId) =>
  qApi.get(
    `/template/${templateId}/section/${sectionId}/questions`
  );

export const updateQuestion = (templateId, sectionId, id, data) =>
  qApi.put(
    `/template/${templateId}/section/${sectionId}/question/${id}/update`,
    data
  );

export const deleteQuestion = (templateId, sectionId, id) =>
  qApi.delete(
    `/template/${templateId}/section/${sectionId}/question/${id}/delete`
  );
