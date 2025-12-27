-- Add Event Timeline table for flexible date management
-- This table stores custom timeline dates for each event

CREATE TABLE IF NOT EXISTS event_timeline (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,

  -- TIMELINE ITEM DETAILS
  baslik TEXT NOT NULL, -- e.g., "Bildiri Gönderme Son Tarihi", "Sonuçların Açıklanması"
  aciklama TEXT, -- Optional description
  tarih TEXT NOT NULL, -- Date in ISO format (YYYY-MM-DD)

  -- CATEGORY/TYPE
  tip TEXT NOT NULL DEFAULT 'ONEMLI', -- ONEMLI, BASVURU, BILDIRI, SONUC, ETKINLIK, DUYURU

  -- ICON (optional, for UI display)
  ikon TEXT, -- e.g., "calendar", "file", "award", "bell"

  -- VISIBILITY
  yayinlandi INTEGER NOT NULL DEFAULT 1, -- 1 = published, 0 = draft
  sira INTEGER NOT NULL DEFAULT 0, -- Order for display

  -- METADATA
  created_by_email TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- FOREIGN KEY
  FOREIGN KEY (event_id) REFERENCES Event(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_event_timeline_event_id ON event_timeline(event_id);
CREATE INDEX IF NOT EXISTS idx_event_timeline_tip ON event_timeline(tip);
CREATE INDEX IF NOT EXISTS idx_event_timeline_tarih ON event_timeline(tarih);
CREATE INDEX IF NOT EXISTS idx_event_timeline_yayinlandi ON event_timeline(yayinlandi);
