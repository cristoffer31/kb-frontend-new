import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export const RequireAuth = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    const location = useLocation();

    if (loading) return <div>Cargando...</div>; // Evita que redirija antes de tiempo

    if (!user) {
        // Guardamos la ruta a la que quería ir para volver ahí después del login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

  return children;
};