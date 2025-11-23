export default function Footer() {
  return (
    <footer className="bg-[#1e3a5f] text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src="/logo.png" alt="KIUTH Logo" className="w-8 h-8 object-contain" />
              <h3 className="text-lg font-semibold">KIUTH</h3>
            </div>
            <p className="text-gray-300 text-sm">
              Kashim Ibrahim University Teaching Hospital - Building Borno's Future Healthcare Workforce
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-300 hover:text-[#4a9d7e] transition-colors">Home</a></li>
              <li><a href="#" className="text-gray-300 hover:text-[#4a9d7e] transition-colors">Job Listings</a></li>
              <li><a href="#" className="text-gray-300 hover:text-[#4a9d7e] transition-colors">Apply Now</a></li>
              <li><a href="#" className="text-gray-300 hover:text-[#4a9d7e] transition-colors">Contact Us</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>Maiduguri,Njimtilo Kano Road, Borno State</li>
              <li>Nigeria</li>
              <li>P.M.B 1065</li>
              <li>Email: recruitment@kiuth.edu.ng</li>
              <li>Phone: +234 (0) 76 123 4567</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-300 hover:text-[#4a9d7e] transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-300 hover:text-[#4a9d7e] transition-colors">Terms of Service</a></li>

            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-300">
          <p>&copy; 2025 Orivon Edge. All rights reserved.</p>

        </div>
      </div>
    </footer>
  );
}
