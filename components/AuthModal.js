'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';

export default function AuthModal({ isOpen, onClose, mode = 'signin' }) {
  const [step, setStep] = useState('email'); // 'email', 'password', 'create-password'
  const [userExists, setUserExists] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Vérifier si l'email existe déjà
      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      
      if (data.exists) {
        // Utilisateur existe → demander mot de passe
        setUserExists(true);
        setStep('password');
      } else {
        // Nouvel utilisateur → créer compte
        setUserExists(false);
        setStep('create-password');
      }
    } catch (error) {
      setError('Erreur de vérification');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (userExists) {
        // Connexion utilisateur existant
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false
        });

        if (result?.ok) {
          onClose();
        } else {
          setError('Mot de passe incorrect');
        }
      } else {
        // Créer nouveau compte
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name })
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Erreur lors de l\'inscription');
        }

        // Connexion automatique après inscription
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false
        });

        if (result?.ok) {
          onClose();
        } else {
          throw new Error('Erreur lors de la connexion');
        }
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      const result = await signIn('google', { 
        redirect: false,
        callbackUrl: window.location.href 
      });
      
      if (result?.ok) {
        onClose();
      } else {
        setError('Erreur lors de la connexion Google');
      }
    } catch (error) {
      setError('Erreur lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const resetModal = () => {
    setStep('email');
    setUserExists(false);
    setEmail('');
    setPassword('');
    setName('');
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      animation: 'fadeIn 0.3s ease-out'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1a1a1a, #2a2a2a)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        borderRadius: '20px',
        padding: '3rem',
        maxWidth: '480px',
        width: '90%',
        textAlign: 'center',
        position: 'relative',
        boxShadow: '0 20px 60px rgba(139, 92, 246, 0.2)',
        animation: 'slideUp 0.3s ease-out'
      }}>
        <button
          onClick={() => { onClose(); resetModal(); }}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            color: '#c4b5fd',
            fontSize: '1.5rem',
            cursor: 'pointer',
            padding: '0.5rem',
            borderRadius: '50%',
            transition: 'all 0.3s ease'
          }}
        >
          ✕
        </button>

        <div style={{ marginBottom: '2rem' }}>
          <img 
            src="https://res.cloudinary.com/dtwkc40qa/image/upload/v1755344329/w_1_copie_p0px1u.png"
            alt="WaveConv"
            style={{
              height: '60px',
              width: '60px',
              objectFit: 'contain',
              borderRadius: '12px',
              margin: '0 auto',
              boxShadow: '0 8px 25px rgba(139, 92, 246, 0.3)'
            }}
          />
        </div>

        {/* Étape 1: Email */}
        {step === 'email' && (
          <>
            <h2 style={{
              color: 'white',
              fontSize: '1.75rem',
              fontWeight: '700',
              marginBottom: '0.75rem'
            }}>
              Welcome to WaveConv
            </h2>

            <p style={{
              color: '#c4b5fd',
              marginBottom: '2rem',
              fontSize: '1rem',
              lineHeight: '1.5'
            }}>
              Enter your email to continue
            </p>

            <form onSubmit={handleEmailSubmit} style={{ marginBottom: '1.5rem' }}>
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '1rem',
                  marginBottom: '1rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  background: 'rgba(139, 92, 246, 0.1)',
                  color: 'white',
                  fontSize: '1rem'
                }}
              />

              {error && (
                <div style={{
                  color: '#ef4444',
                  fontSize: '0.9rem',
                  marginBottom: '1rem',
                  padding: '0.5rem',
                  background: 'rgba(239, 68, 68, 0.1)',
                  borderRadius: '8px',
                  border: '1px solid rgba(239, 68, 68, 0.3)'
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                  color: 'white',
                  padding: '1rem',
                  borderRadius: '12px',
                  border: 'none',
                  fontWeight: '700',
                  fontSize: '1rem',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.7 : 1,
                  marginBottom: '1rem'
                }}
              >
                {isLoading ? 'Checking...' : 'Continue'}
              </button>
            </form>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              margin: '1.5rem 0',
              color: '#8b5cf6'
            }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(139, 92, 246, 0.3)' }}></div>
              <span style={{ padding: '0 1rem', fontSize: '0.9rem' }}>or</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(139, 92, 246, 0.3)' }}></div>
            </div>

            <button
              onClick={handleGoogleAuth}
              disabled={isLoading}
              style={{
                width: '100%',
                background: 'white',
                color: '#1f2937',
                padding: '1rem 1.5rem',
                borderRadius: '12px',
                border: 'none',
                fontWeight: '600',
                fontSize: '1rem',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                opacity: isLoading ? 0.7 : 1
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </>
        )}

        {/* Étape 2: Mot de passe existant */}
        {step === 'password' && userExists && (
          <>
            <h2 style={{
              color: 'white',
              fontSize: '1.75rem',
              fontWeight: '700',
              marginBottom: '0.75rem'
            }}>
              Welcome back!
            </h2>

            <p style={{
              color: '#c4b5fd',
              marginBottom: '2rem',
              fontSize: '1rem',
              lineHeight: '1.5'
            }}>
              Enter your password for {email}
            </p>

            <form onSubmit={handlePasswordSubmit}>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength="6"
                style={{
                  width: '100%',
                  padding: '1rem',
                  marginBottom: '1rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  background: 'rgba(139, 92, 246, 0.1)',
                  color: 'white',
                  fontSize: '1rem'
                }}
              />

              {error && (
                <div style={{
                  color: '#ef4444',
                  fontSize: '0.9rem',
                  marginBottom: '1rem',
                  padding: '0.5rem',
                  background: 'rgba(239, 68, 68, 0.1)',
                  borderRadius: '8px',
                  border: '1px solid rgba(239, 68, 68, 0.3)'
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                  color: 'white',
                  padding: '1rem',
                  borderRadius: '12px',
                  border: 'none',
                  fontWeight: '700',
                  fontSize: '1rem',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.7 : 1,
                  marginBottom: '1rem'
                }}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <button
              onClick={resetModal}
              style={{
                background: 'none',
                border: 'none',
                color: '#8b5cf6',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: '0.9rem'
              }}
            >
              ← Use different email
            </button>
          </>
        )}

        {/* Étape 3: Créer nouveau compte */}
        {step === 'create-password' && !userExists && (
          <>
            <h2 style={{
              color: 'white',
              fontSize: '1.75rem',
              fontWeight: '700',
              marginBottom: '0.75rem'
            }}>
              Create your account
            </h2>

            <p style={{
              color: '#c4b5fd',
              marginBottom: '2rem',
              fontSize: '1rem',
              lineHeight: '1.5'
            }}>
              Complete your account for {email}
            </p>

            <form onSubmit={handlePasswordSubmit}>
              <input
                type="text"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '1rem',
                  marginBottom: '1rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  background: 'rgba(139, 92, 246, 0.1)',
                  color: 'white',
                  fontSize: '1rem'
                }}
              />

              <input
                type="password"
                placeholder="Create a password (min. 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength="6"
                style={{
                  width: '100%',
                  padding: '1rem',
                  marginBottom: '1rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  background: 'rgba(139, 92, 246, 0.1)',
                  color: 'white',
                  fontSize: '1rem'
                }}
              />

              {error && (
                <div style={{
                  color: '#ef4444',
                  fontSize: '0.9rem',
                  marginBottom: '1rem',
                  padding: '0.5rem',
                  background: 'rgba(239, 68, 68, 0.1)',
                  borderRadius: '8px',
                  border: '1px solid rgba(239, 68, 68, 0.3)'
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                  color: 'white',
                  padding: '1rem',
                  borderRadius: '12px',
                  border: 'none',
                  fontWeight: '700',
                  fontSize: '1rem',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.7 : 1,
                  marginBottom: '1rem'
                }}
              >
                {isLoading ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            <button
              onClick={resetModal}
              style={{
                background: 'none',
                border: 'none',
                color: '#8b5cf6',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: '0.9rem'
              }}
            >
              ← Use different email
            </button>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
