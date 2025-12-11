import qApi from "../api/questionnaireApi";

export const getProfessionalQuestionnaires = async () => {
  try {
    const response = await qApi.get("/professional/questionnaires");
    return response;
  } catch (error) {
    throw error;
  }
};

export const getTemplateDetails = async (templateCode) => {
  try {
    const url = `/professional/questionnaires/${templateCode}`;
    const response = await qApi.get(url);
    return response;
  } catch (error) {
    throw error;
  }
};

export const submitProfessionalAnswers = async (templateCode, data) => {
  try {
    const url = `/professional/questionnaires/submit/${templateCode}`;
    const response = await qApi.post(url, data);
    return response;
  } catch (error) {
    throw error;
  }
};