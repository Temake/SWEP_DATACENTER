import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import ThemeToggle from '../components/common/ThemeToggle';
import cscImage from '../assets/csc.jpg';

const LandingPage: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Add smooth scrolling behavior
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      html {
        scroll-behavior: smooth;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 lg:px-8 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="bg-black dark:bg-white text-white dark:text-black p-2 rounded-lg">
            <svg
              className="h-6 w-6"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-xl font-bold text-black dark:text-white">ScholarBase</span>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <a href="#home" className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors">
            Home
          </a>
          <a href="#about" className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors">
            About
          </a>
          <a href="#how-it-works" className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors">
            How It Works
          </a>
          <ThemeToggle />
        </div>

        {/* Mobile Navigation Button */}
        <div className="md:hidden flex items-center space-x-4">
          <ThemeToggle />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-black dark:text-white p-2"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
          <div className="px-6 py-4 space-y-4">
            <a 
              href="#home" 
              className="block text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </a>
            <a 
              href="#about" 
              className="block text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </a>
            <a 
              href="#how-it-works" 
              className="block text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              How It Works
            </a>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section id="home" className="relative flex flex-col items-center justify-center min-h-[90vh] px-6 text-center">
        {/* Background Image */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black/50 z-10"></div>
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
            style={{backgroundImage: `url(${cscImage})`}}
          ></div>
        </div>

        {/* Content */}
        <div className="relative z-20 max-w-5xl mx-auto">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
            <span className="text-white">From Algorithms to Archives.</span>
          </h1>
          
          <p className="text-lg md:text-xl lg:text-1xl text-gray-200 mb-16 max-w-4xl mx-auto leading-relaxed">
            Every line of research, every algorithm, every innovation from Great life's Computer
            Science & Engineering department is preserved here as part of Africa's digital heritage.
          </p>

          {/* Login Buttons */}
          <div className="flex flex-col gap-6 justify-center items-center max-w-sm mx-auto">
            <Link to="/login?role=student" className="w-full">
              <Button 
                variant="outline" 
                className="w-full bg-transparent border-2 border-white dark:border-white text-white dark:text-white hover:bg-white hover:text-black dark:hover:bg-white dark:hover:text-black transition-all duration-300 py-4 px-8 text-lg font-medium rounded-lg"
              >
                Login as Student
              </Button>
            </Link>
            
            <Link to="/login?role=supervisor" className="w-full">
              <Button 
                variant="outline" 
                className="w-full bg-transparent border-2 border-white dark:border-white text-white dark:text-white hover:bg-white hover:text-black dark:hover:bg-white dark:hover:text-black transition-all duration-300 py-4 px-8 text-lg font-medium rounded-lg"
              >
                Login as Supervisor
              </Button>
            </Link>
            
            <Link to="/login?role=admin" className="w-full">
              <Button 
                variant="outline" 
                className="w-full bg-transparent border-2 border-white dark:border-white text-white dark:text-white hover:bg-white hover:text-black dark:hover:bg-white dark:hover:text-black transition-all duration-300 py-4 px-8 text-lg font-medium rounded-lg"
              >
                Login as Admin
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-6 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-blue-600 dark:text-blue-400">
            About the Repository
          </h2>
          
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm dark:shadow-lg border border-gray-200 dark:border-gray-700">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg mb-6">
                The Academic Project Repository is an advanced digital platform designed to store, organize, and manage all undergraduate
                and postgraduate research projects within the Department of Computer Science and Technology. It functions as a
                comprehensive archive of academic projects covering the evolving landscape of tracking topics and ensuring that valuable
                research remains accessible for current and future generations.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                Through this repository, students can securely upload their projects together with relevant details such as title, abstract,
                supervisor's name, year of submission, and keywords. Supervisors can easily access, review, and approve submissions ensuring
                that all approved works meet the required standards and provide relevant context ensuring that all submitted projects meet
                departmental standards before they are archived in the repository.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-black dark:text-white">
            How It Works
          </h2>
          
          <div className="grid gap-12 max-w-4xl mx-auto">
            {/* Step 1 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm dark:shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold mb-4 text-blue-600 dark:text-blue-400">Step 1: Student Submissions</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Students can log into the site, upload, search, use important keywords, year of submission, and the full project
                document. Each submission is automatically tagged with metadata for easy identification and future access.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm dark:shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold mb-4 text-blue-600 dark:text-blue-400">Step 2: Supervisor Review</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Once a project is uploaded, the assigned supervisor receives a notification. Supervisors can then review each
                submission, provide feedback, and either approve or request revisions ensuring that all submitted projects meet
                departmental standards before they are archived in the repository.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm dark:shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold mb-4 text-blue-600 dark:text-blue-400">Step 3: Administrative Management</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                After supervisor approval, the project is formally stored in the central database. Administrators are responsible for
                maintaining the overall structure and quality of the repository, ensuring proper categorization and archiving for easy
                retrieval and reference.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm dark:shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold mb-4 text-blue-600 dark:text-blue-400">Step 4: Long-Term Access & Knowledge Sharing</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Approved projects remain in the repository as part of the department's academic archive. This allows current and future
                students to search, reference, and build upon previous work. The repository supports the advancement of research
                within the Computer Science and Technology Department of Computer Science and Engineering.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-8 mb-8">
            <a href="#home" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
              Home
            </a>
            <a href="#about" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
              About the Repository
            </a>
            <a href="#how-it-works" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
              How It Works
            </a>
            <Link to="/contact" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
              Contact
            </Link>
          </div>
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400">
              © 2025 Department of Computer Science and Engineering, OAU
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;