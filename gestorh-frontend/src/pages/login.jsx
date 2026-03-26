import { useState, useEffect } from "react";
import { authApi, setSession } from "../services/api";
import "../styles/login.css";

export default function Login({ onLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeInput, setActiveInput] = useState(null);
  const [particles, setParticles] = useState([]);

  // Efecto para partículas dinámicas de fondo
  useEffect(() => {
    const createParticles = () => {
      const particleCount = window.innerWidth < 768 ? 20 : 40;
      const newParticles = [];

      for (let i = 0; i < particleCount; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 4 + 1,
          speedX: (Math.random() - 0.5) * 0.3,
          speedY: (Math.random() - 0.5) * 0.3,
          color: i % 4 === 0 ? 'var(--naranja)' :
            i % 4 === 1 ? 'var(--turquesa)' :
              i % 4 === 2 ? 'var(--melocoton)' : 'var(--mint)'
        });
      }

      setParticles(newParticles);
    };

    createParticles();
    window.addEventListener('resize', createParticles);

    // Animación de partículas
    const interval = setInterval(() => {
      setParticles(prev => prev.map(p => ({
        ...p,
        x: (p.x + p.speedX + 100) % 100,
        y: (p.y + p.speedY + 100) % 100
      })));
    }, 50);

    return () => {
      window.removeEventListener('resize', createParticles);
      clearInterval(interval);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Por favor completa todos los campos");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const data = await authApi.login(email, password);
      setSession(data);

      if (onLoggedIn) {
        onLoggedIn(data);
      }
    } catch (err) {
      console.error("Error en login:", err);
      const message = err.response?.data?.error || "Credenciales incorrectas o error de conexión";
      setError(message);

      // Efecto de vibración en error
      document.querySelector('.login-card').classList.add('shake');
      setTimeout(() => {
        document.querySelector('.login-card').classList.remove('shake');
      }, 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Fondo con partículas animadas */}
      <div className="particles-background">
        {particles.map(p => (
          <div
            key={p.id}
            className="particle"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              opacity: 0.7
            }}
          />
        ))}
      </div>

      {/* Formas geométricas decorativas */}
      <div className="geometric-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
      </div>

      {/* Contenedor principal */}
      <div className="login-wrapper">
        {/* Panel izquierdo con branding */}
        <div className="brand-panel">
          <div className="brand-content">
            <div className="logo-container">
              <div className="logo-circle">
                <span className="logo-icon">👥</span>
              </div>
              <h1 className="brand-title">Gesto<span className="brand-highlight">RH</span></h1>
            </div>

            <div className="brand-tagline">
              <h2>Donde el talento se encuentra con la gestión</h2>
              <p>Plataforma integral para la gestión eficiente de recursos humanos</p>
            </div>

            <div className="features-list">
              <div className="feature">
                <div className="feature-icon">✅</div>
                <span>Gestión de talento</span>
              </div>
              <div className="feature">
                <div className="feature-icon">📊</div>
                <span>Análisis de desempeño</span>
              </div>
              <div className="feature">
                <div className="feature-icon">🔒</div>
                <span>Datos seguros</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel derecho con formulario */}
        <div className="login-card">
          <div className="login-header">
            <h2>Bienvenido de vuelta</h2>
            <p>Accede a tu cuenta para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div
              className={`login-input-group ${activeInput === 'email' ? 'active' : ''}`}
              onFocus={() => setActiveInput('email')}
              onBlur={() => setActiveInput(null)}
            >
              <label className="input-label">
                <span className="label-icon">📧</span>
                Correo Electrónico
              </label>
              <div className="input-wrapper">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="login-input"
                  disabled={loading}
                  placeholder="ejemplo@empresa.com"
                />
                <div className="input-underline">
                  <div className="underline-active"></div>
                </div>
              </div>
            </div>

            <div
              className={`login-input-group ${activeInput === 'password' ? 'active' : ''}`}
              onFocus={() => setActiveInput('password')}
              onBlur={() => setActiveInput(null)}
            >
              <label className="input-label">
                <span className="label-icon">🔒</span>
                Contraseña
              </label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="login-input"
                  disabled={loading}
                  placeholder="••••••••"
                />
                <div className="input-underline">
                  <div className="underline-active"></div>
                </div>
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? "🙈 Ocultar" : "👁️ Mostrar"}
                </button>
              </div>
            </div>

            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <button
              type="submit"
              className={`login-submit ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Verificando credenciales...
                </>
              ) : (
                <>
                  <span className="btn-icon">→</span>
                  Iniciar Sesión
                </>
              )}
            </button>

            <div className="login-footer">
              <a href="#" className="forgot-password">
                ¿Olvidaste tu contraseña?
              </a>
              <p className="footer-note">
                Sistema seguro de gestión de recursos humanos
                <span className="version">v2.1</span>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}