// src/components/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import styles from '../styles/HomePage.module.css';


export default function HomePage() {
  return (
    <>
      <Navbar variant="home" />

      <section className={styles.heroSection} id="home">
        <div className={`${styles.bgCircle} ${styles.bgCircle1}`}></div>
        <div className={`${styles.bgCircle} ${styles.bgCircle2}`}></div>
        <div className={`${styles.bgCircle} ${styles.bgCircle3}`}></div>
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <h1>
              <span className={styles.highlight}>Klasifikasi Sampah</span><br />
              Lebih Mudah & Cepat
            </h1>
            <p className={styles.heroSubtitle}>
              Ubah Dunia, Mulai Dari Sampah Anda
            </p>
            <a href="/classify" className={styles.ctaButton}>
              COBA SEKARANG
            </a>
            <p className={styles.heroTagline}>
              Unggah gambar sampah Anda dan dapatkan hasil klasifikasi langsung
            </p>
          </div>
          <div className={styles.heroImage}>
            <div className={styles.illustrationContainer}>
              <div className={styles.mainCircle}>
                <div className={styles.magnifyingGlass}>
                  😊
                  <div className={styles.magnifyingHandle}></div>
                </div>
              </div>
              <div className={`${styles.wasteItem} ${styles.wasteItem1}`}>
                <div className={styles.wasteIcon}>
                  <img src="/images/sampah_plastik.png" alt='logo'/>
                </div>
                <div className={styles.wasteLabel}>Plastik</div>
              </div>
              <div className={`${styles.wasteItem} ${styles.wasteItem2}`}>
                <div className={styles.wasteIcon}>🍃</div>
                <div className={styles.wasteLabel}>Organik</div>
              </div>
              <div className={`${styles.wasteItem} ${styles.wasteItem3}`}>
                <div className={styles.wasteIcon}>📄</div>
                <div className={styles.wasteLabel}>Kertas</div>
              </div>
              <div className={`${styles.wasteItem} ${styles.wasteItem4}`}>
                <div className={styles.wasteIcon}>🥫</div>
                <div className={styles.wasteLabel}>Logam</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.featuresSection} id="cara">
        <div className={styles.featuresContainer}>
          <h2 className={styles.sectionTitle}>Bagaimana Cara Kerjanya?</h2>
          <div className={styles.featuresGrid}>
            {[{
              icon: '📸', title: 'Upload Gambar',
              desc: 'Ambil foto atau upload gambar sampah yang ingin Anda klasifikasikan'
            }, {
              icon: '🤖', title: 'AI Analisis',
              desc: 'Sistem AI kami akan menganalisis jenis sampah dengan akurasi tinggi'
            }, {
              icon: '✅', title: 'Dapatkan Hasil',
              desc: 'Terima hasil klasifikasi lengkap dengan cara pengelolaan yang tepat'
            }].map((item, i) => (
              <div key={i} className={styles.featureCard}>
                <div className={styles.featureIcon}>{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.statsSection}>
        <div className={styles.statsContainer}>
          {[{
            num: '10K+', label: 'Pengguna Aktif'
          }, {
            num: '98%', label: 'Akurasi AI'
          }, {
            num: '50K+', label: 'Sampah Terklasifikasi'
          }, {
            num: '24/7', label: 'Tersedia'
          }].map((item, i) => (
            <div key={i} className={styles.statItem}>
              <div className={styles.statNumber}>{item.num}</div>
              <div className={styles.statLabel}>{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.featuresSection} id="tentang">
        <div className={styles.featuresContainer}>
          <h2 className={styles.sectionTitle}>Kenapa Pilih EcoScan?</h2>
          <div className={styles.featuresGrid}>
            {[{
              icon: '⚡', title: 'Cepat & Akurat',
              desc: 'Hasil klasifikasi dalam hitungan detik dengan akurasi hingga 98%'
            }, {
              icon: '🌍', title: 'Ramah Lingkungan',
              desc: 'Bantu kurangi pencemaran dengan pemilahan sampah yang tepat'
            }, {
              icon: '💚', title: 'Gratis Digunakan',
              desc: 'Akses penuh ke semua fitur tanpa biaya berlangganan'
            }].map((item, i) => (
              <div key={i} className={styles.featureCard}>
                <div className={styles.featureIcon}>{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

        <section className={styles.ctaSection} id="kontak">
        <div className={styles.ctaContent}>
          <h2>Siap Mulai Klasifikasi Sampah?</h2>
          <p>Bergabunglah dengan ribuan pengguna lainnya dalam menjaga kebersihan lingkungan</p>
          {/* ✅ Ganti juga tombol MULAI SEKARANG */}
          <Link to="/classify" className={styles.ctaButton}>MULAI SEKARANG</Link>
        </div>
      </section>

      <footer className={styles.footer}>
        <p>&copy; 2024 EcoScan. All rights reserved.</p>
        <p>Dibuat dengan 💚 untuk lingkungan yang lebih baik</p>
        <p>Kontak: <a href="mailto:info@ecoscan.id">info@ecoscan.id</a></p>
      </footer>
    </>
  );
}