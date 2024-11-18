import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8888', // base URL for the Yii2 backend
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getUsers = async () => {
    try {
        const response = await api.get('/user');
        return response.data;
    } catch (error) {
        console.error("Error fetching users:", error);
    }
};

export default api;
