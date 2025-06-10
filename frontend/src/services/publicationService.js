import qApi from "../api/questionnaireApi";

/* ────────────────  PUBLICATION  ──────────────── */
export const publicationService = {
  publish: (templateId, data) =>
    qApi.post(`/template/${templateId}/publish`, data),

  getAll: () =>
    qApi.get("/publications"),

  getSubmissions: (publicationId) =>
    qApi.get(`/publications/${publicationId}/submissions`),
}; 