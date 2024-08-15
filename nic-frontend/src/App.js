import React from "react";
import Login from "./Pages/Login.jsx";
import Dashboard from "./Pages/Dashboard.jsx";
import Uploads from "./Pages/Upload.jsx";
import Records from "./Pages/Records.jsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import ProtectedRoutes from "./ProtectedRoutes";
import NotFoundPage from "./Pages/NotFound.jsx";

const publicRoutes = ["/", "/*"];

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isauth, setisauth] = useState(false);
  const [token, setToken] = useState("");

  const checkTokenValidity = async () => {
    const storedData = localStorage.getItem("token");

    if (storedData) {
      const parsedData = JSON.parse(storedData);
      const token = parsedData.token;
      setToken(token);
      try {
        const decodedToken = jwtDecode(token);
        if (decodedToken.auth === true) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem("token");
          setIsAuthenticated(false);
        }
      } catch (error) {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
    setIsLoading(false);

    if (isAuthenticated && window.location.pathname === "/") {
      window.location.href = "/dashboard";
    }
  };

  useEffect(() => {
    checkTokenValidity();

    window.onload = () => {
      checkTokenValidity();
    };

    const interval = setInterval(() => {
      checkTokenValidity();
    }, 100);

    return () => {
      clearInterval(interval);
    };
  });

  if (isLoading) {
    return <div>Loading...</div>; // Render loading indicator until authentication status is determined
  }

  return (
    <Router>
      <Routes>
        {RenderProtectedRoutes(isAuthenticated, token)}
        <Route exact path="/" element={<Login />} />
        <Route exact path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

// Function to render protected routes based on user role
function RenderProtectedRoutes(isAuthenticated, token) {
  if (!isAuthenticated && !publicRoutes.includes(window.location.pathname)) {
    return <Route path="*" element={<Navigate to="/" replace />} />;
  }
  console.log(isAuthenticated);
  console.log(token);

  return (
    <Route element={<ProtectedRoutes isAuthenticated={isAuthenticated} />}>
      {isAuthenticated && (
        <>
          <Route exact path="/dashboard" element={<Dashboard />} />
          <Route path="/uploads" element={<Uploads />} />
          <Route path="/records" element={<Records />} />
        </>
      )}
    </Route>
  );
}
export default App;
