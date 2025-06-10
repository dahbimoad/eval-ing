import qApi from "../api/questionnaireApi";

export const getProfessorQuestionnaires = () =>
  qApi.get("/professor/questionnaires");

export const getTemplateDetails = (templateCode) =>
  qApi.get(`/professor/questionnaires/${templateCode}`);

export const submitProfessorAnswers = (templateCode, data) =>
  qApi.post(`/professor/questionnaires/submit/${templateCode}`, data);
