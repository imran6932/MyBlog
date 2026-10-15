import React, { useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import "./LegalPages.css";

const TermsAndConditions = () => {
  const { isDarkMode } = useTheme();

  useEffect(() => {
    document.title = "Terms and Conditions | Imran's Blog";
  }, []);

  return (
    <div className={`legal-page-wrapper ${isDarkMode ? 'blog-dark-theme' : 'blog-light-theme'}`}>
      <div className="legal-page-container">
        <div className="legal-header">
          <h1 className="legal-title">
            <i className="fas fa-file-contract"></i>
            Terms and Conditions
          </h1>
          <p className="legal-subtitle">
            Please read these terms and conditions carefully before using our service
          </p>
          <div className="last-updated">
            <i className="fas fa-calendar-alt"></i>
            Last updated: January 2025
          </div>
        </div>

        <div className="legal-content">
          <section className="legal-section">
            <h2 className="section-title">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Imran's Blog ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. 
              If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="section-title">2. Description of Service</h2>
            <p>
              Imran's Blog is a personal blog platform where I share thoughts, ideas, technical insights, and experiences related to software development, 
              technology, and other topics of interest. The service includes:
            </p>
            <ul>
              <li>Blog posts and articles</li>
              <li>Comment sections for user interaction</li>
              <li>User account creation and management</li>
              <li>Personal profile customization</li>
              <li>Content sharing capabilities</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2 className="section-title">3. User Accounts and Registration</h2>
            <p>
              To access certain features of the Service, you may be required to create an account. You agree to:
            </p>
            <ul>
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain and promptly update your account information</li>
              <li>Maintain the security and confidentiality of your password</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2 className="section-title">4. User Content and Conduct</h2>
            <p>
              You are responsible for all content you post, upload, or share on the Service. You agree not to:
            </p>
            <ul>
              <li>Post content that is illegal, harmful, threatening, abusive, or defamatory</li>
              <li>Violate any intellectual property rights</li>
              <li>Share spam, advertisements, or promotional content without permission</li>
              <li>Impersonate others or provide false information</li>
              <li>Attempt to gain unauthorized access to the Service or other users' accounts</li>
              <li>Use the Service for any unlawful purpose</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2 className="section-title">5. Intellectual Property Rights</h2>
            <p>
              The Service and its original content, features, and functionality are owned by Imran Ansari and are protected by international copyright, 
              trademark, patent, trade secret, and other intellectual property laws.
            </p>
            <p>
              You retain ownership of content you create and post on the Service, but grant us a worldwide, non-exclusive, royalty-free license to use, 
              modify, and display such content in connection with operating the Service.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="section-title">6. Privacy Policy</h2>
            <p>
              Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information when you use the Service. 
              By using the Service, you agree to the collection and use of information in accordance with our Privacy Policy.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="section-title">7. Termination</h2>
            <p>
              We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, 
              including but not limited to breach of these Terms.
            </p>
            <p>
              Upon termination, your right to use the Service will cease immediately, and any data associated with your account may be deleted.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="section-title">8. Disclaimers and Limitation of Liability</h2>
            <p>
              The Service is provided "as is" and "as available" without any warranties of any kind. We do not guarantee that:
            </p>
            <ul>
              <li>The Service will meet your specific requirements</li>
              <li>The Service will be uninterrupted, timely, secure, or error-free</li>
              <li>Any errors in the Service will be corrected</li>
            </ul>
            <p>
              In no event shall Imran Ansari be liable for any indirect, incidental, special, consequential, or punitive damages, 
              including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="section-title">9. Changes to Terms</h2>
            <p>
              We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice 
              prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
            </p>
            <p>
              By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="section-title">10. Governing Law</h2>
            <p>
              These Terms shall be interpreted and governed by the laws of India, without regard to its conflict of law provisions. 
              Any disputes arising under these Terms shall be resolved in the courts of India.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="section-title">11. Contact Information</h2>
            <p>
              If you have any questions about these Terms and Conditions, please contact us at:
            </p>
            <div className="contact-info">
              <p><strong>Email:</strong> imranansari.in.official@gmail.com</p>
              <p><strong>Website:</strong> https://blog.imranansari.in</p>
            </div>
          </section>

          <section className="legal-section">
            <h2 className="section-title">12. Severability</h2>
            <p>
              If any provision of these Terms is held to be unenforceable or invalid, such provision will be changed and interpreted to accomplish 
              the objectives of such provision to the greatest extent possible under applicable law, and the remaining provisions will continue in full force and effect.
            </p>
          </section>
        </div>

        <div className="legal-footer">
          <p>
            By using Imran's Blog, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
