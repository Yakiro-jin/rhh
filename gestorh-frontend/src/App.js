import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import PrivateRoute from "./routes/PrivateRoute";
import RequireRole from "./routes/RequireRole";
import EmpleadosPage from "./pages/EmpleadosPage";
import UsuariosPage from "./pages/UsuariosPage";
import DepartamentosPage from "./pages/DepartamentosPage";
import { getSession } from "./services/api";

export default function App() {
  // 1. Estado para controlar al usuario logueado
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 2. Verificar si hay una sesión activa al cargar la app
  useEffect(() => {
    const session = getSession();
    if (session) {
      setUser(session);
    }
    setLoading(false);
  }, []);

  // 3. Función que se ejecuta tras un login exitoso
  const handleLoginSuccess = (userData) => {
    setUser(userData); // Esto activa el re-renderizado y permite el acceso a rutas privadas
  };

  if (loading) return <div>Cargando sistema...</div>;

  return (
    <BrowserRouter>
      <Routes>
        {/* 1. RUTA PÚBLICA: Si ya está logueado, redirige al dashboard */}
        <Route
          path="/login"
          element={
            !user ? (
              <Login onLoggedIn={handleLoginSuccess} />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />

        {/* 2. RUTAS PRIVADAS: Requieren user != null */}
        <Route element={<PrivateRoute isAllowed={!!user} />}>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard user={user} />} />

          {/* --- RUTAS EXCLUSIVAS PARA ADMIN --- */}
          <Route element={<RequireRole userRole={user?.rol} allow={["admin"]} />}>
            <Route path="/usuarios" element={<UsuariosPage />} />
            <Route path="/departamentos" element={<DepartamentosPage />} />
            <Route path="/empleados" element={<EmpleadosPage />} />
          </Route>

          {/* --- RUTAS COMPARTIDAS --- */}
          <Route element={<RequireRole userRole={user?.rol} allow={["admin", "supervisor"]} />}>
            <Route path="/vacaciones" element={<div>Gestión de Vacaciones</div>} />
            <Route path="/amonestaciones" element={<div>Módulo de Disciplina</div>} />
          </Route>

        </Route>

        {/* 3. FALLBACK */}
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}