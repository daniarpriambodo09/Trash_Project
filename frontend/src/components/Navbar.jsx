// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from '../styles/Navbar.module.css';

export default function Navbar({ variant = 'default' }) {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      // Detect active section
      if (isHomePage) {
        const sections = ['home', 'cara', 'tentang', 'kontak'];
        const currentSection = sections.find(section => {
          const element = document.getElementById(section);
          if (element) {
            const rect = element.getBoundingClientRect();
            return rect.top <= 100 && rect.bottom >= 100;
          }
          return false;
        });
        if (currentSection) {
          setActiveSection(currentSection);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage]);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setMobileMenuOpen(false);
  };

  const handleNavClick = (e, target) => {
    if (!isHomePage) return;
    e.preventDefault();
    scrollToSection(target);
  };

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''} ${variant === 'home' ? styles.homeNavbar : ''}`}>
      <div className={styles.navbarContent}>
        {/* Logo */}
        <Link to="/" className={styles.logo} onClick={() => setMobileMenuOpen(false)}>
          <span className={styles.logoIcon}>🍃</span>
          <span className={styles.logoText}>ECOSCAN</span>
        </Link>

        {/* Desktop Navigation */}
        <div className={styles.navLinks}>
          {isHomePage ? (
            <>
              <a
                href="#home"
                className={activeSection === 'home' ? styles.active : ''}
                onClick={(e) => handleNavClick(e, 'home')}
              >
                <span className={styles.navIcon}>🏠</span>
                Beranda
              </a>
              <a
                href="#cara"
                className={activeSection === 'cara' ? styles.active : ''}
                onClick={(e) => handleNavClick(e, 'cara')}
              >
                <span className={styles.navIcon}>🔍</span>
                Cara Kerja
              </a>
              <a
                href="#tentang"
                className={activeSection === 'tentang' ? styles.active : ''}
                onClick={(e) => handleNavClick(e, 'tentang')}
              >
                <span className={styles.navIcon}>💡</span>
                Tentang
              </a>
              <a
                href="#kontak"
                className={activeSection === 'kontak' ? styles.active : ''}
                onClick={(e) => handleNavClick(e, 'kontak')}
              >
                <span className={styles.navIcon}>📧</span>
                Kontak
              </a>
            </>
          ) : (
            <>
              <Link to="/">
                <span className={styles.navIcon}>🏠</span>
                Beranda
              </Link>
              <Link to="/">
                <span className={styles.navIcon}>🔍</span>
                Cara Kerja
              </Link>
              <Link to="/">
                <span className={styles.navIcon}>💡</span>
                Tentang
              </Link>
              <Link to="/">
                <span className={styles.navIcon}>📧</span>
                Kontak
              </Link>
            </>
          )}
          <Link to="/classify" className={styles.ctaButton}>
            <span className={styles.ctaIcon}>🚀</span>
            Coba Sekarang
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className={`${styles.mobileMenuButton} ${mobileMenuOpen ? styles.open : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.open : ''}`}>
        {isHomePage ? (
          <>
            <a
              href="#home"
              className={activeSection === 'home' ? styles.active : ''}
              onClick={(e) => handleNavClick(e, 'home')}
            >
              <span className={styles.navIcon}>🏠</span>
              Beranda
            </a>
            <a
              href="#cara"
              className={activeSection === 'cara' ? styles.active : ''}
              onClick={(e) => handleNavClick(e, 'cara')}
            >
              <span className={styles.navIcon}>🔍</span>
              Cara Kerja
            </a>
            <a
              href="#tentang"
              className={activeSection === 'tentang' ? styles.active : ''}
              onClick={(e) => handleNavClick(e, 'tentang')}
            >
              <span className={styles.navIcon}>💡</span>
              Tentang
            </a>
            <a
              href="#kontak"
              className={activeSection === 'kontak' ? styles.active : ''}
              onClick={(e) => handleNavClick(e, 'kontak')}
            >
              <span className={styles.navIcon}>📧</span>
              Kontak
            </a>
          </>
        ) : (
          <>
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>
              <span className={styles.navIcon}>🏠</span>
              Beranda
            </Link>
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>
              <span className={styles.navIcon}>🔍</span>
              Cara Kerja
            </Link>
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>
              <span className={styles.navIcon}>💡</span>
              Tentang
            </Link>
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>
              <span className={styles.navIcon}>📧</span>
              Kontak
            </Link>
          </>
        )}
        <Link 
          to="/classify" 
          className={styles.mobileCtaButton}
          onClick={() => setMobileMenuOpen(false)}
        >
          <span className={styles.ctaIcon}>🚀</span>
          Coba Sekarang
        </Link>
      </div>
    </nav>
  );
}