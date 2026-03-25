import React from "react";
import Layout from "../layout/Layout";
import HomePage from "../page/HomePage";
import LoginPage from "../page/LoginPage";
import RegisterPage from "../page/RegisterPage";
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
];

export default publicRoutes;
