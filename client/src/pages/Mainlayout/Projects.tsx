
// Projects.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface TierFeature {
  icon: string;
  title: string;
  description: string;
  included: boolean;
}

interface TierInfo {
  title: string;
  subtitle: string;
  description: string;
  complexity: 'Basic' | 'Advanced';
  duration: string;
  accuracy: string;
  carbonPotential: string;
  features: TierFeature[];
  requirements: string[];
  benefits: string[];
  idealFor: string[];
  estimatedReduction: string;
  color: string;
  gradientClass: string;
}

function Projects() {
  const navigate = useNavigate();
  const [selectedTier, setSelectedTier] = useState<1 | 2 | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  const tierData: Record<1 | 2, TierInfo> = {
    1: {
      title: 'Tier 1 Assessment',
      subtitle: 'Quick Carbon Credit Calculation',
      description: 'Basic emission calculation using simplified parameters. Perfect for farmers who want to quickly understand their carbon credit potential without complex data collection.',
      complexity: 'Basic',
      duration: '5-10 minutes',
      accuracy: '85-90%',
      carbonPotential: '2-6 credits/hectare',
      estimatedReduction: '30-50%',
      color: 'blue',
      gradientClass: 'from-blue-500 to-blue-700',
      features: [
        {
          icon: '📋',
          title: 'Simple Data Collection',
          description: 'Basic farming details only',
          included: true
        },
        {
          icon: '⚡',
          title: 'Quick Processing',
          description: 'Instant emission calculation',
          included: true
        },
        {
          icon: '📊',
          title: 'Standard Factors',
          description: 'Uses IPCC default scaling factors',
          included: true
        },
        {
          icon: '💰',
          title: 'Credit Estimation',
          description: 'Basic carbon credit potential',
          included: true
        },
        {
          icon: '🔬',
          title: 'Detailed Soil Analysis',
          description: 'India-specific soil factors',
          included: false
        },
        {
          icon: '🌾',
          title: 'Variety-Specific Factors',
          description: 'Rice variety scaling factors',
          included: false
        }
      ],
      requirements: [
        'Land area in hectares',
        'Water management practice',
        'Organic material usage',
        'Farming season (Kharif/Rabi/Summer)',
        'Basic location details'
      ],
      benefits: [
        'Quick assessment process',
        'Lower documentation burden',
        'Immediate results',
        'Good for small farmers',
        'Easy to understand'
      ],
      idealFor: [
        'Small-scale farmers (1-5 hectares)',
        'First-time carbon credit participants',
        'Traditional farming methods',
        'Quick feasibility check',
        'Farmers with limited technical knowledge'
      ]
    },
    2: {
      title: 'Tier 2 Assessment',
      subtitle: 'Comprehensive Carbon Analysis',
      description: 'Advanced emission calculation using India-specific factors including soil type, rice variety, and detailed farming conditions for maximum accuracy.',
      complexity: 'Advanced',
      duration: '15-25 minutes',
      accuracy: '95-98%',
      carbonPotential: '3-8 credits/hectare',
      estimatedReduction: '50-70%',
      color: 'green',
      gradientClass: 'from-green-500 to-green-700',
      features: [
        {
          icon: '📋',
          title: 'Comprehensive Data',
          description: 'Detailed farming information',
          included: true
        },
        {
          icon: '🔬',
          title: 'Soil-Specific Analysis',
          description: 'India-specific soil factors',
          included: true
        },
        {
          icon: '🌾',
          title: 'Variety-Specific Calculation',
          description: 'Rice variety scaling factors',
          included: true
        },
        {
          icon: '📊',
          title: 'Advanced Modeling',
          description: 'Multiple scaling factor integration',
          included: true
        },
        {
          icon: '💰',
          title: 'Maximum Credit Potential',
          description: 'Optimized carbon credit calculation',
          included: true
        },
        {
          icon: '🎯',
          title: 'Precision Farming Insights',
          description: 'Detailed improvement recommendations',
          included: true
        }
      ],
      requirements: [
        'All Tier 1 requirements',
        'Soil type classification',
        'Rice variety details',
        'Previous crop information',
        'Fertilizer and pesticide usage',
        'Expected yield data',
        'Irrigation source details'
      ],
      benefits: [
        'Maximum accuracy in calculations',
        'Higher carbon credit potential',
        'Detailed improvement recommendations',
        'Better verification acceptance',
        'Premium pricing eligibility'
      ],
      idealFor: [
        'Medium to large farmers (5+ hectares)',
        'Progressive farmers adopting new techniques',
        'Farmers seeking maximum carbon credits',
        'Those with detailed farm records',
        'Commercial farming operations'
      ]
    }
  };

  const handleTierSelect = (tier: 1 | 2) => {
    setSelectedTier(tier);
    // Navigate to the respective form
    navigate(`/assessment/tier-${tier}`);
  };

  const ComparisonTable = () => (
    <div className="mt-8 rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b">
        <h3 className="text-xl font-semibold text-gray-800">Detailed Comparison</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Feature
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-blue-600 uppercase tracking-wider">
                Tier 1
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-green-600 uppercase tracking-wider">
                Tier 2
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {[
              { feature: 'Time Required', tier1: '5-10 minutes', tier2: '15-25 minutes' },
              { feature: 'Accuracy Level', tier1: '85-90%', tier2: '95-98%' },
              { feature: 'Data Points Required', tier1: '8-10 fields', tier2: '15-20 fields' },
              { feature: 'Scaling Factors', tier1: '3 factors', tier2: '5+ factors' },
              { feature: 'Soil Type Consideration', tier1: '❌', tier2: '✅' },
              { feature: 'Rice Variety Factors', tier1: '❌', tier2: '✅' },
              { feature: 'Fertilizer Analysis', tier1: 'Basic', tier2: 'Detailed' },
              { feature: 'Credit Potential', tier1: '2-6 per hectare', tier2: '3-8 per hectare' },
              { feature: 'Verification Success', tier1: '80-85%', tier2: '90-95%' },
              { feature: 'Premium Pricing', tier1: '❌', tier2: '✅' }
            ].map((row, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {row.feature}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600">
                  {row.tier1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600">
                  {row.tier2}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const TierCard = ({ tier, data }: { tier: 1 | 2; data: TierInfo }) => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Header with gradient */}
      <div className={`bg-gradient-to-r ${data.gradientClass} p-6 text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold">{data.title}</h3>
            <p className="text-blue-100 mt-1">{data.subtitle}</p>
          </div>
          <div className="text-right">
            <div className=" bg-opacity-20 rounded-lg px-3 py-1">
              <span className="text-sm font-medium">{data.complexity}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <p className="text-gray-600 mb-6 leading-relaxed">{data.description}</p>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Duration</div>
            <div className="text-lg font-semibold text-gray-800">{data.duration}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Accuracy</div>
            <div className="text-lg font-semibold text-gray-800">{data.accuracy}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Credits Potential</div>
            <div className="text-lg font-semibold text-green-600">{data.carbonPotential}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Est. Reduction</div>
            <div className="text-lg font-semibold text-green-600">{data.estimatedReduction}</div>
          </div>
        </div>

        {/* Features */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-3">Features Included</h4>
          <div className="space-y-2">
            {data.features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3">
                <span className="text-lg">{feature.icon}</span>
                <div className="flex-1">
                  <div className={`text-sm font-medium ${feature.included ? 'text-gray-800' : 'text-gray-400'}`}>
                    {feature.title}
                    {!feature.included && ' (Not included)'}
                  </div>
                  <div className={`text-xs ${feature.included ? 'text-gray-600' : 'text-gray-400'}`}>
                    {feature.description}
                  </div>
                </div>
                <div className="text-lg">
                  {feature.included ? '✅' : '❌'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ideal For */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-3">Ideal For</h4>
          <div className="space-y-1">
            {data.idealFor.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => handleTierSelect(tier)}
          className={`w-full bg-gradient-to-r ${data.gradientClass} text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105`}
        >
          Start {data.title} →
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-white">
    
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Quick Decision Helper */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-8 rounded-r-lg">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-lg font-medium text-yellow-800">
                Need help choosing? 🤔
              </h3>
              <p className="mt-2 text-sm text-yellow-700">
                <strong>Choose Tier 1</strong> if you're new to carbon credits and want a quick assessment. 
                <strong> Choose Tier 2</strong> if you have detailed farming records and want maximum accuracy and credit potential.
              </p>
            </div>
          </div>
        </div>

        {/* Tier Cards */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {Object.entries(tierData).map(([tier, data]) => (
            <TierCard key={tier} tier={parseInt(tier) as 1 | 2} data={data} />
          ))}
        </div>

        {/* Comparison Toggle */}
        <div className="text-center mb-8">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            {showComparison ? '📊 Hide' : '📊 Show'} Detailed Comparison
          </button>
        </div>

        {/* Comparison Table */}
        {showComparison && <ComparisonTable />}

        {/* Process Flow */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Assessment Process Flow
          </h3>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: '1',
                title: 'Choose Tier',
                description: 'Select Tier 1 or Tier 2 based on your needs',
                icon: '🎯'
              },
              {
                step: '2',
                title: 'Fill Form',
                description: 'Complete the assessment form with your farming details',
                icon: '📝'
              },
              {
                step: '3',
                title: 'Calculate',
                description: 'System calculates your emission reduction potential',
                icon: '⚡'
              },
              {
                step: '4',
                title: 'Get Credits',
                description: 'Receive carbon credits after admin verification',
                icon: '🏆'
              }
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  {item.step}
                </div>
                <div className="text-3xl mb-3">{item.icon}</div>
                <h4 className="font-semibold text-gray-800 mb-2">{item.title}</h4>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-12 grid md:grid-cols-2 gap-8">
          {/* Benefits */}
          <div className="bg-green-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-green-800 mb-4">
              🌱 Why Carbon Credits from Rice Farming?
            </h3>
            <ul className="space-y-3 text-green-700">
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Reduce methane emissions by 30-70% through improved practices</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Earn additional income from sustainable farming</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Contribute to India's climate change goals</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Access to premium markets and buyers</span>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-blue-800 mb-4">
              🤝 Need Support?
            </h3>
            <div className="space-y-3 text-blue-700">
              <div className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">📞</span>
                <div>
                  <strong>Phone Support:</strong> 1800-XXX-XXXX
                  <div className="text-sm">Available 9 AM - 6 PM (Mon-Sat)</div>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">💬</span>
                <div>
                  <strong>WhatsApp:</strong> +91-XXXXX-XXXXX
                  <div className="text-sm">Quick queries and support</div>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">👨‍🌾</span>
                <div>
                  <strong>Field Support:</strong> Local agricultural officers
                  <div className="text-sm">On-ground assistance available</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Projects;
