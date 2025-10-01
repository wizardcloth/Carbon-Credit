import React from "react";
import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { TrendingUp, Shield, Globe, Users, Award, Zap } from "lucide-react";
import NavBar from "@/components/Navbar/navbar";
import "../../App.css";

const HomePage: React.FC = () => {
  useEffect(() => {
    const handleScroll = () => {
      document
        .querySelectorAll<HTMLElement>(".parallax-layer")
        .forEach((layer) => {
          const speed = parseFloat(layer.dataset.speed || "0");
          const yPos = window.scrollY * speed;
          layer.style.transform = `translateY(${yPos}px)`;
        });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  return (
    <div className="">
      <div>
        <NavBar />
      </div>
      <div className="App">
        <div className="parallax-container">
          <div className="parallax-layer" data-speed="0.4" id="base"></div>
          <div className="parallax-layer" data-speed="0.2" id="layer1"></div>
          <div className="parallax-layer" data-speed="0.1" id="layer2"></div>
          <h3 className="block sm:hidden hero-text title font-bold">
            Empowering farmer to Earn Via Carbon Credits
          </h3>
          <div >
            <h3 style={{fontFamily:"arial",color:"white",textShadow:"none",fontWeight:"600"}} className="hidden sm:block hero-text title">
              Empowering farmer to Earn
            </h3>
            <h2 style={{fontFamily:"arial",color:"white",textShadow:"none",fontWeight:"600"}} className="hidden sm:block hero-text subtitle">
              via carbon credit
            </h2>
            <button style={{ color: "white" ,fontFamily:"arial",fontSize:"20px",textShadow:"none",fontWeight:"500"}} className="bg-emerald-500 hover:bg-emerald-600 p-2 w-36 rounded-xl hero-text subtitle absolute mt-20 hover:cursor-pointer hover:underline underline-offset-3 hidden md:block">Join Now</button>
          </div>
        </div>
      </div>
      {/* Features Section */}
      <section className="py-16 bg-[#b0dfdf] bg-gradient-to-t from-[#b0dfdf] to-[#08b259]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-white max-w-2xl mx-auto">
              Cutting-edge technology meets sustainable agriculture to create
              new income streams for farmers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-green-200 hover:shadow-lg transition-shadow bg-slate-50">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-green-800">
                  AI-Powered Calculations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Advanced algorithms calculate carbon sequestration using
                  satellite data and IPCC methodologies for accurate credit
                  estimation.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-blue-200 hover:shadow-lg transition-shadow bg-slate-50">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-blue-800">
                  Blockchain Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Transparent, immutable records on blockchain ensure trust and
                  prevent double-counting of carbon credits.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-purple-200 hover:shadow-lg transition-shadow bg-slate-50">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-purple-800">
                  Satellite Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Real-time satellite imagery tracks vegetation health and
                  validates sustainable farming practices automatically.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-orange-200 hover:shadow-lg transition-shadow bg-slate-50">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-orange-600" />
                </div>
                <CardTitle className="text-orange-800">
                  Farmer-Centric
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Designed specifically for Indian farmers with multilingual
                  support and simple, intuitive interfaces.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-red-200 hover:shadow-lg transition-shadow bg-slate-50">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-red-600" />
                </div>
                <CardTitle className="text-red-800">Verified Credits</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  All carbon credits are verified by certified auditors and
                  comply with international standards like Verra and Gold
                  Standard.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-teal-200 hover:shadow-lg transition-shadow bg-slate-50">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-teal-600" />
                </div>
                <CardTitle className="text-teal-800">
                  Instant Marketplace
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Buy and sell carbon credits instantly through our integrated
                  marketplace with competitive pricing.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-0 bg-gradient-to-b from-[#b0dfdf] to-[#08b259] " id="how">
        <div className="container mx-auto p-16 bg-slate-50 rounded-3xl ">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Simple steps to start earning from sustainable farming
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Register & Verify</h3>
              <p className="text-gray-600">
                Create your farmer profile and verify your land ownership and
                farming practices.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Implement Practices
              </h3>
              <p className="text-gray-600">
                Adopt sustainable farming methods like AWD, direct seeding, and
                organic fertilizers.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">
                AI Calculates Credits
              </h3>
              <p className="text-gray-600">
                Our AI system calculates your carbon reduction using satellite
                data and IPCC methods.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                4
              </div>
              <h3 className="text-xl font-semibold mb-2">Earn & Trade</h3>
              <p className="text-gray-600">
                Receive verified carbon credit tokens and sell them in our
                marketplace.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}

        <div className="container mx-auto mt-12 p-16 text-center bg-gray-50 rounded-3xl">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Ready to Start Your Carbon Credit Journey?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of farmers already earning from sustainable
            agriculture. Your contribution to climate action starts here.
          </p>
          <button className="bg-emerald-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded w-40">
            Get Started
          </button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
