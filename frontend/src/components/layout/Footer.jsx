import "./Footer.css";
import { useTheme } from "../../contexts/ThemeContext";
import { Link } from "react-router-dom";

function Footer() {
  const { isDarkMode } = useTheme();

  return (
    <footer
      className={`modern-footer ${
        isDarkMode ? "blog-dark-theme" : "blog-light-theme"
      }`}
    >
      <div className="footer-container">
        <div className="footer-content">
          {/* Left Section - Brand */}
          <div className="footer-section footer-brand">
            <h3 className="brand-name">
              <i className="fas fa-blog"></i>
              Imran's Blog
            </h3>
            <p className="brand-tagline">
              Sharing thoughts, ideas & experiences
            </p>
          </div>

          {/* Center Section - Contact */}
          <div className="footer-section footer-contact">
            <h4 className="section-title">Get In Touch</h4>
            <div className="contact-info">
              <a
                className="contact-link"
                href="mailto:imranansari.in.official@gmail.com"
                title="Send Email"
              >
                <i className="fas fa-envelope"></i>
                imranansari.in.official@gmail.com
              </a>
            </div>
          </div>

          {/* Right Section - Social Links */}
          <div className="footer-section footer-social">
            <h4 className="section-title">Follow Me</h4>
            <div className="social-links">
              <a
                className="social-link"
                href="https://linkedin.com/in/imran693"
                target="_blank"
                rel="noopener noreferrer"
                title="LinkedIn Profile"
              >
                <i className="fab fa-linkedin"></i>
              </a>
              <a
                className="social-link"
                href="https://github.com/imran6932"
                target="_blank"
                rel="noopener noreferrer"
                title="GitHub Profile"
              >
                <i className="fab fa-github"></i>
              </a>
              <a
                className="social-link"
                href="https://twitter.com/imran693"
                target="_blank"
                rel="noopener noreferrer"
                title="Twitter Profile"
              >
                <i className="fab fa-twitter"></i>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section - Copyright */}
        <div className="footer-bottom">
          <div className="copyright">
            <span>&copy; 2025 Imran Ansari. All rights reserved.</span>
          </div>
          <div className="footer-links">
            <Link to="/privacy-policy" className="footer-link">
              Privacy Policy
            </Link>
            <span className="footer-divider">•</span>
            <Link to="/terms-and-conditions" className="footer-link">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
