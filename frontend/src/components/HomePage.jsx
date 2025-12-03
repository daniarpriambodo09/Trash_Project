// src/components/HomePage.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import styles from '../styles/HomePage.module.css';

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <Navbar variant="home" />

      {/* Hero Section */}
      <section className={styles.heroSection} id="home">
        <div className={`${styles.bgCircle} ${styles.bgCircle1}`}></div>
        <div className={`${styles.bgCircle} ${styles.bgCircle2}`}></div>
        <div className={`${styles.bgCircle} ${styles.bgCircle3}`}></div>
        
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <div className={styles.badge}>
              <span className={styles.badgeIcon}>✨</span>
              <span>Powered by AI Technology</span>
            </div>
            <h1>
              <span className={styles.highlight}>Klasifikasi Sampah</span><br />
              Lebih Mudah & Cepat
            </h1>
            <p className={styles.heroSubtitle}>
              Ubah Dunia, Mulai Dari Sampah Anda. Teknologi AI untuk masa depan yang lebih bersih.
            </p>
            
            <div className={styles.ctaGroup}>
              <Link to="/classify" className={styles.ctaButton}>
                <span className={styles.ctaIcon}>🚀</span>
                COBA SEKARANG
              </Link>
              <a href="#cara" className={styles.ctaButtonSecondary}>
                <span className={styles.ctaIcon}>📖</span>
                Pelajari Lebih Lanjut
              </a>
            </div>

            <div className={styles.heroFeatures}>
              <div className={styles.heroFeatureItem}>
                <span className={styles.featureCheck}>✓</span>
                <span>Gratis & Mudah Digunakan</span>
              </div>
              <div className={styles.heroFeatureItem}>
                <span className={styles.featureCheck}>✓</span>
                <span>Hasil Instan & Akurat</span>
              </div>
              <div className={styles.heroFeatureItem}>
                <span className={styles.featureCheck}>✓</span>
                <span>Tips Pengelolaan</span>
              </div>
            </div>
          </div>

          <div className={styles.heroImage}>
            <div className={styles.illustrationContainer}>
              {/* Main Circle with AI Animation */}
              <div className={styles.mainCircle}>
                <div className={styles.aiScan}>
                  <div className={styles.scanLine}></div>
                  <div className={styles.scanDot}></div>
                  <div className={styles.centerIcon}>
                    <span className={styles.aiIcon}>🤖</span>
                    <span className={styles.aiText}>AI Scan</span>
                  </div>
                </div>
              </div>

              {/* Waste Items with Images */}
              <div className={`${styles.wasteItem} ${styles.wasteItem1}`}>
                <div className={styles.wasteIconWrapper}>
                  <img 
                    src="/images/sampah_plastik.png" 
                    alt="Plastik"
                    className={styles.wasteImage}
                    onError={(e) => e.target.style.display = 'none'}
                  />
                </div>
                <div className={styles.wasteLabel}>Plastik</div>
                <div className={styles.wastePercentage}>95%</div>
              </div>

              <div className={`${styles.wasteItem} ${styles.wasteItem2}`}>
                <div className={styles.wasteIconWrapper}>
                  <img 
                    src="/images/sampah_organik.png" 
                    alt="Organik"
                    className={styles.wasteImage}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<span style="font-size: 3em">🍃</span>';
                    }}
                  />
                </div>
                <div className={styles.wasteLabel}>Organik</div>
                <div className={styles.wastePercentage}>92%</div>
              </div>

              <div className={`${styles.wasteItem} ${styles.wasteItem3}`}>
                <div className={styles.wasteIconWrapper}>
                  <img 
                    src="/images/sampah_kertas.png" 
                    alt="Kertas"
                    className={styles.wasteImage}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<span style="font-size: 3em">📄</span>';
                    }}
                  />
                </div>
                <div className={styles.wasteLabel}>Kertas</div>
                <div className={styles.wastePercentage}>98%</div>
              </div>

              <div className={`${styles.wasteItem} ${styles.wasteItem4}`}>
                <div className={styles.wasteIconWrapper}>
                  <img 
                    src="/images/sampah_logam.png" 
                    alt="Logam"
                    className={styles.wasteImage}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<span style="font-size: 3em">🥫</span>';
                    }}
                  />
                </div>
                <div className={styles.wasteLabel}>Logam</div>
                <div className={styles.wastePercentage}>94%</div>
              </div>

              {/* Decorative Elements */}
              <div className={styles.floatingParticle1}></div>
              <div className={styles.floatingParticle2}></div>
              <div className={styles.floatingParticle3}></div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className={styles.scrollIndicator}>
          <span>Scroll</span>
          <div className={styles.scrollArrow}>↓</div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className={styles.featuresSection} id="cara">
        <div className={styles.featuresContainer}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>🔍 Cara Kerja</span>
            <h2 className={styles.sectionTitle}>Tiga Langkah Mudah</h2>
            <p className={styles.sectionSubtitle}>
              Klasifikasi sampah dalam hitungan detik dengan teknologi AI terdepan
            </p>
          </div>

          <div className={styles.stepsContainer}>
            {[
              {
                step: '01',
                icon: '📸',
                title: 'Upload Gambar',
                desc: 'Ambil foto atau upload gambar sampah dari galeri perangkat Anda',
                color: '#3b82f6'
              },
              {
                step: '02',
                icon: '🤖',
                title: 'AI Menganalisis',
                desc: 'Teknologi deep learning mengidentifikasi jenis sampah dengan akurasi tinggi',
                color: '#8b5cf6'
              },
              {
                step: '03',
                icon: '✅',
                title: 'Dapatkan Hasil',
                desc: 'Terima hasil klasifikasi lengkap dengan tips pengelolaan yang tepat',
                color: '#10b981'
              }
            ].map((item, i) => (
              <div key={i} className={styles.stepCard}>
                <div className={styles.stepNumber} style={{ color: item.color }}>
                  {item.step}
                </div>
                <div className={styles.stepIconContainer} style={{ backgroundColor: `${item.color}15` }}>
                  <span className={styles.stepIcon}>{item.icon}</span>
                </div>
                <h3 className={styles.stepTitle}>{item.title}</h3>
                <p className={styles.stepDesc}>{item.desc}</p>
                {i < 2 && <div className={styles.stepConnector}>→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.statsSection}>
        <div className={styles.statsContainer}>
          {[
            { num: '10K+', label: 'Pengguna Aktif', icon: '👥' },
            { num: '98%', label: 'Akurasi AI', icon: '🎯' },
            { num: '50K+', label: 'Sampah Terklasifikasi', icon: '📊' },
            { num: '24/7', label: 'Tersedia', icon: '⏰' }
          ].map((item, i) => (
            <div key={i} className={styles.statCard}>
              <div className={styles.statIcon}>{item.icon}</div>
              <div className={styles.statNumber}>{item.num}</div>
              <div className={styles.statLabel}>{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Section */}
      <section className={styles.whySection} id="tentang">
        <div className={styles.whyContainer}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>💡 Keunggulan</span>
            <h2 className={styles.sectionTitle}>Kenapa Pilih EcoScan?</h2>
            <p className={styles.sectionSubtitle}>
              Platform terbaik untuk klasifikasi sampah dengan teknologi AI
            </p>
          </div>

          <div className={styles.whyGrid}>
            {[
              {
                icon: '⚡',
                title: 'Cepat & Akurat',
                desc: 'Hasil klasifikasi dalam hitungan detik dengan akurasi hingga 98%',
                color: '#f59e0b',
                features: ['Proses <2 detik', 'Akurasi tinggi', 'Model terlatih']
              },
              {
                icon: '🌍',
                title: 'Ramah Lingkungan',
                desc: 'Bantu kurangi pencemaran dengan pemilahan sampah yang tepat',
                color: '#10b981',
                features: ['Kurangi polusi', 'Daur ulang efektif', 'Edukasi lingkungan']
              },
              {
                icon: '💚',
                title: 'Gratis Digunakan',
                desc: 'Akses penuh ke semua fitur tanpa biaya berlangganan',
                color: '#7cb342',
                features: ['Tanpa biaya', 'Tanpa batas', 'Update gratis']
              },
              {
                icon: '📱',
                title: 'Mudah Digunakan',
                desc: 'Interface intuitif yang mudah dipahami siapa saja',
                color: '#3b82f6',
                features: ['UI sederhana', 'Responsif', 'User-friendly']
              },
              {
                icon: '🎓',
                title: 'Edukatif',
                desc: 'Dilengkapi tips dan informasi pengelolaan sampah',
                color: '#8b5cf6',
                features: ['Tips praktis', 'Info lengkap', 'Panduan jelas']
              },
              {
                icon: '🔒',
                title: 'Aman & Privacy',
                desc: 'Data Anda aman dan tidak dibagikan ke pihak ketiga',
                color: '#ef4444',
                features: ['Data terenkripsi', 'Privacy terjaga', 'Aman 100%']
              }
            ].map((item, i) => (
              <div key={i} className={styles.whyCard}>
                <div 
                  className={styles.whyIconContainer}
                  style={{ backgroundColor: `${item.color}15` }}
                >
                  <span className={styles.whyIcon}>{item.icon}</span>
                </div>
                <h3 className={styles.whyTitle}>{item.title}</h3>
                <p className={styles.whyDesc}>{item.desc}</p>
                <ul className={styles.whyFeatures}>
                  {item.features.map((feature, j) => (
                    <li key={j}>
                      <span className={styles.checkIcon}>✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection} id="kontak">
        <div className={styles.ctaWrapper}>
          <div className={styles.ctaBackground}>
            <div className={styles.ctaCircle1}></div>
            <div className={styles.ctaCircle2}></div>
          </div>
          <div className={styles.ctaContent}>
            <span className={styles.ctaBadge}>🚀 Mulai Sekarang</span>
            <h2>Siap Berkontribusi untuk Lingkungan?</h2>
            <p>
              Bergabunglah dengan ribuan pengguna lainnya dalam menjaga kebersihan lingkungan.
              Mulai klasifikasi sampah Anda hari ini!
            </p>
            <div className={styles.ctaButtons}>
              <Link to="/classify" className={styles.ctaButtonPrimary}>
                <span className={styles.buttonIcon}>🎯</span>
                MULAI KLASIFIKASI
              </Link>
              <a href="#cara" className={styles.ctaButtonOutline}>
                <span className={styles.buttonIcon}>📖</span>
                Pelajari Cara Kerja
              </a>
            </div>
            <div className={styles.ctaStats}>
              <div className={styles.ctaStat}>
                <span className={styles.ctaStatNumber}>10K+</span>
                <span className={styles.ctaStatLabel}>Pengguna</span>
              </div>
              <div className={styles.ctaStat}>
                <span className={styles.ctaStatNumber}>50K+</span>
                <span className={styles.ctaStatLabel}>Klasifikasi</span>
              </div>
              <div className={styles.ctaStat}>
                <span className={styles.ctaStatNumber}>98%</span>
                <span className={styles.ctaStatLabel}>Akurasi</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <div className={styles.footerTop}>
            <div className={styles.footerBrand}>
              <div className={styles.footerLogo}>
                <span className={styles.logoIcon}>🍃</span>
                <span className={styles.logoText}>ECOSCAN</span>
              </div>
              <p className={styles.footerTagline}>
                Teknologi AI untuk masa depan yang lebih bersih dan hijau
              </p>
              <div className={styles.socialLinks}>
                <a href="#" className={styles.socialLink}>📘</a>
                <a href="#" className={styles.socialLink}>📷</a>
                <a href="#" className={styles.socialLink}>🐦</a>
                <a href="#" className={styles.socialLink}>💼</a>
              </div>
            </div>

            <div className={styles.footerLinks}>
              <div className={styles.footerColumn}>
                <h4>Produk</h4>
                <ul>
                  <li><Link to="/classify">Klasifikasi</Link></li>
                  <li><a href="#cara">Cara Kerja</a></li>
                  <li><a href="#tentang">Tentang</a></li>
                </ul>
              </div>

              <div className={styles.footerColumn}>
                <h4>Dukungan</h4>
                <ul>
                  <li><a href="#kontak">Kontak</a></li>
                  <li><a href="#">FAQ</a></li>
                  <li><a href="#">Bantuan</a></li>
                </ul>
              </div>

              <div className={styles.footerColumn}>
                <h4>Kontak</h4>
                <ul>
                  <li>
                    <span className={styles.contactIcon}>📧</span>
                    <a href="mailto:info@ecoscan.id">info@ecoscan.id</a>
                  </li>
                  <li>
                    <span className={styles.contactIcon}>📱</span>
                    <span>+62 812-3456-7890</span>
                  </li>
                  <li>
                    <span className={styles.contactIcon}>📍</span>
                    <span>Surabaya, Indonesia</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <p>&copy; 2024 EcoScan. All rights reserved.</p>
            <div className={styles.footerBottomLinks}>
              <a href="#">Privacy Policy</a>
              <span>•</span>
              <a href="#">Terms of Service</a>
              <span>•</span>
              <a href="#">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}