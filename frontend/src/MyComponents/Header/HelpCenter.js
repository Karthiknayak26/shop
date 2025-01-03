import React, { useState } from 'react';
import './HelpCenter.css';

const HelpCenter = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Submit form data to backend API
    console.log('Form submitted:', formData);
    setSubmitted(true);
  };

  return (
    <div className="help-center">
      <h1>Help Center</h1>
      <section className="help-topics">
        <h2>Common Questions</h2>
        <ul>
          <li>How can I track my order?</li>
          <li>What is the return policy?</li>
          <li>How do I update my profile information?</li>
          <li>How do I reset my password?</li>
        </ul>
      </section>

      <section className="contact-support">
        <h2>Contact Support</h2>
        {submitted ? (
          <p>Thank you for contacting us! We will get back to you shortly.</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="message">Message:</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows="5"
                required
              ></textarea>
            </div>
            <button type="submit" className="submit-button">
              Submit
            </button>
          </form>
        )}
      </section>
    </div>
  );
};

export default HelpCenter;
