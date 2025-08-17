'use client';

import { useState, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import AuthModal from '../components/AuthModal';
import AudioRecorder from '../components/AudioRecorder';

export default function WaveConv() {
  const { data: session } = useSession();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showRecorder, setShowRecorder] = useState(false);
  const [authMode, setAuthMode] = useState('signin');
  const fileInputRef = useRef(null);

  // Fonction pour forcer le téléchargement
  const forceDownload = async (downloadUrl, filename) => {
    try {
      console.log('🔄 Téléchargement forcé...', downloadUrl);
      
      // Fetch le fichier
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement');
      }
      
      // Convertir en blob
      const blob = await response.blob();
      
      // Créer un lien de téléchargement temporaire
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'telegram-voice.ogg';
      
      // Forcer le clic
      document.body.appendChild(link);
      link.click();
      
      // Nettoyer
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Téléchargement forcé réussi');
      
    } catch (error) {
      console.error('❌ Erreur téléchargement forcé:', error);
      // Fallback : ouvrir dans un nouvel onglet
      window.open(downloadUrl, '_blank');
    }
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
  };

  const handleRecordingComplete = (file) => {
    setSelectedFile(file);
    setShowRecorder(false);
  };

  const startConversion = async () => {
    if (!session) {
      setAuthMode('signin');
      setShowAuthModal(true);
      return;
    }

    if (!selectedFile) return;

    setIsConverting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Conversion error');
      }

      const data = await response.json();
      setResult(data);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsConverting(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setResult(null);
    setError(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSignIn = () => {
    setAuthMode('signin');
    setShowAuthModal(true);
  };

  const handleSignUp = () => {
    setAuthMode('signup');
    setShowAuthModal(true);
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
          padding: '0 1rem',
          '@media (min-width: 768px)': {
            padding: '0 2rem'
          }
        }}>
          
          {/* Logo */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            cursor: 'pointer',
            transition: 'transform 0.2s ease',
            minWidth: 'fit-content'
          }}
          onClick={() => window.location.reload()}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <img 
              src="https://res.cloudinary.com/dtwkc40qa/image/upload/f_auto,q_auto,w_64/v1755344329/w_1_copie_p0px1u.png"
              alt="WaveConv"
              style={{
                height: '32px',
                width: '32px',
                objectFit: 'contain',
                borderRadius: '6px',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                // Fallback en cas d'erreur de chargement
                backgroundColor: '#8b5cf6',
                border: '2px solid rgba(139, 92, 246, 0.3)'
              }}
              onError={(e) => {
                // Fallback si l'image ne charge pas
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            
            {/* Fallback logo text si image ne charge pas */}
            <div style={{
              display: 'none',
              width: '32px',
              height: '32px',
              backgroundColor: '#8b5cf6',
              borderRadius: '6px',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '16px',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
            }}>
              W
            </div>
            
            <img 
              src="https://res.cloudinary.com/dtwkc40qa/image/upload/f_auto,q_auto,w_200/v1755327666/waveconv_sa9cof.png"
              alt="WaveConv"
              style={{
                height: '28px',
                width: 'auto',
                objectFit: 'contain',
                display: window.innerWidth > 480 ? 'block' : 'none'
              }}
              onError={(e) => {
                // Fallback texte si logo texte ne charge pas
                e.target.style.display = 'none';
                const fallbackText = document.createElement('span');
                fallbackText.innerHTML = 'WaveConv';
                fallbackText.style.cssText = 'color: white; font-weight: 700; font-size: 18px; display: ' + (window.innerWidth > 480 ? 'inline' : 'none');
                e.target.parentNode.appendChild(fallbackText);
              }}
            />
          </div>

          {/* Nav Links - Hidden on mobile */}
          <div style={{ 
            display: 'none',
            gap: '1.5rem', 
            alignItems: 'center',
            '@media (min-width: 768px)': {
              display: 'flex'
            }
          }}>
            <a href="#features" style={{ 
              color: '#c4b5fd', 
              textDecoration: 'none', 
              fontWeight: 500,
              transition: 'color 0.3s ease',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
            }}
            onMouseEnter={(e) => e.target.style.color = '#8b5cf6'}
            onMouseLeave={(e) => e.target.style.color = '#c4b5fd'}
            >
              How it works
            </a>
            <a href="#use-cases" style={{ 
              color: '#c4b5fd', 
              textDecoration: 'none', 
              fontWeight: 500,
              transition: 'color 0.3s ease',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('use-cases')?.scrollIntoView({ behavior: 'smooth' });
            }}
            onMouseEnter={(e) => e.target.style.color = '#8b5cf6'}
            onMouseLeave={(e) => e.target.style.color = '#c4b5fd'}
            >
              Use cases
            </a>
            <a href="#faq" style={{ 
              color: '#c4b5fd', 
              textDecoration: 'none', 
              fontWeight: 500,
              transition: 'color 0.3s ease',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
            }}
            onMouseEnter={(e) => e.target.style.color = '#8b5cf6'}
            onMouseLeave={(e) => e.target.style.color = '#c4b5fd'}
            >
              FAQ
            </a>
            <a href="/contact" style={{ 
              color: '#c4b5fd', 
              textDecoration: 'none', 
              fontWeight: 500,
              transition: 'color 0.3s ease',
              fontSize: '0.9rem'
            }}
            onMouseEnter={(e) => e.target.style.color = '#8b5cf6'}
            onMouseLeave={(e) => e.target.style.color = '#c4b5fd'}
            >
              Contact
            </a>
          </div>

          {/* Auth Buttons - Responsive */}
          <div style={{ 
            display: 'flex', 
            gap: '0.5rem', 
            alignItems: 'center',
            minWidth: 'fit-content'
          }}>
            {session ? (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem'
                }}>
                  <img 
                    src={session.user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.name || session.user.email)}&background=8b5cf6&color=fff`}
                    alt={session.user.name}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      border: '2px solid rgba(139, 92, 246, 0.5)'
                    }}
                  />
                  <span style={{ 
                    color: '#c4b5fd', 
                    fontSize: '0.85rem',
                    display: 'none',
                    '@media (min-width: 480px)': {
                      display: 'inline'
                    }
                  }}>
                    {session.user.name?.split(' ')[0] || session.user.email?.split('@')[0]}
                  </span>
                </div>
                
                <button
                  onClick={() => signOut()}
                  style={{
                    color: '#c4b5fd',
                    background: 'none',
                    border: 'none',
                    fontWeight: 500,
                    padding: '0.5rem',
                    cursor: 'pointer',
                    transition: 'color 0.3s ease',
                    fontSize: '0.85rem'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#8b5cf6'}
                  onMouseLeave={(e) => e.target.style.color = '#c4b5fd'}
                >
                  Sign out
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={handleSignIn}
                  style={{
                    color: '#c4b5fd',
                    background: 'none',
                    border: 'none',
                    fontWeight: 500,
                    padding: '0.5rem 0.75rem',
                    cursor: 'pointer',
                    transition: 'color 0.3s ease',
                    fontSize: '0.85rem',
                    display: 'none',
                    '@media (min-width: 480px)': {
                      display: 'block'
                    }
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#8b5cf6'}
                  onMouseLeave={(e) => e.target.style.color = '#c4b5fd'}
                >
                  Sign in
                </button>
                
                <button
                  onClick={handleSignUp}
                  style={{
                    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                    color: 'white',
                    padding: '0.6rem 1rem',
                    borderRadius: '6px',
                    border: 'none',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: '0.85rem',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <span style={{ display: 'none', '@media (min-width: 480px)': { display: 'inline' } }}>Get Started</span>
                  <span style={{ display: 'inline', '@media (min-width: 480px)': { display: 'none' } }}>Sign up</span>
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        paddingTop: '8rem',
        paddingBottom: '4rem',
        textAlign: 'center',
        background: 'radial-gradient(ellipse at top, rgba(139, 92, 246, 0.1) 0%, transparent 50%)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          
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
            <div style={{
              width: '8px',
              height: '8px',
              background: '#8b5cf6',
              borderRadius: '50%',
              animation: 'pulse 2s infinite'
            }}></div>
            Transform any audio into Telegram voice messages
          </div>

          <h1 style={{
            fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
            fontWeight: 800,
            lineHeight: '1.1',
            marginBottom: '1.5rem',
            background: 'linear-gradient(135deg, white, #d1d5db)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em'
          }}>
            Convert any audio file into a{' '}
            <span style={{
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Telegram voice message
            </span>
          </h1>

          <p style={{
            fontSize: 'clamp(1.1rem, 3vw, 1.25rem)',
            color: '#9ca3af',
            maxWidth: '600px',
            margin: '0 auto 3rem',
            lineHeight: '1.6'
          }}>
            Upload any audio file or record directly and get a voice-ready OGG/Opus file 
            you can send instantly on Telegram. No quality loss, no hassle.
          </p>

          {/* CTA Buttons */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '3rem'
          }}>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                color: 'white',
                padding: '1rem 2rem',
                borderRadius: '12px',
                border: 'none',
                fontWeight: 600,
                fontSize: '1.1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 25px rgba(139, 92, 246, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 12px 40px rgba(139, 92, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.3)';
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>📁</span>
              Upload Audio File
            </button>

            <button
              onClick={() => setShowRecorder(true)}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                padding: '1rem 2rem',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                fontWeight: 600,
                fontSize: '1.1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>🎙️</span>
              Record Audio
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".mp3,.wav,.m4a,.ogg,.mp4,.mov,.webm"
            onChange={(e) => e.target.files.length > 0 && handleFileSelect(e.target.files[0])}
            style={{ display: 'none' }}
          />

          {/* Trust indicators */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '2rem',
            flexWrap: 'wrap',
            color: '#6b7280',
            fontSize: '0.9rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#8b5cf6' }}>✓</span>
              No file size limits
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#8b5cf6' }}>✓</span>
              Perfect quality
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#8b5cf6' }}>✓</span>
              Instant conversion
            </div>
          </div>
        </div>
      </section>

      {/* File Processing Section */}
      {(selectedFile || isConverting || result || error) && (
        <section style={{
          padding: '2rem',
          background: 'rgba(139, 92, 246, 0.05)',
          borderTop: '1px solid rgba(139, 92, 246, 0.1)',
          borderBottom: '1px solid rgba(139, 92, 246, 0.1)'
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            
            {/* File Selected */}
            {selectedFile && !isConverting && !result && (
              <div style={{ animation: 'fadeInUp 0.6s ease-out' }}>
                <div style={{
                  background: 'rgba(139, 92, 246, 0.1)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderLeft: '4px solid #8b5cf6',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  marginBottom: '2rem'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start' 
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, color: 'white', marginBottom: '0.5rem', fontSize: '1.1rem' }}>
                        {selectedFile.name.includes('recording-') ? '🎙️' : '📄'} {selectedFile.name}
                      </div>
                      <div style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
                        📊 {formatFileSize(selectedFile.size)}
                        {selectedFile.name.includes('recording-') && (
                          <span style={{ marginLeft: '1rem', color: '#8b5cf6' }}>
                            ✨ Live recording
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={resetForm}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#9ca3af',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        padding: '0.25rem',
                        borderRadius: '4px',
                        transition: 'color 0.3s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.color = 'white'}
                      onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <button
                  onClick={startConversion}
                  disabled={isConverting}
                  style={{
                    width: '100%',
                    background: session ? 
                      'linear-gradient(135deg, #8b5cf6, #7c3aed)' :
                      'linear-gradient(135deg, #f59e0b, #d97706)',
                    color: 'white',
                    padding: '1.25rem',
                    borderRadius: '16px',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.75rem',
                    transition: 'all 0.3s ease',
                    boxShadow: session ? 
                      '0 8px 25px rgba(139, 92, 246, 0.3)' :
                      '0 8px 25px rgba(245, 158, 11, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isConverting) {
                      e.target.style.transform = 'translateY(-3px)';
                      e.target.style.boxShadow = session ? 
                        '0 12px 35px rgba(139, 92, 246, 0.5)' :
                        '0 12px 35px rgba(245, 158, 11, 0.5)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isConverting) {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = session ? 
                        '0 8px 25px rgba(139, 92, 246, 0.3)' :
                        '0 8px 25px rgba(245, 158, 11, 0.3)';
                    }
                  }}
                >
                  {session ? (
                    <>
                      <span style={{ fontSize: '1.2rem' }}>⚡</span>
                      Convert to Telegram Voice
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: '1.2rem' }}>🔐</span>
                      Sign in to convert
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Converting */}
            {isConverting && (
              <div style={{
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '16px',
                padding: '3rem',
                textAlign: 'center',
                animation: 'fadeInUp 0.6s ease-out'
              }}>
                <div style={{ 
                  fontSize: '3rem', 
                  marginBottom: '1rem',
                  animation: 'spin 2s linear infinite',
                  display: 'inline-block'
                }}>⚙️</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#8b5cf6', marginBottom: '0.5rem' }}>
                  Converting your file...
                </div>
                <div style={{ color: '#9ca3af', fontSize: '1.1rem' }}>
                  Optimizing for Telegram voice message format
                </div>
                
                <div style={{
                  width: '100%',
                  height: '6px',
                  background: 'rgba(139, 92, 246, 0.2)',
                  borderRadius: '3px',
                  marginTop: '2rem',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                    borderRadius: '3px',
                    animation: 'progress 2s ease-in-out infinite'
                  }}></div>
                </div>
              </div>
            )}

            {/* Success */}
            {result && (
              <div style={{
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '16px',
                padding: '3rem',
                textAlign: 'center',
                animation: 'fadeInUp 0.6s ease-out'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#8b5cf6', marginBottom: '0.5rem' }}>
                  Conversion complete!
                </div>
                <div style={{ color: '#9ca3af', marginBottom: '2rem', fontSize: '1.1rem' }}>
                  Your Telegram voice message is ready to download
                </div>
                
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => forceDownload(result.download_url, result.outputName)}
                    style={{
                      background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                      color: 'white',
                      padding: '1rem 2rem',
                      borderRadius: '12px',
                      border: 'none',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 8px 25px rgba(139, 92, 246, 0.3)',
                      fontSize: '1.1rem',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 12px 35px rgba(139, 92, 246, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.3)';
                    }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>📥</span>
                    Download Voice Message
                  </button>
                  
                  <button
                    onClick={resetForm}
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      padding: '1rem 2rem',
                      borderRadius: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      fontSize: '1.1rem'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    Convert Another File
                  </button>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '16px',
                padding: '2rem',
                textAlign: 'center',
                animation: 'fadeInUp 0.6s ease-out'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ef4444', marginBottom: '0.5rem' }}>
                  Conversion failed
                </div>
                <div style={{ color: '#9ca3af', marginBottom: '1.5rem' }}>{error}</div>
                <button
                  onClick={resetForm}
                  style={{
                    background: 'rgba(139, 92, 246, 0.2)',
                    border: '1px solid rgba(139, 92, 246, 0.4)',
                    color: '#8b5cf6',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(139, 92, 246, 0.3)';
                    e.target.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(139, 92, 246, 0.2)';
                    e.target.style.color = '#8b5cf6';
                  }}
                >
                  Try Again
                </button>
              </div>
            )}

          </div>
        </section>
      )}

      {/* How It Works Section */}
      <section id="features" style={{
        padding: '6rem 2rem',
        background: 'linear-gradient(to bottom, transparent, rgba(139, 92, 246, 0.02))'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          
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
            How it works
          </div>

          <h2 style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 800,
            marginBottom: '1rem',
            color: 'white'
          }}>
            Three simple steps to perfect{' '}
            <span style={{
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Telegram voice messages
            </span>
          </h2>

          <p style={{
            fontSize: '1.1rem',
            color: '#9ca3af',
            maxWidth: '600px',
            margin: '0 auto 4rem',
            lineHeight: '1.6'
          }}>
            Our advanced audio processing engine converts any format into Telegram's native voice message format in seconds.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            marginBottom: '4rem'
          }}>
            
            {/* Step 1 */}
            <div style={{
              background: 'rgba(139, 92, 246, 0.05)',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              borderRadius: '16px',
              padding: '2rem',
              textAlign: 'center',
              transition: 'transform 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                margin: '0 auto 1.5rem',
                boxShadow: '0 8px 25px rgba(139, 92, 246, 0.3)'
              }}>
                📁
              </div>
              <h3 style={{ color: 'white', fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
                Upload Your Audio
              </h3>
              <p style={{ color: '#9ca3af', lineHeight: '1.5' }}>
                Drop any audio file (MP3, WAV, M4A, OGG) or record directly in your browser. No size limits, all formats supported.
              </p>
            </div>

            {/* Step 2 */}
            <div style={{
              background: 'rgba(139, 92, 246, 0.05)',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              borderRadius: '16px',
              padding: '2rem',
              textAlign: 'center',
              transition: 'transform 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                margin: '0 auto 1.5rem',
                boxShadow: '0 8px 25px rgba(139, 92, 246, 0.3)'
              }}>
                ⚙️
              </div>
              <h3 style={{ color: 'white', fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
                AI-Powered Conversion
              </h3>
              <p style={{ color: '#9ca3af', lineHeight: '1.5' }}>
                Our engine converts your audio to OGG/Opus format with optimal compression for Telegram voice messages.
              </p>
            </div>

            {/* Step 3 */}
            <div style={{
              background: 'rgba(139, 92, 246, 0.05)',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              borderRadius: '16px',
              padding: '2rem',
              textAlign: 'center',
              transition: 'transform 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                margin: '0 auto 1.5rem',
                boxShadow: '0 8px 25px rgba(139, 92, 246, 0.3)'
              }}>
                📱
              </div>
              <h3 style={{ color: 'white', fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
                Download & Send
              </h3>
              <p style={{ color: '#9ca3af', lineHeight: '1.5' }}>
                Get your converted file and send it on Telegram as if you just recorded it. Perfect voice message every time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" style={{
        padding: '6rem 2rem',
        background: 'rgba(139, 92, 246, 0.02)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 800,
              marginBottom: '1rem',
              color: 'white'
            }}>
              Perfect for every{' '}
              <span style={{
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                use case
              </span>
            </h2>
            <p style={{
              fontSize: '1.1rem',
              color: '#9ca3af',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}>
              From content creators to business professionals, WaveConv adapts to your workflow.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem'
          }}>
            
            {/* Content Creators */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '2rem'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                🎬
              </div>
              <h3 style={{ color: 'white', fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
                Content Creators
              </h3>
              <p style={{ color: '#9ca3af', lineHeight: '1.6', marginBottom: '1rem' }}>
                Transform podcast clips, YouTube audio, or any content into engaging Telegram voice messages for your community.
              </p>
              <div style={{ color: '#8b5cf6', fontSize: '0.9rem' }}>
                Perfect for audience engagement →
              </div>
            </div>

            {/* Marketers */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '2rem'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                📢
              </div>
              <h3 style={{ color: 'white', fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
                Digital Marketers
              </h3>
              <p style={{ color: '#9ca3af', lineHeight: '1.6', marginBottom: '1rem' }}>
                Send personalized voice messages to clients, create audio testimonials, or share campaign updates with a personal touch.
              </p>
              <div style={{ color: '#8b5cf6', fontSize: '0.9rem' }}>
                Boost conversion rates →
              </div>
            </div>

            {/* Teams */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '2rem'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                👥
              </div>
              <h3 style={{ color: 'white', fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
                Teams & Freelancers
              </h3>
              <p style={{ color: '#9ca3af', lineHeight: '1.6', marginBottom: '1rem' }}>
                Share meeting recordings, voice notes, or project updates in a format that feels natural and immediate.
              </p>
              <div style={{ color: '#8b5cf6', fontSize: '0.9rem' }}>
                Streamline communication →
              </div>
            </div>

            {/* Personal */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '2rem'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                💬
              </div>
              <h3 style={{ color: 'white', fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
                Personal Use
              </h3>
              <p style={{ color: '#9ca3af', lineHeight: '1.6', marginBottom: '1rem' }}>
                Send songs, voice memos, or any audio to friends and family as if you recorded it live in the conversation.
              </p>
              <div style={{ color: '#8b5cf6', fontSize: '0.9rem' }}>
                More authentic sharing →
              </div>
            </div>

            {/* Bots & AI Agents */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '2rem'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                🤖
              </div>
              <h3 style={{ color: 'white', fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
                Bots & AI Agents
              </h3>
              <p style={{ color: '#9ca3af', lineHeight: '1.6', marginBottom: '1rem' }}>
                <strong>Make your AI feel more human.</strong> Convert generated text or audio into native Telegram voice messages, giving your bot or virtual assistant a more authentic presence.
              </p>
              <div style={{ color: '#8b5cf6', fontSize: '0.9rem' }}>
                Boost engagement with lifelike interactions →
              </div>
            </div>

            {/* Customer Support */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '2rem'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #ec4899, #db2777)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                🎧
              </div>
              <h3 style={{ color: 'white', fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
                Customer Support & Service Teams
              </h3>
              <p style={{ color: '#9ca3af', lineHeight: '1.6', marginBottom: '1rem' }}>
                <strong>Deliver quick, human-like support with voice replies.</strong> Convert instructions, explanations, or updates into authentic Telegram voice messages that strengthen customer trust.
              </p>
              <div style={{ color: '#8b5cf6', fontSize: '0.9rem' }}>
                Build stronger connections →
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" style={{
        padding: '6rem 2rem',
        background: 'linear-gradient(to bottom, rgba(139, 92, 246, 0.02), transparent)'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 800,
              marginBottom: '1rem',
              color: 'white'
            }}>
              Frequently asked{' '}
              <span style={{
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                questions
              </span>
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* FAQ Item 1 */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '1.5rem'
            }}>
              <h3 style={{ color: 'white', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                What audio formats are supported?
              </h3>
              <p style={{ color: '#9ca3af', lineHeight: '1.6', margin: 0 }}>
                We support all major formats: MP3, WAV, M4A, OGG, FLAC, AAC, and even video files like MP4, MOV, WEBM. 
                If it has audio, we can convert it.
              </p>
            </div>

            {/* FAQ Item 2 */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '1.5rem'
            }}>
              <h3 style={{ color: 'white', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                Is it completely free?
              </h3>
              <p style={{ color: '#9ca3af', lineHeight: '1.6', margin: 0 }}>
                Yes! WaveConv is free to use with no file size limits. We believe everyone should have access to seamless 
                audio conversion for Telegram.
              </p>
            </div>

            {/* FAQ Item 3 */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '1.5rem'
            }}>
              <h3 style={{ color: 'white', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                What's the maximum file size?
              </h3>
              <p style={{ color: '#9ca3af', lineHeight: '1.6', margin: 0 }}>
                Currently set to 50MB per file, but this covers most use cases. Need larger files? 
                Contact us and we'll increase your limit.
              </p>
            </div>

            {/* FAQ Item 4 */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '1.5rem'
            }}>
              <h3 style={{ color: 'white', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                Does it preserve audio quality?
              </h3>
              <p style={{ color: '#9ca3af', lineHeight: '1.6', margin: 0 }}>
                Absolutely. We use advanced compression algorithms optimized for voice content while maintaining 
                excellent quality that's perfect for Telegram's voice message system.
              </p>
            </div>

            {/* FAQ Item 5 */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '1.5rem'
            }}>
              <h3 style={{ color: 'white', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                Does it work on mobile devices?
              </h3>
              <p style={{ color: '#9ca3af', lineHeight: '1.6', margin: 0 }}>
                Yes! WaveConv works perfectly on any device with a modern browser. Upload files or record audio 
                directly from your phone, tablet, or desktop.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '3rem 2rem 2rem',
        background: 'rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem',
            marginBottom: '2rem'
          }}>
            
            {/* Brand */}
            <div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem',
                marginBottom: '1rem'
              }}>
                <img 
                  src="https://res.cloudinary.com/dtwkc40qa/image/upload/v1755344329/w_1_copie_p0px1u.png"
                  alt="WaveConv"
                  style={{
                    width: '32px',
                    height: '32px',
                    objectFit: 'contain',
                    borderRadius: '8px'
                  }}
                />
                <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>WaveConv</span>
              </div>
              <p style={{ color: '#9ca3af', lineHeight: '1.6', margin: 0 }}>
                Transform any audio into perfect Telegram voice messages. 
                Fast, free, and reliable audio conversion.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 style={{ color: 'white', fontWeight: 600, marginBottom: '1rem' }}>Product</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <a href="#features" style={{ color: '#9ca3af', textDecoration: 'none', transition: 'color 0.3s ease' }}
                   onMouseEnter={(e) => e.target.style.color = 'white'}
                   onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>
                  Features
                </a>
                <a href="#pricing" style={{ color: '#9ca3af', textDecoration: 'none', transition: 'color 0.3s ease' }}
                   onMouseEnter={(e) => e.target.style.color = 'white'}
                   onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>
                  Pricing
                </a>
                <a href="/admin" style={{ color: '#9ca3af', textDecoration: 'none', transition: 'color 0.3s ease' }}
                   onMouseEnter={(e) => e.target.style.color = 'white'}
                   onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>
                  Admin
                </a>
              </div>
            </div>

            {/* Support */}
            <div>
              <h4 style={{ color: 'white', fontWeight: 600, marginBottom: '1rem' }}>Support</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <a href="mailto:support@waveconv.com" style={{ color: '#9ca3af', textDecoration: 'none', transition: 'color 0.3s ease' }}
                   onMouseEnter={(e) => e.target.style.color = 'white'}
                   onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>
                  Contact Us
                </a>
                <a href="#" style={{ color: '#9ca3af', textDecoration: 'none', transition: 'color 0.3s ease' }}
                   onMouseEnter={(e) => e.target.style.color = 'white'}
                   onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>
                  Help Center
                </a>
                <a href="#" style={{ color: '#9ca3af', textDecoration: 'none', transition: 'color 0.3s ease' }}
                   onMouseEnter={(e) => e.target.style.color = 'white'}
                   onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>
                  Privacy Policy
                </a>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '0.9rem' }}>
              © 2024 WaveConv. All rights reserved.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <a href="#" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.9rem' }}>Terms</a>
              <a href="#" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.9rem' }}>Privacy</a>
              <a href="#" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.9rem' }}>Cookies</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
      />

      {showRecorder && (
        <AudioRecorder 
          onRecordingComplete={handleRecordingComplete}
          onClose={() => setShowRecorder(false)}
        />
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes progress {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}