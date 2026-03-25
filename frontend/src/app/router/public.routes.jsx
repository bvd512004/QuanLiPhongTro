import HomePage from "../page/HomePage";
import LoginPage from "../page/LoginPage";
import RegisterPage from "../page/RegisterPage";
import ProfilePage from "../component/home/ProfilePage";
import UpdateProfilePage from "../page/UpdateProfilePage";

const publicRoutes = [
  {
    path: "/",              
    element: <HomePage />
  },
  {
    path: "/login",
    element: <LoginPage />
  },
  {
    path: "/register",
    element: <RegisterPage />
  },
  {
    path: "/profile",
    element: <ProfilePage />
  },
  {
    path: "/profile/edit",
    element: <UpdateProfilePage />
  }
];

export default publicRoutes;
