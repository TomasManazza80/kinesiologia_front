import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const getUserRole = (token, userInfo) => {
    if (userInfo?.role) return userInfo.role;
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.role || 'USER';
        } catch (e) {
            return 'USER';
        }
    }
    return null;
};

export const AdminRoute = ({ children }) => {
    const { accessToken, userInfo } = useSelector((state) => state.authSlice);

    if (!accessToken) {
        return <Navigate to="/login" replace />;
    }

    const role = getUserRole(accessToken, userInfo);

    if (role !== 'ADMIN' && role !== 'EMPLOYEE') {
        return <Navigate to="/reservar" replace />;
    }

    return children;
};

export default AdminRoute;
