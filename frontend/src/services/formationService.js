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

      // Map backend format to frontend format
      return formations.map(formation => {
        console.log('🔧 Raw formation object:', formation); // Debug log
        
        // Map the properties (handle both Pascal and camel case)
        const id = formation.id || formation.Id;
        const code = formation.code || formation.Code;
        const title = formation.title || formation.Title;
        
        console.log('🔧 Mapped formation:', { id, code, title }); // Debug log
        
        return { id, code, title };
      });
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
