import { Navigate, Outlet } from "react-router-dom";
import { getSession } from "../services/api";

/**
 * PrivateRoute: Protege las rutas base.
 * @param {boolean} isAllowed - Estado de autenticación que viene desde App.js
 */
const PrivateRoute = ({ isAllowed }) => {
    // 1. Prioridad: Lo que diga el estado global de App.js
    // 2. Respaldo: Verificar si hay un token válido en el almacenamiento
    const session = getSession();

    if (!isAllowed && !session) {
        return <Navigate to="/login" replace />;
    }

    // Si hay permiso o sesión válida, renderiza el contenido (Outlet)
    return <Outlet />;
};

export default PrivateRoute;