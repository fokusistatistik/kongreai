import { WebhookResponse } from "@/types";

const WEBHOOK_BASE_URL = process.env.NEXT_PUBLIC_WEBHOOK_BASE_URL || "https://n8n.fokusistatistik.com/webhook";
const WEBHOOK_API_KEY = process.env.WEBHOOK_API_KEY;

export interface WebhookOptions {
  timeout?: number;
  retries?: number;
}

/**
 * Generic webhook request function
 */
async function webhookRequest<T = any>(
  endpoint: string,
  data: any,
  options: WebhookOptions = {}
): Promise<WebhookResponse<T>> {
  const { timeout = 30000, retries = 3 } = options;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(`${WEBHOOK_BASE_URL}/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(WEBHOOK_API_KEY && { "X-API-Key": WEBHOOK_API_KEY }),
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        success: true,
        data: result.data || result,
        message: result.message,
      };
    } catch (error: any) {
      lastError = error;

      // Don't retry on abort (timeout)
      if (error.name === "AbortError") {
        console.error(`Webhook timeout on attempt ${attempt}/${retries}`);
      } else {
        console.error(`Webhook error on attempt ${attempt}/${retries}:`, error.message);
      }

      // Wait before retry (exponential backoff)
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  return {
    success: false,
    error: lastError?.message || "Webhook request failed",
  };
}

/**
 * Görev Yönetimi Webhook Fonksiyonları
 */
export const gorevWebhook = {
  async olustur(gorevData: any): Promise<WebhookResponse> {
    return webhookRequest("gorev-olustur", gorevData);
  },

  async guncelle(gorevId: string, guncellemeler: any): Promise<WebhookResponse> {
    return webhookRequest("gorev-guncelle", { gorev_id: gorevId, ...guncellemeler });
  },

  async devret(gorevId: string, yeniAtananId: string, not?: string): Promise<WebhookResponse> {
    return webhookRequest("gorev-devret", {
      gorev_id: gorevId,
      yeni_atanan_id: yeniAtananId,
      not,
    });
  },

  async sil(gorevId: string): Promise<WebhookResponse> {
    return webhookRequest("gorev-sil", { gorev_id: gorevId });
  },

  async listele(filtreler?: any): Promise<WebhookResponse> {
    return webhookRequest("gorev-listele", { filtreler });
  },

  async detay(gorevId: string): Promise<WebhookResponse> {
    return webhookRequest("gorev-detay", { gorev_id: gorevId });
  },

  async yorumEkle(gorevId: string, icerik: string, dosyalar?: string[]): Promise<WebhookResponse> {
    return webhookRequest("gorev-yorum-ekle", {
      gorev_id: gorevId,
      icerik,
      dosyalar,
    });
  },
};

/**
 * ASM Veri Girişi Webhook Fonksiyonları
 */
export const asmWebhook = {
  async veriGir(veriData: any): Promise<WebhookResponse> {
    return webhookRequest("asm-veri-giris", veriData);
  },

  async veriListele(asmId: string, baslangic?: Date, bitis?: Date): Promise<WebhookResponse> {
    return webhookRequest("asm-veri-listele", {
      asm_id: asmId,
      baslangic_tarihi: baslangic?.toISOString(),
      bitis_tarihi: bitis?.toISOString(),
    });
  },

  async veriOnayla(veriId: string, onay: boolean, not?: string): Promise<WebhookResponse> {
    return webhookRequest("asm-veri-onayla", {
      veri_id: veriId,
      onay,
      not,
    });
  },

  async istatistikler(asmId: string, donem: string): Promise<WebhookResponse> {
    return webhookRequest("asm-istatistikler", {
      asm_id: asmId,
      donem,
    });
  },
};

/**
 * Kullanıcı Yönetimi Webhook Fonksiyonları
 */
export const kullaniciWebhook = {
  async olustur(kullaniciData: any): Promise<WebhookResponse> {
    return webhookRequest("kullanici-olustur", kullaniciData);
  },

  async guncelle(kullaniciId: string, guncellemeler: any): Promise<WebhookResponse> {
    return webhookRequest("kullanici-guncelle", {
      kullanici_id: kullaniciId,
      ...guncellemeler,
    });
  },

  async sil(kullaniciId: string): Promise<WebhookResponse> {
    return webhookRequest("kullanici-sil", { kullanici_id: kullaniciId });
  },

  async listele(filtreler?: any): Promise<WebhookResponse> {
    return webhookRequest("kullanici-listele", { filtreler });
  },

  async detay(kullaniciId: string): Promise<WebhookResponse> {
    return webhookRequest("kullanici-detay", { kullanici_id: kullaniciId });
  },
};

/**
 * Birim Yönetimi Webhook Fonksiyonları
 */
export const birimWebhook = {
  async olustur(birimData: any): Promise<WebhookResponse> {
    return webhookRequest("birim-olustur", birimData);
  },

  async guncelle(birimId: string, guncellemeler: any): Promise<WebhookResponse> {
    return webhookRequest("birim-guncelle", {
      birim_id: birimId,
      ...guncellemeler,
    });
  },

  async listele(): Promise<WebhookResponse> {
    return webhookRequest("birim-listele", {});
  },

  async detay(birimId: string): Promise<WebhookResponse> {
    return webhookRequest("birim-detay", { birim_id: birimId });
  },
};

/**
 * Takvim Webhook Fonksiyonları
 */
export const takvimWebhook = {
  async etkinlikOlustur(etkinlikData: any): Promise<WebhookResponse> {
    return webhookRequest("takvim-etkinlik-olustur", etkinlikData);
  },

  async etkinlikGuncelle(etkinlikId: string, guncellemeler: any): Promise<WebhookResponse> {
    return webhookRequest("takvim-etkinlik-guncelle", {
      etkinlik_id: etkinlikId,
      ...guncellemeler,
    });
  },

  async etkinlikSil(etkinlikId: string): Promise<WebhookResponse> {
    return webhookRequest("takvim-etkinlik-sil", { etkinlik_id: etkinlikId });
  },

  async etkinlikListele(baslangic: Date, bitis: Date, filtreler?: any): Promise<WebhookResponse> {
    return webhookRequest("takvim-etkinlik-listele", {
      baslangic_tarihi: baslangic.toISOString(),
      bitis_tarihi: bitis.toISOString(),
      ...filtreler,
    });
  },
};

/**
 * Raporlama Webhook Fonksiyonları
 */
export const raporWebhook = {
  async olustur(raporData: any): Promise<WebhookResponse> {
    return webhookRequest("rapor-olustur", raporData, { timeout: 60000 });
  },

  async durum(raporId: string): Promise<WebhookResponse> {
    return webhookRequest("rapor-durum", { rapor_id: raporId });
  },

  async listele(filtreler?: any): Promise<WebhookResponse> {
    return webhookRequest("rapor-listele", { filtreler });
  },
};

/**
 * Bildirim Webhook Fonksiyonları
 */
export const bildirimWebhook = {
  async gonder(bildirimData: any): Promise<WebhookResponse> {
    return webhookRequest("bildirim-gonder", bildirimData);
  },

  async listele(kullaniciId: string, okunmamis?: boolean): Promise<WebhookResponse> {
    return webhookRequest("bildirim-listele", {
      kullanici_id: kullaniciId,
      okunmamis,
    });
  },

  async okunduIsaretle(bildirimId: string): Promise<WebhookResponse> {
    return webhookRequest("bildirim-okundu", { bildirim_id: bildirimId });
  },

  async tumunuOkunduIsaretle(kullaniciId: string): Promise<WebhookResponse> {
    return webhookRequest("bildirim-tumunu-okundu", { kullanici_id: kullaniciId });
  },
};

/**
 * Dashboard İstatistikleri Webhook Fonksiyonları
 */
export const dashboardWebhook = {
  async istatistikler(kullaniciId?: string, birimId?: string): Promise<WebhookResponse> {
    return webhookRequest("dashboard-istatistikler", {
      kullanici_id: kullaniciId,
      birim_id: birimId,
    });
  },

  async grafikVerileri(tip: string, donem: string, filtreler?: any): Promise<WebhookResponse> {
    return webhookRequest("dashboard-grafik", {
      tip,
      donem,
      ...filtreler,
    });
  },
};
