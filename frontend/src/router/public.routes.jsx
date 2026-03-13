import React from "react";
import { PublicLayout } from "../layouts/PublicLayout";
const publicRoutes = [
    { path: "/login", element: <LoginPage /> },
    {path: "/register", element: <RegisterPage />},
    {path:"/",element:<PublicLayout/>, children:[
        
    ]}
];

export default publicRoutes;
