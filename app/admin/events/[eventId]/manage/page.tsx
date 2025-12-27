'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { FileText, Award, Image, Calendar, Plus, Pencil, Trash2, Save, X } from 'lucide-react';

export default function ManageEventSubsectionsPage() {
  const params = useParams();
  const { data: session } = useSession();
  const eventId = params?.eventId as string;

  const [activeTab, setActiveTab] = useState<'documents' | 'results' | 'gallery' | 'schedule'>('documents');
  const [loading, setLoading] = useState(false);
  const [event, setEvent] = useState<any>(null);

  // Documents state
  const [documents, setDocuments] = useState<any[]>([]);
  const [editingDoc, setEditingDoc] = useState<any>(null);
  const [newDoc, setNewDoc] = useState<any>(null);

  // Results state
  const [results, setResults] = useState<any[]>([]);
  const [editingResult, setEditingResult] = useState<any>(null);
  const [newResult, setNewResult] = useState<any>(null);

  // Gallery state
  const [gallery, setGallery] = useState<any[]>([]);
  const [editingGallery, setEditingGallery] = useState<any>(null);
  const [newGallery, setNewGallery] = useState<any>(null);

  // Schedule state
  const [schedule, setSchedule] = useState<any[]>([]);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [newSchedule, setNewSchedule] = useState<any>(null);

  // Check authorization
  useEffect(() => {
    if (session && !['SUPER_ADMIN', 'ADMIN', 'ORGANIZATOR'].includes(session.user.role)) {
      window.location.href = '/dashboard';
    }
  }, [session]);

  // Fetch event details
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/admin/events/${eventId}`);
        if (res.ok) {
          const data = await res.json();
          setEvent(data.event);
        }
      } catch (error) {
        console.error('Event fetch error:', error);
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  // Fetch data based on active tab
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'documents') {
          const res = await fetch(`/api/admin/events/${eventId}/documents`);
          if (res.ok) {
            const data = await res.json();
            setDocuments(data.documents || []);
          }
        } else if (activeTab === 'results') {
          const res = await fetch(`/api/admin/events/${eventId}/results`);
          if (res.ok) {
            const data = await res.json();
            setResults(data.results || []);
          }
        } else if (activeTab === 'gallery') {
          const res = await fetch(`/api/admin/events/${eventId}/gallery`);
          if (res.ok) {
            const data = await res.json();
            setGallery(data.galleryItems || []);
          }
        } else if (activeTab === 'schedule') {
          const res = await fetch(`/api/admin/events/${eventId}/schedule`);
          if (res.ok) {
            const data = await res.json();
            setSchedule(data.scheduleItems || []);
          }
        }
      } catch (error) {
        console.error('Data fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (eventId && activeTab) {
      fetchData();
    }
  }, [eventId, activeTab]);

  // Document handlers
  const handleCreateDocument = async () => {
    if (!newDoc?.baslik || !newDoc?.dosya_url || !newDoc?.dosya_tipi) {
      alert('Başlık, dosya URL ve dosya tipi zorunludur');
      return;
    }

    try {
      const res = await fetch(`/api/admin/events/${eventId}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDoc),
      });

      if (res.ok) {
        const data = await res.json();
        setDocuments([...documents, data.document]);
        setNewDoc(null);
        alert('Döküman başarıyla oluşturuldu');
      } else {
        const error = await res.json();
        alert(error.error || 'Bir hata oluştu');
      }
    } catch (error) {
      console.error('Document creation error:', error);
      alert('Bir hata oluştu');
    }
  };

  const handleUpdateDocument = async (docId: string) => {
    try {
      const res = await fetch(`/api/admin/events/${eventId}/documents/${docId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingDoc),
      });

      if (res.ok) {
        const data = await res.json();
        setDocuments(documents.map((d) => (d.id === docId ? data.document : d)));
        setEditingDoc(null);
        alert('Döküman başarıyla güncellendi');
      } else {
        const error = await res.json();
        alert(error.error || 'Bir hata oluştu');
      }
    } catch (error) {
      console.error('Document update error:', error);
      alert('Bir hata oluştu');
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm('Bu dökümanı silmek istediğinizden emin misiniz?')) return;

    try {
      const res = await fetch(`/api/admin/events/${eventId}/documents/${docId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setDocuments(documents.filter((d) => d.id !== docId));
        alert('Döküman başarıyla silindi');
      } else {
        const error = await res.json();
        alert(error.error || 'Bir hata oluştu');
      }
    } catch (error) {
      console.error('Document deletion error:', error);
      alert('Bir hata oluştu');
    }
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Kongre Alt Bölümler Yönetimi</h1>
        {event && (
          <p className="text-gray-600 mt-2">
            {event.baslik}
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-4">
          <button
            onClick={() => setActiveTab('documents')}
            className={`pb-4 px-4 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'documents'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText className="inline-block w-5 h-5 mr-2" />
            Dokümanlar
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`pb-4 px-4 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'results'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Award className="inline-block w-5 h-5 mr-2" />
            Sonuçlar
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`pb-4 px-4 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'gallery'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Image className="inline-block w-5 h-5 mr-2" />
            Galeri
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`pb-4 px-4 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'schedule'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Calendar className="inline-block w-5 h-5 mr-2" />
            Program
          </button>
        </nav>
      </div>

      {/* Content based on active tab */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      ) : (
        <div>
          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Dokümanlar</h2>
                <button
                  onClick={() =>
                    setNewDoc({
                      baslik: '',
                      aciklama: '',
                      dosya_url: '',
                      dosya_tipi: 'PDF',
                      kategori: 'GENEL',
                      yayinlandi: true,
                      sira: 0,
                    })
                  }
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Yeni Döküman
                </button>
              </div>

              {/* New Document Form */}
              {newDoc && (
                <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
                  <h3 className="font-bold mb-3">Yeni Döküman</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Başlık *"
                      value={newDoc.baslik}
                      onChange={(e) => setNewDoc({ ...newDoc, baslik: e.target.value })}
                      className="px-3 py-2 border rounded"
                    />
                    <input
                      type="text"
                      placeholder="Dosya URL *"
                      value={newDoc.dosya_url}
                      onChange={(e) => setNewDoc({ ...newDoc, dosya_url: e.target.value })}
                      className="px-3 py-2 border rounded"
                    />
                    <input
                      type="text"
                      placeholder="Dosya Tipi (PDF, DOCX...)"
                      value={newDoc.dosya_tipi}
                      onChange={(e) => setNewDoc({ ...newDoc, dosya_tipi: e.target.value })}
                      className="px-3 py-2 border rounded"
                    />
                    <select
                      value={newDoc.kategori}
                      onChange={(e) => setNewDoc({ ...newDoc, kategori: e.target.value })}
                      className="px-3 py-2 border rounded"
                    >
                      <option value="GENEL">Genel</option>
                      <option value="PROGRAM">Program</option>
                      <option value="SABLONLAR">Şablonlar</option>
                      <option value="BILDIRILER">Bildiriler</option>
                      <option value="RAPORLAR">Raporlar</option>
                      <option value="SERTIFIKALAR">Sertifikalar</option>
                    </select>
                    <textarea
                      placeholder="Açıklama"
                      value={newDoc.aciklama}
                      onChange={(e) => setNewDoc({ ...newDoc, aciklama: e.target.value })}
                      className="px-3 py-2 border rounded col-span-2"
                      rows={2}
                    />
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newDoc.yayinlandi}
                        onChange={(e) => setNewDoc({ ...newDoc, yayinlandi: e.target.checked })}
                      />
                      Yayınla
                    </label>
                    <input
                      type="number"
                      placeholder="Sıra"
                      value={newDoc.sira}
                      onChange={(e) => setNewDoc({ ...newDoc, sira: parseInt(e.target.value) || 0 })}
                      className="px-3 py-2 border rounded"
                    />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={handleCreateDocument}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Kaydet
                    </button>
                    <button
                      onClick={() => setNewDoc(null)}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      İptal
                    </button>
                  </div>
                </div>
              )}

              {/* Documents List */}
              <div className="space-y-3">
                {documents.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Henüz döküman eklenmemiş</p>
                ) : (
                  documents.map((doc) => (
                    <div key={doc.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                      {editingDoc?.id === doc.id ? (
                        <div>
                          <div className="grid grid-cols-2 gap-4">
                            <input
                              type="text"
                              value={editingDoc.baslik}
                              onChange={(e) => setEditingDoc({ ...editingDoc, baslik: e.target.value })}
                              className="px-3 py-2 border rounded"
                            />
                            <input
                              type="text"
                              value={editingDoc.dosya_url}
                              onChange={(e) => setEditingDoc({ ...editingDoc, dosya_url: e.target.value })}
                              className="px-3 py-2 border rounded"
                            />
                            <input
                              type="text"
                              value={editingDoc.dosya_tipi}
                              onChange={(e) => setEditingDoc({ ...editingDoc, dosya_tipi: e.target.value })}
                              className="px-3 py-2 border rounded"
                            />
                            <select
                              value={editingDoc.kategori}
                              onChange={(e) => setEditingDoc({ ...editingDoc, kategori: e.target.value })}
                              className="px-3 py-2 border rounded"
                            >
                              <option value="GENEL">Genel</option>
                              <option value="PROGRAM">Program</option>
                              <option value="SABLONLAR">Şablonlar</option>
                              <option value="BILDIRILER">Bildiriler</option>
                              <option value="RAPORLAR">Raporlar</option>
                              <option value="SERTIFIKALAR">Sertifikalar</option>
                            </select>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <button
                              onClick={() => handleUpdateDocument(doc.id)}
                              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm flex items-center gap-1"
                            >
                              <Save className="w-4 h-4" />
                              Kaydet
                            </button>
                            <button
                              onClick={() => setEditingDoc(null)}
                              className="bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400 text-sm flex items-center gap-1"
                            >
                              <X className="w-4 h-4" />
                              İptal
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-lg">{doc.baslik}</h3>
                            <p className="text-sm text-gray-600">{doc.aciklama}</p>
                            <div className="flex gap-4 mt-2 text-sm">
                              <span className="text-gray-500">Tip: {doc.dosya_tipi}</span>
                              <span className="text-gray-500">Kategori: {doc.kategori}</span>
                              <span className={doc.yayinlandi ? 'text-green-600' : 'text-red-600'}>
                                {doc.yayinlandi ? 'Yayında' : 'Taslak'}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingDoc(doc)}
                              className="text-blue-600 hover:text-blue-800 p-2"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteDocument(doc.id)}
                              className="text-red-600 hover:text-red-800 p-2"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Other tabs - Placeholder for now */}
          {activeTab === 'results' && (
            <div className="text-center py-8">
              <p className="text-gray-600">Sonuçlar yönetimi yakında eklenecek</p>
            </div>
          )}

          {activeTab === 'gallery' && (
            <div className="text-center py-8">
              <p className="text-gray-600">Galeri yönetimi yakında eklenecek</p>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="text-center py-8">
              <p className="text-gray-600">Program yönetimi yakında eklenecek</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
