import { Navigate } from 'react-router-dom';
import type { User } from 'firebase/auth';

interface ProtectedRouteProps {
    user: User | null;
    children: React.ReactElement;
    redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    user,
    children,
    redirectTo = '/login'
}) => {
    if (!user || user.isAnonymous) {
        return <Navigate to={redirectTo} replace />;
    }

    return children;
};
