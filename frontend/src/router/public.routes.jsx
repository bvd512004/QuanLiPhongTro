import React from "react";
import Layout from "../layout/Layout";
import HomePage from "../page/HomePage";
import LoginPage from "../page/LoginPage";
import RegisterPage from "../page/RegisterPage";
import ProfilePage from "../app/component/home/ProfilePage";
import UpdateProfilePage from "../page/UpdateProfilePage";
import ListingPage from "../page/ListingPage";
import CheckoutPage from "../page/CheckoutPage";
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
        path: "/profile",
        element: <Layout />,
        children: [
            { index: true, element: <ProfilePage /> },
        ],
    },
    {
        path: "/profile/edit",
        element: <Layout />,
        children: [
            { index: true, element: <UpdateProfilePage /> },
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
    }
];

export default publicRoutes;
