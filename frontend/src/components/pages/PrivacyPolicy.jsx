import React, { useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import "./LegalPages.css";

const PrivacyPolicy = () => {
  const { isDarkMode } = useTheme();

  useEffect(() => {
    document.title = "Privacy Policy | Imran's Blog";
  }, []);

  return (
    <div className={`legal-page-wrapper ${isDarkMode ? 'blog-dark-theme' : 'blog-light-theme'}`}>
      <div className="legal-page-container">
        <div className="legal-header">
          <h1 className="legal-title">
            <i className="fas fa-shield-alt"></i>
            Privacy Policy
          </h1>
          <p className="legal-subtitle">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information.
          </p>
          <div className="last-updated">
            <i className="fas fa-calendar-alt"></i>
            Last updated: January 2025
          </div>
        </div>

        <div className="legal-content">
          <section className="legal-section">
            <h2 className="section-title">1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us and information we obtain automatically when you use our Service.
            </p>
            
            <h3 className="subsection-title">Information You Provide:</h3>
            <ul>
              <li><strong>Account Information:</strong> Name, email address, password, and profile information</li>
              <li><strong>Profile Content:</strong> Profile pictures, bio, and other profile customizations</li>
              <li><strong>User Content:</strong> Comments, posts, and other content you create on the platform</li>
              <li><strong>Communications:</strong> Messages you send to us, including feedback and support requests</li>
            </ul>

            <h3 className="subsection-title">Information We Collect Automatically:</h3>
            <ul>
              <li><strong>Usage Information:</strong> Pages visited, time spent on pages, links clicked</li>
              <li><strong>Device Information:</strong> Browser type, operating system, device identifiers</li>
              <li><strong>Log Information:</strong> IP address, access times, pages requested</li>
              <li><strong>Cookies and Similar Technologies:</strong> Information stored on your device to enhance user experience</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2 className="section-title">2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, maintain, and improve our Service</li>
              <li>Create and manage your account</li>
              <li>Enable you to post content and interact with other users</li>
              <li>Send you technical notices, updates, and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Monitor and analyze trends and usage patterns</li>
              <li>Detect, investigate, and prevent security incidents and fraudulent activities</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2 className="section-title">3. Information Sharing and Disclosure</h2>
            <p>We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:</p>
            
            <h3 className="subsection-title">Public Information:</h3>
            <ul>
              <li>Profile information you choose to make public</li>
              <li>Comments and posts you publish on the blog</li>
              <li>Any content you explicitly choose to share publicly</li>
            </ul>

            <h3 className="subsection-title">Service Providers:</h3>
            <ul>
              <li>Third-party services that help us operate the platform (hosting, analytics, etc.)</li>
              <li>Email service providers for sending notifications</li>
              <li>These providers are bound by confidentiality agreements</li>
            </ul>

            <h3 className="subsection-title">Legal Requirements:</h3>
            <ul>
              <li>When required by law or to respond to legal process</li>
              <li>To protect the rights, property, or safety of our users or the public</li>
              <li>To enforce our Terms of Service</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2 className="section-title">4. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, 
              alteration, disclosure, or destruction. These measures include:
            </p>
            <ul>
              <li>Encryption of sensitive data in transit and at rest</li>
              <li>Regular security assessments and updates</li>
              <li>Access controls and authentication mechanisms</li>
              <li>Secure hosting infrastructure</li>
            </ul>
            <p>
              However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your 
              personal information, we cannot guarantee absolute security.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="section-title">5. Your Rights and Choices</h2>
            <p>You have several rights regarding your personal information:</p>

            <h3 className="subsection-title">Account Information:</h3>
            <ul>
              <li>Update your profile information at any time</li>
              <li>Change your password and security settings</li>
              <li>Delete your account (some information may be retained for legal purposes)</li>
            </ul>

            <h3 className="subsection-title">Communication Preferences:</h3>
            <ul>
              <li>Opt out of promotional emails</li>
              <li>Manage notification settings</li>
              <li>Contact us to request data deletion or correction</li>
            </ul>

            <h3 className="subsection-title">Cookies:</h3>
            <ul>
              <li>Most browsers allow you to manage cookie preferences</li>
              <li>You can disable cookies, but this may affect site functionality</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2 className="section-title">6. Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to provide the Service and fulfill the purposes described in this Privacy Policy. 
              This includes:
            </p>
            <ul>
              <li>Account information: Until you delete your account</li>
              <li>Content you create: Until you delete it or your account is deleted</li>
              <li>Log data: Typically retained for 12 months for security and analytics purposes</li>
              <li>Legal compliance: As required by applicable laws and regulations</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2 className="section-title">7. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with 
              applicable data protection laws and that appropriate safeguards are in place to protect your information.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="section-title">8. Children's Privacy</h2>
            <p>
              Our Service is not directed to children under the age of 13, and we do not knowingly collect personal information from children under 13. 
              If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="section-title">9. Third-Party Links and Services</h2>
            <p>
              Our Service may contain links to third-party websites or services. We are not responsible for the privacy practices or content of these 
              third parties. We encourage you to read the privacy policies of any third-party services you visit.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="section-title">10. Analytics and Tracking</h2>
            <p>
              We may use third-party analytics services to help understand how users interact with our Service. These services may collect information 
              such as your IP address, browser type, pages visited, and time spent on pages.
            </p>
            <p>
              Common analytics services we may use include:
            </p>
            <ul>
              <li>Google Analytics (subject to Google's Privacy Policy)</li>
              <li>Other similar analytics tools that help improve our Service</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2 className="section-title">11. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any material changes by:
            </p>
            <ul>
              <li>Posting the new Privacy Policy on this page</li>
              <li>Updating the "Last updated" date</li>
              <li>Sending you an email notification (for significant changes)</li>
            </ul>
            <p>
              Your continued use of the Service after any changes indicates your acceptance of the updated Privacy Policy.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="section-title">12. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
            </p>
            <div className="contact-info">
              <p><strong>Email:</strong> imranansari.in.official@gmail.com</p>
              <p><strong>Website:</strong> https://blog.imranansari.in</p>
              <p><strong>Response Time:</strong> We typically respond to privacy inquiries within 48 hours</p>
            </div>
          </section>

          <section className="legal-section">
            <h2 className="section-title">13. Data Protection Officer</h2>
            <p>
              For privacy-related concerns or data protection inquiries, you can reach out to our Data Protection Officer at the contact information provided above. 
              We are committed to addressing your privacy concerns promptly and transparently.
            </p>
          </section>
        </div>

        <div className="legal-footer">
          <p>
            By using Imran's Blog, you acknowledge that you have read, understood, and agree to this Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
