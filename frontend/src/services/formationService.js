// src/services/formationService.js
import qApi from "../api/questionnaireApi";

export const formationService = {
  // Get all formations from backend
  async getAll() {
    console.log('Making API call to /formation-cache...'); // Debug log
    try {
      console.log('🔧 Base URL:', qApi.defaults.baseURL);
      const response = await qApi.get('/formation-cache');
      console.log('✅ Formation cache response:', response.data);
      
      // Handle both array and object responses
      let formations = [];
      if (Array.isArray(response.data)) {
        formations = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        formations = response.data.data;
      } else if (response.data && typeof response.data === 'object') {
        // Single formation object, wrap in array
        formations = [response.data];
      }

      // Map backend format to frontend format - use the actual ID from backend
      return formations.map(formation => ({
        id: formation.id || formation.Id, // Use the actual database ID (integer)
        code: formation.code || formation.Code,
        title: formation.title || formation.Title
      }));
    } catch (error) {
      console.error('❌ Formation service error:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      
      if (error.response?.status === 404) {
        console.error('❌ GET /formation-cache endpoint not found!');
        console.error('   Available endpoints might be:');
        console.error('   - POST /formation-cache (exists)');
        console.error('   - GET /formation-cache (MISSING)');
      }
      
      // Return empty array instead of throwing
      return [];
    }
  }
};
