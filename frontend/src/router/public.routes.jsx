import React from "react";
import HomePage from "../page/HomePage";
import Layout from "../layout/Layout";

const publicRoutes = [
    {
        element: <Layout />,
        children: [
            { path: "/", element: <HomePage /> },
        
        ]
    }
];

export default publicRoutes;
