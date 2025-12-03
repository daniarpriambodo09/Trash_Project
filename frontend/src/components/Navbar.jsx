// src/components/Navbar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom'; // ✅ tambahkan useLocation
import styles from '../styles/Navbar.module.css';

export default function Navbar({ variant = 'default' }) {
  const location = useLocation(); // ✅ dapatkan path saat ini
  const isHomePage = location.pathname === '/';

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleNavClick = (e, target) => {
    if (!isHomePage) return; // Jika bukan homepage, biarkan Link handle
    e.preventDefault();
    scrollToSection(target);
  };

  return (
    <nav className={`${styles.navbar} ${variant === 'home' ? styles.homeNavbar : ''}`}>
      <div className={styles.navbarContent}>
        {/* Logo selalu ke homepage */}
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>🍃</span>
          <span>ECOSCAN</span>
        </Link>

        <div className={styles.navLinks}>
          {isHomePage ? (
            <>
              <a
                href="#home"
                className={variant === 'home' ? styles.active : ''}
                onClick={(e) => handleNavClick(e, 'home')}
              >
                Beranda
              </a>
              <a href="#tentang" onClick={(e) => handleNavClick(e, 'tentang')}>Tentang Kami</a>
              <a href="#cara" onClick={(e) => handleNavClick(e, 'cara')}>Cara Kerja</a>
              <a href="#kontak" onClick={(e) => handleNavClick(e, 'kontak')}>Kontak</a>
            </>
          ) : (
            /* Di halaman lain, tampilkan link statis ke section homepage via Link */
            <>
              <Link to="/">Beranda</Link>
              <Link to="/">Tentang Kami</Link>
              <Link to="/">Cara Kerja</Link>
              <Link to="/">Kontak</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}