import React, { useState, useEffect } from 'react';
import { ShoppingBag, TrendingUp, Star, Zap, Brain, BarChart3, Eye, Heart, Clock, Sparkles, X, Plus, Minus } from 'lucide-react';

// Simulated product catalog with rich metadata
const PRODUCT_CATALOG = [
  { id: 1, name: "Premium Wireless Headphones", category: "Electronics", price: 299, rating: 4.8, tags: ["audio", "wireless", "premium"], description: "Noise-cancelling with 30hr battery", image: "🎧", popularity: 95, specs: ["Active Noise Cancellation", "30h Battery", "Bluetooth 5.0", "Hi-Res Audio"], reviews: 2543 },
  { id: 2, name: "Smart Fitness Watch", category: "Wearables", price: 249, rating: 4.6, tags: ["fitness", "smart", "health"], description: "Track your health metrics 24/7", image: "⌚", popularity: 88, specs: ["Heart Rate Monitor", "GPS", "Water Resistant", "7 Day Battery"], reviews: 1856 },
  { id: 3, name: "4K Action Camera", category: "Electronics", price: 399, rating: 4.7, tags: ["camera", "sports", "4k"], description: "Waterproof adventure companion", image: "📷", popularity: 82, specs: ["4K 60fps", "Waterproof 30m", "Stabilization", "Voice Control"], reviews: 1234 },
  { id: 4, name: "Ergonomic Office Chair", category: "Furniture", price: 449, rating: 4.9, tags: ["office", "ergonomic", "comfort"], description: "All-day comfort for professionals", image: "🪑", popularity: 91, specs: ["Lumbar Support", "Armrest Adjust", "Breathable Mesh", "5 Year Warranty"], reviews: 3421 },
  { id: 5, name: "Smart Coffee Maker", category: "Appliances", price: 179, rating: 4.5, tags: ["coffee", "smart", "kitchen"], description: "Brew from your smartphone", image: "☕", popularity: 76, specs: ["WiFi Connected", "Programmable", "12 Cup Capacity", "Thermal Carafe"], reviews: 892 },
  { id: 6, name: "Mechanical Keyboard RGB", category: "Electronics", price: 159, rating: 4.7, tags: ["gaming", "keyboard", "rgb"], description: "Cherry MX switches with RGB", image: "⌨️", popularity: 85, specs: ["Cherry MX Switches", "RGB Lighting", "Aluminum Frame", "Programmable"], reviews: 2156 },
  { id: 7, name: "Yoga Mat Premium", category: "Sports", price: 79, rating: 4.4, tags: ["fitness", "yoga", "wellness"], description: "Eco-friendly non-slip mat", image: "🧘", popularity: 70, specs: ["Non-slip Surface", "6mm Thickness", "Eco TPE", "Carrying Strap"], reviews: 1023 },
  { id: 8, name: "Wireless Charging Pad", category: "Electronics", price: 49, rating: 4.3, tags: ["wireless", "charging", "tech"], description: "Fast charge any Qi device", image: "🔋", popularity: 68, specs: ["15W Fast Charging", "Qi Compatible", "LED Indicator", "Non-slip Base"], reviews: 756 },
  { id: 9, name: "Designer Backpack", category: "Fashion", price: 129, rating: 4.6, tags: ["fashion", "travel", "urban"], description: "Water-resistant laptop compartment", image: "🎒", popularity: 79, specs: ["Laptop Pocket", "Water Resistant", "USB Charging Port", "TSA Friendly"], reviews: 1456 },
  { id: 10, name: "Air Purifier HEPA", category: "Appliances", price: 299, rating: 4.8, tags: ["health", "air", "home"], description: "Remove 99.97% of pollutants", image: "💨", popularity: 84, specs: ["HEPA Filter", "Smart Control", "Coverage 500 sqft", "3 Speed Modes"], reviews: 2789 },
];

// Multiple user profiles with different behaviors - CAREFULLY ALIGNED
const USER_PROFILES = [
  {
    id: "user_tech",
    name: "Tech Enthusiast",
    avatar: "👨‍💻",
    color: "from-blue-600 to-blue-400",
    behavior: {
      // Headphones (1), Keyboard (6), Action Camera (3), Charging Pad (8)
      viewed: [1, 6, 8, 3],
      purchased: [1, 6],
      recentViews: ["Electronics"]
    }
  },
  {
    id: "user_fitness",
    name: "Fitness Lover",
    avatar: "🏃",
    color: "from-green-600 to-green-400",
    behavior: {
      // Yoga Mat (7), Air Purifier (10) viewed - nothing purchased yet
      viewed: [7, 10, 4, 5],
      purchased: [],
      recentViews: ["Wearables", "Sports", "Appliances"]
    }
  },
  {
    id: "user_office",
    name: "Office Professional",
    avatar: "💼",
    color: "from-purple-600 to-purple-400",
    behavior: {
      // Office Chair (4), Mechanical Keyboard (6), Designer Backpack (9), Wireless Headphones (1)
      viewed: [4, 6, 9, 1],
      purchased: [4, 9],
      recentViews: ["Furniture", "Electronics", "Fashion"]
    }
  },
  {
    id: "user_home",
    name: "Home Organizer",
    avatar: "🏠",
    color: "from-orange-600 to-orange-400",
    behavior: {
      // Air Purifier (10), Smart Coffee Maker (5), Office Chair (4), Designer Backpack (9)
      viewed: [10, 5, 4, 9],
      purchased: [10, 5],
      recentViews: ["Appliances", "Furniture", "Fashion"]
    }
  },
  {
    id: "user_explorer",
    name: "Adventure Seeker",
    avatar: "🧗",
    color: "from-red-600 to-red-400",
    behavior: {
      // Action Camera (3), Designer Backpack (9), Smart Watch (2), Yoga Mat (7)
      viewed: [3, 9, 2, 7],
      purchased: [3, 9],
      recentViews: ["Electronics", "Sports", "Fashion"]
    }
  },
];

// Advanced ML-inspired recommendation engine
class HybridRecommendationEngine {
  constructor() {
    this.productEmbeddings = this.generateProductEmbeddings();
  }

  generateProductEmbeddings() {
    return PRODUCT_CATALOG.map(product => ({
      id: product.id,
      embedding: this.createEmbedding(product)
    }));
  }

  createEmbedding(product) {
    const features = {
      price: product.price / 500,
      rating: product.rating / 5,
      popularity: product.popularity / 100,
      category: this.categoryToVector(product.category),
      tags: product.tags.length / 5
    };
    return Object.values(features);
  }

  categoryToVector(category) {
    const categories = ["Electronics", "Wearables", "Furniture", "Appliances", "Sports", "Fashion"];
    return categories.indexOf(category) / categories.length;
  }

  collaborativeFiltering(userBehavior, product) {
    let score = 0;
    
    // Get all viewed products
    const viewedProducts = userBehavior.viewed.map(id => 
      PRODUCT_CATALOG.find(p => p.id === id)
    ).filter(Boolean);

    // Category match - strong signal
    const categoryMatches = viewedProducts.filter(p => p.category === product.category);
    if (categoryMatches.length > 0) {
      score += 0.5; // Strong boost for category match
    }
    
    // Tag overlap - check if product has tags user is interested in
    const viewedTags = viewedProducts.flatMap(p => p.tags);
    const commonTags = product.tags.filter(tag => viewedTags.includes(tag)).length;
    score += Math.min(commonTags * 0.2, 0.4); // Up to 0.4 for tags
    
    return Math.min(score, 1.0); // Cap at 1.0
  }

  contentBasedFiltering(userBehavior, product) {
    let score = 0;
    
    const viewedProducts = userBehavior.viewed.map(id => 
      PRODUCT_CATALOG.find(p => p.id === id)
    ).filter(Boolean);

    if (viewedProducts.length === 0) return 0;
    
    // Price affinity
    const viewedPrices = viewedProducts.map(p => p.price);
    const avgPrice = viewedPrices.reduce((a, b) => a + b, 0) / viewedPrices.length;
    const priceDiff = Math.abs(product.price - avgPrice) / avgPrice;
    score += Math.max(0, 0.4 - priceDiff * 0.5); // Better price matching
    
    // Rating preference - if user viewed high-rated products, recommend high-rated
    const avgRating = viewedProducts.reduce((a, b) => a + b.rating, 0) / viewedProducts.length;
    if (product.rating >= avgRating - 0.2) {
      score += 0.3;
    }
    
    return Math.min(score, 1.0);
  }

  contextualBandit(product, exploration = 0.1) {
    const random = Math.random();
    if (random < exploration) {
      return Math.random() * 0.2;
    }
    return product.popularity / 100 * 0.25;
  }

  neuralNetworkScore(userBehavior, product) {
    const layer1 = this.collaborativeFiltering(userBehavior, product);
    const layer2 = this.contentBasedFiltering(userBehavior, product);
    const layer3 = this.contextualBandit(product);
    
    return layer1 * 0.4 + layer2 * 0.35 + layer3 * 0.25;
  }

  recommend(userBehavior, limit = 5) {
    const scores = PRODUCT_CATALOG.map(product => {
      // Only skip purchased items
      if (userBehavior.purchased.includes(product.id)) {
        return { product, score: -1, components: {} };
      }

      const cfScore = this.collaborativeFiltering(userBehavior, product);
      const cbScore = this.contentBasedFiltering(userBehavior, product);
      const banditScore = this.contextualBandit(product);
      const nnScore = this.neuralNetworkScore(userBehavior, product);

      const recencyBoost = userBehavior.recentViews.includes(product.category) ? 0.5 : 0;

      const totalScore = nnScore + recencyBoost;

      return {
        product,
        score: totalScore,
        components: {
          collaborative: cfScore,
          contentBased: cbScore,
          contextual: banditScore,
          neural: nnScore,
          recency: recencyBoost
        }
      };
    });

    // Sort by score and return top products
    const sorted = scores
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return sorted;
  }
}

// LLM explanation generator
class LLMExplanationGenerator {
  generateExplanation(product, userBehavior, scoreComponents) {
    const explanations = [];
    
    const viewedProducts = userBehavior.viewed.map(id => 
      PRODUCT_CATALOG.find(p => p.id === id)
    ).filter(Boolean);
    
    const purchasedProducts = userBehavior.purchased.map(id => 
      PRODUCT_CATALOG.find(p => p.id === id)
    ).filter(Boolean);

    if (scoreComponents.collaborative > 0.2) {
      const commonCategory = viewedProducts.find(p => p.category === product.category);
      if (commonCategory) {
        explanations.push(`You've shown strong interest in ${product.category.toLowerCase()} products.`);
      }
    }

    if (scoreComponents.contentBased > 0.2) {
      const avgViewedPrice = viewedProducts.reduce((sum, p) => sum + p.price, 0) / viewedProducts.length;
      if (Math.abs(product.price - avgViewedPrice) < 100) {
        explanations.push(`This aligns with your price preferences around $${Math.round(avgViewedPrice)}.`);
      }
    }

    if (product.rating >= 4.5) {
      explanations.push(`With a ${product.rating}⭐ rating, this is highly-rated.`);
    }

    const viewedTags = viewedProducts.flatMap(p => p.tags);
    const matchingTags = product.tags.filter(tag => viewedTags.includes(tag));
    if (matchingTags.length > 0) {
      explanations.push(`Matches your interest in ${matchingTags.slice(0, 2).join(', ')}.`);
    }

    if (scoreComponents.contextual > 0.15) {
      explanations.push(`Currently trending among similar users.`);
    }

    if (explanations.length === 0) {
      explanations.push(`Popular in the ${product.category} category.`);
    }

    return explanations.join(' ');
  }

  generateInsight(userBehavior, recommendations) {
    const categories = recommendations.map(r => r.product.category);
    const uniqueCategories = [...new Set(categories)];
    
    if (uniqueCategories.length === 1) {
      return `Strong affinity for ${uniqueCategories[0].toLowerCase()}. Specialized selection curated.`;
    } else {
      return `Diverse interests across ${uniqueCategories.length} categories. Multi-dimensional recommendations using advanced neural algorithms.`;
    }
  }
}

// Product Detail Modal Component
const ProductModal = ({ product, onClose, onViewDetails }) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 flex items-center justify-between p-6">
          <h2 className="text-2xl font-bold text-slate-900">{product.name}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex items-start space-x-6">
            <div className="w-32 h-32 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center text-7xl shadow-lg">
              {product.image}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span className="text-xl font-bold text-slate-900">{product.rating}</span>
                <span className="text-sm text-slate-500">({product.reviews.toLocaleString()} reviews)</span>
              </div>
              
              <p className="text-slate-700 mb-4">{product.description}</p>
              
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg mb-4">
                <p className="text-3xl font-bold text-slate-900">${product.price}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {product.tags.map(tag => (
                  <span key={tag} className="bg-slate-100 px-3 py-1 rounded-full text-xs font-medium text-slate-700">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-3">Key Specifications</h3>
            <div className="grid grid-cols-2 gap-3">
              {product.specs.map((spec, idx) => (
                <div key={idx} className="flex items-center space-x-2 p-3 bg-slate-50 rounded-lg">
                  <Plus className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-slate-700">{spec}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => {
                onViewDetails(product.id);
                onClose();
              }}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg"
            >
              Mark as Viewed
            </button>
            <button className="px-6 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
              <Heart className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Product List Modal Component
const ProductListModal = ({ title, products, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 flex items-center justify-between p-6">
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6">
          {products.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No products yet</p>
          ) : (
            <div className="space-y-3">
              {products.map(product => (
                <div key={product.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
                  <div className="flex items-center space-x-4">
                    <span className="text-3xl">{product.image}</span>
                    <div>
                      <p className="font-semibold text-slate-900">{product.name}</p>
                      <div className="flex items-center space-x-2 text-sm text-slate-600">
                        <span>{product.category}</span>
                        <span>•</span>
                        <span className="flex items-center">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 mr-1" />
                          {product.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="font-bold text-slate-900">${product.price}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const EcommerceRecommender = () => {
  const [selectedUser, setSelectedUser] = useState(USER_PROFILES[0]);
  const [userBehavior, setUserBehavior] = useState(selectedUser.behavior);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showProductList, setShowProductList] = useState(null);
  const [engine] = useState(() => new HybridRecommendationEngine());
  const [llm] = useState(() => new LLMExplanationGenerator());

  useEffect(() => {
    setUserBehavior(selectedUser.behavior);
    setSelectedProduct(null);
  }, [selectedUser]);

  useEffect(() => {
    const recs = engine.recommend(userBehavior, 5);
    const recsWithExplanations = recs.map(rec => ({
      ...rec,
      explanation: llm.generateExplanation(rec.product, userBehavior, rec.components)
    }));
    setRecommendations(recsWithExplanations);
  }, [userBehavior, engine, llm]);

  const handleViewProduct = (productId) => {
    setUserBehavior(prev => ({
      ...prev,
      viewed: [...new Set([...prev.viewed, productId])],
      recentViews: [...new Set([...prev.recentViews, PRODUCT_CATALOG.find(p => p.id === productId)?.category])]
    }));
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
  };

  const getConfidenceLevel = (score) => {
    if (score > 0.7) return { level: "Very High", color: "text-green-600", bg: "bg-green-50" };
    if (score > 0.5) return { level: "High", color: "text-blue-600", bg: "bg-blue-50" };
    if (score > 0.3) return { level: "Medium", color: "text-yellow-600", bg: "bg-yellow-50" };
    return { level: "Exploratory", color: "text-gray-600", bg: "bg-gray-50" };
  };

  const overallInsight = llm.generateInsight(userBehavior, recommendations);

  const viewedProducts = userBehavior.viewed.map(id => PRODUCT_CATALOG.find(p => p.id === id)).filter(Boolean);
  const purchasedProducts = userBehavior.purchased.map(id => PRODUCT_CATALOG.find(p => p.id === id)).filter(Boolean);
  const categoryProducts = userBehavior.recentViews.flatMap(cat => 
    PRODUCT_CATALOG.filter(p => p.category === cat && (userBehavior.viewed.includes(p.id) || userBehavior.purchased.includes(p.id)))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-3 rounded-xl shadow-lg">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Neural Recommender</h1>
                <p className="text-sm text-slate-500">Multi-User AI Personalization Engine</p>
              </div>
            </div>
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="text-sm font-medium">Analytics</span>
            </button>
          </div>

          {/* User Profiles */}
          <div className="flex space-x-3 overflow-x-auto pb-2">
            {USER_PROFILES.map(user => (
              <button
                key={user.id}
                onClick={() => handleSelectUser(user)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                  selectedUser.id === user.id
                    ? `bg-gradient-to-r ${user.color} text-white shadow-lg`
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span className="text-xl">{user.avatar}</span>
                <span className="font-medium text-sm">{user.name}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* AI Insight Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 mb-8 shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">AI Insight for {selectedUser.name}</h3>
              <p className="text-slate-700">{overallInsight}</p>
            </div>
          </div>
        </div>

        {/* User Behavior Summary */}
        {showAnalytics && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
              User Behavior Analytics - {selectedUser.name}
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => setShowProductList({ type: 'viewed', title: 'Products Viewed' })}
                className="bg-blue-50 p-4 rounded-lg hover:bg-blue-100 transition cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <Eye className="w-5 h-5 text-blue-600" />
                  <span className="text-2xl font-bold text-blue-700">{userBehavior.viewed.length}</span>
                </div>
                <p className="text-sm text-slate-600">Products Viewed</p>
              </button>
              
              <button
                onClick={() => setShowProductList({ type: 'purchased', title: 'Products Purchased' })}
                className="bg-green-50 p-4 rounded-lg hover:bg-green-100 transition cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <ShoppingBag className="w-5 h-5 text-green-600" />
                  <span className="text-2xl font-bold text-green-700">{userBehavior.purchased.length}</span>
                </div>
                <p className="text-sm text-slate-600">Products Purchased</p>
              </button>
              
              <button
                onClick={() => setShowProductList({ type: 'categories', title: 'Active Categories' })}
                className="bg-purple-50 p-4 rounded-lg hover:bg-purple-100 transition cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <Heart className="w-5 h-5 text-purple-600" />
                  <span className="text-2xl font-bold text-purple-700">{userBehavior.recentViews.length}</span>
                </div>
                <p className="text-sm text-slate-600">Active Categories</p>
              </button>
            </div>
          </div>
        )}

        {/* Recommendations Grid */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Personalized Recommendations</h2>
        </div>

        <div className="space-y-4">
          {recommendations.map((rec, index) => {
            const confidence = getConfidenceLevel(rec.score);
            return (
              <div
                key={rec.product.id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                <div className="flex items-start p-6">
                  {/* Rank Badge */}
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-xl">#{index + 1}</span>
                    </div>
                  </div>

                  {/* Product Image */}
                  <div className="flex-shrink-0 mr-6">
                    <button
                      onClick={() => setSelectedProduct(rec.product)}
                      className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center text-5xl shadow-inner hover:shadow-md transition cursor-pointer"
                    >
                      {rec.product.image}
                    </button>
                  </div>

                  {/* Product Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">{rec.product.name}</h3>
                        <div className="flex items-center space-x-3 text-sm text-slate-600">
                          <span className="bg-slate-100 px-2 py-1 rounded">{rec.product.category}</span>
                          <span className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-500 mr-1 fill-yellow-500" />
                            {rec.product.rating}
                          </span>
                          <span className="font-semibold text-slate-900">${rec.product.price}</span>
                        </div>
                      </div>
                      <div className={`${confidence.bg} ${confidence.color} px-3 py-1 rounded-lg text-xs font-semibold`}>
                        {confidence.level} Match
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 mb-3">{rec.product.description}</p>

                    {/* AI Explanation */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100 mb-3">
                      <div className="flex items-start space-x-2">
                        <Brain className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900 mb-1">Why we recommend this:</p>
                          <p className="text-sm text-slate-700">{rec.explanation}</p>
                        </div>
                      </div>
                    </div>

                    {/* ML Score Breakdown */}
                    {showAnalytics && (
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <p className="text-xs font-semibold text-slate-700 mb-3">ML Algorithm Breakdown (Score: {rec.score.toFixed(3)}):</p>
                        <div className="space-y-3">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-slate-700">Collaborative Filtering</span>
                              <span className="text-xs font-bold text-blue-600">{rec.components.collaborative.toFixed(3)} (40%)</span>
                            </div>
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-600" style={{ width: `${rec.components.collaborative * 100}%` }}></div>
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-slate-700">Content-Based Filtering</span>
                              <span className="text-xs font-bold text-green-600">{rec.components.contentBased.toFixed(3)} (35%)</span>
                            </div>
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full bg-green-600" style={{ width: `${rec.components.contentBased * 100}%` }}></div>
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-slate-700">Contextual Bandits</span>
                              <span className="text-xs font-bold text-purple-600">{rec.components.contextual.toFixed(3)} (25%)</span>
                            </div>
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full bg-purple-600" style={{ width: `${rec.components.contextual * 100}%` }}></div>
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-slate-700">Neural Network Score</span>
                              <span className="text-xs font-bold text-orange-600">{rec.components.neural.toFixed(3)}</span>
                            </div>
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full bg-orange-600" style={{ width: `${rec.components.neural * 100}%` }}></div>
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-slate-700">Recency Boost</span>
                              <span className="text-xs font-bold text-pink-600">{rec.components.recency.toFixed(3)}</span>
                            </div>
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full bg-pink-600" style={{ width: `${rec.components.recency * 100}%` }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="mt-4 flex space-x-3">
                      <button
                        onClick={() => setSelectedProduct(rec.product)}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium shadow-sm"
                      >
                        View Details
                      </button>
                      <button className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                        <Heart className="w-5 h-5 text-slate-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Tech Stack */}
        <div className="mt-12 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
            <Zap className="w-4 h-4 mr-2 text-yellow-500" />
            Powered By Advanced ML/AI
          </h3>
          <div className="flex flex-wrap gap-2">
            {["Collaborative Filtering", "Content-Based Filtering", "Contextual Bandits", "Neural Networks", "Ensemble Methods", "LLM Explanations"].map(tech => (
              <span key={tech} className="bg-gradient-to-r from-slate-100 to-slate-200 px-3 py-1 rounded-full text-xs font-medium text-slate-700">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </main>

      {/* Modals */}
      <ProductModal 
        product={selectedProduct} 
        onClose={() => setSelectedProduct(null)}
        onViewDetails={handleViewProduct}
      />

      {showProductList && (
        <ProductListModal 
          title={showProductList.type === 'viewed' ? 'Products Viewed' : showProductList.type === 'purchased' ? 'Products Purchased' : 'Products by Active Categories'}
          products={
            showProductList.type === 'viewed' ? viewedProducts :
            showProductList.type === 'purchased' ? purchasedProducts :
            categoryProducts
          }
          onClose={() => setShowProductList(null)}
        />
      )}
    </div>
  );
};

export default EcommerceRecommender;