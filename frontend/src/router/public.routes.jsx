import React from "react";
import Layout from "../layout/Layout";
import HomePage from "../page/HomePage";
import ProfilePage from "../page/ProfilePage";
import LoginPage from "../page/LoginPage";
import RegisterPage from "../page/RegisterPage";
import AdminPropertyModerationPage from "../feature/admin/pages/AdminPropertyModerationPage";
import UpdateProfilePage from "../page/UpdateProfilePage";
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
];

export default publicRoutes;
