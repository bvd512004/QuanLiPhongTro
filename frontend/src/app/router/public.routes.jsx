import React from "react";
import { Navigate } from "react-router-dom";
import Layout from "@/layout/Layout.jsx";
import HomePage from "@/page/HomePage.jsx";
import ProfilePage from "@/page/ProfilePage.jsx";
import LoginPage from "@/page/LoginPage.jsx";
import RegisterPage from "@/page/RegisterPage.jsx";
import AdminPropertyModerationPage from "@/feature/admin/pages/AdminPropertyModerationPage.jsx";
import AdminPropertyDetailPage from "@/feature/admin/pages/AdminPropertyDetailPage.jsx";
import AdminDashboardPage from "@/feature/admin/pages/AdminDashboardPage.jsx";
import AdminUserManagementPage from "@/feature/admin/pages/AdminUserManagementPage.jsx";
import UpdateProfilePage from "@/page/UpdateProfilePage.jsx";
import ListingPage from "@/page/ListingPage.jsx";
import CheckoutPage from "@/page/CheckoutPage.jsx";
const publicRoutes = [

    {
        path: "/",
        element: <Layout />,
        children: [
            { index: true, element: <HomePage /> },

        ]
    },
    {
        path: "/profile",
        element: <Layout />,
        children: [
            { index: true, element: <ProfilePage /> },     // /profile
            { path: "edit", element: <UpdateProfilePage /> } // /profile/edit
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
        path: "/auth",
        element: <Layout />,
        children: [
            { index: true, element: <LoginPage /> },
            { path: "register", element: <RegisterPage /> },
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
    },
    {
        path: "/listing/:id",
        element: <Layout />,
        children: [
            { index: true, element: <ListingPage /> },
        ],
    },
    {
        path: "/checkout",
        element: <Layout />,
        children: [
            { index: true, element: <CheckoutPage /> },
        ],
    },
    {
        path: "*",
        element: <Navigate to="/" replace />,
    },
];

export default publicRoutes;