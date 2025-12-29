'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { FileText, Award, Calendar, Clock, Plus, Pencil, Trash2, Save, X, Bell, Download, MapPin, Users, DollarSign, Globe } from 'lucide-react';
import { sanitizeHTML } from '@/app/lib/sanitize';

export default function ManageEventSubsectionsPage() {
  const params = useParams();
  const { data: session } = useSession();
  const eventId = params?.eventId as string;

  const [activeTab, setActiveTab] = useState<'documents' | 'results' | 'schedule' | 'details' | 'announcements'>('documents');
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

  // Schedule state
  const [schedule, setSchedule] = useState<any[]>([]);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [newSchedule, setNewSchedule] = useState<any>(null);

  // Event details - no state needed, will use event state from main component

  // Announcements state
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null);
  const [newAnnouncement, setNewAnnouncement] = useState<any>(null);

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
        } else if (activeTab === 'schedule') {
          const res = await fetch(`/api/admin/events/${eventId}/schedule`);
          if (res.ok) {
            const data = await res.json();
            setSchedule(data.scheduleItems || []);
          }
        } else if (activeTab === 'details') {
          // Event details are already loaded in event state, no additional fetch needed
        } else if (activeTab === 'announcements') {
          const res = await fetch(`/api/admin/announcements?eventId=${eventId}`);
          if (res.ok) {
            const data = await res.json();
            setAnnouncements(data.announcements || []);
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

  // Result handlers
  const handleCreateResult = async () => {
    if (!newResult?.baslik || !newResult?.icerik) {
      alert('Başlık ve içerik zorunludur');
      return;
    }

    try {
      const res = await fetch(`/api/admin/events/${eventId}/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newResult),
      });

      if (res.ok) {
        const data = await res.json();
        setResults([...results, data.result]);
        setNewResult(null);
        alert('Sonuç başarıyla oluşturuldu');
      } else {
        const error = await res.json();
        alert(error.error || 'Bir hata oluştu');
      }
    } catch (error) {
      console.error('Result creation error:', error);
      alert('Bir hata oluştu');
    }
  };

  const handleUpdateResult = async (resultId: string) => {
    try {
      const res = await fetch(`/api/admin/events/${eventId}/results/${resultId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingResult),
      });

      if (res.ok) {
        const data = await res.json();
        setResults(results.map((r) => (r.id === resultId ? data.result : r)));
        setEditingResult(null);
        alert('Sonuç başarıyla güncellendi');
      } else {
        const error = await res.json();
        alert(error.error || 'Bir hata oluştu');
      }
    } catch (error) {
      console.error('Result update error:', error);
      alert('Bir hata oluştu');
    }
  };

  const handleDeleteResult = async (resultId: string) => {
    if (!confirm('Bu sonucu silmek istediğinizden emin misiniz?')) return;

    try {
      const res = await fetch(`/api/admin/events/${eventId}/results/${resultId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setResults(results.filter((r) => r.id !== resultId));
        alert('Sonuç başarıyla silindi');
      } else {
        const error = await res.json();
        alert(error.error || 'Bir hata oluştu');
      }
    } catch (error) {
      console.error('Result deletion error:', error);
      alert('Bir hata oluştu');
    }
  };

  // Announcement handlers
  const handleCreateAnnouncement = async () => {
    if (!newAnnouncement?.baslik || !newAnnouncement?.icerik) {
      alert('Başlık ve içerik zorunludur');
      return;
    }

    try {
      const res = await fetch(`/api/admin/events/${eventId}/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAnnouncement),
      });

      if (res.ok) {
        const data = await res.json();
        setAnnouncements([...announcements, data.announcement]);
        setNewAnnouncement(null);
        alert('Duyuru başarıyla oluşturuldu');
      } else {
        const error = await res.json();
        alert(error.error || 'Bir hata oluştu');
      }
    } catch (error) {
      console.error('Announcement creation error:', error);
      alert('Bir hata oluştu');
    }
  };

  const handleUpdateAnnouncement = async (announcementId: string) => {
    try {
      const res = await fetch(`/api/admin/events/${eventId}/announcements/${announcementId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingAnnouncement),
      });

      if (res.ok) {
        const data = await res.json();
        setAnnouncements(announcements.map((a) => (a.id === announcementId ? data.announcement : a)));
        setEditingAnnouncement(null);
        alert('Duyuru başarıyla güncellendi');
      } else {
        const error = await res.json();
        alert(error.error || 'Bir hata oluştu');
      }
    } catch (error) {
      console.error('Announcement update error:', error);
      alert('Bir hata oluştu');
    }
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
    if (!confirm('Bu duyuruyu silmek istediğinizden emin misiniz?')) return;

    try {
      const res = await fetch(`/api/admin/events/${eventId}/announcements/${announcementId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setAnnouncements(announcements.filter((a) => a.id !== announcementId));
        alert('Duyuru başarıyla silindi');
      } else {
        const error = await res.json();
        alert(error.error || 'Bir hata oluştu');
      }
    } catch (error) {
      console.error('Announcement deletion error:', error);
      alert('Bir hata oluştu');
    }
  };

  // Schedule handlers
  const handleCreateSchedule = async () => {
    if (!newSchedule?.gun || !newSchedule?.baslik || !newSchedule?.baslangic_saati || !newSchedule?.bitis_saati) {
      alert('Gün, başlık, başlangıç ve bitiş saati zorunludur');
      return;
    }

    try {
      const res = await fetch(`/api/admin/events/${eventId}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSchedule),
      });

      if (res.ok) {
        const data = await res.json();
        setSchedule([...schedule, data.scheduleItem]);
        setNewSchedule(null);
        alert('Program öğesi başarıyla oluşturuldu');
      } else {
        const error = await res.json();
        alert(error.error || 'Bir hata oluştu');
      }
    } catch (error) {
      console.error('Schedule creation error:', error);
      alert('Bir hata oluştu');
    }
  };

  const handleUpdateSchedule = async (scheduleId: string) => {
    try {
      const res = await fetch(`/api/admin/events/${eventId}/schedule/${scheduleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingSchedule),
      });

      if (res.ok) {
        const data = await res.json();
        setSchedule(schedule.map((s) => (s.id === scheduleId ? data.scheduleItem : s)));
        setEditingSchedule(null);
        alert('Program öğesi başarıyla güncellendi');
      } else {
        const error = await res.json();
        alert(error.error || 'Bir hata oluştu');
      }
    } catch (error) {
      console.error('Schedule update error:', error);
      alert('Bir hata oluştu');
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!confirm('Bu program öğesini silmek istediğinizden emin misiniz?')) return;

    try {
      const res = await fetch(`/api/admin/events/${eventId}/schedule/${scheduleId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setSchedule(schedule.filter((s) => s.id !== scheduleId));
        alert('Program öğesi başarıyla silindi');
      } else {
        const error = await res.json();
        alert(error.error || 'Bir hata oluştu');
      }
    } catch (error) {
      console.error('Schedule deletion error:', error);
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
        <nav className="flex space-x-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('documents')}
            className={`pb-4 px-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'documents'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText className="inline-block w-5 h-5 mr-2" />
            Dokümanlar
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`pb-4 px-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'schedule'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Calendar className="inline-block w-5 h-5 mr-2" />
            Program
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-4 px-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'details'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText className="inline-block w-5 h-5 mr-2" />
            Etkinlik Detayları
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`pb-4 px-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'results'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Award className="inline-block w-5 h-5 mr-2" />
            Sonuçlar
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className={`pb-4 px-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'announcements'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Bell className="inline-block w-5 h-5 mr-2" />
            Duyurular
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
            <DocumentsTab
              documents={documents}
              newDoc={newDoc}
              setNewDoc={setNewDoc}
              editingDoc={editingDoc}
              setEditingDoc={setEditingDoc}
              handleCreate={handleCreateDocument}
              handleUpdate={handleUpdateDocument}
              handleDelete={handleDeleteDocument}
            />
          )}

          {/* Results Tab */}
          {activeTab === 'results' && (
            <ResultsTab
              results={results}
              newResult={newResult}
              setNewResult={setNewResult}
              editingResult={editingResult}
              setEditingResult={setEditingResult}
              handleCreate={handleCreateResult}
              handleUpdate={handleUpdateResult}
              handleDelete={handleDeleteResult}
            />
          )}

          {/* Schedule Tab */}
          {activeTab === 'schedule' && (
            <ScheduleTab
              schedule={schedule}
              newSchedule={newSchedule}
              setNewSchedule={setNewSchedule}
              editingSchedule={editingSchedule}
              setEditingSchedule={setEditingSchedule}
              handleCreate={handleCreateSchedule}
              handleUpdate={handleUpdateSchedule}
              handleDelete={handleDeleteSchedule}
            />
          )}

          {/* Event Details Tab */}
          {activeTab === 'details' && (
            <EventDetailsTab event={event} eventId={eventId} />
          )}

          {/* Announcements Tab */}
          {activeTab === 'announcements' && (
            <AnnouncementsTab
              announcements={announcements}
              newAnnouncement={newAnnouncement}
              setNewAnnouncement={setNewAnnouncement}
              editingAnnouncement={editingAnnouncement}
              setEditingAnnouncement={setEditingAnnouncement}
              handleCreate={handleCreateAnnouncement}
              handleUpdate={handleUpdateAnnouncement}
              handleDelete={handleDeleteAnnouncement}
            />
          )}
        </div>
      )}
    </div>
  );
}

// Documents Tab Component
function DocumentsTab({ documents, newDoc, setNewDoc, editingDoc, setEditingDoc, handleCreate, handleUpdate, handleDelete }: any) {
  return (
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
              onClick={handleCreate}
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
          documents.map((doc: any) => (
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
                      onClick={() => handleUpdate(doc.id)}
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
                      onClick={() => handleDelete(doc.id)}
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
  );
}

// Results Tab Component
function ResultsTab({ results, newResult, setNewResult, editingResult, setEditingResult, handleCreate, handleUpdate, handleDelete }: any) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Sonuçlar</h2>
        <button
          onClick={() =>
            setNewResult({
              baslik: '',
              icerik: '',
              tip: 'SONUC',
              yayinlandi: false,
            })
          }
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Yeni Sonuç
        </button>
      </div>

      {/* New Result Form */}
      {newResult && (
        <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
          <h3 className="font-bold mb-3">Yeni Sonuç</h3>
          <p className="text-sm text-gray-600 mb-4">
            Blog tarzında sonuç yayınlayın. HTML formatında yazabilirsiniz (kalın, italik, liste vb.)
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Başlık <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Sonuç başlığı"
                value={newResult.baslik}
                onChange={(e) => setNewResult({ ...newResult, baslik: e.target.value })}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sonuç Detayı <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="HTML formatında sonuç detaylarını yazın. Örnek: <strong>Kalın</strong>, <em>İtalik</em>, <ul><li>Liste</li></ul>"
                value={newResult.icerik}
                onChange={(e) => {
                  if (e.target.value.length <= 2000) {
                    setNewResult({ ...newResult, icerik: e.target.value });
                  }
                }}
                maxLength={2000}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                rows={8}
              />
              <p className="text-xs text-gray-500 mt-1">
                {newResult.icerik.length}/2000 karakter (HTML desteklenir: &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;p&gt;, vb.)
              </p>
            </div>

            <div className="flex items-center gap-2 p-3 bg-white border rounded">
              <input
                type="checkbox"
                id="yayinla"
                checked={newResult.yayinlandi}
                onChange={(e) => setNewResult({ ...newResult, yayinlandi: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="yayinla" className="text-sm font-medium text-gray-700 cursor-pointer">
                Hemen yayınla
              </label>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleCreate}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Kaydet
            </button>
            <button
              onClick={() => setNewResult(null)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              İptal
            </button>
          </div>
        </div>
      )}

      {/* Results List */}
      <div className="space-y-3">
        {results.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Henüz sonuç eklenmemiş</p>
        ) : (
          results.map((result: any) => (
            <div key={result.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              {editingResult?.id === result.id ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Başlık <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editingResult.baslik}
                      onChange={(e) => setEditingResult({ ...editingResult, baslik: e.target.value })}
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sonuç Detayı <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={editingResult.icerik}
                      onChange={(e) => {
                        if (e.target.value.length <= 2000) {
                          setEditingResult({ ...editingResult, icerik: e.target.value });
                        }
                      }}
                      maxLength={2000}
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                      rows={6}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {editingResult.icerik.length}/2000 karakter
                    </p>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-white border rounded">
                    <input
                      type="checkbox"
                      id={`edit-yayinla-${result.id}`}
                      checked={editingResult.yayinlandi}
                      onChange={(e) => setEditingResult({ ...editingResult, yayinlandi: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor={`edit-yayinla-${result.id}`} className="text-sm font-medium text-gray-700 cursor-pointer">
                      Yayınla
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(result.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Güncelle
                    </button>
                    <button
                      onClick={() => setEditingResult(null)}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      İptal
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg">{result.baslik}</h3>
                      <span className={`text-xs px-2 py-1 rounded font-medium ${
                        result.yayinlandi
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {result.yayinlandi ? '✓ Yayında' : '○ Taslak'}
                      </span>
                    </div>
                    <div
                      className="text-sm text-gray-600 mb-2 line-clamp-3"
                      dangerouslySetInnerHTML={{ __html: sanitizeHTML(result.icerik) }}
                    />
                    {result.yayin_tarihi && (
                      <p className="text-xs text-gray-500 mt-2">
                        📅 {new Date(result.yayin_tarihi).toLocaleDateString('tr-TR')}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => setEditingResult(result)}
                      className="text-blue-600 hover:text-blue-800 p-2"
                      title="Düzenle"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(result.id)}
                      className="text-red-600 hover:text-red-800 p-2"
                      title="Sil"
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
  );
}

// Schedule Tab Component
function ScheduleTab({ schedule, newSchedule, setNewSchedule, editingSchedule, setEditingSchedule, handleCreate, handleUpdate, handleDelete }: any) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Program</h2>
        <button
          onClick={() =>
            setNewSchedule({
              gun: '',
              baslik: '',
              aciklama: '',
              baslangic_saati: '',
              bitis_saati: '',
              salon: '',
              tip: 'OTURUM',
              konusmacilar: '',
              oturum_baskani: '',
              yayinlandi: true,
              sira: 0,
            })
          }
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Yeni Program Öğesi
        </button>
      </div>

      {/* New Schedule Form */}
      {newSchedule && (
        <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
          <h3 className="font-bold mb-3">Yeni Program Öğesi</h3>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Gün * (örn: 1. Gün, 2025-12-27)"
              value={newSchedule.gun}
              onChange={(e) => setNewSchedule({ ...newSchedule, gun: e.target.value })}
              className="px-3 py-2 border rounded"
            />
            <select
              value={newSchedule.tip}
              onChange={(e) => setNewSchedule({ ...newSchedule, tip: e.target.value })}
              className="px-3 py-2 border rounded"
            >
              <option value="OTURUM">Oturum</option>
              <option value="PANEL">Panel</option>
              <option value="KAHVE_ARASI">Kahve Arası</option>
              <option value="YEMEK">Yemek</option>
              <option value="SOSYAL">Sosyal</option>
              <option value="ACILIS">Açılış</option>
              <option value="KAPANIS">Kapanış</option>
            </select>
            <input
              type="text"
              placeholder="Başlık *"
              value={newSchedule.baslik}
              onChange={(e) => setNewSchedule({ ...newSchedule, baslik: e.target.value })}
              className="px-3 py-2 border rounded col-span-2"
            />
            <input
              type="time"
              placeholder="Başlangıç Saati *"
              value={newSchedule.baslangic_saati}
              onChange={(e) => setNewSchedule({ ...newSchedule, baslangic_saati: e.target.value })}
              className="px-3 py-2 border rounded"
            />
            <input
              type="time"
              placeholder="Bitiş Saati *"
              value={newSchedule.bitis_saati}
              onChange={(e) => setNewSchedule({ ...newSchedule, bitis_saati: e.target.value })}
              className="px-3 py-2 border rounded"
            />
            <input
              type="text"
              placeholder="Salon (opsiyonel)"
              value={newSchedule.salon}
              onChange={(e) => setNewSchedule({ ...newSchedule, salon: e.target.value })}
              className="px-3 py-2 border rounded"
            />
            <input
              type="text"
              placeholder="Oturum Başkanı (opsiyonel)"
              value={newSchedule.oturum_baskani}
              onChange={(e) => setNewSchedule({ ...newSchedule, oturum_baskani: e.target.value })}
              className="px-3 py-2 border rounded"
            />
            <textarea
              placeholder="Açıklama"
              value={newSchedule.aciklama}
              onChange={(e) => setNewSchedule({ ...newSchedule, aciklama: e.target.value })}
              className="px-3 py-2 border rounded col-span-2"
              rows={2}
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newSchedule.yayinlandi}
                onChange={(e) => setNewSchedule({ ...newSchedule, yayinlandi: e.target.checked })}
              />
              Yayınla
            </label>
            <input
              type="number"
              placeholder="Sıra"
              value={newSchedule.sira}
              onChange={(e) => setNewSchedule({ ...newSchedule, sira: parseInt(e.target.value) || 0 })}
              className="px-3 py-2 border rounded"
            />
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleCreate}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Kaydet
            </button>
            <button
              onClick={() => setNewSchedule(null)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              İptal
            </button>
          </div>
        </div>
      )}

      {/* Schedule List */}
      <div className="space-y-6">
        {schedule.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Henüz program öğesi eklenmemiş</p>
        ) : (
          // Group by day
          Array.from(new Set(schedule.map((s: any) => s.gun))).map((gun: any) => (
            <div key={gun}>
              <h3 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-blue-500">
                {gun}
              </h3>
              <div className="space-y-2">
                {schedule
                  .filter((s: any) => s.gun === gun)
                  .sort((a: any, b: any) => a.baslangic_saati.localeCompare(b.baslangic_saati))
                  .map((item: any) => (
                    <div
                      key={item.id}
                      className="border-l-4 border-blue-500 bg-gray-50 p-4 rounded-r-lg hover:bg-gray-100 transition-colors"
                    >
                      {editingSchedule?.id === item.id ? (
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            type="text"
                            value={editingSchedule.gun}
                            onChange={(e) => setEditingSchedule({ ...editingSchedule, gun: e.target.value })}
                            className="px-3 py-2 border rounded"
                          />
                          <select
                            value={editingSchedule.tip}
                            onChange={(e) => setEditingSchedule({ ...editingSchedule, tip: e.target.value })}
                            className="px-3 py-2 border rounded"
                          >
                            <option value="OTURUM">Oturum</option>
                            <option value="PANEL">Panel</option>
                            <option value="KAHVE_ARASI">Kahve Arası</option>
                            <option value="YEMEK">Yemek</option>
                            <option value="SOSYAL">Sosyal</option>
                            <option value="ACILIS">Açılış</option>
                            <option value="KAPANIS">Kapanış</option>
                          </select>
                          <input
                            type="text"
                            value={editingSchedule.baslik}
                            onChange={(e) => setEditingSchedule({ ...editingSchedule, baslik: e.target.value })}
                            className="px-3 py-2 border rounded col-span-2"
                          />
                          <input
                            type="time"
                            value={editingSchedule.baslangic_saati}
                            onChange={(e) => setEditingSchedule({ ...editingSchedule, baslangic_saati: e.target.value })}
                            className="px-3 py-2 border rounded"
                          />
                          <input
                            type="time"
                            value={editingSchedule.bitis_saati}
                            onChange={(e) => setEditingSchedule({ ...editingSchedule, bitis_saati: e.target.value })}
                            className="px-3 py-2 border rounded"
                          />
                          <input
                            type="text"
                            value={editingSchedule.salon}
                            onChange={(e) => setEditingSchedule({ ...editingSchedule, salon: e.target.value })}
                            className="px-3 py-2 border rounded"
                            placeholder="Salon"
                          />
                          <input
                            type="text"
                            value={editingSchedule.oturum_baskani}
                            onChange={(e) => setEditingSchedule({ ...editingSchedule, oturum_baskani: e.target.value })}
                            className="px-3 py-2 border rounded"
                            placeholder="Oturum Başkanı"
                          />
                          <div className="col-span-2 flex gap-2">
                            <button
                              onClick={() => handleUpdate(item.id)}
                              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm flex items-center gap-1"
                            >
                              <Save className="w-4 h-4" />
                              Kaydet
                            </button>
                            <button
                              onClick={() => setEditingSchedule(null)}
                              className="bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400 text-sm flex items-center gap-1"
                            >
                              <X className="w-4 h-4" />
                              İptal
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded">
                                {item.baslangic_saati} - {item.bitis_saati}
                              </span>
                              {item.salon && (
                                <span className="text-xs text-gray-600">📍 {item.salon}</span>
                              )}
                              <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">
                                {item.tip}
                              </span>
                              <span className={item.yayinlandi ? 'text-green-600 text-xs' : 'text-red-600 text-xs'}>
                                {item.yayinlandi ? '✓ Yayında' : '✗ Taslak'}
                              </span>
                            </div>
                            <h4 className="font-bold text-gray-900">{item.baslik}</h4>
                            {item.aciklama && (
                              <p className="text-sm text-gray-600 mt-1">{item.aciklama}</p>
                            )}
                            {item.oturum_baskani && (
                              <p className="text-sm text-gray-700 mt-2">
                                <span className="font-medium">Oturum Başkanı:</span> {item.oturum_baskani}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => setEditingSchedule(item)}
                              className="text-blue-600 hover:text-blue-800 p-2"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="text-red-600 hover:text-red-800 p-2"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Event Details Tab Component
function EventDetailsTab({ event, eventId }: { event: any; eventId: string }) {
  if (!event) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Etkinlik bilgileri yükleniyor...</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Edit Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Etkinlik Detayları</h2>
        <Link
          href={`/admin/events/${eventId}/edit`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Pencil className="w-4 h-4" />
          Düzenle
        </Link>
      </div>

      {/* Basic Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Temel Bilgiler
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailItem label="Başlık" value={event.baslik} />
          <DetailItem label="Alt Başlık" value={event.alt_baslik || '-'} />
          <DetailItem label="Tip" value={event.tip} />
          <DetailItem label="Kapsam" value={event.kapsam} />
          <DetailItem label="Slug" value={event.slug} />
          <DetailItem label="Durum" value={event.durum} badge />
        </div>
        {event.aciklama && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Açıklama:</p>
            <div
              className="text-sm text-gray-600 prose max-w-none"
              dangerouslySetInnerHTML={{ __html: sanitizeHTML(event.aciklama) }}
            />
          </div>
        )}
      </div>

      {/* Dates */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Tarihler
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailItem label="Başlangıç Tarihi" value={formatDate(event.baslangic_tarihi)} />
          <DetailItem label="Bitiş Tarihi" value={formatDate(event.bitis_tarihi)} />
          <DetailItem label="Son Başvuru Tarihi" value={formatDate(event.son_basvuru_tarihi)} />
          <DetailItem label="Erken Kayıt Tarihi" value={formatDate(event.erken_kayit_tarihi)} />
        </div>
      </div>

      {/* Location */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          Mekan Bilgileri
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailItem label="Yer" value={event.yer} />
          <DetailItem label="Adres" value={event.adres || '-'} />
          <DetailItem label="Online" value={event.online ? 'Evet' : 'Hayır'} />
          {event.online && event.online_link && (
            <DetailItem label="Online Link" value={event.online_link} link />
          )}
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-blue-600" />
          Fiyatlandırma
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailItem
            label="Ücretsiz"
            value={event.ucretsiz ? 'Evet' : 'Hayır'}
          />
          {!event.ucretsiz && (
            <>
              <DetailItem
                label="Standart Ücret"
                value={`${event.ucret} ${event.para_birimi}`}
              />
              {event.erken_kayit_ucret && (
                <DetailItem
                  label="Erken Kayıt Ücreti"
                  value={`${event.erken_kayit_ucret} ${event.para_birimi}`}
                />
              )}
              {event.ogrenci_ucret && (
                <DetailItem
                  label="Öğrenci Ücreti"
                  value={`${event.ogrenci_ucret} ${event.para_birimi}`}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Media */}
      {(event.gorsel_url || event.logo_url) && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600" />
            Medya
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {event.gorsel_url && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Banner/Poster:</p>
                <img
                  src={event.gorsel_url}
                  alt="Event Banner"
                  className="w-full h-48 object-cover rounded-lg border"
                />
              </div>
            )}
            {event.logo_url && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Logo:</p>
                <img
                  src={event.logo_url}
                  alt="Event Logo"
                  className="w-full h-48 object-contain rounded-lg border bg-gray-50"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content Fields */}
      {(event.amaclar_hedefler || event.hedef_kitle || event.bilimsel_program) && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">İçerik Alanları</h3>
          <div className="space-y-4">
            {event.amaclar_hedefler && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Amaçlar ve Hedefler:</p>
                <div
                  className="text-sm text-gray-600 prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: sanitizeHTML(event.amaclar_hedefler) }}
                />
              </div>
            )}
            {event.hedef_kitle && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Hedef Kitle:</p>
                <div
                  className="text-sm text-gray-600 prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: sanitizeHTML(event.hedef_kitle) }}
                />
              </div>
            )}
            {event.bilimsel_program && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Bilimsel Program:</p>
                <div
                  className="text-sm text-gray-600 prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: sanitizeHTML(event.bilimsel_program) }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Ayarlar
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailItem
            label="Başvuru Aktif"
            value={event.basvuru_aktif ? 'Evet' : 'Hayır'}
          />
          <DetailItem
            label="Maksimum Katılımcı"
            value={event.max_katilimci || 'Sınırsız'}
          />
          <DetailItem
            label="Sertifika Aktif"
            value={event.sertifika_aktif ? 'Evet' : 'Hayır'}
          />
        </div>
      </div>

      {/* Timestamps */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">Oluşturulma:</span>{' '}
            {formatDate(event.created_at)}
          </div>
          <div>
            <span className="font-medium">Son Güncelleme:</span>{' '}
            {formatDate(event.updated_at)}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for detail items
function DetailItem({
  label,
  value,
  badge = false,
  link = false,
}: {
  label: string;
  value: string | number;
  badge?: boolean;
  link?: boolean;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-1">{label}</p>
      {badge ? (
        <span
          className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
            value === 'YAYINDA'
              ? 'bg-green-100 text-green-700'
              : value === 'TASLAK'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {value}
        </span>
      ) : link ? (
        <a
          href={value as string}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          {value}
        </a>
      ) : (
        <p className="text-sm text-gray-900">{value}</p>
      )}
    </div>
  );
}

// Announcements Tab Component
function AnnouncementsTab({ announcements, newAnnouncement, setNewAnnouncement, editingAnnouncement, setEditingAnnouncement, handleCreate, handleUpdate, handleDelete }: any) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Duyurular</h2>
        <button
          onClick={() =>
            setNewAnnouncement({
              baslik: '',
              icerik: '',
              tip: 'BILGI',
              oncelik: 0,
              yayinlandi: false,
              yayin_baslangic: '',
              yayin_bitis: '',
            })
          }
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Yeni Duyuru
        </button>
      </div>

      {/* New Announcement Form */}
      {newAnnouncement && (
        <div className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-bold mb-4">Yeni Duyuru Ekle</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Başlık <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Duyuru başlığı"
                value={newAnnouncement.baslik}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, baslik: e.target.value })}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                İçerik <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="Duyuru içeriği (HTML desteklenir)"
                value={newAnnouncement.icerik}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, icerik: e.target.value })}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tip</label>
                <select
                  value={newAnnouncement.tip}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, tip: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="BILGI">Bilgi</option>
                  <option value="UYARI">Uyarı</option>
                  <option value="ONEMLI">Önemli</option>
                  <option value="ACIL">Acil</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Öncelik (0-10)
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={newAnnouncement.oncelik}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, oncelik: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Yayın Başlangıç (opsiyonel)
                </label>
                <input
                  type="datetime-local"
                  value={newAnnouncement.yayin_baslangic}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, yayin_baslangic: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Yayın Bitiş (opsiyonel)
                </label>
                <input
                  type="datetime-local"
                  value={newAnnouncement.yayin_bitis}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, yayin_bitis: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-white border rounded">
              <input
                type="checkbox"
                id="yayinla-duyuru"
                checked={newAnnouncement.yayinlandi}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, yayinlandi: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="yayinla-duyuru" className="text-sm font-medium text-gray-700 cursor-pointer">
                Hemen yayınla
              </label>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Kaydet
              </button>
              <button
                onClick={() => setNewAnnouncement(null)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Henüz duyuru eklenmemiş</p>
            <p className="text-sm text-gray-500 mt-1">Yeni bir duyuru eklemek için yukarıdaki butona tıklayın</p>
          </div>
        ) : (
          announcements.map((announcement: any) => (
            <div key={announcement.id} className="p-4 bg-white border border-gray-200 rounded-lg">
              {editingAnnouncement?.id === announcement.id ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editingAnnouncement.baslik}
                    onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, baslik: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="Başlık"
                  />
                  <textarea
                    value={editingAnnouncement.icerik}
                    onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, icerik: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    rows={4}
                    placeholder="İçerik"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      value={editingAnnouncement.tip}
                      onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, tip: e.target.value })}
                      className="px-3 py-2 border rounded"
                    >
                      <option value="BILGI">Bilgi</option>
                      <option value="UYARI">Uyarı</option>
                      <option value="ONEMLI">Önemli</option>
                      <option value="ACIL">Acil</option>
                    </select>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={editingAnnouncement.oncelik}
                      onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, oncelik: parseInt(e.target.value) })}
                      className="px-3 py-2 border rounded"
                      placeholder="Öncelik"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="datetime-local"
                      value={editingAnnouncement.yayin_baslangic ? new Date(editingAnnouncement.yayin_baslangic).toISOString().slice(0, 16) : ''}
                      onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, yayin_baslangic: e.target.value })}
                      className="px-3 py-2 border rounded"
                    />
                    <input
                      type="datetime-local"
                      value={editingAnnouncement.yayin_bitis ? new Date(editingAnnouncement.yayin_bitis).toISOString().slice(0, 16) : ''}
                      onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, yayin_bitis: e.target.value })}
                      className="px-3 py-2 border rounded"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingAnnouncement.yayinlandi}
                      onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, yayinlandi: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label className="text-sm">Yayınla</label>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(announcement.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm flex items-center gap-1"
                    >
                      <Save className="w-4 h-4" />
                      Kaydet
                    </button>
                    <button
                      onClick={() => setEditingAnnouncement(null)}
                      className="bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400 text-sm flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      İptal
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg">{announcement.baslik}</h3>
                      <span className={`px-2 py-1 text-xs rounded ${
                        announcement.tip === 'ACIL' ? 'bg-red-100 text-red-700' :
                        announcement.tip === 'UYARI' ? 'bg-yellow-100 text-yellow-700' :
                        announcement.tip === 'ONEMLI' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {announcement.tip}
                      </span>
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                        Öncelik: {announcement.oncelik}
                      </span>
                      <span className={announcement.yayinlandi ? 'text-green-600 text-sm' : 'text-red-600 text-sm'}>
                        {announcement.yayinlandi ? '✓ Yayında' : '✗ Taslak'}
                      </span>
                    </div>
                    <div
                      className="text-sm text-gray-700 mb-2"
                      dangerouslySetInnerHTML={{ __html: sanitizeHTML(announcement.icerik) }}
                    />
                    {(announcement.yayin_baslangic || announcement.yayin_bitis) && (
                      <div className="text-xs text-gray-500 mt-2">
                        {announcement.yayin_baslangic && (
                          <span>Başlangıç: {new Date(announcement.yayin_baslangic).toLocaleDateString('tr-TR')} </span>
                        )}
                        {announcement.yayin_bitis && (
                          <span>• Bitiş: {new Date(announcement.yayin_bitis).toLocaleDateString('tr-TR')}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingAnnouncement(announcement)}
                      className="text-blue-600 hover:text-blue-800 p-2"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(announcement.id)}
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
  );
}
