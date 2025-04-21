import axios from 'axios';

// Créer une instance axios avec l'URL de base
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// API pour les offres d'emploi
export const jobsApi = {
    // Récupérer toutes les offres d'emploi
    getJobs: async () => {
        try {
            const response = await api.get('/jobs/');
            return response.data;
        } catch (error) {
            console.error('Error fetching jobs:', error);
            throw error;
        }
    },

    // Récupérer une offre d'emploi par son ID
    getJobById: async (id) => {
        try {
            const response = await api.get(`/jobs/${id}/`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching job with ID ${id}:`, error);
            throw error;
        }
    },

    // Soumettre une URL pour le scraping
    scrapeJobUrl: async (url) => {
        try {
            const response = await api.post('/jobs/scrape/', { url });
            return response.data;
        } catch (error) {
            console.error('Error scraping job URL:', error);
            throw error;
        }
    },
};

export default api;
