import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, 
  Shield, 
  Globe, 
  TrendingDown, 
  Clock, 
  ArrowRight,
  Bitcoin,
  DollarSign,
  CheckCircle,
  Star,
  Users,
  Award
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast",
      description: "Send money globally in seconds using crypto rails",
      highlight: "30 seconds avg"
    },
    {
      icon: <TrendingDown className="w-8 h-8" />,
      title: "Ultra Low Fees",
      description: "Save up to 90% compared to traditional banks",
      highlight: "0.5% fee only"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Bank-Grade Security",
      description: "Military-grade encryption with blockchain transparency",
      highlight: "100% secure"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Global Network",
      description: "Send to 180+ countries with local payout options",
      highlight: "180+ countries"
    }
  ];

  const stats = [
    { value: "$2.4B+", label: "Transferred", icon: <DollarSign className="w-5 h-5" /> },
    { value: "180+", label: "Countries", icon: <Globe className="w-5 h-5" /> },
    { value: "2M+", label: "Users", icon: <Users className="w-5 h-5" /> },
    { value: "99.9%", label: "Uptime", icon: <Award className="w-5 h-5" /> }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Small Business Owner",
      content: "CryptoStream saved me thousands in fees. International payments are now instant!",
      rating: 5
    },
    {
      name: "Miguel Rodriguez",
      role: "Freelancer",
      content: "Finally, a way to receive payments from clients worldwide without crazy bank fees.",
      rating: 5
    },
    {
      name: "Priya Patel",
      role: "Family Support",
      content: "Sending money to my family in India is now instant and costs almost nothing.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="flex justify-between items-center p-6 relative z-10"
      >
        <motion.div 
          className="flex items-center space-x-3"
          whileHover={{ scale: 1.05 }}
        >
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Bitcoin className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">CryptoStream</span>
        </motion.div>
        
        <div className="flex items-center space-x-4">
          <motion.button 
            onClick={() => navigate('/auth')}
            className="text-gray-300 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/10"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Sign In
          </motion.button>
          <motion.button 
            onClick={() => navigate('/auth')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg"
            whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)" }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started
          </motion.button>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <div className="container mx-auto px-6 pt-20 pb-32">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-5xl mx-auto"
        >
          <motion.h1 
            className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Send Money at the
            <motion.span 
              className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent block"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Speed of Light
            </motion.span>
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Convert your money to crypto, transfer instantly across borders, and deliver as local currency. 
            All in seconds, not days.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <motion.button 
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-10 py-5 rounded-xl text-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all shadow-2xl flex items-center space-x-3"
              whileHover={{ 
                scale: 1.05, 
                boxShadow: "0 25px 50px rgba(59, 130, 246, 0.4)" 
              }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Start Sending Money</span>
              <ArrowRight className="w-6 h-6" />
            </motion.button>
            
            <motion.div 
              className="flex items-center space-x-3 text-gray-300"
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-green-400" />
                <span>Average transfer time: 30 seconds</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Live Transfer Demo */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className="bg-black/30 backdrop-blur-xl rounded-3xl p-8 border border-white/20 max-w-3xl mx-auto shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-white font-bold text-xl">$1,000 USD</div>
                  <div className="text-gray-400 text-sm">United States</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <motion.div 
                  className="w-3 h-3 bg-blue-500 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
                <span className="text-blue-400 text-sm font-medium">Converting via USDC...</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <div>
                  <div className="text-white font-bold text-xl">₹83,240 INR</div>
                  <div className="text-gray-400 text-sm">India</div>
                </div>
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg font-bold">₹</span>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-gray-400 text-sm mb-2">
                Fee: $3.99 • You save $46.01 vs traditional banks
              </div>
              <div className="flex items-center justify-center space-x-2 text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Delivered in 30 seconds</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24"
        >
          {stats.map((stat, index) => (
            <motion.div 
              key={index} 
              className="text-center group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-blue-400 mb-3 flex justify-center group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                {stat.value}
              </div>
              <div className="text-gray-400 group-hover:text-gray-300 transition-colors">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 py-24">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Why Choose CryptoStream?
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            We use blockchain technology to make international money transfers faster, 
            cheaper, and more transparent than ever before.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-black/30 backdrop-blur-xl rounded-2xl p-8 border border-white/20 hover:border-blue-500/50 transition-all group hover:bg-black/40"
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <div className="text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-blue-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-300 mb-4 leading-relaxed">{feature.description}</p>
              <div className="text-blue-400 font-semibold text-sm">{feature.highlight}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="container mx-auto px-6 py-24">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl font-bold text-white mb-6">
            Trusted by Millions
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            See what our users say about their CryptoStream experience
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-black/30 backdrop-blur-xl rounded-2xl p-8 border border-white/20"
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">"{testimonial.content}"</p>
              <div>
                <div className="text-white font-semibold">{testimonial.name}</div>
                <div className="text-gray-400 text-sm">{testimonial.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-6 py-24">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-xl rounded-3xl p-16 text-center border border-white/20 shadow-2xl"
        >
          <h2 className="text-5xl font-bold text-white mb-6">
            Ready to Send Money at Light Speed?
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            Join millions of users who trust CryptoStream for their international transfers.
            Start saving money and time today.
          </p>
          <motion.button 
            onClick={() => navigate('/auth')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-12 py-5 rounded-xl text-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all shadow-2xl"
            whileHover={{ 
              scale: 1.05, 
              boxShadow: "0 25px 50px rgba(59, 130, 246, 0.4)" 
            }}
            whileTap={{ scale: 0.95 }}
          >
            Create Free Account
          </motion.button>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Bitcoin className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">CryptoStream</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2024 CryptoStream. All rights reserved. • Powered by blockchain technology
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}