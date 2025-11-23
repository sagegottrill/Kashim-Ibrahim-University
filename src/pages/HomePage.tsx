import heroBg from '../assets/images/hero_bg.png';
import trainingHospital from '../assets/images/training_hospital.png';
import careerGrowth from '../assets/images/career_growth.png';
import communityImpact from '../assets/images/community_impact.png';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[500px] bg-cover bg-center" style={{
        backgroundImage: `linear-gradient(rgba(30, 58, 95, 0.8), rgba(30, 58, 95, 0.8)), url(${heroBg})`
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center items-center text-center">
          <div className="max-w-3xl animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Join the Team at Kashim Ibrahim University Teaching Hospital
            </h1>
            <p className="text-xl text-gray-200 mb-8">
              Excellence in Healthcare, Education, and Research.
            </p>
            <button
              onClick={() => onNavigate('jobs')}
              className="bg-[#4a9d7e] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#3d8568] transition-colors duration-300"
            >
              View Open Positions
            </button>
          </div>
        </div>
      </section>

      {/* Why Work With KIUTH */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1e3a5f] mb-4">Why Work With KIUTH?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We offer a supportive environment where you can grow your career and make a real impact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Training Hospital',
                description: 'Learn from experienced professionals in a world-class teaching hospital environment',
                image: trainingHospital
              },
              {
                title: 'Career Growth',
                description: 'Opportunities for professional development, research, and specialization',
                image: careerGrowth
              },
              {
                title: 'Community Impact',
                description: 'Serve the community and contribute to improving healthcare in the region',
                image: communityImpact
              }
            ].map((item, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="h-48 overflow-hidden">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-[#1e3a5f] mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
