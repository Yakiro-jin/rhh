import { Navigate, Outlet } from "react-router-dom";
import { getSession } from "../services/api";

const RequireRole = ({ allow }) => {
    const session = getSession();

    // 1. Doble verificación por si acaso
    if (!session) return <Navigate to="/login" replace />;

    // 2. Verificamos si el ROL extraído del JWT está en la lista permitida
    // allow es un array, ej: ["admin"] o ["admin", "supervisor"]
    if (!allow.includes(session.rol)) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default RequireRole;