import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import "../styles/Challenge.css";

const Feedback = () => {
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate

  const handleFeedbackChange = (e) => {
    setFeedback(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    
    try {
      const response = await fetch('http://localhost:5000/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ fedbck: feedback })
      });
      
      if (!response.ok) { // Fix the issue where the error handling wasn't correctly checking response status
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit feedback');
      }
      
      setSuccess(true);
      setFeedback("");

      // Navigate to home page after a short delay
      setTimeout(() => {
        navigate("/");
      }, 2000); // Optional delay for user to see the success message
    } catch (error) {
      setError(error.message || "Failed to submit feedback");
      console.error("Error submitting feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container">
      <div className="main-content">
        <div className="content">
          <div className="challenge-container">
            <h1 className="challenge-title">📝 Feedback 📝</h1>
            
            <div className="challenge-form-container">
              <h2>Share Your Thoughts</h2>
              {error && <div className="error-message">{error}</div>}
              {success && (
                <div className="success-message">
                  Thank you for your feedback! Redirecting...
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="feedback">Your Feedback:</label>
                  <textarea 
                    id="feedback" 
                    value={feedback}
                    onChange={handleFeedbackChange}
                    placeholder="Tell us what you think about QUIZENA. Share your suggestions, report issues, or let us know what features you'd like to see next!"
                    required
                    className="feedback-textarea"
                    rows="8"
                  />
                </div>
                
                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="submit-btn" 
                    disabled={isSubmitting || !feedback.trim()}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Feedback"}
                  </button>
                </div>
              </form>
            </div>

            <div className="feedback-info">
              <h3>Why Your Feedback Matters</h3>
              <p>
                At QUIZENA, we're constantly working to improve your experience.
                Your insights help us understand what's working well and what needs improvement.
                Every suggestion is valuable and contributes to making QUIZENA better for everyone.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
