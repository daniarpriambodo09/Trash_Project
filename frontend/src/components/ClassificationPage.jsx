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
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
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
        probabilities: data.probabilities
      });

    } catch (err) {
      console.error("💥 Classification error:", err);
      setError(`Gagal mengklasifikasi: ${err.message}`);
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
        <h2 className={styles.pageTitle}>Klasifikasi Sampah dengan AI</h2>
        <p className={styles.pageSubtitle}>
          Upload gambar sampah untuk mengidentifikasi jenisnya secara otomatis
        </p>

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
                  <p>Atau klik untuk memilih file</p>
                  <span className={styles.fileFormat}>Format: JPG, PNG, JPEG (Max 5MB)</span>
                </div>
                <button className={styles.fileButton}>PILIH FILE</button>
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
                <div className={styles.sampleTitle}>Contoh Jenis Sampah</div>
                <div className={styles.sampleGrid}>
                  {[
                    { icon: '💧', label: 'Plastik' },
                    { icon: '📄', label: 'Kertas' },
                    { icon: '📦', label: 'Kardus' },
                    { icon: '🍶', label: 'Kaca' },
                    { icon: '🔧', label: 'Logam' },
                    { icon: '🗑️', label: 'Trash' }
                  ].map((item, i) => (
                    <div key={i} className={styles.sampleItem}>
                      <div style={{ fontSize: '2.5em' }}>{item.icon}</div>
                      <p className={styles.sampleLabel}>{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className={styles.errorMessage}>
              <span>⚠️</span>
              <p>{error}</p>
            </div>
          )}

          {/* Modified Upload Area - Shows image when uploaded */}
          {previewUrl && (
            <div className={`${styles.uploadedImageSection} ${styles.fadeSlideUp}`}>
              <div className={styles.uploadedImageContainer}>
                <img src={previewUrl} alt="Uploaded" className={styles.uploadedImage} />
                {isUploading && (
                  <div className={styles.uploadingOverlay}>
                    <div className={styles.spinner}></div>
                    <p>Menganalisis gambar dengan AI...</p>
                  </div>
                )}
              </div>
              {!isUploading && (
                <button className={styles.retryBtn} onClick={reset}>
                  🔄 Ulangi
                </button>
              )}
            </div>
          )}

          {/* Result Section - Simplified below upload */}
          {result && (
            <div className={`${styles.resultSectionSimple} ${styles.fadeSlideUp}`}>
              <div className={styles.resultCard}>
                <div className={styles.resultIconLarge}>{result.icon}</div>
                <h2 className={styles.resultTitle}>{result.category}</h2>
                <div className={styles.accuracyBadge}>
                  <span className={styles.accuracyLabel}>Akurasi:</span>
                  <span className={styles.accuracyValue}>{result.confidence}</span>
                </div>
                <p className={styles.resultDesc}>{result.description}</p>
                <div className={styles.resultBadgesRow}>
                  {result.badges.map((badge, i) => (
                    <span key={i} className={styles.badgeTag}>{badge}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}