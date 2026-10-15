import { Link, useLocation } from "react-router-dom";
import "./NotFound.css";
import { useEffect } from "react";

function NotFound() {
  const location = useLocation();

  
  useEffect(() => {
    document.title = "Blog | Not found";
  }, [location]); // location is now correctly included as a dependency

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <div className="not-found">
        <h1>404 - Page Not Found</h1>
        <p>Oops! The page you are looking for does not exist.</p>
      </div>
      <Link to="/" style={{ color: "blue", textDecoration: "underline" }}>
        Go back to Home
      </Link>
    </div>
  );
}

export default NotFound;
