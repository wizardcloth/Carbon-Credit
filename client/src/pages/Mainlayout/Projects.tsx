// Projects.tsx
import { useNavigate } from 'react-router-dom';
import { 
  Leaf, 
  TrendingDown, 
  Droplets, 
  CheckCircle, 
  Clock, 
  MapPin, 
  FileText, 
  ArrowRight,
  Info,
  Phone,
  MessageSquare,
  Users
} from 'lucide-react';

function Projects() {
  const navigate = useNavigate();

  const handleStartAssessment = () => {
    navigate('/assessment/tier-2');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Main Heading */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-green-900 mb-4">
            Rice Cultivation Carbon Credit Assessment
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Calculate your methane emission reduction potential using IPCC 2019 Tier 2 methodology 
            and earn carbon credits from sustainable rice farming practices
          </p>
        </div>

        {/* Info Alert */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8 rounded-r-lg shadow-sm">
          <div className="flex items-start">
            <Info className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                IPCC 2019 Tier 2 Methodology
              </h3>
              <p className="text-sm text-blue-800">
                This assessment uses the <strong>IPCC 2019 Refinement (AFOLU Vol.4, Ch.5)</strong> methodology 
                for rice cultivation emissions. It incorporates water management practices, organic amendments, 
                and region-specific factors to calculate your carbon credit potential with <strong>95-98% accuracy</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Main Assessment Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">Tier 2 CH₄ Emission Assessment</h2>
                <p className="text-green-100 text-lg">
                  Comprehensive carbon credit calculation for rice cultivation
                </p>
              </div>
              <div className="hidden md:block">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4 text-center">
                  <div className="text-4xl font-bold">3-8</div>
                  <div className="text-sm text-green-100">Credits per hectare</div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
                <Clock className="h-8 w-8 text-blue-600 mb-2" />
                <div className="text-sm text-blue-700 font-medium mb-1">Duration</div>
                <div className="text-2xl font-bold text-blue-900">15-20 min</div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200">
                <CheckCircle className="h-8 w-8 text-green-600 mb-2" />
                <div className="text-sm text-green-700 font-medium mb-1">Accuracy</div>
                <div className="text-2xl font-bold text-green-900">95-98%</div>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-5 border border-emerald-200">
                <TrendingDown className="h-8 w-8 text-emerald-600 mb-2" />
                <div className="text-sm text-emerald-700 font-medium mb-1">Reduction</div>
                <div className="text-2xl font-bold text-emerald-900">30-70%</div>
              </div>
              
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-5 border border-yellow-200">
                <Leaf className="h-8 w-8 text-yellow-600 mb-2" />
                <div className="text-sm text-yellow-700 font-medium mb-1">Credits</div>
                <div className="text-2xl font-bold text-yellow-900">3-8/ha</div>
              </div>
            </div>

            {/* Features */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                What's Included in This Assessment
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  {
                    icon: <Droplets className="h-5 w-5" />,
                    title: 'Water Management Analysis',
                    description: 'Continuously flooded, AWD, single/multiple drainage regimes'
                  },
                  {
                    icon: <Leaf className="h-5 w-5" />,
                    title: 'Organic Amendment Assessment',
                    description: 'Rice straw, compost, farmyard manure, green manure impacts'
                  },
                  {
                    icon: <MapPin className="h-5 w-5" />,
                    title: 'Spatial Field Mapping',
                    description: 'Interactive map boundary selection for satellite verification'
                  },
                  {
                    icon: <TrendingDown className="h-5 w-5" />,
                    title: 'Baseline vs Project Emissions',
                    description: 'Compare business-as-usual with improved practices'
                  },
                  {
                    icon: <CheckCircle className="h-5 w-5" />,
                    title: 'Gold Standard Compliant',
                    description: '15% uncertainty deduction for verified carbon credits'
                  },
                  {
                    icon: <FileText className="h-5 w-5" />,
                    title: 'IPCC 2019 Certified',
                    description: 'Uses latest refinement methodology with regional factors'
                  }
                ].map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3 bg-gray-50 p-4 rounded-lg">
                    <div className="text-green-600 mt-1">{feature.icon}</div>
                    <div>
                      <div className="font-semibold text-gray-900">{feature.title}</div>
                      <div className="text-sm text-gray-600">{feature.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Requirements */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                📋 Information You'll Need
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  'Personal details (Name, Phone, Aadhar)',
                  'Land survey number and area (hectares)',
                  'Village, district, and state location',
                  'Water management practices during cultivation',
                  'Pre-season water regime information',
                  'Organic amendments (type, rate, timing)',
                  'Field boundary on interactive map',
                  'Cultivation period (90-140 days typical)'
                ].map((req, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                    <span className="text-sm text-gray-700">{req}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleStartAssessment}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-700 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
            >
              Start Carbon Credit Assessment
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Process Flow */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            🌾 Simple 4-Step Process
          </h3>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: '1',
                title: 'Fill Form',
                description: 'Enter your farming details and select field boundary on map',
                icon: '📝',
                color: 'from-blue-500 to-blue-600'
              },
              {
                step: '2',
                title: 'Calculate',
                description: 'System calculates baseline vs project emissions using IPCC 2019',
                icon: '⚡',
                color: 'from-green-500 to-green-600'
              },
              {
                step: '3',
                title: 'Review Results',
                description: 'See your carbon credit potential and emission reduction percentage',
                icon: '📊',
                color: 'from-emerald-500 to-emerald-600'
              },
              {
                step: '4',
                title: 'Get Verified',
                description: 'Submit for verification and receive tradeable carbon credits',
                icon: '✅',
                color: 'from-yellow-500 to-yellow-600'
              }
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className={`bg-gradient-to-r ${item.color} text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-lg`}>
                  {item.step}
                </div>
                <div className="text-4xl mb-3">{item.icon}</div>
                <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits & Support */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Benefits */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-8 border border-green-200">
            <h3 className="text-2xl font-semibold text-green-900 mb-6 flex items-center">
              <Leaf className="h-6 w-6 mr-2" />
              Why Choose Our Platform?
            </h3>
            <ul className="space-y-4">
              {[
                {
                  icon: '🎯',
                  text: 'IPCC 2019 compliant methodology with 95-98% accuracy'
                },
                {
                  icon: '💰',
                  text: 'Maximize carbon credits with improved water management'
                },
                {
                  icon: '🛰️',
                  text: 'Satellite verification using Google Earth Engine & Sentinel'
                },
                {
                  icon: '✅',
                  text: 'Gold Standard certified emission reduction calculations'
                },
                {
                  icon: '📈',
                  text: 'Track baseline vs project emissions in real-time'
                },
                {
                  icon: '🌍',
                  text: 'Contribute to India\'s climate goals while earning income'
                }
              ].map((benefit, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <span className="text-2xl flex-shrink-0">{benefit.icon}</span>
                  <span className="text-green-800 font-medium">{benefit.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 border border-blue-200">
            <h3 className="text-2xl font-semibold text-blue-900 mb-6 flex items-center">
              <Users className="h-6 w-6 mr-2" />
              Need Help?
            </h3>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-600 rounded-full p-3">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <div>
                  <strong className="text-blue-900">Phone Support</strong>
                  <div className="text-blue-700 mt-1">1800-XXX-XXXX</div>
                  <div className="text-sm text-blue-600">Available 9 AM - 6 PM (Mon-Sat)</div>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-green-600 rounded-full p-3">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <div>
                  <strong className="text-blue-900">WhatsApp Support</strong>
                  <div className="text-blue-700 mt-1">+91-XXXXX-XXXXX</div>
                  <div className="text-sm text-blue-600">Quick queries and assistance</div>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-emerald-600 rounded-full p-3">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <strong className="text-blue-900">Field Support</strong>
                  <div className="text-blue-700 mt-1">Local agricultural officers</div>
                  <div className="text-sm text-blue-600">On-ground assistance available</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info Banner */}
        <div className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 p-6 rounded-r-xl">
          <h4 className="font-semibold text-yellow-900 mb-2">
            🌾 Rice Cultivation Emission Reduction Potential
          </h4>
          <p className="text-yellow-800 text-sm">
            By adopting improved water management practices like Alternate Wetting and Drying (AWD) 
            or controlled drainage, you can reduce methane emissions by <strong>30-70%</strong> compared 
            to continuously flooded conditions, while maintaining or even improving yields. Each tonne 
            of CO₂e reduced can be monetized as a carbon credit at approximately <strong>₹100-150 per credit</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Projects;
