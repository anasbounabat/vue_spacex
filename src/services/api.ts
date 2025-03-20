
import axios from 'axios';

const API_URL = 'https://api.spacexdata.com/v4';

export default {
  async fetchLaunches() {
    try {
      const response = await axios.get(`${API_URL}/launches`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des lancements:', error);
      throw error;
    }
  }
};
