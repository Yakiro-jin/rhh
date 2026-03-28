import axios from "axios";

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || (window.location.hostname.includes("zrok.io") ? "" : `${window.location.protocol}//${window.location.hostname}:5005`),
    headers: {
        "Content-Type": "application/json",
    },
});

/**
 * HELPER: Decodifica el JWT de forma segura
 */
const decodeToken = (token) => {
    try {
        if (!token || typeof token !== 'string') return null;
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(window.atob(base64));
    } catch (e) {
        return null;
    }
};

/**
 * GESTIÓN DE SESIÓN
 */
export const getSession = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const payload = decodeToken(token);
    const now = Math.floor(Date.now() / 1000);

    // Si el token expiró, limpiamos y mandamos al login
    if (!payload || (payload.exp && payload.exp < now)) {
        localStorage.removeItem("token");
        return null;
    }

    return {
        token,
        empleado_id: payload.empleado_id,
        rol: payload.rol,
        departamento_id: payload.departamento_id
    };
};

// CORRECCIÓN: Ahora detecta si le pasas un objeto o solo el string
export const setSession = (data) => {
    const token = typeof data === 'object' ? data.token : data;
    if (token) {
        localStorage.setItem("token", token);
    }
};

export const clearSession = () => {
    localStorage.removeItem("token");
    // Evitar redirección si ya estamos en login
    if (window.location.pathname !== "/login") {
        window.location.href = "/login";
    }
};

/**
 * SERVICIOS
 */
export const authApi = {
    login: async (email, password) => {
        const response = await api.post("/auth/login", { email, password });
        return response.data;
    },
};

/**
 * INTERCEPTORES
 */
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // CORRECCIÓN: No ejecutar clearSession si el error 401 viene del login
        const isLoginAction = error.config.url.includes("/auth/login");
        if ((error.response?.status === 401 || error.response?.status === 403) && !isLoginAction) {
            clearSession();
        }
        return Promise.reject(error);
    }
);

export default api;