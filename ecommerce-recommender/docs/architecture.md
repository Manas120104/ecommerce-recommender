# Full Stack E-Commerce Recommender System Architecture

## 🏗️ Complete System Design

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  - User Interface                                            │
│  - Real-time Updates                                         │
│  - API Integration                                           │
└──────────────────────┬──────────────────────────────────────┘
                       │ REST API / WebSocket
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend API (FastAPI/Flask)               │
│  - Authentication & Authorization                            │
│  - Request Handling                                          │
│  - Business Logic                                            │
└──────────┬──────────────────────┬──────────────────────────┘
           │                      │
           ▼                      ▼
┌──────────────────────┐  ┌─────────────────────────────────┐
│  PostgreSQL/MongoDB  │  │   ML Model Service (Python)     │
│  - User Profiles     │  │  - Recommendation Engine        │
│  - Products          │  │  - Real-time Scoring            │
│  - Interactions      │  │  - Model Inference              │
│  - Purchase History  │  └─────────────┬───────────────────┘
└──────────────────────┘                │
                                        ▼
                              ┌─────────────────────────┐
                              │  LLM Service (OpenAI/   │
                              │  Anthropic Claude/      │
                              │  Local LLaMA)           │
                              │  - Generate Explanations│
                              │  - Natural Language     │
                              └─────────────────────────┘
```

---

## 📦 **Component Breakdown**

### 1. **Frontend (Current - React)**
**Status**: ✅ Already Built
- User interface for displaying recommendations
- Analytics dashboard
- Real-time interaction tracking

**What to Add**:
- API integration layer
- Loading states
- Error handling
- Authentication UI

---

### 2. **Backend API (FastAPI - Recommended)**

**File: `backend/main.py`**

```python
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
import asyncio
from datetime import datetime

app = FastAPI(title="AI Recommender API")

# CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Models
class UserBehavior(BaseModel):
    user_id: str
    viewed: List[int]
    purchased: List[int]
    recent_views: List[str]
    session_id: str

class RecommendationRequest(BaseModel):
    user_behavior: UserBehavior
    limit: int = 5
    context: Dict = {}

# Response Models
class ProductRecommendation(BaseModel):
    product_id: int
    product_name: str
    score: float
    confidence: str
    explanation: str
    algorithm_breakdown: Dict[str, float]

class RecommendationResponse(BaseModel):
    recommendations: List[ProductRecommendation]
    user_insight: str
    timestamp: datetime
    model_version: str

# API Endpoints
@app.post("/api/recommendations", response_model=RecommendationResponse)
async def get_recommendations(request: RecommendationRequest):
    """
    Main recommendation endpoint
    """
    # 1. Fetch user profile from database
    user_profile = await get_user_profile(request.user_behavior.user_id)
    
    # 2. Get product catalog
    products = await get_product_catalog()
    
    # 3. Run ML recommendation engine
    recommendations = await ml_service.generate_recommendations(
        user_profile=user_profile,
        products=products,
        behavior=request.user_behavior,
        limit=request.limit
    )
    
    # 4. Generate LLM explanations for each recommendation
    explained_recs = await llm_service.generate_explanations(
        recommendations=recommendations,
        user_behavior=request.user_behavior
    )
    
    # 5. Generate overall user insight
    insight = await llm_service.generate_user_insight(
        recommendations=explained_recs,
        user_behavior=request.user_behavior
    )
    
    return RecommendationResponse(
        recommendations=explained_recs,
        user_insight=insight,
        timestamp=datetime.now(),
        model_version="v1.0.0"
    )

@app.post("/api/track-interaction")
async def track_interaction(user_id: str, product_id: int, interaction_type: str):
    """
    Track user interactions (view, click, purchase)
    """
    await db.store_interaction(user_id, product_id, interaction_type)
    return {"status": "tracked"}

@app.get("/api/products")
async def get_products():
    """
    Get product catalog
    """
    return await db.get_all_products()

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "recommender-api"}
```

---

### 3. **ML Model Service**

**File: `backend/ml_service.py`**

```python
import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict
import joblib

class RecommendationEngine:
    def __init__(self):
        # Load pre-trained models
        self.cf_model = joblib.load('models/collaborative_filtering.pkl')
        self.cb_model = joblib.load('models/content_based.pkl')
        self.user_embeddings = joblib.load('models/user_embeddings.pkl')
        self.product_embeddings = joblib.load('models/product_embeddings.pkl')
    
    async def generate_recommendations(self, user_profile, products, behavior, limit=5):
        """
        Hybrid recommendation using multiple algorithms
        """
        # 1. Collaborative Filtering Score
        cf_scores = self.collaborative_filtering(user_profile, products)
        
        # 2. Content-Based Filtering Score
        cb_scores = self.content_based_filtering(user_profile, products, behavior)
        
        # 3. Neural Network Embeddings (Deep Learning)
        nn_scores = self.neural_network_score(user_profile, products)
        
        # 4. Contextual Bandit (Exploration-Exploitation)
        bandit_scores = self.contextual_bandit(products)
        
        # 5. Ensemble: Weighted combination
        final_scores = (
            0.35 * cf_scores +
            0.30 * cb_scores +
            0.25 * nn_scores +
            0.10 * bandit_scores
        )
        
        # Sort and return top recommendations
        top_indices = np.argsort(final_scores)[::-1][:limit]
        
        recommendations = []
        for idx in top_indices:
            product = products[idx]
            recommendations.append({
                'product_id': product['id'],
                'product_name': product['name'],
                'score': float(final_scores[idx]),
                'components': {
                    'collaborative': float(cf_scores[idx]),
                    'content_based': float(cb_scores[idx]),
                    'neural': float(nn_scores[idx]),
                    'contextual': float(bandit_scores[idx])
                }
            })
        
        return recommendations
    
    def collaborative_filtering(self, user_profile, products):
        """
        User-User or Item-Item collaborative filtering
        Uses trained matrix factorization model
        """
        user_vector = self.user_embeddings[user_profile['id']]
        product_vectors = self.product_embeddings
        
        # Compute similarity
        similarities = cosine_similarity([user_vector], product_vectors)[0]
        return similarities
    
    def content_based_filtering(self, user_profile, products, behavior):
        """
        Content-based filtering using product features
        """
        # Create user preference vector from history
        user_preferences = self._build_user_preference_vector(behavior)
        
        # Compare with product features
        scores = []
        for product in products:
            product_vector = self._product_to_vector(product)
            score = cosine_similarity([user_preferences], [product_vector])[0][0]
            scores.append(score)
        
        return np.array(scores)
    
    def neural_network_score(self, user_profile, products):
        """
        Deep learning model for recommendations
        Uses pre-trained neural network
        """
        # This would use TensorFlow/PyTorch model
        # For now, simplified version
        user_embedding = self.user_embeddings[user_profile['id']]
        
        scores = []
        for product in products:
            product_embedding = self.product_embeddings[product['id']]
            # Dot product of embeddings
            score = np.dot(user_embedding, product_embedding)
            scores.append(score)
        
        return np.array(scores)
    
    def contextual_bandit(self, products, epsilon=0.1):
        """
        Multi-armed bandit for exploration-exploitation
        """
        scores = []
        for product in products:
            if np.random.random() < epsilon:
                # Explore: random score
                score = np.random.random()
            else:
                # Exploit: use popularity
                score = product.get('popularity', 0) / 100
            scores.append(score)
        
        return np.array(scores)

# Initialize service
ml_service = RecommendationEngine()
```

---

### 4. **LLM Service (Real AI Explanations)**

**File: `backend/llm_service.py`**

```python
import openai
import anthropic
import os
from typing import List, Dict

class LLMExplanationService:
    def __init__(self):
        # Choose your LLM provider
        self.provider = os.getenv("LLM_PROVIDER", "openai")  # or "anthropic" or "local"
        
        if self.provider == "openai":
            openai.api_key = os.getenv("OPENAI_API_KEY")
        elif self.provider == "anthropic":
            self.client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    
    async def generate_explanations(self, recommendations: List[Dict], user_behavior: Dict):
        """
        Generate natural language explanations for each recommendation
        """
        explained_recs = []
        
        for rec in recommendations:
            explanation = await self._generate_single_explanation(rec, user_behavior)
            rec['explanation'] = explanation
            rec['confidence'] = self._calculate_confidence(rec['score'])
            explained_recs.append(rec)
        
        return explained_recs
    
    async def _generate_single_explanation(self, recommendation: Dict, user_behavior: Dict):
        """
        Use LLM to generate explanation for a single product
        """
        # Build context for LLM
        prompt = f"""You are an AI shopping assistant. Explain why we're recommending this product to the user.

Product: {recommendation['product_name']}
Score: {recommendation['score']:.2f}
Algorithm Breakdown:
- Collaborative Filtering: {recommendation['components']['collaborative']:.2f}
- Content-Based: {recommendation['components']['content_based']:.2f}
- Neural Network: {recommendation['components']['neural']:.2f}

User's Recent Activity:
- Viewed products: {len(user_behavior['viewed'])} items
- Purchased: {len(user_behavior['purchased'])} items
- Recent categories: {', '.join(user_behavior['recent_views'])}

Generate a natural, personalized 2-3 sentence explanation of why this product is recommended. Be specific and reference their behavior."""

        if self.provider == "openai":
            response = openai.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a helpful shopping assistant."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=150,
                temperature=0.7
            )
            return response.choices[0].message.content
        
        elif self.provider == "anthropic":
            message = self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=150,
                messages=[{"role": "user", "content": prompt}]
            )
            return message.content[0].text
    
    async def generate_user_insight(self, recommendations: List[Dict], user_behavior: Dict):
        """
        Generate overall insight about user's preferences
        """
        prompt = f"""Analyze this user's shopping behavior and provide a brief insight.

User Activity:
- Viewed: {len(user_behavior['viewed'])} products
- Purchased: {len(user_behavior['purchased'])} products
- Active in categories: {', '.join(user_behavior['recent_views'])}

Top recommendations: {[r['product_name'] for r in recommendations[:3]]}

Generate a single sentence insight about their preferences and shopping style."""

        if self.provider == "openai":
            response = openai.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=100
            )
            return response.choices[0].message.content
        
        elif self.provider == "anthropic":
            message = self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=100,
                messages=[{"role": "user", "content": prompt}]
            )
            return message.content[0].text
    
    def _calculate_confidence(self, score: float) -> str:
        if score > 0.7:
            return "Very High"
        elif score > 0.5:
            return "High"
        elif score > 0.3:
            return "Medium"
        else:
            return "Exploratory"

# Initialize service
llm_service = LLMExplanationService()
```

---

### 5. **Database Schema (PostgreSQL)**

**File: `backend/database/schema.sql`**

```sql
-- Users table
CREATE TABLE users (
    user_id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    preferences JSONB
);

-- Products table
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    price DECIMAL(10, 2),
    rating DECIMAL(3, 2),
    tags TEXT[],
    description TEXT,
    popularity INT DEFAULT 0,
    features JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User interactions (for training ML models)
CREATE TABLE interactions (
    interaction_id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(user_id),
    product_id INT REFERENCES products(product_id),
    interaction_type VARCHAR(50), -- 'view', 'click', 'purchase', 'like'
    session_id VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    context JSONB
);

-- User embeddings (pre-computed)
CREATE TABLE user_embeddings (
    user_id VARCHAR(255) PRIMARY KEY REFERENCES users(user_id),
    embedding FLOAT[],
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product embeddings (pre-computed)
CREATE TABLE product_embeddings (
    product_id INT PRIMARY KEY REFERENCES products(product_id),
    embedding FLOAT[],
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recommendations log (for A/B testing)
CREATE TABLE recommendations_log (
    log_id SERIAL PRIMARY KEY,
    user_id VARCHAR(255),
    recommendations JSONB,
    model_version VARCHAR(50),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_interactions_user ON interactions(user_id);
CREATE INDEX idx_interactions_product ON interactions(product_id);
CREATE INDEX idx_interactions_timestamp ON interactions(timestamp);
```

---

### 6. **ML Model Training Pipeline**

**File: `ml_training/train_models.py`**

```python
import pandas as pd
import numpy as np
from sklearn.decomposition import NMF
from sklearn.preprocessing import StandardScaler
import joblib

class ModelTrainer:
    def __init__(self):
        self.cf_model = None
        self.cb_model = None
    
    def train_collaborative_filtering(self, interactions_df):
        """
        Train collaborative filtering model using Matrix Factorization
        """
        # Create user-item matrix
        user_item_matrix = interactions_df.pivot_table(
            index='user_id',
            columns='product_id',
            values='rating',
            fill_value=0
        )
        
        # Non-negative Matrix Factorization
        model = NMF(n_components=50, init='random', random_state=42)
        user_features = model.fit_transform(user_item_matrix)
        product_features = model.components_
        
        # Save embeddings
        joblib.dump(user_features, 'models/user_embeddings.pkl')
        joblib.dump(product_features.T, 'models/product_embeddings.pkl')
        joblib.dump(model, 'models/collaborative_filtering.pkl')
        
        print("✅ Collaborative Filtering model trained")
    
    def train_content_based(self, products_df):
        """
        Train content-based model using product features
        """
        # Feature engineering
        features = self._extract_product_features(products_df)
        
        # Normalize features
        scaler = StandardScaler()
        normalized_features = scaler.fit_transform(features)
        
        joblib.dump(scaler, 'models/content_based.pkl')
        joblib.dump(normalized_features, 'models/product_features.pkl')
        
        print("✅ Content-based model trained")
    
    def _extract_product_features(self, products_df):
        """
        Extract numerical features from products
        """
        # This would include: price, rating, category encoding, tag vectors, etc.
        pass

# Training script
if __name__ == "__main__":
    trainer = ModelTrainer()
    
    # Load data from database
    interactions = pd.read_sql("SELECT * FROM interactions", db_connection)
    products = pd.read_sql("SELECT * FROM products", db_connection)
    
    # Train models
    trainer.train_collaborative_filtering(interactions)
    trainer.train_content_based(products)
    
    print("🎉 All models trained successfully!")
```

---

## 🚀 **Deployment Architecture**

### Development
```bash
# Frontend
cd frontend
npm run dev

# Backend
cd backend
uvicorn main:app --reload

# Database
docker-compose up postgres
```

### Production
```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
  
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/recommender
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - db
      - redis
  
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: recommender
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

---

## 📊 **ML Model Training Schedule**

```python
# Batch training (daily/weekly)
- Retrain CF model: Daily (based on new interactions)
- Update embeddings: Every 6 hours
- Content-based features: Weekly
- A/B test results: Continuous

# Real-time updates
- User session data: In-memory (Redis)
- Immediate recommendations: Cached + real-time scoring
```
