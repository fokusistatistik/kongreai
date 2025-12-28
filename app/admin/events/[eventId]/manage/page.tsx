'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { FileText, Award, Image, Calendar, Clock, Plus, Pencil, Trash2, Save, X, Bell, Download } from 'lucide-react';

export default function ManageEventSubsectionsPage() {
  const params = useParams();
  const { data: session } = useSession();
  const eventId = params?.eventId as string;

  const [activeTab, setActiveTab] = useState<'documents' | 'results' | 'gallery' | 'schedule' | 'timeline' | 'announcements'>('documents');
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

  // Timeline state
  const [timeline, setTimeline] = useState<any[]>([]);
  const [editingTimeline, setEditingTimeline] = useState<any>(null);
  const [newTimeline, setNewTimeline] = useState<any>(null);

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
        } else if (activeTab === 'timeline') {
          const res = await fetch(`/api/admin/events/${eventId}/timeline`);
          if (res.ok) {
            const data = await res.json();
            setTimeline(data.timeline || []);
          }
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

  // Gallery handlers
  const handleCreateGallery = async () => {
    if (!newGallery?.medya_url || !newGallery?.medya_tipi) {
      alert('Medya URL ve medya tipi zorunludur');
      return;
    }

    try {
      const res = await fetch(`/api/admin/events/${eventId}/gallery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGallery),
      });

      if (res.ok) {
        const data = await res.json();
        setGallery([...gallery, data.galleryItem]);
        setNewGallery(null);
        alert('Galeri öğesi başarıyla oluşturuldu');
      } else {
        const error = await res.json();
        alert(error.error || 'Bir hata oluştu');
      }
    } catch (error) {
      console.error('Gallery creation error:', error);
      alert('Bir hata oluştu');
    }
  };

  const handleUpdateGallery = async (galleryId: string) => {
    try {
      const res = await fetch(`/api/admin/events/${eventId}/gallery/${galleryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingGallery),
      });

      if (res.ok) {
        const data = await res.json();
        setGallery(gallery.map((g) => (g.id === galleryId ? data.galleryItem : g)));
        setEditingGallery(null);
        alert('Galeri öğesi başarıyla güncellendi');
      } else {
        const error = await res.json();
        alert(error.error || 'Bir hata oluştu');
      }
    } catch (error) {
      console.error('Gallery update error:', error);
      alert('Bir hata oluştu');
    }
  };

  const handleDeleteGallery = async (galleryId: string) => {
    if (!confirm('Bu galeri öğesini silmek istediğinizden emin misiniz?')) return;

    try {
      const res = await fetch(`/api/admin/events/${eventId}/gallery/${galleryId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setGallery(gallery.filter((g) => g.id !== galleryId));
        alert('Galeri öğesi başarıyla silindi');
      } else {
        const error = await res.json();
        alert(error.error || 'Bir hata oluştu');
      }
    } catch (error) {
      console.error('Gallery deletion error:', error);
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

  // Timeline handlers
  const handleCreateTimeline = async () => {
    if (!newTimeline?.baslik || !newTimeline?.tarih || !newTimeline?.tip) {
      alert('Başlık, tarih ve tip zorunludur');
      return;
    }

    try {
      const res = await fetch(`/api/admin/events/${eventId}/timeline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTimeline),
      });

      if (res.ok) {
        const data = await res.json();
        setTimeline([...timeline, data.timelineItem]);
        setNewTimeline(null);
        alert('Timeline öğesi başarıyla oluşturuldu');
      } else {
        const error = await res.json();
        alert(error.error || 'Bir hata oluştu');
      }
    } catch (error) {
      console.error('Timeline creation error:', error);
      alert('Bir hata oluştu');
    }
  };

  const handleUpdateTimeline = async (timelineId: string) => {
    try {
      const res = await fetch(`/api/admin/events/${eventId}/timeline/${timelineId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingTimeline),
      });

      if (res.ok) {
        const data = await res.json();
        setTimeline(timeline.map((t) => (t.id === timelineId ? data.timelineItem : t)));
        setEditingTimeline(null);
        alert('Timeline öğesi başarıyla güncellendi');
      } else {
        const error = await res.json();
        alert(error.error || 'Bir hata oluştu');
      }
    } catch (error) {
      console.error('Timeline update error:', error);
      alert('Bir hata oluştu');
    }
  };

  const handleDeleteTimeline = async (timelineId: string) => {
    if (!confirm('Bu timeline öğesini silmek istediğinizden emin misiniz?')) return;

    try {
      const res = await fetch(`/api/admin/events/${eventId}/timeline/${timelineId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setTimeline(timeline.filter((t) => t.id !== timelineId));
        alert('Timeline öğesi başarıyla silindi');
      } else {
        const error = await res.json();
        alert(error.error || 'Bir hata oluştu');
      }
    } catch (error) {
      console.error('Timeline deletion error:', error);
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
            onClick={() => setActiveTab('timeline')}
            className={`pb-4 px-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'timeline'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Clock className="inline-block w-5 h-5 mr-2" />
            Önemli Tarihler
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
            onClick={() => setActiveTab('gallery')}
            className={`pb-4 px-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'gallery'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Image className="inline-block w-5 h-5 mr-2" />
            Galeri
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

          {/* Gallery Tab */}
          {activeTab === 'gallery' && (
            <GalleryTab
              gallery={gallery}
              newGallery={newGallery}
              setNewGallery={setNewGallery}
              editingGallery={editingGallery}
              setEditingGallery={setEditingGallery}
              handleCreate={handleCreateGallery}
              handleUpdate={handleUpdateGallery}
              handleDelete={handleDeleteGallery}
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

          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <TimelineTab
              timeline={timeline}
              newTimeline={newTimeline}
              setNewTimeline={setNewTimeline}
              editingTimeline={editingTimeline}
              setEditingTimeline={setEditingTimeline}
              handleCreate={handleCreateTimeline}
              handleUpdate={handleUpdateTimeline}
              handleDelete={handleDeleteTimeline}
            />
          )}

          {/* Announcements Tab - Coming soon */}
          {activeTab === 'announcements' && (
            <div className="text-center py-8">
              <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Duyuru yönetimi yakında eklenecek</p>
              <p className="text-sm text-gray-500 mt-2">Announcement API entegrasyonu devam ediyor</p>
            </div>
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
                      dangerouslySetInnerHTML={{ __html: result.icerik }}
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

// Gallery Tab Component
function GalleryTab({ gallery, newGallery, setNewGallery, editingGallery, setEditingGallery, handleCreate, handleUpdate, handleDelete }: any) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Galeri</h2>
        <button
          onClick={() =>
            setNewGallery({
              baslik: '',
              aciklama: '',
              medya_url: '',
              medya_tipi: 'IMAGE',
              thumbnail_url: '',
              kategori: 'GENEL',
              yayinlandi: true,
              sira: 0,
            })
          }
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Yeni Medya
        </button>
      </div>

      {/* New Gallery Form */}
      {newGallery && (
        <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
          <h3 className="font-bold mb-3">Yeni Galeri Öğesi</h3>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Başlık"
              value={newGallery.baslik}
              onChange={(e) => setNewGallery({ ...newGallery, baslik: e.target.value })}
              className="px-3 py-2 border rounded"
            />
            <select
              value={newGallery.medya_tipi}
              onChange={(e) => setNewGallery({ ...newGallery, medya_tipi: e.target.value })}
              className="px-3 py-2 border rounded"
            >
              <option value="IMAGE">Resim</option>
              <option value="VIDEO">Video</option>
            </select>
            <input
              type="text"
              placeholder="Medya URL *"
              value={newGallery.medya_url}
              onChange={(e) => setNewGallery({ ...newGallery, medya_url: e.target.value })}
              className="px-3 py-2 border rounded"
            />
            <input
              type="text"
              placeholder="Thumbnail URL (opsiyonel)"
              value={newGallery.thumbnail_url}
              onChange={(e) => setNewGallery({ ...newGallery, thumbnail_url: e.target.value })}
              className="px-3 py-2 border rounded"
            />
            <select
              value={newGallery.kategori}
              onChange={(e) => setNewGallery({ ...newGallery, kategori: e.target.value })}
              className="px-3 py-2 border rounded"
            >
              <option value="GENEL">Genel</option>
              <option value="OTURUM">Oturum</option>
              <option value="GALA">Gala</option>
              <option value="POSTER">Poster</option>
              <option value="SOSYAL">Sosyal</option>
            </select>
            <input
              type="number"
              placeholder="Sıra"
              value={newGallery.sira}
              onChange={(e) => setNewGallery({ ...newGallery, sira: parseInt(e.target.value) || 0 })}
              className="px-3 py-2 border rounded"
            />
            <textarea
              placeholder="Açıklama"
              value={newGallery.aciklama}
              onChange={(e) => setNewGallery({ ...newGallery, aciklama: e.target.value })}
              className="px-3 py-2 border rounded col-span-2"
              rows={2}
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newGallery.yayinlandi}
                onChange={(e) => setNewGallery({ ...newGallery, yayinlandi: e.target.checked })}
              />
              Yayınla
            </label>
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
              onClick={() => setNewGallery(null)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              İptal
            </button>
          </div>
        </div>
      )}

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {gallery.length === 0 ? (
          <div className="col-span-full text-gray-500 text-center py-8">Henüz galeri öğesi eklenmemiş</div>
        ) : (
          gallery.map((item: any) => (
            <div key={item.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              {editingGallery?.id === item.id ? (
                <div className="p-4">
                  <input
                    type="text"
                    value={editingGallery.baslik}
                    onChange={(e) => setEditingGallery({ ...editingGallery, baslik: e.target.value })}
                    className="px-3 py-2 border rounded w-full mb-2"
                    placeholder="Başlık"
                  />
                  <input
                    type="text"
                    value={editingGallery.medya_url}
                    onChange={(e) => setEditingGallery({ ...editingGallery, medya_url: e.target.value })}
                    className="px-3 py-2 border rounded w-full mb-2"
                    placeholder="Medya URL"
                  />
                  <select
                    value={editingGallery.kategori}
                    onChange={(e) => setEditingGallery({ ...editingGallery, kategori: e.target.value })}
                    className="px-3 py-2 border rounded w-full mb-2"
                  >
                    <option value="GENEL">Genel</option>
                    <option value="OTURUM">Oturum</option>
                    <option value="GALA">Gala</option>
                    <option value="POSTER">Poster</option>
                    <option value="SOSYAL">Sosyal</option>
                  </select>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleUpdate(item.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm flex items-center gap-1 flex-1"
                    >
                      <Save className="w-4 h-4" />
                      Kaydet
                    </button>
                    <button
                      onClick={() => setEditingGallery(null)}
                      className="bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400 text-sm flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="relative">
                    {item.medya_tipi === 'IMAGE' ? (
                      <img src={item.medya_url} alt={item.baslik || 'Galeri'} className="w-full h-48 object-cover" />
                    ) : (
                      <video src={item.medya_url} className="w-full h-48 object-cover" controls />
                    )}
                    <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                      {item.kategori}
                    </div>
                    <div className="absolute top-2 left-2">
                      <span className={`text-xs px-2 py-1 rounded ${item.yayinlandi ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                        {item.yayinlandi ? 'Yayında' : 'Taslak'}
                      </span>
                    </div>
                  </div>
                  <div className="p-3">
                    {item.baslik && <h4 className="font-semibold text-sm mb-1">{item.baslik}</h4>}
                    {item.aciklama && <p className="text-xs text-gray-600 mb-2">{item.aciklama}</p>}
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setEditingGallery(item)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </>
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

// Timeline Tab Component
function TimelineTab({ timeline, newTimeline, setNewTimeline, editingTimeline, setEditingTimeline, handleCreate, handleUpdate, handleDelete }: any) {
  return (
    <div>
      {/* Create New Timeline Item */}
      {newTimeline && (
        <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
          <h3 className="font-bold mb-3">Yeni Önemli Tarih</h3>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Başlık * (örn: Bildiri Gönderme Son Tarihi)"
              value={newTimeline.baslik}
              onChange={(e) => setNewTimeline({ ...newTimeline, baslik: e.target.value })}
              className="px-3 py-2 border rounded col-span-2"
            />
            <input
              type="date"
              placeholder="Tarih *"
              value={newTimeline.tarih}
              onChange={(e) => setNewTimeline({ ...newTimeline, tarih: e.target.value })}
              className="px-3 py-2 border rounded"
            />
            <select
              value={newTimeline.tip}
              onChange={(e) => setNewTimeline({ ...newTimeline, tip: e.target.value })}
              className="px-3 py-2 border rounded"
            >
              <option value="">Tip Seçin *</option>
              <option value="ONEMLI">Önemli</option>
              <option value="BASVURU">Başvuru</option>
              <option value="BILDIRI">Bildiri</option>
              <option value="SONUC">Sonuç</option>
              <option value="ETKINLIK">Etkinlik</option>
              <option value="DUYURU">Duyuru</option>
            </select>
            <textarea
              placeholder="Açıklama (opsiyonel)"
              value={newTimeline.aciklama || ''}
              onChange={(e) => setNewTimeline({ ...newTimeline, aciklama: e.target.value })}
              className="px-3 py-2 border rounded col-span-2"
              rows={2}
            />
            <select
              value={newTimeline.ikon || ''}
              onChange={(e) => setNewTimeline({ ...newTimeline, ikon: e.target.value })}
              className="px-3 py-2 border rounded"
            >
              <option value="">İkon (opsiyonel)</option>
              <option value="calendar">📅 Takvim</option>
              <option value="file">📄 Dosya</option>
              <option value="award">🏆 Ödül</option>
              <option value="bell">🔔 Duyuru</option>
              <option value="clock">⏰ Saat</option>
              <option value="check">✅ Onay</option>
            </select>
            <label className="flex items-center gap-2 px-3 py-2 border rounded bg-white">
              <input
                type="checkbox"
                checked={newTimeline.yayinlandi}
                onChange={(e) => setNewTimeline({ ...newTimeline, yayinlandi: e.target.checked })}
              />
              <span className="text-sm">Yayınlansın mı?</span>
            </label>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Kaydet
            </button>
            <button
              onClick={() => setNewTimeline(null)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              İptal
            </button>
          </div>
        </div>
      )}

      {/* Add New Button */}
      {!newTimeline && !editingTimeline && (
        <button
          onClick={() => setNewTimeline({ baslik: '', tarih: '', tip: 'ONEMLI', aciklama: '', ikon: '', yayinlandi: true, sira: 0 })}
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Yeni Önemli Tarih Ekle
        </button>
      )}

      {/* Timeline List */}
      <div className="space-y-3">
        {timeline.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Henüz önemli tarih eklenmemiş
          </div>
        ) : (
          timeline.map((item: any) => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
              {editingTimeline?.id === item.id ? (
                <div>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={editingTimeline.baslik}
                      onChange={(e) => setEditingTimeline({ ...editingTimeline, baslik: e.target.value })}
                      className="px-3 py-2 border rounded col-span-2"
                    />
                    <input
                      type="date"
                      value={editingTimeline.tarih}
                      onChange={(e) => setEditingTimeline({ ...editingTimeline, tarih: e.target.value })}
                      className="px-3 py-2 border rounded"
                    />
                    <select
                      value={editingTimeline.tip}
                      onChange={(e) => setEditingTimeline({ ...editingTimeline, tip: e.target.value })}
                      className="px-3 py-2 border rounded"
                    >
                      <option value="ONEMLI">Önemli</option>
                      <option value="BASVURU">Başvuru</option>
                      <option value="BILDIRI">Bildiri</option>
                      <option value="SONUC">Sonuç</option>
                      <option value="ETKINLIK">Etkinlik</option>
                      <option value="DUYURU">Duyuru</option>
                    </select>
                    <textarea
                      value={editingTimeline.aciklama || ''}
                      onChange={(e) => setEditingTimeline({ ...editingTimeline, aciklama: e.target.value })}
                      className="px-3 py-2 border rounded col-span-2"
                      rows={2}
                    />
                    <select
                      value={editingTimeline.ikon || ''}
                      onChange={(e) => setEditingTimeline({ ...editingTimeline, ikon: e.target.value })}
                      className="px-3 py-2 border rounded"
                    >
                      <option value="">İkon (opsiyonel)</option>
                      <option value="calendar">📅 Takvim</option>
                      <option value="file">📄 Dosya</option>
                      <option value="award">🏆 Ödül</option>
                      <option value="bell">🔔 Duyuru</option>
                      <option value="clock">⏰ Saat</option>
                      <option value="check">✅ Onay</option>
                    </select>
                    <label className="flex items-center gap-2 px-3 py-2 border rounded bg-white">
                      <input
                        type="checkbox"
                        checked={editingTimeline.yayinlandi}
                        onChange={(e) => setEditingTimeline({ ...editingTimeline, yayinlandi: e.target.checked })}
                      />
                      <span className="text-sm">Yayınlansın mı?</span>
                    </label>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleUpdate(item.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Güncelle
                    </button>
                    <button
                      onClick={() => setEditingTimeline(null)}
                      className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      İptal
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-lg">{item.baslik}</h3>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                        {item.tip}
                      </span>
                      {!item.yayinlandi && (
                        <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded">
                          Taslak
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      📅 {new Date(item.tarih).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    {item.aciklama && (
                      <p className="text-sm text-gray-700">{item.aciklama}</p>
                    )}
                    {item.ikon && (
                      <p className="text-xs text-gray-500 mt-1">İkon: {item.ikon}</p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => setEditingTimeline(item)}
                      className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm flex items-center gap-1"
                    >
                      <Pencil className="w-4 h-4" />
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      Sil
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
