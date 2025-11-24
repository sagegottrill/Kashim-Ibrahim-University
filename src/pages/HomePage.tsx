interface HomePageProps {
  onNavigate: (page: string) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] bg-cover bg-center" style={{
        backgroundImage: `url(/hero.png)`
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-end pb-4 items-center text-center">
          <div className="animate-fade-in-up space-y-8">
            <div className="inline-block bg-black/50 backdrop-blur-sm px-8 py-6 rounded-2xl">
              <h1 className="text-4xl md:text-6xl font-bold font-serif text-white leading-tight drop-shadow-lg">
                <span className="text-brand-teal">Kashim Ibrahim University</span> <br />
                Teaching Hospital
              </h1>
            </div>
            <div className="inline-block bg-black/50 backdrop-blur-sm px-8 py-4 rounded-2xl">
              <p className="text-xl md:text-2xl text-white font-light drop-shadow-md">
                Excellence in Healthcare, Education, and Research.
              </p>
            </div>
            <div className="pt-4">
              <button
                onClick={() => onNavigate('jobs')}
                className="bg-brand-teal text-white px-10 py-4 rounded-full font-semibold text-lg hover:bg-[#3d8568] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                View Open Positions
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Work With KIUTH */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-brand-blue mb-6">Why Work With KIUTH?</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We offer a supportive environment where you can grow your career, collaborate with experts, and make a real impact on patient lives.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                title: 'Training Hospital',
                description: 'Learn from experienced professionals in a world-class teaching hospital environment.',
                image: '/train.jpg'
              },
              {
                title: 'Career Growth',
                description: 'Opportunities for professional development, research, and specialization.',
                image: '/carrer.jpg'
              },
              {
                title: 'Community Impact',
                description: 'Serve the community and contribute to improving healthcare in the region.',
                image: '/impc.jpg'
              }
            ].map((item, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group">
                <div className="h-56 overflow-hidden">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold font-serif text-brand-blue mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
