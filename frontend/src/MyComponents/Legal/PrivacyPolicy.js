import React from 'react';
import { Container, Typography, Box, Divider } from '@mui/material';
import './Legal.css';

const PrivacyPolicy = () => {
  return (
    <Container className="legal-container">
      <Box my={4}>
        <Typography variant="h3" component="h1" gutterBottom className="legal-title">
          Privacy Policy
        </Typography>
        <Typography variant="subtitle1" gutterBottom className="legal-updated">
          Last Updated: {new Date().toLocaleDateString()}
        </Typography>
        
        <Divider className="legal-divider" />
        
        <Box my={3}>
          <Typography variant="h5" component="h2" gutterBottom className="legal-section-title">
            1. Introduction
          </Typography>
          <Typography variant="body1" paragraph className="legal-text">
            Welcome to Kandukuru Supermarket. We respect your privacy and are committed to protecting your personal data. 
            This privacy policy will inform you about how we look after your personal data when you visit our website and 
            tell you about your privacy rights and how the law protects you.
          </Typography>
          <Typography variant="body1" paragraph className="legal-text">
            This privacy policy applies to all users of our website, regardless of how you access it, and by using our 
            website, you consent to the data practices described in this statement.
          </Typography>
        </Box>
        
        <Box my={3}>
          <Typography variant="h5" component="h2" gutterBottom className="legal-section-title">
            2. Data We Collect
          </Typography>
          <Typography variant="body1" paragraph className="legal-text">
            We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
          </Typography>
          <Typography variant="body1" component="ul" className="legal-list">
            <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
            <li><strong>Contact Data</strong> includes billing address, delivery address, email address and telephone numbers.</li>
            <li><strong>Financial Data</strong> includes payment card details (stored securely through our payment processors).</li>
            <li><strong>Transaction Data</strong> includes details about payments to and from you and other details of products you have purchased from us.</li>
            <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access this website.</li>
            <li><strong>Profile Data</strong> includes your username and password, purchases or orders made by you, your interests, preferences, feedback and survey responses.</li>
            <li><strong>Usage Data</strong> includes information about how you use our website and services.</li>
          </Typography>
        </Box>
        
        <Box my={3}>
          <Typography variant="h5" component="h2" gutterBottom className="legal-section-title">
            3. How We Use Your Data
          </Typography>
          <Typography variant="body1" paragraph className="legal-text">
            We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
          </Typography>
          <Typography variant="body1" component="ul" className="legal-list">
            <li>To register you as a new customer.</li>
            <li>To process and deliver your order including managing payments and collecting money owed to us.</li>
            <li>To manage our relationship with you including notifying you about changes to our terms or privacy policy.</li>
            <li>To enable you to participate in a review, survey, or other features of our service.</li>
            <li>To administer and protect our business and this website.</li>
            <li>To deliver relevant website content and advertisements to you.</li>
            <li>To use data analytics to improve our website, products/services, marketing, customer relationships and experiences.</li>
          </Typography>
        </Box>
        
        <Box my={3}>
          <Typography variant="h5" component="h2" gutterBottom className="legal-section-title">
            4. Data Security
          </Typography>
          <Typography variant="body1" paragraph className="legal-text">
            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or 
            accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those 
            employees, agents, contractors and other third parties who have a business need to know.
          </Typography>
          <Typography variant="body1" paragraph className="legal-text">
            We have put in place procedures to deal with any suspected personal data breach and will notify you and any applicable 
            regulator of a breach where we are legally required to do so.
          </Typography>
        </Box>
        
        <Box my={3}>
          <Typography variant="h5" component="h2" gutterBottom className="legal-section-title">
            5. Data Retention
          </Typography>
          <Typography variant="body1" paragraph className="legal-text">
            We will only retain your personal data for as long as necessary to fulfill the purposes we collected it for, including 
            for the purposes of satisfying any legal, accounting, or reporting requirements.
          </Typography>
          <Typography variant="body1" paragraph className="legal-text">
            To determine the appropriate retention period for personal data, we consider the amount, nature, and sensitivity of the 
            personal data, the potential risk of harm from unauthorized use or disclosure of your personal data, the purposes for 
            which we process your personal data and whether we can achieve those purposes through other means, and the applicable 
            legal requirements.
          </Typography>
        </Box>
        
        <Box my={3}>
          <Typography variant="h5" component="h2" gutterBottom className="legal-section-title">
            6. Your Legal Rights
          </Typography>
          <Typography variant="body1" paragraph className="legal-text">
            Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:
          </Typography>
          <Typography variant="body1" component="ul" className="legal-list">
            <li><strong>Request access</strong> to your personal data.</li>
            <li><strong>Request correction</strong> of your personal data.</li>
            <li><strong>Request erasure</strong> of your personal data.</li>
            <li><strong>Object to processing</strong> of your personal data.</li>
            <li><strong>Request restriction of processing</strong> your personal data.</li>
            <li><strong>Request transfer</strong> of your personal data.</li>
            <li><strong>Right to withdraw consent</strong>.</li>
          </Typography>
          <Typography variant="body1" paragraph className="legal-text">
            You will not have to pay a fee to access your personal data (or to exercise any of the other rights). However, 
            we may charge a reasonable fee if your request is clearly unfounded, repetitive or excessive. Alternatively, 
            we may refuse to comply with your request in these circumstances.
          </Typography>
        </Box>
        
        <Box my={3}>
          <Typography variant="h5" component="h2" gutterBottom className="legal-section-title">
            7. Cookies
          </Typography>
          <Typography variant="body1" paragraph className="legal-text">
            Our website uses cookies to distinguish you from other users of our website. This helps us to provide you with a good 
            experience when you browse our website and also allows us to improve our site.
          </Typography>
          <Typography variant="body1" paragraph className="legal-text">
            A cookie is a small file of letters and numbers that we store on your browser or the hard drive of your computer if you agree. 
            Cookies contain information that is transferred to your computer's hard drive.
          </Typography>
          <Typography variant="body1" paragraph className="legal-text">
            You can set your browser to refuse all or some browser cookies, or to alert you when websites set or access cookies. 
            If you disable or refuse cookies, please note that some parts of this website may become inaccessible or not function properly.
          </Typography>
        </Box>
        
        <Box my={3}>
          <Typography variant="h5" component="h2" gutterBottom className="legal-section-title">
            8. Third-Party Links
          </Typography>
          <Typography variant="body1" paragraph className="legal-text">
            This website may include links to third-party websites, plug-ins and applications. Clicking on those links or enabling those 
            connections may allow third parties to collect or share data about you. We do not control these third-party websites and are not 
            responsible for their privacy statements. When you leave our website, we encourage you to read the privacy policy of every 
            website you visit.
          </Typography>
        </Box>
        
        <Box my={3}>
          <Typography variant="h5" component="h2" gutterBottom className="legal-section-title">
            9. Changes to This Privacy Policy
          </Typography>
          <Typography variant="body1" paragraph className="legal-text">
            We may update our privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page 
            and updating the "Last Updated" date at the top of this privacy policy.
          </Typography>
          <Typography variant="body1" paragraph className="legal-text">
            You are advised to review this privacy policy periodically for any changes. Changes to this privacy policy are effective when they 
            are posted on this page.
          </Typography>
        </Box>
        
        <Box my={3}>
          <Typography variant="h5" component="h2" gutterBottom className="legal-section-title">
            10. Contact Us
          </Typography>
          <Typography variant="body1" paragraph className="legal-text">
            If you have any questions about this privacy policy or our privacy practices, please contact us at:
          </Typography>
          <Typography variant="body1" paragraph className="legal-contact">
            Email: support@kandukuru-supermarket.com<br />
            Phone: +91-XXXXXXXXXX<br />
            Address: 123 Main Street, Hyderabad, Telangana, India
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default PrivacyPolicy;