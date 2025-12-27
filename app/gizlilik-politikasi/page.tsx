import { Shield, Lock, Eye, FileText, UserCheck, Database } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Shield className="h-16 w-16 mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Gizlilik Politikası
            </h1>
            <p className="text-xl text-blue-100">
              Kişisel verilerinizin gizliliği bizim için çok önemlidir
            </p>
            <p className="text-sm text-blue-200 mt-4">
              Son Güncellenme: {new Date().toLocaleDateString('tr-TR')}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Introduction */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Giriş</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Kongre Yönetim Sistemi olarak, kullanıcılarımızın kişisel verilerinin gizliliğini ve
              güvenliğini korumayı en önemli sorumluluklarımızdan biri olarak görüyoruz.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Bu gizlilik politikası, platformumuzda topladığımız bilgilerin nasıl kullanıldığını,
              saklandığını ve korunduğunu açıklamaktadır.
            </p>
          </section>

          {/* Data Collection */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Database className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Toplanan Veriler</h2>
                <p className="text-gray-700 mb-4">
                  Platformumuzda aşağıdaki kişisel veriler toplanmaktadır:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Ad, soyad ve iletişim bilgileri (e-posta, telefon)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Akademik unvan ve kurum bilgileri</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Başvuru ve bilimsel çalışma dokümanları</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Ödeme bilgileri (şifreli olarak saklanır)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Oturum ve kullanım verileri</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Data Usage */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Verilerin Kullanımı</h2>
                <p className="text-gray-700 mb-4">
                  Toplanan kişisel veriler yalnızca aşağıdaki amaçlarla kullanılır:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">•</span>
                    <span>Kullanıcı hesabı oluşturma ve yönetimi</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">•</span>
                    <span>Etkinlik başvurularının işlenmesi ve değerlendirilmesi</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">•</span>
                    <span>Ödeme işlemlerinin gerçekleştirilmesi</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">•</span>
                    <span>Etkinlik bildirimleri ve duyuruların gönderilmesi</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">•</span>
                    <span>Platformun geliştirilmesi ve iyileştirilmesi</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Data Security */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Lock className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Veri Güvenliği</h2>
                <p className="text-gray-700 mb-4">
                  Kişisel verilerinizin güvenliğini sağlamak için aşağıdaki önlemleri alıyoruz:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    <span>SSL/TLS şifreleme ile güvenli veri iletimi</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    <span>Şifrelerin bcrypt ile hashlenmiş olarak saklanması</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    <span>Düzenli güvenlik güncellemeleri ve testleri</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    <span>Rol tabanlı erişim kontrolü</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    <span>Veritabanı düzenli yedekleme</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* User Rights */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-orange-100 p-3 rounded-lg">
                <UserCheck className="h-6 w-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Kullanıcı Hakları</h2>
                <p className="text-gray-700 mb-4">
                  KVKK (Kişisel Verilerin Korunması Kanunu) kapsamında aşağıdaki haklara sahipsiniz:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 mt-1">•</span>
                    <span>Kişisel verilerinizin işlenip işlenmediğini öğrenme</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 mt-1">•</span>
                    <span>Kişisel verilerinize erişim talep etme</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 mt-1">•</span>
                    <span>Kişisel verilerinizin düzeltilmesini isteme</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 mt-1">•</span>
                    <span>Kişisel verilerinizin silinmesini veya yok edilmesini isteme</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 mt-1">•</span>
                    <span>İşlenen verilerin üçüncü kişilere aktarılması durumunda bilgilendirilme</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Cookies */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Çerezler (Cookies)</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Platformumuz, kullanıcı deneyimini iyileştirmek ve oturum yönetimi için çerezler
              kullanmaktadır. Çerezler, tarayıcınız tarafından saklanan küçük metin dosyalarıdır.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Tarayıcınızın ayarlarından çerezleri devre dışı bırakabilirsiniz, ancak bu durumda
              platformun bazı özelliklerinin çalışmaması mümkündür.
            </p>
          </section>

          {/* Third Parties */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Üçüncü Taraf Hizmetler</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Ödeme işlemleri için güvenilir üçüncü taraf hizmet sağlayıcıları (örn. Iyzico)
              kullanılmaktadır. Bu hizmetler kendi gizlilik politikalarına tabidir.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Kredi kartı bilgileriniz hiçbir zaman sunucularımızda saklanmaz ve doğrudan ödeme
              sağlayıcısına iletilir.
            </p>
          </section>

          {/* Changes */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            <div className="flex items-start gap-4">
              <div className="bg-gray-100 p-3 rounded-lg">
                <FileText className="h-6 w-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Politika Değişiklikleri</h2>
                <p className="text-gray-700 leading-relaxed">
                  Bu gizlilik politikası gerektiğinde güncellenebilir. Önemli değişiklikler
                  durumunda kullanıcılarımız e-posta yoluyla bilgilendirilecektir. Politika
                  güncellemeleri bu sayfada yayınlanır ve güncellenme tarihi belirtilir.
                </p>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">İletişim</h2>
            <p className="text-blue-100 mb-6">
              Gizlilik politikamız hakkında sorularınız için bizimle iletişime geçebilirsiniz
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="mailto:gizlilik@kongreai.com"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
              >
                E-posta: gizlilik@kongreai.com
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
