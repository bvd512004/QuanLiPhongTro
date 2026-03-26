import { createBrowserRouter } from "react-router-dom";
import publicRoutes from '../router/public.routes.jsx';
import hostRoutes from "@/app/router/host.routes.jsx";
const routes = createBrowserRouter([
    ...publicRoutes,
    ...hostRoutes,
]);

export default routes;
