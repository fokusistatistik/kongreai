import { GraduationCap, Target, Users, Globe, Award, Shield, CheckCircle, TrendingUp, Zap, Heart, BookOpen, Lightbulb, Calendar } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-4">
              <GraduationCap className="w-4 h-4" />
              <span>Bilimsel Yayın ve Etkinlik Platformu</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Akademik Dünyayı <br />
              <span className="text-blue-200">Bir Araya Getiriyoruz</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Bilimsel kongre, sempozyum ve konferansların organizasyonunu dijitalleştiriyor,
              akademisyenlerin ve araştırmacıların işbirliğini kolaylaştırıyoruz.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </div>

      {/* Stats Section */}
      <div className="py-12 bg-gray-50 border-y border-gray-200">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              <StatCard number="500+" label="Etkinlik" icon={<Calendar className="w-5 h-5" />} />
              <StatCard number="10,000+" label="Akademisyen" icon={<Users className="w-5 h-5" />} />
              <StatCard number="50+" label="Üniversite" icon={<GraduationCap className="w-5 h-5" />} />
              <StatCard number="99%" label="Memnuniyet" icon={<Heart className="w-5 h-5" />} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-sm border border-blue-100 p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-blue-600 p-3 rounded-xl shadow-lg">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Misyonumuz</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Bilimsel kongre, sempozyum ve etkinliklerin organizasyonunu tamamen dijitalleştirerek,
                    akademisyenlerin ve araştırmacıların işbirliğini kolaylaştırıyoruz.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    Modern teknolojilerle akademik dünyayı bir araya getirerek, bilimsel bilginin
                    paylaşımını ve yaygınlaşmasını destekliyoruz.
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-sm border border-purple-100 p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-purple-600 p-3 rounded-xl shadow-lg">
                  <Lightbulb className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Vizyonumuz</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Akademik etkinlik yönetiminde Türkiye'nin lider platformu olmak ve
                    uluslararası alanda tanınan bir marka haline gelmek.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    Bilim ve teknolojinin gücünü birleştirerek, akademik toplulukların
                    gelişimine katkıda bulunmayı hedefliyoruz.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* How it Works */}
          <section className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Nasıl Çalışır?
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Etkinlik yönetiminden katılımcı başvurularına kadar tüm süreç 4 adımda
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <ProcessStep
                number="1"
                title="Etkinlik Oluştur"
                description="Kongre, sempozyum veya konferans bilgilerini sisteme ekleyin"
                icon={<Calendar className="w-6 h-6" />}
              />
              <ProcessStep
                number="2"
                title="Başvuruları Al"
                description="Katılımcılar online formlar ile kolayca başvuru yapar"
                icon={<Users className="w-6 h-6" />}
              />
              <ProcessStep
                number="3"
                title="Değerlendirme"
                description="Hakem sistemi ile bildirileri profesyonel şekilde değerlendirin"
                icon={<Award className="w-6 h-6" />}
              />
              <ProcessStep
                number="4"
                title="Yönetim & Raporlama"
                description="Tüm süreci takip edin ve detaylı raporlar alın"
                icon={<TrendingUp className="w-6 h-6" />}
              />
            </div>
          </section>

          {/* Features Grid */}
          <section className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Neden Bizi Seçmelisiniz?
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Akademik etkinlik yönetiminde size sunduğumuz avantajlar
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard
                icon={<Users className="h-6 w-6" />}
                title="Kolay Yönetim"
                description="Etkinlik organizatörleri için sezgisel arayüz ve kapsamlı yönetim araçları ile zamandan tasarruf edin"
              />
              <FeatureCard
                icon={<Globe className="h-6 w-6" />}
                title="Global Erişim"
                description="Uluslararası etkinlikler için çoklu para birimi ve çok dilli destek, dünya çapında erişim"
              />
              <FeatureCard
                icon={<Award className="h-6 w-6" />}
                title="Hakem Sistemi"
                description="Akademik standartlara uygun profesyonel hakem değerlendirme ve geri bildirim sistemi"
              />
              <FeatureCard
                icon={<Shield className="h-6 w-6" />}
                title="Güvenli Altyapı"
                description="Verilerinizin güvenliği için en güncel şifreleme ve güvenlik protokolleri"
              />
              <FeatureCard
                icon={<Zap className="h-6 w-6" />}
                title="Hızlı & Performanslı"
                description="Modern teknolojilerle optimize edilmiş, hızlı ve kesintisiz hizmet"
              />
              <FeatureCard
                icon={<BookOpen className="h-6 w-6" />}
                title="Detaylı Raporlama"
                description="Kapsamlı istatistikler ve raporlarla etkinliğinizi anlık takip edin"
              />
            </div>
          </section>

          {/* Values Section */}
          <section className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Değerlerimiz
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                İş yapış şeklimizi şekillendiren temel prensipler
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <ValueCard
                title="Şeffaflık"
                description="Tüm süreçlerimizde açık, anlaşılır ve dürüst iletişim ilkesine bağlıyız"
                icon={<CheckCircle className="w-6 h-6" />}
                color="blue"
              />
              <ValueCard
                title="Kalite"
                description="En yüksek standartlarda hizmet sunarak kullanıcı memnuniyetini ön planda tutuyoruz"
                icon={<Award className="w-6 h-6" />}
                color="green"
              />
              <ValueCard
                title="İnovasyon"
                description="Sürekli gelişim ve yenilikçi çözümlerle sektörde öncü olmayı hedefliyoruz"
                icon={<Lightbulb className="w-6 h-6" />}
                color="purple"
              />
              <ValueCard
                title="Kullanıcı Odaklılık"
                description="Kullanıcı deneyimi ve ihtiyaçları tüm kararlarımızın merkezinde"
                icon={<Heart className="w-6 h-6" />}
                color="red"
              />
            </div>
          </section>

          {/* Contact Section */}
          <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-2xl shadow-2xl p-8 md:p-12 text-white text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Bizimle İletişime Geçin</h2>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
              Platformumuz hakkında sorularınız mı var? Size yardımcı olmaktan mutluluk duyarız.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-2xl mx-auto">
              <a
                href="mailto:destek@kongreai.com"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                destek@kongreai.com
              </a>
              <a
                href="tel:+908501234567"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-xl hover:bg-white/20 transition-all font-semibold"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                0850 123 45 67
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// Component Definitions
function StatCard({ number, label, icon }: { number: string; label: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition-shadow">
      <div className="flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full mx-auto mb-3">
        {icon}
      </div>
      <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{number}</div>
      <div className="text-sm text-gray-600 font-medium">{label}</div>
    </div>
  );
}

function ProcessStep({ number, title, description, icon }: { number: string; title: string; description: string; icon: React.ReactNode }) {
  return (
    <div className="relative bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all group">
      <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
        {number}
      </div>
      <div className="flex items-center justify-center w-14 h-14 bg-blue-50 text-blue-600 rounded-xl mx-auto mb-4 group-hover:bg-blue-100 transition-colors">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">{title}</h3>
      <p className="text-sm text-gray-600 text-center">{description}</p>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-blue-200 transition-all group">
      <div className="bg-gradient-to-br from-blue-100 to-indigo-100 w-14 h-14 rounded-xl flex items-center justify-center text-blue-600 mb-4 group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:text-white transition-all shadow-md">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function ValueCard({ icon, title, description, color }: { icon: React.ReactNode; title: string; description: string; color: string }) {
  const colorClasses = {
    blue: 'from-blue-50 to-blue-100 border-blue-200 text-blue-600',
    green: 'from-green-50 to-green-100 border-green-200 text-green-600',
    purple: 'from-purple-50 to-purple-100 border-purple-200 text-purple-600',
    red: 'from-red-50 to-red-100 border-red-200 text-red-600',
  };

  const iconBgClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    purple: 'bg-purple-600',
    red: 'bg-red-600',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} rounded-xl shadow-sm border p-6 hover:shadow-md transition-all`}>
      <div className="flex items-start gap-4">
        <div className={`${iconBgClasses[color as keyof typeof iconBgClasses]} text-white p-3 rounded-xl shadow-lg flex-shrink-0`}>
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-700 text-sm leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}
