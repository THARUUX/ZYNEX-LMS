import "../styles/globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { verify } from "jsonwebtoken";
import { jwtDecode } from "jwt-decode";
import Cookie from "js-cookie";
import { ConfirmDialogProvider } from "./dashboard/components/Dialog";

const PUBLIC_ROUTES = ["/", "/login", "/register"];

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = Cookie.get("token");
      const isPublic = ["/", "/login", "/register"].includes(router.pathname); // ✅ FIXED

      if (!token && !isPublic) {
        console.log("No token and route is protected, redirecting to login");
        router.push("/login");
        return;
      }

      if (token) {
        try {
          const decoded = jwtDecode(token);
          setUser(decoded);
          setAuthorized(true);
        } catch (err) {
          console.log("JWT verification failed:", err.message);
          Cookie.remove("token");
          router.push("/login");
        }
      } else {
        setAuthorized(true);
      }
    };

    if (router.pathname) checkAuth();
  }, [router.pathname]);



  return (
    <>
      <ToastContainer />
      <ConfirmDialogProvider>
        {authorized && <Component {...pageProps} user={user} />}
      </ConfirmDialogProvider>
    </>
  );
}