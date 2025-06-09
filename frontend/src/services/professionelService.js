import qApi from "../api/questionnaireApi";

// Debug: vérifiez l'URL de base
console.log("🔍 qApi baseURL:", qApi.defaults.baseURL);
console.log("🔍 qApi config:", qApi.defaults);

export const getProfessionalQuestionnaires = async () => {
  try {
    console.log("📡 Calling GET /professional/questionnaires");
    const response = await qApi.get("/professional/questionnaires");
    console.log("✅ Response received:", response.data);
    return response;
  } catch (error) {
    console.error("❌ Error in getProfessionalQuestionnaires:", error);
    console.error("❌ Error response:", error.response?.data);
    console.error("❌ Error status:", error.response?.status);
    throw error;
  }
};

export const getTemplateDetails = async (templateCode) => {
  try {
    const url = `/professional/questionnaires/${templateCode}`;
    console.log(`📡 Calling GET ${url}`);
    console.log(`📡 Full URL will be: ${qApi.defaults.baseURL}${url}`);
    
    const response = await qApi.get(url);
    console.log("✅ Template details response:", response.data);
    return response;
  } catch (error) {
    console.error(`❌ Error in getTemplateDetails for templateCode: ${templateCode}`);
    console.error("❌ Error details:", error);
    console.error("❌ Error response:", error.response?.data);
    console.error("❌ Error status:", error.response?.status);
    console.error("❌ Request URL:", error.config?.url);
    throw error;
  }
};

export const submitProfessionalAnswers = async (templateCode, data) => {
  try {
    const url = `/professional/questionnaires/submit/${templateCode}`;
    console.log(`📡 Calling POST ${url}`);
    console.log("📡 Payload:", data);
    
    const response = await qApi.post(url, data);
    console.log("✅ Submit response:", response.data);
    return response;
  } catch (error) {
    console.error(`❌ Error in submitProfessionalAnswers for templateCode: ${templateCode}`);
    console.error("❌ Error details:", error);
    console.error("❌ Error response:", error.response?.data);
    console.error("❌ Error status:", error.response?.status);
    throw error;
  }
};