import React from "react";
import HostPortalPage from "@/features/host/pages/HostPortalPage.jsx";
import DashboardPage from "@/features/host/pages/DashboardPage.jsx";
import ReservationsPage from "@/features/host/pages/ReservationsPage.jsx";
import AddPropertyPage from "@/features/host/pages/AddPropertyPage.jsx";
import HostReviewsPage from "@/features/host/pages/HostReviewsPage.jsx";
import EditPropertyPage from "@/features/host/pages/EditPropertyPage.jsx";

const hostRoutes = [

    {path: "/host", element: < HostPortalPage/>},
    {path: "/host/dashboard", element: < DashboardPage/>},
    {path: "/host/reservations", element: <ReservationsPage/>},
    {path: "/host/reviews", element: <HostReviewsPage/>},
    {path: "/host/add-property", element: <AddPropertyPage/>},
    {path: "/host/properties/:propertyId/edit", element: <EditPropertyPage/>},


];

export default hostRoutes;