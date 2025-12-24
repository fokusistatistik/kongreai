import { prisma } from './prisma'

export interface LogActivityParams {
  personel_id?: string
  personel_email?: string
  islem: string
  tablo: string
  kayit_id?: string
  aciklama?: string
}

/**
 * Log an activity to the database
 */
export async function logAktivite(params: LogActivityParams) {
  try {
    await prisma.aktiviteLog.create({
      data: {
        personel_id: params.personel_id,
        personel_email: params.personel_email,
        islem: params.islem,
        tablo: params.tablo,
        kayit_id: params.kayit_id,
        aciklama: params.aciklama
      }
    })
  } catch (error) {
    // Silently fail - aktivite log should not break the main operation
  }
}

