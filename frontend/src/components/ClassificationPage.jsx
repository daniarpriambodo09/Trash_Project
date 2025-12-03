// src/components/ClassificationPage.jsx
import React, { useState, useRef } from 'react';
import Navbar from './Navbar';
import styles from '../styles/ClassificationPage.module.css';

export default function ClassificationPage() {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // API Configuration
  const API_BASE_URL = 'http://localhost:8000';

  // === Helper functions ===
  const getIconForClass = (cls) => {
    const map = {
      glass: "🍶",
      paper: "📄",
      cardboard: "📦",
      plastic: "💧",
      metal: "🔧",
      trash: "🗑️"
    };
    return map[cls] || "❓";
  };

  const getDescription = (cls) => {
    const map = {
      glass: "Sampah kaca dapat didaur ulang berkali-kali tanpa kehilangan kualitas.",
      paper: "Kertas bekas dapat diolah kembali menjadi kertas baru yang ramah lingkungan.",
      cardboard: "Kardus bekas mudah didaur ulang dan bisa jadi bahan kemasan baru.",
      plastic: "Plastik membutuhkan waktu ratusan tahun untuk terurai — daur ulang adalah solusi.",
      metal: "Logam bekas memiliki nilai ekonomis tinggi dan bisa didaur ulang tanpa batas.",
      trash: "Sampah campuran tidak bisa didaur ulang — buang ke tempat sampah umum."
    };
    return map[cls] || "Deskripsi tidak tersedia.";
  };

  const getBadges = (cls) => {
    const map = {
      glass: ["♻️ Dapat Didaur Ulang", "🔄 Ramah Lingkungan"],
      paper: ["♻️ Dapat Didaur Ulang", "🌲 Hemat Sumber Daya"],
      cardboard: ["📦 Ringan", "♻️ Mudah Didaur Ulang"],
      plastic: ["⚠️ Sulit Terurai", "♻️ Perlu Pemilahan"],
      metal: ["💰 Nilai Ekonomis", "♻️ Dapat Didaur Ulang"],
      trash: ["⚠️ Tidak Daur Ulang", "🚮 Buang ke Tempat Sampah Umum"]
    };
    return map[cls] || ["ℹ️ Informasi"];
  };

  const getRecyclingTips = (cls) => {
    const map = {
      glass: [
        "Bersihkan botol kaca sebelum didaur ulang",
        "Pisahkan tutup logam dari botol kaca",
        "Hindari mencampur kaca dengan sampah lain"
      ],
      paper: [
        "Pastikan kertas dalam kondisi kering",
        "Pisahkan kertas berlapis plastik",
        "Lipat atau sobek kertas untuk menghemat ruang"
      ],
      cardboard: [
        "Ratakan kardus bekas untuk efisiensi penyimpanan",
        "Lepaskan selotip dan label plastik",
        "Hindari kardus yang terkena minyak atau makanan"
      ],
      plastic: [
        "Cek kode daur ulang di bagian bawah plastik",
        "Bilas botol plastik sebelum didaur ulang",
        "Lepaskan tutup dan label jika memungkinkan"
      ],
      metal: [
        "Kaleng aluminium bernilai ekonomis tinggi",
        "Bersihkan dari sisa makanan atau minuman",
        "Tekan kaleng agar tidak memakan banyak ruang"
      ],
      trash: [
        "Buang ke tempat sampah umum",
        "Hindari mencampur dengan sampah daur ulang",
        "Pertimbangkan untuk mengurangi sampah jenis ini"
      ]
    };
    return map[cls] || [];
  };

  const getConfidenceLevel = (confidence) => {
    const value = parseFloat(confidence);
    if (value >= 80) return { text: "TINGGI", color: "#22c55e", emoji: "🟢" };
    if (value >= 60) return { text: "SEDANG", color: "#f59e0b", emoji: "🟡" };
    return { text: "RENDAH", color: "#ef4444", emoji: "🔴" };
  };

  // === Handle file upload & auto classify ===
  const handleFile = async (file) => {
    console.log("🔍 File received:", file.name, file.type, file.size);
    
    // Validation
    if (!file.type.startsWith('image/')) {
      setError('❌ Mohon upload file gambar (JPG, PNG, JPEG)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('❌ Ukuran file terlalu besar. Maksimal 5MB.');
      return;
    }

    // Reset states
    setError(null);
    setResult(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = async (e) => {
      const url = e.target.result;
      setPreviewUrl(url);
      console.log("✅ Preview set");

      // Auto-classify
      await classifyImage(file);
    };
    reader.readAsDataURL(file);
  };

  // === Classification logic ===
  const classifyImage = async (file) => {
    console.log("🚀 Starting classification...");
    setIsUploading(true);
    setError(null);

    try {
      // Prepare FormData
      const formData = new FormData();
      formData.append("file", file);

      // Send to backend
      console.log(`📡 Sending to ${API_BASE_URL}/classify...`);
      
      const response = await fetch(`${API_BASE_URL}/classify`, {
        method: "POST",
        body: formData,
      }).catch(err => {
        throw new Error(`Tidak dapat terhubung ke server. Pastikan backend berjalan di ${API_BASE_URL}`);
      });

      if (!response) {
        throw new Error("Tidak ada response dari server");
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP Error ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Response received:", data);

      if (!data.success) {
        throw new Error(data.message || "Classification failed");
      }

      // Format result
      setResult({
        category: data.class.charAt(0).toUpperCase() + data.class.slice(1),
        confidence: `${(data.confidence * 100).toFixed(1)}%`,
        confidenceValue: data.confidence * 100,
        icon: getIconForClass(data.class),
        description: getDescription(data.class),
        badges: getBadges(data.class),
        tips: getRecyclingTips(data.class),
        probabilities: data.probabilities
      });

    } catch (err) {
      console.error("💥 Classification error:", err);
      setError(err.message || `Gagal mengklasifikasi gambar`);
    } finally {
      setIsUploading(false);
    }
  };

  // === Event handlers ===
  const onFileChange = (e) => {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const triggerFileInput = () => fileInputRef.current?.click();

  const reset = () => {
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // === Render ===
  return (
    <>
      <Navbar />
      <main className={styles.mainContent}>
        {/* Hero Section */}
        <div className={styles.heroSection}>
          <div className={styles.heroIcon}>🌍</div>
          <h1 className={styles.pageTitle}>Klasifikasi Sampah dengan AI</h1>
          <p className={styles.pageSubtitle}>
            Teknologi kecerdasan buatan untuk mengidentifikasi jenis sampah secara otomatis dan akurat
          </p>
          <div className={styles.statsContainer}>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>6</div>
              <div className={styles.statLabel}>Kategori Sampah</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>95%</div>
              <div className={styles.statLabel}>Akurasi Model</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>{"<2s"}</div>
              <div className={styles.statLabel}>Waktu Proses</div>
            </div>
          </div>
        </div>

        <div className={styles.classificationSection}>
          {/* Upload Area - Hidden when image uploaded */}
          {!previewUrl && (
            <div className={styles.uploadContainer}>
              <div
                className={`${styles.uploadArea} ${isDragging ? styles.dragOver : ''}`}
                onClick={triggerFileInput}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
              >
                <div className={styles.uploadIcon}>☁️</div>
                <div className={styles.uploadText}>
                  <h3>Seret & Letakkan Gambar Disini</h3>
                  <p>Atau klik untuk memilih file dari perangkat Anda</p>
                  <span className={styles.fileFormat}>Format: JPG, PNG, JPEG • Maksimal 5MB</span>
                </div>
                <button className={styles.fileButton}>
                  <span className={styles.buttonIcon}>📂</span>
                  PILIH FILE
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={onFileChange}
                  hidden
                />
              </div>

              {/* Sample Images */}
              <div className={styles.sampleImages}>
                <div className={styles.sampleTitle}>
                  <span className={styles.sampleTitleIcon}>🔍</span>
                  Kategori yang Dapat Dideteksi
                </div>
                <div className={styles.sampleGrid}>
                  {[
                    { icon: '💧', label: 'Plastik', color: '#3b82f6' },
                    { icon: '📄', label: 'Kertas', color: '#f59e0b' },
                    { icon: '📦', label: 'Kardus', color: '#8b5cf6' },
                    { icon: '🍶', label: 'Kaca', color: '#06b6d4' },
                    { icon: '🔧', label: 'Logam', color: '#6b7280' },
                    { icon: '🗑️', label: 'Trash', color: '#ef4444' }
                  ].map((item, i) => (
                    <div key={i} className={styles.sampleItem}>
                      <div 
                        className={styles.sampleIconCircle}
                        style={{ backgroundColor: `${item.color}15` }}
                      >
                        <span style={{ fontSize: '2em' }}>{item.icon}</span>
                      </div>
                      <p className={styles.sampleLabel}>{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className={`${styles.errorMessage} ${styles.shake}`}>
              <span className={styles.errorIcon}>⚠️</span>
              <div className={styles.errorContent}>
                <div className={styles.errorTitle}>Terjadi Kesalahan</div>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Modified Upload Area - Shows image when uploaded */}
          {previewUrl && (
            <div className={`${styles.uploadedImageSection} ${styles.fadeSlideUp}`}>
              <div className={styles.uploadedImageContainer}>
                <img src={previewUrl} alt="Uploaded" className={styles.uploadedImage} />
                {isUploading && (
                  <div className={styles.uploadingOverlay}>
                    <div className={styles.spinnerContainer}>
                      <div className={styles.spinner}></div>
                      <div className={styles.spinnerRing}></div>
                    </div>
                    <p className={styles.loadingText}>Menganalisis gambar dengan AI...</p>
                    <div className={styles.loadingSubtext}>Mohon tunggu sebentar</div>
                  </div>
                )}
              </div>
              {!isUploading && (
                <button className={styles.retryBtn} onClick={reset}>
                  <span className={styles.buttonIcon}>🔄</span>
                  Upload Gambar Baru
                </button>
              )}
            </div>
          )}

          {/* Result Section - Enhanced Professional */}
          {result && (
            <div className={`${styles.resultSectionEnhanced} ${styles.fadeSlideUp}`}>
              {/* Main Result Card */}
              <div className={styles.resultMainCard}>
                <div className={styles.resultHeader}>
                  <div className={styles.resultIconContainer}>
                    <div className={styles.resultIconLarge}>{result.icon}</div>
                    <div className={styles.iconGlow}></div>
                  </div>
                  <div className={styles.resultHeaderInfo}>
                    <div className={styles.resultLabel}>Hasil Klasifikasi</div>
                    <h2 className={styles.resultTitle}>{result.category}</h2>
                    <div className={styles.confidenceBadgeWrapper}>
                      <div 
                        className={styles.confidenceBadge}
                        style={{ 
                          borderColor: getConfidenceLevel(result.confidenceValue).color,
                          backgroundColor: `${getConfidenceLevel(result.confidenceValue).color}15`
                        }}
                      >
                        <span className={styles.confidenceEmoji}>
                          {getConfidenceLevel(result.confidenceValue).emoji}
                        </span>
                        <span className={styles.confidenceLabel}>Tingkat Keyakinan:</span>
                        <span 
                          className={styles.confidenceValue}
                          style={{ color: getConfidenceLevel(result.confidenceValue).color }}
                        >
                          {result.confidence}
                        </span>
                        <span className={styles.confidenceLevel}>
                          ({getConfidenceLevel(result.confidenceValue).text})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.resultDescription}>
                  <div className={styles.descriptionIcon}>📋</div>
                  <div>
                    <h3>Deskripsi</h3>
                    <p>{result.description}</p>
                  </div>
                </div>

                <div className={styles.resultBadgesContainer}>
                  <div className={styles.badgesLabel}>
                    <span>✨</span> Karakteristik
                  </div>
                  <div className={styles.resultBadgesRow}>
                    {result.badges.map((badge, i) => (
                      <span key={i} className={styles.badgeTag}>{badge}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tips Card */}
              {result.tips && result.tips.length > 0 && (
                <div className={`${styles.tipsCard} ${styles.fadeSlideUp}`}>
                  <div className={styles.tipsHeader}>
                    <span className={styles.tipsIcon}>💡</span>
                    <h3>Tips Pengelolaan</h3>
                  </div>
                  <ul className={styles.tipsList}>
                    {result.tips.map((tip, i) => (
                      <li key={i} className={styles.tipItem}>
                        <span className={styles.tipBullet}>•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Probabilities Chart */}
              {result.probabilities && (
                <div className={`${styles.probabilitiesCard} ${styles.fadeSlideUp}`}>
                  <div className={styles.probabilitiesHeader}>
                    <span className={styles.chartIcon}>📊</span>
                    <h3>Detail Probabilitas</h3>
                  </div>
                  <div className={styles.probabilitiesChart}>
                    {Object.entries(result.probabilities)
                      .sort((a, b) => b[1] - a[1])
                      .map(([cls, prob], idx) => (
                        <div key={idx} className={styles.probabilityRow}>
                          <div className={styles.probabilityLabel}>
                            <span className={styles.probabilityIcon}>{getIconForClass(cls)}</span>
                            <span className={styles.probabilityName}>
                              {cls.charAt(0).toUpperCase() + cls.slice(1)}
                            </span>
                          </div>
                          <div className={styles.probabilityBarContainer}>
                            <div 
                              className={styles.probabilityBar}
                              style={{ 
                                width: `${(prob * 100).toFixed(1)}%`,
                                backgroundColor: idx === 0 ? '#7cb342' : '#e2e8f0'
                              }}
                            >
                              <span className={styles.probabilityBarValue}>
                                {(prob * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                          <span className={styles.probabilityValue}>
                            {(prob * 100).toFixed(1)}%
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info Banner */}
        {!previewUrl && (
          <div className={styles.infoBanner}>
            <div className={styles.infoIcon}>ℹ️</div>
            <div className={styles.infoContent}>
              <h4>Cara Menggunakan</h4>
              <p>Upload gambar sampah → AI akan menganalisis → Dapatkan hasil klasifikasi dan tips pengelolaan</p>
            </div>
          </div>
        )}
      </main>
    </>
  );
}