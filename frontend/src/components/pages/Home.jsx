import "./Home.css";
import HomeBlog from "../blog/HomeBlog";
import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";

const Home = () => {
  const location = useLocation();

  useEffect(() => {
    document.title = "Blog | Home";
  }, [location]);

  return (
    <div className="home-container">
      <div className="home-content">
        <div className="home-hero">
          <h1 className="home-title">
            Welcome to Our Blog
          </h1>
          <p className="home-subtitle">
            Discover stories, insights, and ideas from our community of writers. 
            Join us on a journey of knowledge and inspiration.
          </p>
          <div className="home-cta">
            <Link to="/create-blog" className="btn-secondary">
              Start Writing
            </Link>
            <Link to="/dashboard" className="btn-secondary">
              Explore Blogs
            </Link>
          </div>
        </div>
        
        <div className="blog-section">
          <div className="section-header">
            <h2 className="section-title">Latest Posts</h2>
            <p className="section-description">
              Check out the most recent articles from our community
            </p>
          </div>
          <HomeBlog />
        </div>
      </div>
    </div>
  );
};

export default Home;
