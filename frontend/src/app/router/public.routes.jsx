import React from "react";
import HomePage from "@/app/page/HomePage";
import AdminPropertyModerationPage from "@/feature/admin/pages/AdminPropertyModerationPage";

const publicRoutes = [
    { path: "/", element: <HomePage /> },
    { path: "/admin/properties/moderation", element: <AdminPropertyModerationPage /> },
    // { path: "/login", element: <LoginPage /> },
    // {path: "/register", element: <RegisterPage />},
    // { path: "*", element: <NotFound /> },
];

export default publicRoutes;
