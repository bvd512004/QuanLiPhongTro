import React from "react";
import Layout from "../layout/Layout";
import HomePage from "../page/HomePage";
import LoginPage from "../page/LoginPage";
import RegisterPage from "../page/RegisterPage";
import AdminPropertyModerationPage from "../feature/admin/pages/AdminPropertyModerationPage";
import AdminPropertyDetailPage from "../feature/admin/pages/AdminPropertyDetailPage";
import AdminDashboardPage from "../feature/admin/pages/AdminDashboardPage";
import AdminUserManagementPage from "../feature/admin/pages/AdminUserManagementPage";
const publicRoutes = [
    
    {
        path: "/",
        element: <Layout />,
        children: [
            { index: true, element: <HomePage /> },
        
        ]
    },
    {
        path: "/login",
        element: <Layout />,
        children: [
            { index: true, element: <LoginPage /> },
        ],
    },
    {
        path: "/register",
        element: <Layout />,
        children: [
            { index: true, element: <RegisterPage /> },
        ],
    },
    {
        path: "/short-term-listings",
        element: <Layout />,
        children: [
            { index: true, element: <HomePage /> },
        ],
    }
    ,
    {
        path: "/admin/properties/moderation",
        element: <Layout />,
        children: [
            { index: true, element: <AdminPropertyModerationPage /> },
        ],
    }
    ,
    {
        path: "/admin/properties/moderation/:id",
        element: <Layout />,
        children: [
            { index: true, element: <AdminPropertyDetailPage /> },
        ],
    }
    ,
    {
        path: "/admin/dashboard",
        element: <Layout />,
        children: [
            { index: true, element: <AdminDashboardPage /> },
        ],
    },
    {
        path: "/admin/users",
        element: <Layout />,
        children: [
            { index: true, element: <AdminUserManagementPage /> },
        ],
    }
];

export default publicRoutes;
