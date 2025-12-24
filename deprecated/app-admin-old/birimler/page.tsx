'use client'

import { useState, useEffect } from 'react'
import { Building2, Plus, Edit, Trash2, Search, Building, MapPin, X } from 'lucide-react'
import { toast } from '@/lib/toast'
import { confirmDialog } from '@/lib/confirm-dialog'
import { TableSkeleton } from '@/components/loading-skeleton'
import { EmptyState } from '@/components/empty-state'

type BirimTip = 'MUDURLUK' | 'DIS_BIRIM'
type DisBirimTip = 'ASM' | 'HSM' | 'VSD' | 'ILCE_SAGLIK'

interface Birim {
  id: string
  ad: string
  kod: string
  tip: BirimTip
  dis_birim_tip?: DisBirimTip | null
  ust_birim_id?: string | null
  ust_birim?: {
    id: string
    ad: string
  } | null
  telefon?: string | null
  email?: string | null
  adres?: string | null
  aktif: boolean
  _count?: {
    personeller: number
  }
}

const disBirimTipLabels: Record<DisBirimTip, string> = {
  ASM: 'Aile Sağlığı Merkezi (ASM)',
  HSM: 'Halk Sağlığı Merkezi (HSM)',
  VSD: 'Verem Savaş Dispanseri (VSD)',
  ILCE_SAGLIK: 'İlçe Sağlık Müdürlüğü'
}

export default function BirimlerPage() {
  const [birimler, setBirimler] = useState<Birim[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingBirim, setEditingBirim] = useState<Birim | null>(null)
  const [formData, setFormData] = useState({
    ad: '',
    kod: '',
    tip: 'MUDURLUK' as BirimTip,
    dis_birim_tip: '' as DisBirimTip | '',
    ust_birim_id: '',
    telefon: '',
    email: '',
    adres: '',
    aktif: true
  })

  useEffect(() => {
    fetchBirimler()
  }, [])

  const fetchBirimler = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/birim')
      const data = await res.json()
      if (data.success) {
        setBirimler(data.data)
      }
    } catch {
      toast.error('Birimler yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Form validasyonları
    if (formData.ad.trim().length < 3) {
      toast.error('Birim adı en az 3 karakter olmalıdır')
      return
    }

    if (formData.kod.trim().length < 2) {
      toast.error('Birim kodu en az 2 karakter olmalıdır')
      return
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Geçerli bir e-posta adresi giriniz')
      return
    }

    try {
      const payload: Record<string, string | boolean | null> = {
        ad: formData.ad.trim(),
        kod: formData.kod.trim().toUpperCase(),
        tip: formData.tip,
        telefon: formData.telefon.trim() || null,
        email: formData.email.trim() || null,
        adres: formData.adres.trim() || null,
        aktif: formData.aktif
      }

      if (formData.tip === 'DIS_BIRIM') {
        if (!formData.dis_birim_tip) {
          toast.error('Dış birim tipi seçmelisiniz')
          return
        }
        if (!formData.ust_birim_id) {
          toast.error('Üst müdürlük birimi seçmelisiniz')
          return
        }
        payload.dis_birim_tip = formData.dis_birim_tip
        payload.ust_birim_id = formData.ust_birim_id
      } else {
        payload.dis_birim_tip = null
        payload.ust_birim_id = formData.ust_birim_id || null
      }

      const url = editingBirim ? `/api/birim/${editingBirim.id}` : '/api/birim'
      const method = editingBirim ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (data.success) {
        toast.success(editingBirim ? 'Birim güncellendi' : 'Birim oluşturuldu')
        setShowModal(false)
        resetForm()
        fetchBirimler()
      } else {
        toast.error(data.error || 'İşlem başarısız')
      }
    } catch {
      toast.error('Bir hata oluştu')
    }
  }

  const handleDelete = async (birim: Birim) => {
    const confirmed = await confirmDialog.danger(
      `"${birim.ad}" birimini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      'Birim Sil'
    )

    if (!confirmed) return

    try {
      const res = await fetch(`/api/birim/${birim.id}`, { method: 'DELETE' })
      const data = await res.json()

      if (data.success) {
        toast.success('Birim başarıyla silindi')
        fetchBirimler()
      } else {
        toast.error(data.error || 'Silme başarısız')
      }
    } catch {
      toast.error('Bir hata oluştu')
    }
  }

  const handleEdit = (birim: Birim) => {
    setEditingBirim(birim)
    setFormData({
      ad: birim.ad,
      kod: birim.kod,
      tip: birim.tip,
      dis_birim_tip: birim.dis_birim_tip || '',
      ust_birim_id: birim.ust_birim_id || '',
      telefon: birim.telefon || '',
      email: birim.email || '',
      adres: birim.adres || '',
      aktif: birim.aktif
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setEditingBirim(null)
    setFormData({
      ad: '',
      kod: '',
      tip: 'MUDURLUK',
      dis_birim_tip: '',
      ust_birim_id: '',
      telefon: '',
      email: '',
      adres: '',
      aktif: true
    })
  }

  const filteredBirimler = birimler.filter(
    (b) =>
      b.ad.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.kod.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const mudurlukBirimleri = filteredBirimler.filter((b) => b.tip === 'MUDURLUK')
  const disBirimleri = filteredBirimler.filter((b) => b.tip === 'DIS_BIRIM')

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="w-8 h-8 text-primary" />
              Birim Yönetimi
            </h1>
            <p className="text-gray-600 mt-1">Müdürlük ve dış birimleri yönetin</p>
          </div>
          <button
            onClick={() => {
              resetForm()
              setShowModal(true)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            <Plus className="w-5 h-5" />
            Yeni Birim
          </button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Birim adı veya kodu ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {loading ? (
          <TableSkeleton rows={8} />
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building className="w-6 h-6 text-primary" />
                Müdürlük Birimleri ({mudurlukBirimleri.length})
              </h2>
              {mudurlukBirimleri.length === 0 ? (
                <EmptyState
                  title="Müdürlük birimi bulunamadı"
                  description="Henüz müdürlük birimi eklenmemiş"
                />
              ) : (
                <div className="grid gap-4">
                  {mudurlukBirimleri.map((birim) => (
                    <div
                      key={birim.id}
                      className={`rounded-lg shadow p-6 hover:shadow-md transition-all ${
                        !birim.aktif ? 'bg-gray-100 border-2 border-red-200 opacity-70' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{birim.ad}</h3>
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                              {birim.kod}
                            </span>
                            {!birim.aktif && (
                              <span className="px-3 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full border border-red-300 flex items-center gap-1">
                                <div className="w-2 h-2 bg-red-500 rounded-full" />
                                Pasif
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            {birim.ust_birim && (
                              <span>Üst Birim: {birim.ust_birim.ad}</span>
                            )}
                            {birim._count && (
                              <span>{birim._count.personeller} Personel</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(birim)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(birim)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-primary" />
                Dış Birimler ({disBirimleri.length})
              </h2>
              {disBirimleri.length === 0 ? (
                <EmptyState
                  title="Dış birim bulunamadı"
                  description="Henüz dış birim eklenmemiş"
                />
              ) : (
                <div className="grid gap-4">
                  {disBirimleri.map((birim) => (
                    <div
                      key={birim.id}
                      className={`rounded-lg shadow p-6 hover:shadow-md transition-all ${
                        !birim.aktif ? 'bg-gray-100 border-2 border-red-200 opacity-70' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{birim.ad}</h3>
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                              {birim.kod}
                            </span>
                            {birim.dis_birim_tip && (
                              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                                {birim.dis_birim_tip}
                              </span>
                            )}
                            {!birim.aktif && (
                              <span className="px-3 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full border border-red-300 flex items-center gap-1">
                                <div className="w-2 h-2 bg-red-500 rounded-full" />
                                Pasif
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            {birim.ust_birim && (
                              <span>Bağlı Olduğu Müdürlük: {birim.ust_birim.ad}</span>
                            )}
                            {birim._count && (
                              <span>{birim._count.personeller} Personel</span>
                            )}
                          </div>
                          {birim.telefon && (
                            <p className="text-sm text-gray-600 mt-1">Tel: {birim.telefon}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(birim)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(birim)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingBirim ? 'Birim Düzenle' : 'Yeni Birim Ekle'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Birim Tipi *
                  </label>
                  <select
                    value={formData.tip}
                    onChange={(e) => setFormData({ ...formData, tip: e.target.value as BirimTip, dis_birim_tip: '', ust_birim_id: '' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  >
                    <option value="MUDURLUK">Müdürlük Birimi</option>
                    <option value="DIS_BIRIM">Dış Birim</option>
                  </select>
                </div>

                {formData.tip === 'DIS_BIRIM' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dış Birim Tipi *
                    </label>
                    <select
                      value={formData.dis_birim_tip}
                      onChange={(e) => setFormData({ ...formData, dis_birim_tip: e.target.value as DisBirimTip })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    >
                      <option value="">Seçiniz</option>
                      {Object.entries(disBirimTipLabels).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Birim Adı *
                  </label>
                  <input
                    type="text"
                    value={formData.ad}
                    onChange={(e) => setFormData({ ...formData, ad: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Birim Kodu *
                  </label>
                  <input
                    type="text"
                    value={formData.kod}
                    onChange={(e) => setFormData({ ...formData, kod: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                    placeholder="Örn: ASM-IZMIT-ALIKAHYA"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {formData.tip === 'DIS_BIRIM' ? 'Bağlı Olduğu Müdürlük Birimi *' : 'Üst Birim (Opsiyonel)'}
                  </label>
                  <select
                    value={formData.ust_birim_id}
                    onChange={(e) => setFormData({ ...formData, ust_birim_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required={formData.tip === 'DIS_BIRIM'}
                  >
                    <option value="">Seçiniz</option>
                    {birimler
                      .filter((b) => b.tip === 'MUDURLUK' && b.id !== editingBirim?.id)
                      .map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.ad}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={formData.telefon}
                    onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adres
                  </label>
                  <textarea
                    value={formData.adres}
                    onChange={(e) => setFormData({ ...formData, adres: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    rows={3}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="aktif"
                    checked={formData.aktif}
                    onChange={(e) => setFormData({ ...formData, aktif: e.target.checked })}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <label htmlFor="aktif" className="text-sm font-medium text-gray-700">
                    Aktif
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                  >
                    {editingBirim ? 'Güncelle' : 'Oluştur'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      resetForm()
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                  >
                    İptal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
