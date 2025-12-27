import { GraduationCap, Target, Users, Globe, Award, Shield } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <GraduationCap className="h-16 w-16 mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Hakkımızda
            </h1>
            <p className="text-xl text-blue-100">
              Bilimsel kongre ve etkinlik yönetiminde yenilikçi çözümler sunuyoruz
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Mission Section */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Misyonumuz</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Kongre Yönetim Sistemi, bilimsel kongre, sempozyum ve etkinliklerin organizasyonunu
                  kolaylaştırmak ve dijitalleştirmek amacıyla geliştirilmiş modern bir platformdur.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Amacımız, akademisyenler, araştırmacılar ve bilim insanları için etkili bir
                  iletişim ve işbirliği ortamı sağlayarak bilimsel bilginin paylaşımını ve
                  yaygınlaşmasını desteklemektir.
                </p>
              </div>
            </div>
          </section>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <FeatureCard
              icon={<Users className="h-6 w-6" />}
              title="Kolay Yönetim"
              description="Etkinlik organizatörleri için kullanıcı dostu arayüz ve kapsamlı yönetim araçları"
            />
            <FeatureCard
              icon={<Globe className="h-6 w-6" />}
              title="Çok Dilli Destek"
              description="Uluslararası etkinlikler için çoklu para birimi ve çok dilli destek"
            />
            <FeatureCard
              icon={<Award className="h-6 w-6" />}
              title="Hakem Sistemi"
              description="Akademik standartlara uygun profesyonel hakem değerlendirme sistemi"
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6" />}
              title="Güvenli Altyapı"
              description="Verilerinizin güvenliği için modern şifreleme ve güvenlik protokolleri"
            />
          </div>

          {/* Values Section */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Değerlerimiz</h2>
            <div className="space-y-4">
              <ValueItem
                title="Şeffaflık"
                description="Tüm süreçlerimizde açık ve anlaşılır iletişim"
              />
              <ValueItem
                title="Kalite"
                description="En yüksek standartlarda hizmet ve teknik altyapı"
              />
              <ValueItem
                title="İnovasyon"
                description="Sürekli gelişim ve yenilikçi çözümler"
              />
              <ValueItem
                title="Kullanıcı Odaklılık"
                description="Kullanıcı deneyimi ve memnuniyeti önceliğimiz"
              />
            </div>
          </section>

          {/* Contact Section */}
          <section className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">İletişime Geçin</h2>
            <p className="text-blue-100 mb-6">
              Sorularınız için bizimle iletişime geçmekten çekinmeyin
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="mailto:destek@kongreai.com"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
              >
                E-posta: destek@kongreai.com
              </a>
              <a
                href="tel:+908501234567"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors font-medium"
              >
                Telefon: 0850 123 45 67
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: any) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center text-blue-600 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}

function ValueItem({ title, description }: any) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
      <div>
        <h4 className="font-semibold text-gray-900">{title}</h4>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </div>
  );
}
