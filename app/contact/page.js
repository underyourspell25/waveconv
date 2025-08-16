'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi du message');
      }

      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ 
      backgroundColor: '#0a0a0a', 
      color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
      margin: 0,
      padding: 0,
      minHeight: '100vh'
    }}>
      
      {/* Navigation */}
      <nav style={{
        position: 'fixed',
        top: 0,
        width: '100%',
        background: 'rgba(10, 10, 10, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        zIndex: 1000,
        padding: '1rem 0'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 2rem'
        }}>
          
          {/* Logo */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem',
            cursor: 'pointer',
            transition: 'transform 0.2s ease'
          }}
          onClick={() => window.location.href = '/'}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <img 
              src="https://res.cloudinary.com/dtwkc40qa/image/upload/v1755344329/w_1_copie_p0px1u.png"
              alt="WaveConv Favicon"
              style={{
                height: '40px',
                width: '40px',
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
              }}
            />
            
            <img 
              src="https://res.cloudinary.com/dtwkc40qa/image/upload/v1755327666/waveconv_sa9cof.png"
              alt="WaveConv Logo"
              style={{
                height: '38px',
                width: 'auto',
                objectFit: 'contain'
              }}
            />
          </div>

          {/* Back Link */}
          <a href="/" style={{ 
            color: '#c4b5fd', 
            textDecoration: 'none', 
            fontWeight: 500,
            transition: 'color 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
          onMouseEnter={(e) => e.target.style.color = '#8b5cf6'}
          onMouseLeave={(e) => e.target.style.color = '#c4b5fd'}
          >
            ← Back to Home
          </a>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{
        paddingTop: '8rem',
        paddingBottom: '4rem',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ maxWidth: '600px', width: '100%', padding: '0 2rem' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '50px',
              padding: '0.5rem 1rem',
              marginBottom: '2rem',
              fontSize: '0.9rem',
              color: '#8b5cf6'
            }}>
              💬 Get in touch
            </div>

            <h1 style={{
              fontSize: 'clamp(2rem, 6vw, 3rem)',
              fontWeight: 800,
              marginBottom: '1rem',
              background: 'linear-gradient(135deg, white, #d1d5db)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Contact{' '}
              <span style={{
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                WaveConv
              </span>
            </h1>

            <p style={{
              fontSize: '1.1rem',
              color: '#9ca3af',
              lineHeight: '1.6'
            }}>
              Have a question, suggestion, or need support? We'd love to hear from you.
            </p>
          </div>

          {/* Success Message */}
          {isSubmitted && (
            <div style={{
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '2rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
              <h3 style={{ color: '#22c55e', fontWeight: 600, marginBottom: '0.5rem' }}>
                Message sent successfully!
              </h3>
              <p style={{ color: '#9ca3af', margin: 0 }}>
                We'll get back to you as soon as possible.
              </p>
            </div>
          )}

          {/* Contact Form */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '2rem'
          }}>
            
            <form onSubmit={handleSubmit}>
              
              {/* Name & Email Row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: 600,
                    color: 'white'
                  }}>
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.875rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      background: 'rgba(139, 92, 246, 0.1)',
                      color: 'white',
                      fontSize: '1rem',
                      transition: 'border-color 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'rgba(139, 92, 246, 0.6)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)'}
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: 600,
                    color: 'white'
                  }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.875rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      background: 'rgba(139, 92, 246, 0.1)',
                      color: 'white',
                      fontSize: '1rem',
                      transition: 'border-color 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'rgba(139, 92, 246, 0.6)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)'}
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              {/* Subject */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: 600,
                  color: 'white'
                }}>
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    background: 'rgba(139, 92, 246, 0.1)',
                    color: 'white',
                    fontSize: '1rem',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'rgba(139, 92, 246, 0.6)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)'}
                  placeholder="What's this about?"
                />
              </div>

              {/* Message */}
              <div style={{ marginBottom: '2rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: 600,
                  color: 'white'
                }}>
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    background: 'rgba(139, 92, 246, 0.1)',
                    color: 'white',
                    fontSize: '1rem',
                    resize: 'vertical',
                    minHeight: '120px',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'rgba(139, 92, 246, 0.6)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)'}
                  placeholder="Tell us what you need help with..."
                />
              </div>

              {/* Error Message */}
              {error && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  padding: '0.875rem',
                  marginBottom: '1.5rem',
                  color: '#ef4444',
                  fontSize: '0.9rem'
                }}>
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  background: isSubmitting ? 
                    'rgba(139, 92, 246, 0.5)' : 
                    'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                  color: 'white',
                  padding: '1rem',
                  borderRadius: '12px',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              >
                {isSubmitting ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Sending...
                  </>
                ) : (
                  <>
                    📧 Send Message
                  </>
                )}
              </button>
            </form>

            {/* Contact Info */}
            <div style={{
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              marginTop: '2rem',
              paddingTop: '2rem',
              textAlign: 'center'
            }}>
              <p style={{ color: '#9ca3af', fontSize: '0.9rem', margin: 0 }}>
                Or email us directly at{' '}
                <a href="mailto:contact@waveconv.com" style={{
                  color: '#8b5cf6',
                  textDecoration: 'none',
                  fontWeight: 600
                }}>
                  contact@waveconv.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* CSS for spinner animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}