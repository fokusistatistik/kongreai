-- Migration: Add Congress Subsections
-- Date: 2025-12-27
-- Description: Adds support for congress subsections (documents, results, gallery, schedule)

-- ============================================
-- 1. CONGRESS DOCUMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS congress_documents (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  baslik TEXT NOT NULL,
  aciklama TEXT,
  dosya_url TEXT NOT NULL,
  dosya_tipi TEXT NOT NULL,
  dosya_boyut INTEGER,
  kategori TEXT NOT NULL DEFAULT 'GENEL',
  yayinlandi INTEGER NOT NULL DEFAULT 1,
  sira INTEGER NOT NULL DEFAULT 0,
  created_by_email TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_congress_documents_event_id ON congress_documents(event_id);
CREATE INDEX IF NOT EXISTS idx_congress_documents_kategori ON congress_documents(kategori);
CREATE INDEX IF NOT EXISTS idx_congress_documents_yayinlandi ON congress_documents(yayinlandi);

-- ============================================
-- 2. CONGRESS RESULTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS congress_results (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  baslik TEXT NOT NULL,
  icerik TEXT NOT NULL,
  tip TEXT NOT NULL DEFAULT 'SONUC',
  dosya_url TEXT,
  yayinlandi INTEGER NOT NULL DEFAULT 0,
  yayin_tarihi DATETIME,
  sira INTEGER NOT NULL DEFAULT 0,
  created_by_email TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_congress_results_event_id ON congress_results(event_id);
CREATE INDEX IF NOT EXISTS idx_congress_results_tip ON congress_results(tip);
CREATE INDEX IF NOT EXISTS idx_congress_results_yayinlandi ON congress_results(yayinlandi);

-- ============================================
-- 3. CONGRESS GALLERY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS congress_gallery (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  baslik TEXT,
  aciklama TEXT,
  medya_url TEXT NOT NULL,
  medya_tipi TEXT NOT NULL,
  thumbnail_url TEXT,
  kategori TEXT NOT NULL DEFAULT 'GENEL',
  yayinlandi INTEGER NOT NULL DEFAULT 1,
  sira INTEGER NOT NULL DEFAULT 0,
  uploaded_by_email TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_congress_gallery_event_id ON congress_gallery(event_id);
CREATE INDEX IF NOT EXISTS idx_congress_gallery_medya_tipi ON congress_gallery(medya_tipi);
CREATE INDEX IF NOT EXISTS idx_congress_gallery_kategori ON congress_gallery(kategori);

-- ============================================
-- 4. CONGRESS SCHEDULE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS congress_schedule (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  gun TEXT NOT NULL,
  baslik TEXT NOT NULL,
  aciklama TEXT,
  baslangic_saati TEXT NOT NULL,
  bitis_saati TEXT NOT NULL,
  salon TEXT,
  tip TEXT NOT NULL DEFAULT 'OTURUM',
  konusmacilar TEXT,
  oturum_baskani TEXT,
  yayinlandi INTEGER NOT NULL DEFAULT 1,
  sira INTEGER NOT NULL DEFAULT 0,
  created_by_email TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_congress_schedule_event_id ON congress_schedule(event_id);
CREATE INDEX IF NOT EXISTS idx_congress_schedule_gun ON congress_schedule(gun);
CREATE INDEX IF NOT EXISTS idx_congress_schedule_tip ON congress_schedule(tip);
