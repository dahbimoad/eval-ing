import qApi from "../api/questionnaireApi";

// Debug: vérifiez l'URL de base
console.log("🔍 Student qApi baseURL:", qApi.defaults.baseURL);

export const getStudentQuestionnaires = async () => {
  try {
    console.log("📡 Calling GET /student/questionnaires");
    const response = await qApi.get("/student/questionnaires");
    console.log("✅ Student questionnaires received:", response.data);
    return response;
  } catch (error) {
    console.error("❌ Error in getStudentQuestionnaires:", error);
    console.error("❌ Error response:", error.response?.data);
    console.error("❌ Error status:", error.response?.status);
    throw error;
  }
};

export const getStudentTemplateDetails = async (templateCode) => {
  try {
    const url = `/student/questionnaires/${templateCode}`;
    console.log(`📡 Calling GET ${url}`);
    console.log(`📡 Full URL will be: ${qApi.defaults.baseURL}${url}`);
    
    const response = await qApi.get(url);
    console.log("✅ Student template details received:", response.data);
    return response;
  } catch (error) {
    console.error(`❌ Error in getStudentTemplateDetails for templateCode: ${templateCode}`);
    console.error("❌ Error details:", error);
    console.error("❌ Error response:", error.response?.data);
    console.error("❌ Error status:", error.response?.status);
    throw error;
  }
};

export const submitStudentAnswers = async (templateCode, data) => {
  try {
    const url = `/student/questionnaires/submit/${templateCode}`;
    console.log(`📡 Calling POST ${url}`);
    console.log("📡 Payload:", data);
    
    const response = await qApi.post(url, data);
    console.log("✅ Student submit response:", response.data);
    return response;
  } catch (error) {
    console.error(`❌ Error in submitStudentAnswers for templateCode: ${templateCode}`);
    console.error("❌ Error details:", error);
    console.error("❌ Error response:", error.response?.data);
    console.error("❌ Error status:", error.response?.status);
    throw error;
  }
};