import React from "react";
import Layout from "../layout/Layout";
import HomePage from "../page/HomePage";
const publicRoutes = [
    
    {
        element: <Layout />,
        children: [
            { path: "/", element: <HomePage /> },
        
        ]
    }
];

export default publicRoutes;
