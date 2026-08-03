import {logout} from "./authSlice.js";

export function logoutUser() {
    logout();
    localStorage.removeItem('refreshToken')

    // Si el usuario no está ya en login o signup, redirigir a login
    const publicRoutes = ['/login', '/signup', '/signup-admin', '/'];
    if (!publicRoutes.includes(window.location.pathname)) {
        window.location.href = '/login';
    }
}