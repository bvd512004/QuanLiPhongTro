import { createBrowserRouter } from "react-router-dom";
import publicRoutes from "./public.routes";
const routes = createBrowserRouter([
    ...publicRoutes,
]);

export default routes;
