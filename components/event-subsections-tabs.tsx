'use client';

import { useState, useEffect } from 'react';
import { FileText, Award, Image as ImageIcon, Calendar, Download, ExternalLink } from 'lucide-react';

interface EventSubsectionsTabsProps {
  eventId: string;
}

export default function EventSubsectionsTabs({ eventId }: EventSubsectionsTabsProps) {
  const [activeTab, setActiveTab] = useState<'documents' | 'results' | 'gallery' | 'schedule'>('documents');
  const [loading, setLoading] = useState(false);

  // Data states
  const [documents, setDocuments] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);

  // Fetch data based on active tab
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let res;
        if (activeTab === 'documents') {
          res = await fetch(`/api/events/${eventId}/documents`);
          if (res.ok) {
            const data = await res.json();
            setDocuments(data.documents || []);
          }
        } else if (activeTab === 'results') {
          res = await fetch(`/api/events/${eventId}/results`);
          if (res.ok) {
            const data = await res.json();
            setResults(data.results || []);
          }
        } else if (activeTab === 'gallery') {
          res = await fetch(`/api/events/${eventId}/gallery`);
          if (res.ok) {
            const data = await res.json();
            setGallery(data.galleryItems || []);
          }
        } else if (activeTab === 'schedule') {
          res = await fetch(`/api/events/${eventId}/schedule`);
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

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('PDF')) return '📄';
    if (fileType.includes('DOC')) return '📝';
    if (fileType.includes('XLS')) return '📊';
    if (fileType.includes('PPT')) return '📽️';
    return '📁';
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    if (mb < 1) {
      const kb = bytes / 1024;
      return `${kb.toFixed(0)} KB`;
    }
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Etkinlik Kaynakları</h2>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-4">
          <button
            onClick={() => setActiveTab('documents')}
            className={`pb-3 px-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'documents'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText className="inline-block w-4 h-4 mr-2" />
            Dokümanlar
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`pb-3 px-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'schedule'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Calendar className="inline-block w-4 h-4 mr-2" />
            Program
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`pb-3 px-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'results'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Award className="inline-block w-4 h-4 mr-2" />
            Sonuçlar
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`pb-3 px-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'gallery'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <ImageIcon className="inline-block w-4 h-4 mr-2" />
            Galeri
          </button>
        </nav>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 mt-3">Yükleniyor...</p>
        </div>
      ) : (
        <div className="min-h-[200px]">
          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div>
              {documents.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Henüz döküman eklenmemiş</p>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <a
                      key={doc.id}
                      href={doc.dosya_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-3xl flex-shrink-0">{getFileIcon(doc.dosya_tipi)}</div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 flex items-center gap-2">
                            {doc.baslik}
                            <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </h3>
                          {doc.aciklama && (
                            <p className="text-sm text-gray-600 mt-1">{doc.aciklama}</p>
                          )}
                          <div className="flex gap-3 mt-2 text-xs text-gray-500">
                            <span className="bg-gray-100 px-2 py-1 rounded">{doc.dosya_tipi}</span>
                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">{doc.kategori}</span>
                            {doc.dosya_boyut && <span>{formatFileSize(doc.dosya_boyut)}</span>}
                          </div>
                        </div>
                        <Download className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Schedule Tab */}
          {activeTab === 'schedule' && (
            <div>
              {schedule.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Henüz program eklenmemiş</p>
              ) : (
                <div className="space-y-6">
                  {/* Group by day */}
                  {Array.from(new Set(schedule.map((s) => s.gun))).map((gun) => (
                    <div key={gun}>
                      <h3 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-blue-500">
                        {gun}
                      </h3>
                      <div className="space-y-2">
                        {schedule
                          .filter((s) => s.gun === gun)
                          .map((item) => (
                            <div
                              key={item.id}
                              className="border-l-4 border-blue-500 bg-gray-50 p-4 rounded-r-lg hover:bg-gray-100 transition-colors"
                            >
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
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Results Tab */}
          {activeTab === 'results' && (
            <div>
              {results.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Henüz sonuç eklenmemiş</p>
              ) : (
                <div className="space-y-4">
                  {results.map((result) => (
                    <div key={result.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-bold text-gray-900">{result.baslik}</h3>
                        <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
                          {result.tip}
                        </span>
                      </div>
                      <div
                        className="prose prose-sm max-w-none text-gray-700 mb-3"
                        dangerouslySetInnerHTML={{ __html: result.icerik }}
                      />
                      {result.dosya_url && (
                        <a
                          href={result.dosya_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                          <Download className="w-4 h-4" />
                          Dosyayı İndir
                        </a>
                      )}
                      {result.yayin_tarihi && (
                        <p className="text-xs text-gray-500 mt-2">
                          Yayınlanma: {new Date(result.yayin_tarihi).toLocaleDateString('tr-TR')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Gallery Tab */}
          {activeTab === 'gallery' && (
            <div>
              {gallery.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Henüz galeri öğesi eklenmemiş</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {gallery.map((item) => (
                    <div key={item.id} className="group relative overflow-hidden rounded-lg border border-gray-200 hover:shadow-lg transition-all">
                      {item.medya_tipi === 'IMAGE' ? (
                        <img
                          src={item.medya_url}
                          alt={item.baslik || 'Galeri görseli'}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <video
                          src={item.medya_url}
                          className="w-full h-48 object-cover"
                          controls
                        />
                      )}
                      {(item.baslik || item.aciklama) && (
                        <div className="p-3 bg-white">
                          {item.baslik && <h4 className="font-semibold text-gray-900">{item.baslik}</h4>}
                          {item.aciklama && <p className="text-sm text-gray-600 mt-1">{item.aciklama}</p>}
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <span className="bg-black/50 text-white text-xs px-2 py-1 rounded">
                          {item.kategori}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
