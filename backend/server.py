from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import httpx
import re

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET_KEY', 'gojuniors_super_secret_key_2024_production')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24 * 7  # 7 days

# Stripe Config
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY', '')
STRIPE_WEBHOOK_SECRET = os.environ.get('STRIPE_WEBHOOK_SECRET', '')

# Create the main app
app = FastAPI(title="GoJuniors E-commerce API")

# Auto-import data file path
DATA_BACKUP_FILE = ROOT_DIR / 'data_backup.json'

# Startup event - Create default admin users and auto-import data
@app.on_event("startup")
async def startup_tasks():
    """Create default admin users and auto-import data on startup"""
    # Create default admins
    default_admins = [
        {"email": "admin@gojuniors.com", "password": "admin123", "name": "Admin"},
        {"email": "hamza.info2359@gmail.com", "password": "hamza123", "name": "Hamza"},
        {"email": "goharayuubkhan06@gmail.com", "password": "gohar123", "name": "Gohar"}
    ]
    
    for admin in default_admins:
        try:
            existing = await db.users.find_one({"email": admin["email"]})
            if not existing:
                # Create new admin user
                hashed_pw = bcrypt.hashpw(admin["password"].encode(), bcrypt.gensalt()).decode()
                user_doc = {
                    "user_id": f"user_{uuid.uuid4().hex[:12]}",
                    "name": admin["name"],
                    "email": admin["email"],
                    "password": hashed_pw,
                    "picture": None,
                    "is_admin": True,
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
                await db.users.insert_one(user_doc)
                print(f"Created admin user: {admin['email']}")
            else:
                # Ensure existing user has admin access and password
                update_data = {"is_admin": True}
                if not existing.get("password"):
                    hashed_pw = bcrypt.hashpw(admin["password"].encode(), bcrypt.gensalt()).decode()
                    update_data["password"] = hashed_pw
                await db.users.update_one({"email": admin["email"]}, {"$set": update_data})
                print(f"Updated admin user: {admin['email']}")
        except Exception as e:
            print(f"Error creating admin {admin['email']}: {e}")
    
    # Auto-import data from backup file if it exists
    await auto_import_data()

async def auto_import_data():
    """Automatically import data from backup file on startup - ONLY if database is empty"""
    import json
    
    if not DATA_BACKUP_FILE.exists():
        print("No data backup file found, skipping auto-import")
        return
    
    try:
        # Check if database already has data - if yes, skip import
        existing_products = await db.products.count_documents({})
        existing_categories = await db.categories.count_documents({})
        
        if existing_products > 0 or existing_categories > 0:
            print(f"Database already has data ({existing_products} products, {existing_categories} categories). Skipping auto-import.")
            print("To reimport, manually clear the database or use Admin > Data Transfer > Import")
            return
        
        print("Database is empty, starting auto-import from backup file...")
        
        with open(DATA_BACKUP_FILE, 'r') as f:
            data = json.load(f)
        
        imported = {"products": 0, "categories": 0, "custom_attributes": 0}
        
        # Import categories first
        if "categories" in data and data["categories"]:
            for category in data["categories"]:
                existing = await db.categories.find_one({"id": category.get("id")})
                if not existing:
                    await db.categories.insert_one(category)
                    imported["categories"] += 1
        
        # Import products
        if "products" in data and data["products"]:
            for product in data["products"]:
                existing = await db.products.find_one({"product_id": product.get("product_id")})
                if not existing:
                    await db.products.insert_one(product)
                    imported["products"] += 1
        
        # Import custom attributes
        if "custom_attributes" in data and data["custom_attributes"]:
            for attr in data["custom_attributes"]:
                existing = await db.attributes.find_one({"id": attr.get("id")})
                if not existing:
                    await db.attributes.insert_one(attr)
                    imported["custom_attributes"] += 1
        
        # Import shipping settings
        if "shipping_settings" in data and data["shipping_settings"]:
            existing = await db.settings.find_one({"type": "shipping"})
            if not existing:
                await db.settings.insert_one(data["shipping_settings"])
        
        # Import site content
        if "site_content" in data and data["site_content"]:
            existing = await db.settings.find_one({"type": "content"})
            if not existing:
                await db.settings.insert_one(data["site_content"])
            else:
                await db.settings.update_one({"type": "content"}, {"$set": data["site_content"]})
        
        # Import theme settings
        if "theme_settings" in data and data["theme_settings"]:
            existing = await db.settings.find_one({"type": "theme"})
            if not existing:
                await db.settings.insert_one(data["theme_settings"])
            else:
                await db.settings.update_one({"type": "theme"}, {"$set": data["theme_settings"]})
        
        print(f"Auto-imported: {imported['categories']} categories, {imported['products']} products, {imported['custom_attributes']} attributes")
        
    except Exception as e:
        print(f"Error auto-importing data: {e}")

# Health check endpoint for Kubernetes (root level)
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Health check also on /api/health
@api_router.get("/health")
async def api_health_check():
    return {"status": "healthy"}

# ==================== DEVICE CONFIGURATIONS (Mobile/Laptop) ====================

class DeviceConfig(BaseModel):
    device_type: str  # "mobile" or "laptop"
    brands: Optional[List[dict]] = []  # [{name: "Samsung", logo: "url"}]
    colors: Optional[List[dict]] = []  # [{name: "Black", code: "#000000"}]
    ram_options: Optional[List[str]] = []  # ["4GB", "8GB", "16GB"]
    storage_options: Optional[List[str]] = []  # ["64GB", "128GB", "256GB"]
    processors: Optional[List[str]] = []  # ["Snapdragon 888", "Apple A15"]
    descriptions: Optional[List[dict]] = []  # [{title: "Premium Quality", text: "..."}]
    conditions: Optional[List[dict]] = []  # [{name: "New", badge_color: "#4CAF50"}]
    warranties: Optional[List[dict]] = []  # [{duration: "7 Days", description: "Replacement warranty"}]

@api_router.get("/admin/device-config/{device_type}")
async def get_device_config(device_type: str, request: Request):
    """Get device configuration (brands, colors, RAM) for mobile or laptop"""
    await require_admin(request)
    
    config = await db.device_configs.find_one(
        {"device_type": device_type},
        {"_id": 0}
    )
    
    if not config:
        # Return default empty config
        return {
            "device_type": device_type,
            "brands": [],
            "colors": [],
            "ram_options": [],
            "storage_options": [],
            "processors": [],
            "descriptions": [],
            "conditions": [],
            "warranties": []
        }
    
    return config

@api_router.post("/admin/device-config/{device_type}")
async def save_device_config(device_type: str, config: DeviceConfig, request: Request):
    """Save device configuration for mobile or laptop"""
    await require_admin(request)
    
    config_data = {
        "device_type": device_type,
        "brands": config.brands,
        "colors": config.colors,
        "ram_options": config.ram_options,
        "storage_options": config.storage_options,
        "processors": config.processors,
        "descriptions": config.descriptions,
        "conditions": config.conditions,
        "warranties": config.warranties,
        "updated_at": datetime.now(timezone.utc)
    }
    
    await db.device_configs.update_one(
        {"device_type": device_type},
        {"$set": config_data},
        upsert=True
    )
    
    return {"message": f"{device_type.capitalize()} configuration saved successfully"}

@api_router.get("/device-config/{device_type}")
async def get_public_device_config(device_type: str):
    """Get device configuration for public use (product pages)"""
    config = await db.device_configs.find_one(
        {"device_type": device_type},
        {"_id": 0}
    )
    
    if not config:
        return {
            "device_type": device_type,
            "brands": [],
            "colors": [],
            "ram_options": [],
            "storage_options": [],
            "processors": [],
            "descriptions": [],
            "conditions": [],
            "warranties": []
        }
    
    return config

# ==================== VISITOR TRACKING ====================

class VisitorTrack(BaseModel):
    visitor_id: str
    device_type: str  # mobile, tablet, desktop
    browser: Optional[str] = None
    page: Optional[str] = None
    # UTM Parameters for Ad Tracking
    utm_source: Optional[str] = None  # google, facebook, instagram
    utm_medium: Optional[str] = None  # cpc, social, email
    utm_campaign: Optional[str] = None  # campaign name
    utm_term: Optional[str] = None  # keyword
    utm_content: Optional[str] = None  # ad content

@api_router.post("/track-visit")
async def track_visitor(visitor: VisitorTrack):
    """Track unique visitor - won't count duplicate visits from same visitor_id"""
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    # Check if this visitor already visited today
    existing = await db.visitors.find_one({
        "visitor_id": visitor.visitor_id,
        "date": today
    })
    
    if existing:
        # Already counted today, just update last_seen
        await db.visitors.update_one(
            {"_id": existing["_id"]},
            {"$set": {"last_seen": datetime.now(timezone.utc), "page_views": existing.get("page_views", 1) + 1}}
        )
        return {"status": "already_tracked", "new_visit": False}
    
    # New visitor for today
    visit_data = {
        "visitor_id": visitor.visitor_id,
        "device_type": visitor.device_type.lower(),
        "browser": visitor.browser,
        "page": visitor.page,
        "date": today,
        "first_seen": datetime.now(timezone.utc),
        "last_seen": datetime.now(timezone.utc),
        "page_views": 1,
        # UTM Data
        "utm_source": visitor.utm_source,
        "utm_medium": visitor.utm_medium,
        "utm_campaign": visitor.utm_campaign,
        "utm_term": visitor.utm_term,
        "utm_content": visitor.utm_content,
        "is_from_ad": bool(visitor.utm_source or visitor.utm_campaign)
    }
    
    await db.visitors.insert_one(visit_data)
    
    # If from ad campaign, also track in campaigns collection
    if visitor.utm_source or visitor.utm_campaign:
        campaign_name = visitor.utm_campaign or f"{visitor.utm_source}_direct"
        await db.ad_campaigns.update_one(
            {"campaign_name": campaign_name, "date": today},
            {
                "$inc": {"visitors": 1},
                "$set": {
                    "utm_source": visitor.utm_source,
                    "utm_medium": visitor.utm_medium,
                    "last_visit": datetime.now(timezone.utc)
                },
                "$addToSet": {"visitor_ids": visitor.visitor_id}
            },
            upsert=True
        )
    
    return {"status": "tracked", "new_visit": True}

# Track product view from ad visitor
@api_router.post("/track-product-view")
async def track_product_view(visitor_id: str = None, product_id: str = None, product_name: str = None):
    """Track which products ad visitors are viewing"""
    if not visitor_id or not product_id:
        return {"status": "missing_data"}
    
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    # Check if this visitor came from an ad
    visitor = await db.visitors.find_one({
        "visitor_id": visitor_id,
        "is_from_ad": True
    })
    
    if visitor and visitor.get("utm_campaign"):
        # Update campaign with product view
        await db.ad_campaigns.update_one(
            {"campaign_name": visitor["utm_campaign"], "date": today},
            {
                "$addToSet": {
                    "products_viewed": {
                        "product_id": product_id,
                        "product_name": product_name,
                        "viewed_at": datetime.now(timezone.utc).isoformat()
                    }
                }
            }
        )
        return {"status": "tracked", "campaign": visitor["utm_campaign"]}
    
    return {"status": "not_from_ad"}

# Track conversion (add to cart / purchase)
@api_router.post("/track-conversion")
async def track_conversion(visitor_id: str = None, conversion_type: str = "cart", product_id: str = None, order_total: float = None):
    """Track conversions from ad visitors"""
    if not visitor_id:
        return {"status": "missing_visitor_id"}
    
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    # Check if visitor came from ad
    visitor = await db.visitors.find_one({
        "visitor_id": visitor_id,
        "is_from_ad": True
    })
    
    if visitor and visitor.get("utm_campaign"):
        update_data = {}
        if conversion_type == "cart":
            update_data = {"$inc": {"cart_adds": 1}}
        elif conversion_type == "purchase":
            update_data = {
                "$inc": {"purchases": 1, "revenue": order_total or 0}
            }
        
        await db.ad_campaigns.update_one(
            {"campaign_name": visitor["utm_campaign"], "date": today},
            update_data
        )
        return {"status": "conversion_tracked", "type": conversion_type}
    
    return {"status": "not_from_ad"}

@api_router.get("/admin/analytics")
async def get_analytics(request: Request):
    """Get visitor analytics for admin dashboard"""
    await require_admin(request)
    
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    # Get today's stats
    today_visitors = await db.visitors.count_documents({"date": today})
    
    # Get total unique visitors (by unique visitor_id)
    total_unique = len(await db.visitors.distinct("visitor_id"))
    
    # Get total visits (all records)
    total_visits = await db.visitors.count_documents({})
    
    # Device breakdown - total
    device_stats = await db.visitors.aggregate([
        {"$group": {
            "_id": "$device_type",
            "count": {"$sum": 1}
        }}
    ]).to_list(100)
    
    device_breakdown = {
        "mobile": 0,
        "tablet": 0,
        "desktop": 0
    }
    for stat in device_stats:
        device_type = stat["_id"] or "desktop"
        if device_type in device_breakdown:
            device_breakdown[device_type] = stat["count"]
    
    # Last 7 days stats
    last_7_days = []
    for i in range(6, -1, -1):
        date = (datetime.now(timezone.utc) - timedelta(days=i)).strftime("%Y-%m-%d")
        count = await db.visitors.count_documents({"date": date})
        last_7_days.append({
            "date": date,
            "visitors": count
        })
    
    # Recent visitors (last 10)
    recent_visitors = await db.visitors.find(
        {}, 
        {"_id": 0, "visitor_id": 1, "device_type": 1, "browser": 1, "first_seen": 1, "page": 1}
    ).sort("first_seen", -1).limit(10).to_list(10)
    
    # Convert datetime to string for JSON
    for v in recent_visitors:
        if v.get("first_seen"):
            v["first_seen"] = v["first_seen"].isoformat()
    
    return {
        "today_visitors": today_visitors,
        "total_unique_visitors": total_unique,
        "total_visits": total_visits,
        "device_breakdown": device_breakdown,
        "last_7_days": last_7_days,
        "recent_visitors": recent_visitors
    }

@api_router.get("/admin/ad-campaigns")
async def get_ad_campaigns(request: Request):
    """Get ad campaign analytics for admin dashboard"""
    await require_admin(request)
    
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    # Get all campaigns
    campaigns = await db.ad_campaigns.find({}, {"_id": 0}).sort("date", -1).to_list(100)
    
    # Convert datetime objects to strings
    for camp in campaigns:
        if camp.get("last_visit"):
            camp["last_visit"] = camp["last_visit"].isoformat()
    
    # Get total ad visitors
    total_ad_visitors = await db.visitors.count_documents({"is_from_ad": True})
    
    # Get today's ad visitors
    today_ad_visitors = await db.visitors.count_documents({"is_from_ad": True, "date": today})
    
    # Campaign summary stats
    total_campaigns = len(set([c.get("campaign_name") for c in campaigns]))
    total_conversions = sum([c.get("cart_adds", 0) + c.get("purchases", 0) for c in campaigns])
    total_revenue = sum([c.get("revenue", 0) for c in campaigns])
    
    # Group by campaign name for summary
    campaign_summary = {}
    for camp in campaigns:
        name = camp.get("campaign_name", "Unknown")
        if name not in campaign_summary:
            campaign_summary[name] = {
                "campaign_name": name,
                "utm_source": camp.get("utm_source"),
                "utm_medium": camp.get("utm_medium"),
                "total_visitors": 0,
                "cart_adds": 0,
                "purchases": 0,
                "revenue": 0,
                "products_viewed": [],
                "dates_active": []
            }
        campaign_summary[name]["total_visitors"] += camp.get("visitors", 0)
        campaign_summary[name]["cart_adds"] += camp.get("cart_adds", 0)
        campaign_summary[name]["purchases"] += camp.get("purchases", 0)
        campaign_summary[name]["revenue"] += camp.get("revenue", 0)
        campaign_summary[name]["dates_active"].append(camp.get("date"))
        if camp.get("products_viewed"):
            campaign_summary[name]["products_viewed"].extend(camp["products_viewed"])
    
    # Last 7 days ad visitors
    ad_last_7_days = []
    for i in range(6, -1, -1):
        date = (datetime.now(timezone.utc) - timedelta(days=i)).strftime("%Y-%m-%d")
        count = await db.visitors.count_documents({"is_from_ad": True, "date": date})
        ad_last_7_days.append({
            "date": date,
            "visitors": count
        })
    
    return {
        "total_ad_visitors": total_ad_visitors,
        "today_ad_visitors": today_ad_visitors,
        "total_campaigns": total_campaigns,
        "total_conversions": total_conversions,
        "total_revenue": total_revenue,
        "campaigns": list(campaign_summary.values()),
        "daily_campaigns": campaigns,
        "ad_last_7_days": ad_last_7_days
    }

# ==================== MODELS ====================

class UserCreate(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    user_id: str
    name: str
    email: str
    picture: Optional[str] = None
    is_admin: bool = False

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    discount_price: Optional[float] = None
    category: str  # clothes, toys, educational, mens, womens, children, electronics, etc.
    image_url: Optional[str] = None
    image_urls: Optional[List[str]] = None
    stock: int = 100
    sku: Optional[str] = None  # Custom SKU
    sizes: Optional[List[str]] = None
    size_variations: Optional[List[dict]] = None  # [{name: "34", stock: 100}, ...]
    colors: Optional[List[str]] = None
    color_variations: Optional[List[dict]] = None  # [{name: "Black", code: "#000", images: [], price: 100, stock: 50}, ...]
    # Combined variations: [{color: "Blue", size: "S", price: 100, discount_price: 90, stock: 10, images: []}, ...]
    variations: Optional[List[dict]] = None
    ages: Optional[str] = None
    brand: Optional[str] = None
    weight: Optional[str] = None
    dimensions: Optional[str] = None
    warranty: Optional[str] = None
    # Device specifications for Mobiles/Laptops
    device_specs: Optional[dict] = None  # {brand, color, ram, storage, processor, condition, warranty}
    # Product Variations (Color, Size, Material, Warranty, etc. - up to 5)
    product_variations: Optional[List[dict]] = None  # [{id, heading, required, values: [{name, value, priceModifier, stock, skuModifier}]}]
    # Custom description fields
    highlights: Optional[List[Any]] = None  # Key features as bullet points (can be string or {text, bold} objects)
    whats_in_box: Optional[List[str]] = None  # Package contents list
    specifications: Optional[List[Any]] = None  # Can be strings or dicts
    custom_attributes: Optional[dict] = None  # Custom attributes added by admin
    is_sold_out: bool = False
    rating: Optional[float] = 0
    review_count: Optional[int] = 0
    # Featured product control (admin toggle)
    is_featured: bool = False
    featured_order: Optional[int] = 0
    # SEO fields
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    slug: Optional[str] = None
    product_id: str
    name: str
    description: str
    price: float
    discount_price: Optional[float] = None
    category: str
    image_url: str
    image_urls: Optional[List[str]] = None
    stock: int
    sku: Optional[str] = None
    sizes: Optional[List[str]] = None
    size_variations: Optional[List[dict]] = None
    colors: Optional[List[str]] = None
    color_variations: Optional[List[dict]] = None
    variations: Optional[List[dict]] = None
    ages: Optional[str] = None
    brand: Optional[str] = None
    weight: Optional[str] = None
    dimensions: Optional[str] = None
    warranty: Optional[str] = None
    device_specs: Optional[dict] = None  # Device specifications for Mobiles/Laptops
    product_variations: Optional[List[dict]] = None  # Product Variations (Color, Size, etc.)
    highlights: Optional[List[str]] = None
    whats_in_box: Optional[List[str]] = None
    specifications: Optional[List[Any]] = None
    is_sold_out: bool = False
    rating: Optional[float] = 0
    review_count: Optional[int] = 0
    is_featured: bool = False
    featured_order: Optional[int] = 0
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    slug: Optional[str] = None
    created_at: str

class ReviewCreate(BaseModel):
    rating: int  # 1-5
    comment: str
    
class WishlistItem(BaseModel):
    product_id: str

class CartItem(BaseModel):
    product_id: str
    quantity: int = 1
    size: Optional[str] = None

class CartItemResponse(BaseModel):
    product_id: str
    name: str
    price: float
    quantity: int
    size: Optional[str] = None
    image_url: str

class OrderCreate(BaseModel):
    items: List[CartItem]
    shipping_address: str
    city: str
    phone: str
    payment_method: str  # cod or stripe
    total_amount: float

class OrderResponse(BaseModel):
    order_id: str
    user_id: str
    items: List[Dict[str, Any]]
    shipping_address: str
    city: str
    phone: str
    payment_method: str
    total_amount: float
    status: str
    payment_status: str
    created_at: str

# ==================== AUTH HELPERS ====================

# Initial admin emails - used only for first-time setup, after that admins are managed via database
INITIAL_ADMIN_EMAILS = ["goharayuubkhan06@gmail.com", "hamza.info2359@gmail.com", "admin@gojuniors.com"]

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_token(user_id: str) -> str:
    payload = {
        "user_id": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> Optional[dict]:
    # Check cookie first
    token = request.cookies.get("session_token")
    
    # Fallback to Authorization header
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
    
    if not token:
        return None
    
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        
        # Check user_sessions collection for Google auth
        session = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
        if session:
            expires_at = session.get("expires_at")
            if isinstance(expires_at, str):
                expires_at = datetime.fromisoformat(expires_at)
            if expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=timezone.utc)
            if expires_at < datetime.now(timezone.utc):
                return None
            user_id = session.get("user_id")
        
        user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
        return user
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

async def require_auth(request: Request) -> dict:
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

async def require_admin(request: Request) -> dict:
    user = await require_auth(request)
    if not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register")
async def register(user_data: UserCreate, response: Response):
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    hashed_pw = hash_password(user_data.password)
    
    # Check if email is in initial admin list (for first-time setup only)
    is_admin = user_data.email.lower() in [e.lower() for e in INITIAL_ADMIN_EMAILS]
    
    user_doc = {
        "user_id": user_id,
        "name": user_data.name,
        "email": user_data.email,
        "password": hashed_pw,
        "picture": None,
        "is_admin": is_admin,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    token = create_token(user_id)
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=JWT_EXPIRATION_HOURS * 3600
    )
    
    return {
        "user_id": user_id,
        "name": user_data.name,
        "email": user_data.email,
        "is_admin": is_admin,
        "token": token
    }

@api_router.post("/auth/login")
async def login(user_data: UserLogin, response: Response):
    user = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    
    # Check if user exists and has a password set
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Check if password is set (some users may only have Google login)
    if not user.get("password"):
        raise HTTPException(status_code=401, detail="Please use Google login for this account")
    
    if not verify_password(user_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_token(user["user_id"])
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=JWT_EXPIRATION_HOURS * 3600
    )
    
    return {
        "user_id": user["user_id"],
        "name": user["name"],
        "email": user["email"],
        "is_admin": user.get("is_admin", False),
        "token": token
    }

@api_router.get("/auth/me")
async def get_me(request: Request):
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return {
        "user_id": user["user_id"],
        "name": user["name"],
        "email": user["email"],
        "picture": user.get("picture"),
        "is_admin": user.get("is_admin", False)
    }

@api_router.post("/auth/logout")
async def logout(response: Response, request: Request):
    token = request.cookies.get("session_token")
    if token:
        await db.user_sessions.delete_one({"session_token": token})
    
    response.delete_cookie(key="session_token", path="/", secure=True, samesite="none")
    return {"message": "Logged out successfully"}

# Google OAuth - Emergent Auth
# REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
@api_router.post("/auth/session")
async def exchange_session(request: Request, response: Response):
    body = await request.json()
    session_id = body.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    
    # Exchange session_id for user data
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id}
        )
        
        if resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid session")
        
        data = resp.json()
    
    email = data.get("email")
    name = data.get("name")
    picture = data.get("picture")
    session_token = data.get("session_token")
    
    # Check if user exists
    existing_user = await db.users.find_one({"email": email}, {"_id": 0})
    
    if existing_user:
        user_id = existing_user["user_id"]
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": name, "picture": picture}}
        )
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user_doc = {
            "user_id": user_id,
            "name": name,
            "email": email,
            "password": None,
            "picture": picture,
            "is_admin": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user_doc)
    
    # Store session
    session_doc = {
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.user_sessions.insert_one(session_doc)
    
    # Create JWT token for localStorage
    token = create_token(user_id)
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 3600
    )
    
    return {
        "user_id": user_id,
        "name": name,
        "email": email,
        "picture": picture,
        "is_admin": False,
        "token": token
    }

# ==================== PRODUCT ROUTES ====================

@api_router.get("/products")
async def get_products(
    category: Optional[str] = None, 
    search: Optional[str] = None,
    page: int = 1,
    limit: int = 12
):
    query = {}
    if category and category != "all":
        # Get category info to handle subcategories
        cat_info = await db.categories.find_one({
            "$or": [
                {"id": category},
                {"category_id": category},
                {"name": {"$regex": f"^{category}$", "$options": "i"}}
            ]
        })
        
        if cat_info:
            cat_id = cat_info.get("category_id") or cat_info.get("id")
            cat_name = cat_info.get("name", "")
            
            # Get all subcategory IDs for this category
            subcategories = await db.categories.find({"parent_id": cat_id}).to_list(100)
            sub_ids = [s.get("category_id") or s.get("id") for s in subcategories]
            sub_names = [s.get("name", "").lower() for s in subcategories]
            
            # Build query to match category ID, name, or any subcategory
            all_matches = [cat_id, cat_name.lower()] + sub_ids + sub_names
            query["$or"] = [
                {"category": {"$in": all_matches}},
                {"category": {"$regex": f"^{cat_name}$", "$options": "i"}},
                {"category": {"$regex": f"^{category}$", "$options": "i"}}
            ]
        else:
            # Fallback to simple match
            query["$or"] = [
                {"category": category},
                {"category": {"$regex": f"^{category}$", "$options": "i"}}
            ]
    
    if search:
        if "$or" in query:
            query = {"$and": [query, {"name": {"$regex": search, "$options": "i"}}]}
        else:
            query["name"] = {"$regex": search, "$options": "i"}
    
    # Calculate skip
    skip = (page - 1) * limit
    
    # Get total count
    total = await db.products.count_documents(query)
    
    # Get paginated products
    products = await db.products.find(query, {"_id": 0}).skip(skip).limit(limit).to_list(limit)
    
    return {
        "products": products,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit  # Ceiling division
    }

def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

async def make_unique_slug(base_text: str, exclude_product_id: Optional[str] = None) -> str:
    base_slug = slugify(base_text) or f"product-{uuid.uuid4().hex[:6]}"
    slug = base_slug
    counter = 1
    while True:
        query = {"slug": slug}
        if exclude_product_id:
            query["product_id"] = {"$ne": exclude_product_id}
        existing = await db.products.find_one(query)
        if not existing:
            return slug
        counter += 1
        slug = f"{base_slug}-{counter}"

@api_router.get("/products/featured")
async def get_featured_products():
    # Return admin-selected featured products, ordered by featured_order
    products = await db.products.find({"is_featured": True}, {"_id": 0}).sort("featured_order", 1).limit(12).to_list(12)
    if not products:
        # Fallback: no featured products set yet, show latest 8 so homepage isn't empty
        products = await db.products.find({}, {"_id": 0}).sort("created_at", -1).limit(8).to_list(8)
    return products

@api_router.get("/products/slug/{slug}")
async def get_product_by_slug(slug: str):
    product = await db.products.find_one({"slug": slug}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@api_router.get("/products/{product_id}")
async def get_product(product_id: str):
    product = await db.products.find_one({"product_id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@api_router.post("/products")
async def create_product(product: ProductCreate, request: Request):
    await require_admin(request)
    
    product_id = f"prod_{uuid.uuid4().hex[:12]}"
    product_data = product.model_dump()
    product_data["slug"] = await make_unique_slug(product.slug or product.name)
    product_doc = {
        "product_id": product_id,
        **product_data,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.products.insert_one(product_doc)
    return {"product_id": product_id, **product_data, "created_at": product_doc["created_at"]}

@api_router.put("/products/{product_id}")
async def update_product(product_id: str, product: ProductCreate, request: Request):
    await require_admin(request)
    
    product_data = product.model_dump()
    product_data["slug"] = await make_unique_slug(product.slug or product.name, exclude_product_id=product_id)
    
    result = await db.products.update_one(
        {"product_id": product_id},
        {"$set": product_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"message": "Product updated"}

class FeaturedUpdate(BaseModel):
    is_featured: bool
    featured_order: Optional[int] = 0

@api_router.patch("/admin/products/{product_id}/featured")
async def set_product_featured(product_id: str, data: FeaturedUpdate, request: Request):
    await require_admin(request)
    result = await db.products.update_one(
        {"product_id": product_id},
        {"$set": {"is_featured": data.is_featured, "featured_order": data.featured_order}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Featured status updated"}

# Stock Update Model
class StockUpdate(BaseModel):
    stock: int

@api_router.patch("/products/{product_id}/stock")
async def update_product_stock(product_id: str, stock_data: StockUpdate, request: Request):
    await require_admin(request)
    
    result = await db.products.update_one(
        {"product_id": product_id},
        {"$set": {"stock": stock_data.stock}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"message": "Stock updated", "stock": stock_data.stock}

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, request: Request):
    await require_admin(request)
    
    result = await db.products.delete_one({"product_id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"message": "Product deleted"}

# ==================== CART ROUTES ====================

@api_router.get("/cart")
async def get_cart(request: Request):
    user = await require_auth(request)
    cart = await db.carts.find_one({"user_id": user["user_id"]}, {"_id": 0})
    
    if not cart:
        return {"items": [], "total": 0}
    
    items_with_details = []
    total = 0
    
    # Batch fetch all products at once (N+1 optimization)
    product_ids = [item["product_id"] for item in cart.get("items", [])]
    products = await db.products.find({"product_id": {"$in": product_ids}}, {"_id": 0}).to_list(None)
    products_dict = {p["product_id"]: p for p in products}
    
    for item in cart.get("items", []):
        product = products_dict.get(item["product_id"])
        if product:
            # Use discount_price if available, otherwise use regular price
            effective_price = product.get("discount_price") or product["price"]
            item_total = effective_price * item["quantity"]
            total += item_total
            items_with_details.append({
                "product_id": item["product_id"],
                "name": product["name"],
                "price": product["price"],
                "discount_price": product.get("discount_price"),
                "quantity": item["quantity"],
                "size": item.get("size"),
                "image_url": product.get("image_url") or (product.get("image_urls", [None])[0] if product.get("image_urls") else None)
            })
    
    return {"items": items_with_details, "total": total}

@api_router.post("/cart/add")
async def add_to_cart(item: CartItem, request: Request):
    user = await require_auth(request)
    
    product = await db.products.find_one({"product_id": item.product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    cart = await db.carts.find_one({"user_id": user["user_id"]}, {"_id": 0})
    
    if not cart:
        cart_doc = {
            "user_id": user["user_id"],
            "items": [item.model_dump()],
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.carts.insert_one(cart_doc)
    else:
        existing_item = None
        for i, cart_item in enumerate(cart["items"]):
            if cart_item["product_id"] == item.product_id and cart_item.get("size") == item.size:
                existing_item = i
                break
        
        if existing_item is not None:
            cart["items"][existing_item]["quantity"] += item.quantity
            await db.carts.update_one(
                {"user_id": user["user_id"]},
                {"$set": {"items": cart["items"], "updated_at": datetime.now(timezone.utc).isoformat()}}
            )
        else:
            await db.carts.update_one(
                {"user_id": user["user_id"]},
                {"$push": {"items": item.model_dump()}, "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}}
            )
    
    return {"message": "Item added to cart"}

@api_router.delete("/cart/{product_id}")
async def remove_from_cart(product_id: str, request: Request):
    user = await require_auth(request)
    
    await db.carts.update_one(
        {"user_id": user["user_id"]},
        {"$pull": {"items": {"product_id": product_id}}}
    )
    
    return {"message": "Item removed from cart"}

@api_router.put("/cart/{product_id}")
async def update_cart_item(product_id: str, item: CartItem, request: Request):
    user = await require_auth(request)
    
    cart = await db.carts.find_one({"user_id": user["user_id"]}, {"_id": 0})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    for i, cart_item in enumerate(cart["items"]):
        if cart_item["product_id"] == product_id:
            cart["items"][i]["quantity"] = item.quantity
            break
    
    await db.carts.update_one(
        {"user_id": user["user_id"]},
        {"$set": {"items": cart["items"]}}
    )
    
    return {"message": "Cart updated"}

@api_router.delete("/cart")
async def clear_cart(request: Request):
    user = await require_auth(request)
    await db.carts.delete_one({"user_id": user["user_id"]})
    return {"message": "Cart cleared"}

# ==================== WISHLIST ROUTES ====================

@api_router.get("/wishlist")
async def get_wishlist(request: Request):
    user = await require_auth(request)
    wishlist = await db.wishlists.find_one({"user_id": user["user_id"]}, {"_id": 0})
    
    if not wishlist:
        return {"items": []}
    
    # Get product details for wishlist items
    product_ids = wishlist.get("product_ids", [])
    products = await db.products.find(
        {"product_id": {"$in": product_ids}},
        {"_id": 0}
    ).to_list(100)
    
    return {"items": products}

@api_router.post("/wishlist/add")
async def add_to_wishlist(item: WishlistItem, request: Request):
    user = await require_auth(request)
    
    # Check if product exists
    product = await db.products.find_one({"product_id": item.product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Add to wishlist
    await db.wishlists.update_one(
        {"user_id": user["user_id"]},
        {"$addToSet": {"product_ids": item.product_id}},
        upsert=True
    )
    
    return {"message": "Added to wishlist"}

@api_router.post("/wishlist/remove")
async def remove_from_wishlist(item: WishlistItem, request: Request):
    user = await require_auth(request)
    
    await db.wishlists.update_one(
        {"user_id": user["user_id"]},
        {"$pull": {"product_ids": item.product_id}}
    )
    
    return {"message": "Removed from wishlist"}

@api_router.get("/wishlist/check/{product_id}")
async def check_wishlist(product_id: str, request: Request):
    user = await require_auth(request)
    
    wishlist = await db.wishlists.find_one({
        "user_id": user["user_id"],
        "product_ids": product_id
    })
    
    return {"in_wishlist": wishlist is not None}

# ==================== REVIEW ROUTES ====================

@api_router.get("/products/{product_id}/reviews")
async def get_product_reviews(product_id: str):
    reviews = await db.reviews.find(
        {"product_id": product_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    return reviews

@api_router.post("/products/{product_id}/reviews")
async def add_review(product_id: str, review: ReviewCreate, request: Request):
    user = await require_auth(request)
    
    # Check if product exists
    product = await db.products.find_one({"product_id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if user already reviewed
    existing = await db.reviews.find_one({
        "product_id": product_id,
        "user_id": user["user_id"]
    })
    if existing:
        raise HTTPException(status_code=400, detail="You already reviewed this product")
    
    # Create review
    review_doc = {
        "review_id": f"rev_{uuid.uuid4().hex[:12]}",
        "product_id": product_id,
        "user_id": user["user_id"],
        "user_name": user.get("name", "Anonymous"),
        "rating": min(5, max(1, review.rating)),
        "comment": review.comment,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.reviews.insert_one(review_doc)
    
    # Update product rating
    all_reviews = await db.reviews.find({"product_id": product_id}).to_list(1000)
    avg_rating = sum(r["rating"] for r in all_reviews) / len(all_reviews)
    
    await db.products.update_one(
        {"product_id": product_id},
        {"$set": {"rating": round(avg_rating, 1), "review_count": len(all_reviews)}}
    )
    
    return {"message": "Review added", "review_id": review_doc["review_id"]}

# ==================== ADMIN REVIEWS MANAGEMENT ====================

@api_router.get("/admin/reviews")
async def get_all_reviews(request: Request):
    """Get all reviews for admin management"""
    await require_admin(request)
    
    reviews = await db.reviews.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    
    # Enrich with product names
    product_ids = list(set(r["product_id"] for r in reviews))
    products = await db.products.find({"product_id": {"$in": product_ids}}, {"_id": 0, "product_id": 1, "name": 1, "image_url": 1}).to_list(None)
    products_dict = {p["product_id"]: p for p in products}
    
    for review in reviews:
        product = products_dict.get(review["product_id"], {})
        review["product_name"] = product.get("name", "Unknown Product")
        review["product_image"] = product.get("image_url", "")
    
    return reviews

@api_router.put("/admin/reviews/{review_id}")
async def update_review(review_id: str, request: Request):
    """Update a review (admin only)"""
    await require_admin(request)
    
    body = await request.json()
    
    # Update review
    result = await db.reviews.update_one(
        {"review_id": review_id},
        {"$set": {
            "rating": body.get("rating"),
            "comment": body.get("comment"),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Review not found")
    
    # Recalculate product rating
    review = await db.reviews.find_one({"review_id": review_id})
    if review:
        all_reviews = await db.reviews.find({"product_id": review["product_id"]}).to_list(1000)
        if all_reviews:
            avg_rating = sum(r["rating"] for r in all_reviews) / len(all_reviews)
            await db.products.update_one(
                {"product_id": review["product_id"]},
                {"$set": {"rating": round(avg_rating, 1), "review_count": len(all_reviews)}}
            )
    
    return {"message": "Review updated"}

@api_router.delete("/admin/reviews/{review_id}")
async def delete_review(review_id: str, request: Request):
    """Delete a review (admin only)"""
    await require_admin(request)
    
    # Get review first to know the product
    review = await db.reviews.find_one({"review_id": review_id})
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    product_id = review["product_id"]
    
    # Delete review
    await db.reviews.delete_one({"review_id": review_id})
    
    # Recalculate product rating
    all_reviews = await db.reviews.find({"product_id": product_id}).to_list(1000)
    if all_reviews:
        avg_rating = sum(r["rating"] for r in all_reviews) / len(all_reviews)
        await db.products.update_one(
            {"product_id": product_id},
            {"$set": {"rating": round(avg_rating, 1), "review_count": len(all_reviews)}}
        )
    else:
        # No reviews left
        await db.products.update_one(
            {"product_id": product_id},
            {"$set": {"rating": 0, "review_count": 0}}
        )
    
    return {"message": "Review deleted"}

# ==================== ORDER ROUTES ====================

@api_router.post("/orders")
async def create_order(order_data: OrderCreate, request: Request):
    user = await require_auth(request)
    
    order_id = f"order_{uuid.uuid4().hex[:12]}"
    
    # Get product details for items (batch fetch - N+1 optimization)
    product_ids = [item.product_id for item in order_data.items]
    products = await db.products.find({"product_id": {"$in": product_ids}}, {"_id": 0}).to_list(None)
    products_dict = {p["product_id"]: p for p in products}
    
    items_with_details = []
    for item in order_data.items:
        product = products_dict.get(item.product_id)
        if product:
            items_with_details.append({
                "product_id": item.product_id,
                "name": product["name"],
                "price": product["price"],
                "quantity": item.quantity,
                "size": item.size,
                "image_url": product["image_url"]
            })
    
    order_doc = {
        "order_id": order_id,
        "user_id": user["user_id"],
        "items": items_with_details,
        "shipping_address": order_data.shipping_address,
        "city": order_data.city,
        "phone": order_data.phone,
        "payment_method": order_data.payment_method,
        "total_amount": order_data.total_amount,
        "status": "pending",
        "payment_status": "pending" if order_data.payment_method == "stripe" else "cod",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.orders.insert_one(order_doc)
    
    # Clear cart
    await db.carts.delete_one({"user_id": user["user_id"]})
    
    # Return order data without MongoDB ObjectId
    return {
        "order_id": order_id,
        "user_id": user["user_id"],
        "items": items_with_details,
        "shipping_address": order_data.shipping_address,
        "city": order_data.city,
        "phone": order_data.phone,
        "payment_method": order_data.payment_method,
        "total_amount": order_data.total_amount,
        "status": "pending",
        "payment_status": "pending" if order_data.payment_method == "stripe" else "cod",
        "created_at": order_doc["created_at"]
    }

@api_router.get("/orders")
async def get_user_orders(request: Request):
    user = await require_auth(request)
    orders = await db.orders.find({"user_id": user["user_id"]}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return orders

@api_router.get("/orders/{order_id}")
async def get_order(order_id: str, request: Request):
    user = await require_auth(request)
    order = await db.orders.find_one({"order_id": order_id, "user_id": user["user_id"]}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

# Cancel order - User can cancel their own pending orders
@api_router.post("/orders/{order_id}/cancel")
async def cancel_order(order_id: str, request: Request):
    user = await require_auth(request)
    
    # Find the order
    order = await db.orders.find_one({"order_id": order_id, "user_id": user["user_id"]})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Only pending or processing orders can be cancelled by user
    if order["status"] not in ["pending", "processing"]:
        raise HTTPException(status_code=400, detail=f"Cannot cancel order with status: {order['status']}")
    
    # Update order status to cancelled
    await db.orders.update_one(
        {"order_id": order_id},
        {"$set": {
            "status": "cancelled",
            "cancelled_at": datetime.now(timezone.utc).isoformat(),
            "cancelled_by": "user"
        }}
    )
    
    return {"message": "Order cancelled successfully", "order_id": order_id}

# ==================== STRIPE PAYMENT ====================

@api_router.post("/checkout/create-session")
async def create_checkout_session(request: Request):
    import stripe

    user = await require_auth(request)
    body = await request.json()
    
    order_id = body.get("order_id")
    origin_url = body.get("origin_url")
    
    if not order_id or not origin_url:
        raise HTTPException(status_code=400, detail="order_id and origin_url required")
    
    order = await db.orders.find_one({"order_id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if not STRIPE_API_KEY:
        raise HTTPException(status_code=500, detail="Stripe is not configured on this server")
    
    # Amount from backend - NOT from frontend for security
    amount = float(order["total_amount"])
    
    stripe.api_key = STRIPE_API_KEY
    
    success_url = f"{origin_url}/order-success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin_url}/checkout"
    
    session = stripe.checkout.Session.create(
        mode="payment",
        payment_method_types=["card"],
        line_items=[{
            "price_data": {
                "currency": "usd",
                "product_data": {"name": f"GoJuniors Order {order_id}"},
                "unit_amount": int(round(amount * 100)),
            },
            "quantity": 1,
        }],
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "order_id": order_id,
            "user_id": user["user_id"]
        }
    )
    
    # Create payment transaction record
    transaction_doc = {
        "transaction_id": f"txn_{uuid.uuid4().hex[:12]}",
        "session_id": session.id,
        "order_id": order_id,
        "user_id": user["user_id"],
        "amount": amount,
        "currency": "usd",
        "payment_status": "initiated",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.payment_transactions.insert_one(transaction_doc)
    
    return {"url": session.url, "session_id": session.id}

@api_router.get("/checkout/status/{session_id}")
async def get_checkout_status(session_id: str, request: Request):
    import stripe

    if not STRIPE_API_KEY:
        raise HTTPException(status_code=500, detail="Stripe is not configured on this server")
    
    stripe.api_key = STRIPE_API_KEY
    session = stripe.checkout.Session.retrieve(session_id)
    payment_status = session.payment_status
    
    # Update transaction and order status
    if payment_status == "paid":
        transaction = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
        if transaction and transaction.get("payment_status") != "paid":
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {"$set": {"payment_status": "paid", "updated_at": datetime.now(timezone.utc).isoformat()}}
            )
            
            order_id = transaction.get("order_id")
            if order_id:
                await db.orders.update_one(
                    {"order_id": order_id},
                    {"$set": {"payment_status": "paid", "status": "confirmed"}}
                )
    
    return {
        "status": session.status,
        "payment_status": payment_status,
        "amount_total": session.amount_total,
        "currency": session.currency
    }

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    import json
    import stripe
    
    if not STRIPE_API_KEY:
        return {"received": True}
    
    stripe.api_key = STRIPE_API_KEY
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    try:
        if STRIPE_WEBHOOK_SECRET:
            event = stripe.Webhook.construct_event(body, signature, STRIPE_WEBHOOK_SECRET)
        else:
            event = stripe.Event.construct_from(json.loads(body), stripe.api_key)
        
        if event["type"] == "checkout.session.completed":
            session_obj = event["data"]["object"]
            session_id = session_obj["id"]
            payment_status = session_obj.get("payment_status")
            
            if payment_status == "paid":
                transaction = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
                if transaction and transaction.get("payment_status") != "paid":
                    await db.payment_transactions.update_one(
                        {"session_id": session_id},
                        {"$set": {"payment_status": "paid", "updated_at": datetime.now(timezone.utc).isoformat()}}
                    )
                    
                    order_id = transaction.get("order_id")
                    if order_id:
                        await db.orders.update_one(
                            {"order_id": order_id},
                            {"$set": {"payment_status": "paid", "status": "confirmed"}}
                        )
        
        return {"received": True}
    except Exception as e:
        logging.error(f"Webhook error: {e}")
        return {"received": True}

# ==================== ADMIN ROUTES ====================

@api_router.get("/admin/orders")
async def get_all_orders(request: Request, status: Optional[str] = None):
    await require_admin(request)
    
    query = {}
    if status:
        query["status"] = status
    
    orders = await db.orders.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return orders

@api_router.put("/admin/orders/{order_id}/status")
async def update_order_status(order_id: str, request: Request):
    await require_admin(request)
    body = await request.json()
    new_status = body.get("status")
    
    if new_status not in ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    update_data = {"status": new_status}
    if new_status == "cancelled":
        update_data["cancelled_at"] = datetime.now(timezone.utc).isoformat()
        update_data["cancelled_by"] = "admin"
        update_data["cancel_reason"] = body.get("reason", "Cancelled by admin")
    
    result = await db.orders.update_one(
        {"order_id": order_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Send WhatsApp notification once, when order is confirmed (never duplicates)
    if new_status == "confirmed":
        order = await db.orders.find_one({"order_id": order_id}, {"_id": 0})
        if order and not order.get("whatsapp_notified"):
            sent = await send_whatsapp_order_notification(order)
            if sent:
                await db.orders.update_one({"order_id": order_id}, {"$set": {"whatsapp_notified": True}})
    
    return {"message": "Order status updated"}

@api_router.delete("/admin/orders/{order_id}")
async def delete_order(order_id: str, request: Request):
    """Permanently delete an order from the database (admin only). Not a soft delete."""
    await require_admin(request)
    result = await db.orders.delete_one({"order_id": order_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": "Order deleted"}

@api_router.get("/admin/stats")
async def get_admin_stats(request: Request):
    await require_admin(request)
    
    total_orders = await db.orders.count_documents({})
    total_products = await db.products.count_documents({})
    total_users = await db.users.count_documents({})
    
    # Calculate total revenue
    pipeline = [
        {"$match": {"payment_status": {"$in": ["paid", "cod"]}}},
        {"$group": {"_id": None, "total": {"$sum": "$total_amount"}}}
    ]
    revenue_result = await db.orders.aggregate(pipeline).to_list(1)
    total_revenue = revenue_result[0]["total"] if revenue_result else 0
    
    return {
        "total_orders": total_orders,
        "total_products": total_products,
        "total_users": total_users,
        "total_revenue": total_revenue
    }

# ==================== ADMIN USERS ====================

@api_router.get("/admin/users")
async def get_admin_users(request: Request):
    await require_admin(request)
    
    users = await db.users.find({}, {"_id": 0, "password": 0}).to_list(1000)
    
    # Calculate stats
    total = len(users)
    admins = sum(1 for u in users if u.get("is_admin"))
    
    # Count users created this month
    now = datetime.now(timezone.utc)
    first_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    new_this_month = sum(1 for u in users if u.get("created_at") and datetime.fromisoformat(u["created_at"].replace('Z', '+00:00')) >= first_of_month)
    
    return {
        "users": users,
        "stats": {
            "total": total,
            "admins": admins,
            "active": total,
            "new_this_month": new_this_month
        }
    }

@api_router.put("/admin/users/{user_id}/role")
async def update_user_role(user_id: str, request: Request):
    await require_admin(request)
    
    body = await request.json()
    is_admin = body.get("is_admin", False)
    
    result = await db.users.update_one(
        {"user_id": user_id},
        {"$set": {"is_admin": is_admin}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "User role updated"}

@api_router.post("/admin/users/add-admin")
async def add_admin_by_email(request: Request):
    """Add admin access to a user by email - creates user if doesn't exist"""
    await require_admin(request)
    
    body = await request.json()
    email = body.get("email", "").strip().lower()
    
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    
    password = body.get("password", "").strip()
    name = body.get("name", "").strip() or email.split("@")[0]
    
    # Check if user exists
    existing_user = await db.users.find_one({"email": {"$regex": f"^{email}$", "$options": "i"}}, {"_id": 0})
    
    if existing_user:
        # Update existing user to admin and optionally update password
        update_data = {"is_admin": True}
        if password:
            update_data["password"] = hash_password(password)
        await db.users.update_one(
            {"user_id": existing_user["user_id"]},
            {"$set": update_data}
        )
        return {"message": f"Admin access granted to {email}", "user_id": existing_user["user_id"], "is_new": False}
    else:
        # Create new admin user with password
        if not password:
            raise HTTPException(status_code=400, detail="Password is required for new admin")
        
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user_doc = {
            "user_id": user_id,
            "name": name,
            "email": email,
            "password": hash_password(password),
            "picture": None,
            "is_admin": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user_doc)
        return {"message": f"New admin user created: {email}", "user_id": user_id, "is_new": True}

@api_router.delete("/admin/users/{user_id}")
async def delete_admin_user(user_id: str, request: Request):
    """Remove a user completely"""
    current_user = await require_admin(request)
    
    # Prevent self-deletion
    if current_user["user_id"] == user_id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    result = await db.users.delete_one({"user_id": user_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "User deleted successfully"}

@api_router.get("/admin/products")
async def get_admin_products(request: Request):
    await require_admin(request)
    products = await db.products.find({}, {"_id": 0}).to_list(100)
    return products

@api_router.post("/admin/products")
async def create_admin_product(request: Request):
    await require_admin(request)
    body = await request.json()
    
    product_id = f"prod_{uuid.uuid4().hex[:12]}"
    
    product_doc = {
        "product_id": product_id,
        "name": body.get("name"),
        "description": body.get("description", ""),
        "price": float(body.get("price", 0)),
        "discount_price": float(body.get("discount_price")) if body.get("discount_price") else None,
        "category": body.get("category"),
        "image_url": body.get("image_urls", [None])[0] if body.get("image_urls") else None,
        "image_urls": body.get("image_urls", []),
        "stock": int(body.get("stock", 100)),
        "sizes": body.get("sizes", []),
        "colors": body.get("colors", []),
        "ages": body.get("ages", ""),
        "brand": body.get("brand", ""),
        "weight": body.get("weight", ""),
        "warranty": body.get("warranty", ""),
        "highlights": body.get("highlights", []),
        "whats_in_box": body.get("whats_in_box", []),
        "specifications": body.get("specifications", []),
        "variations": body.get("variations", []),
        "custom_attributes": body.get("custom_attributes", {}),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.products.insert_one(product_doc)
    return {"product_id": product_id, "message": "Product created successfully"}

# ==================== CATEGORIES ====================

class CategoryCreate(BaseModel):
    name: str
    icon: str = "📦"
    image_url: Optional[str] = None
    parent_id: Optional[str] = None  # For subcategories (supports multi-level nesting)

@api_router.get("/categories")
async def get_categories():
    # Fetch categories from DB only - no hardcoded defaults
    categories = await db.categories.find({}, {"_id": 0}).sort("position", 1).to_list(500)
    
    if not categories:
        # Return empty array if no categories exist
        return []
    
    # Build a map of category IDs for quick lookup
    cat_ids = {c.get("category_id") or c.get("id") for c in categories}
    
    # Count subcategories for each category
    subcategory_counts = {}
    for cat in categories:
        parent_id = cat.get("parent_id")
        if parent_id:
            subcategory_counts[parent_id] = subcategory_counts.get(parent_id, 0) + 1
    
    # Count products per category (match by ID or name)
    product_counts = {}
    products = await db.products.find({}, {"category": 1, "_id": 0}).to_list(10000)
    
    # Build a map of category names to IDs
    cat_name_to_id = {}
    for cat in categories:
        cat_id = cat.get("category_id") or cat.get("id")
        cat_name = cat.get("name", "").lower()
        cat_name_to_id[cat_name] = cat_id
        cat_name_to_id[cat_id] = cat_id  # Also map ID to itself
    
    for product in products:
        product_cat = product.get("category", "")
        if product_cat:
            # Try to match by ID first, then by name (case-insensitive)
            matched_id = cat_name_to_id.get(product_cat) or cat_name_to_id.get(product_cat.lower())
            if matched_id:
                product_counts[matched_id] = product_counts.get(matched_id, 0) + 1
            else:
                # Direct match
                product_counts[product_cat] = product_counts.get(product_cat, 0) + 1
    
    # Add counts to each category (including subcategory products in parent count)
    enriched_categories = []
    for cat in categories:
        cat_id = cat.get("category_id") or cat.get("id")
        cat_name = cat.get("name", "").lower()
        
        # Count direct products
        direct_count = product_counts.get(cat_id, 0) + product_counts.get(cat_name, 0)
        
        # For parent categories, also count products in subcategories
        if not cat.get("parent_id"):
            for subcat in categories:
                if subcat.get("parent_id") == cat_id:
                    sub_id = subcat.get("category_id") or subcat.get("id")
                    sub_name = subcat.get("name", "").lower()
                    direct_count += product_counts.get(sub_id, 0) + product_counts.get(sub_name, 0)
        
        enriched_cat = {**cat}
        enriched_cat["subcategory_count"] = subcategory_counts.get(cat_id, 0)
        enriched_cat["product_count"] = direct_count
        enriched_categories.append(enriched_cat)
    
    return enriched_categories

@api_router.post("/admin/categories")
async def create_category(category: CategoryCreate, request: Request):
    await require_admin(request)
    
    # Check for duplicate category name (case-insensitive)
    existing = await db.categories.find_one({
        "name": {"$regex": f"^{category.name}$", "$options": "i"},
        "parent_id": category.parent_id  # Allow same name in different parent
    })
    if existing:
        raise HTTPException(status_code=400, detail=f"Category '{category.name}' already exists at this level")
    
    category_id = f"cat_{uuid.uuid4().hex[:8]}"
    category_doc = {
        "category_id": category_id,
        "id": category_id,  # For backwards compatibility
        "name": category.name,
        "icon": category.icon,
        "image_url": category.image_url,
        "parent_id": category.parent_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.categories.insert_one(category_doc)
    return {"category_id": category_id, "id": category_id, "name": category.name, "icon": category.icon, "image_url": category.image_url, "parent_id": category.parent_id}

@api_router.put("/admin/categories/{category_id}")
async def update_category(category_id: str, request: Request):
    await require_admin(request)
    
    body = await request.json()
    update_data = {
        "name": body.get("name"),
        "icon": body.get("icon", "📦"),
        "image_url": body.get("image_url"),
        "parent_id": body.get("parent_id")
    }
    
    result = await db.categories.update_one(
        {"$or": [{"id": category_id}, {"category_id": category_id}]},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    
    return {"message": "Category updated"}

@api_router.delete("/admin/categories/{category_id}")
async def delete_category(category_id: str, request: Request):
    await require_admin(request)
    
    result = await db.categories.delete_one({"$or": [{"id": category_id}, {"category_id": category_id}]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    
    return {"message": "Category deleted"}

# Category Reorder API
class CategoryReorderRequest(BaseModel):
    category_ids: List[str]

@api_router.post("/admin/categories/reorder")
async def reorder_categories(reorder_data: CategoryReorderRequest, request: Request):
    await require_admin(request)
    
    # Filter out any empty or invalid IDs
    valid_ids = [cid for cid in reorder_data.category_ids if cid and cid.strip()]
    
    # Update position for each category
    for index, cat_id in enumerate(valid_ids):
        await db.categories.update_one(
            {"$or": [{"id": cat_id}, {"category_id": cat_id}]},
            {"$set": {"position": index}}
        )
    
    return {"message": "Categories reordered"}

# ==================== CUSTOM ATTRIBUTES ====================

@api_router.get("/admin/custom-attributes")
async def get_custom_attributes(request: Request):
    await require_admin(request)
    attributes = await db.custom_attributes.find({}, {"_id": 0}).to_list(100)
    return attributes

@api_router.post("/admin/custom-attributes")
async def create_custom_attribute(request: Request):
    await require_admin(request)
    body = await request.json()
    
    attr_id = f"attr_{uuid.uuid4().hex[:8]}"
    attr_doc = {
        "id": attr_id,
        "name": body.get("name"),
        "type": body.get("type", "text"),  # text, select, number
        "options": body.get("options", []),  # For select type
        "required": body.get("required", False),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.custom_attributes.insert_one(attr_doc)
    return attr_doc

@api_router.delete("/admin/custom-attributes/{attr_id}")
async def delete_custom_attribute(attr_id: str, request: Request):
    await require_admin(request)
    result = await db.custom_attributes.delete_one({"id": attr_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Attribute not found")
    return {"message": "Attribute deleted"}

# ==================== IMAGE UPLOAD ====================

@api_router.post("/upload/image")
async def upload_image(request: Request):
    await require_admin(request)
    
    body = await request.json()
    image_data = body.get("image")  # Base64 encoded image
    
    if not image_data:
        raise HTTPException(status_code=400, detail="No image data provided")
    
    # Store image in DB (base64)
    image_id = f"img_{uuid.uuid4().hex[:12]}"
    image_doc = {
        "image_id": image_id,
        "data": image_data,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.images.insert_one(image_doc)
    
    # Return URL that serves the image
    return {"image_url": f"/api/images/{image_id}", "image_id": image_id}

@api_router.get("/images/{image_id}")
async def get_image(image_id: str):
    from fastapi.responses import Response as FastAPIResponse
    import base64
    
    image = await db.images.find_one({"image_id": image_id}, {"_id": 0})
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    
    # Decode base64 and return as image
    image_data = image["data"]
    if "," in image_data:
        image_data = image_data.split(",")[1]
    
    image_bytes = base64.b64decode(image_data)
    return FastAPIResponse(content=image_bytes, media_type="image/jpeg")

# ==================== SHIPPING SETTINGS ====================

class ShippingSettings(BaseModel):
    shipping_fee: float = 200
    free_shipping_minimum: float = 5000

@api_router.get("/shipping")
async def get_public_shipping():
    """Public endpoint to get shipping charges for cart/checkout"""
    settings = await db.settings.find_one({"type": "shipping"}, {"_id": 0})
    if not settings:
        return {
            "shipping_fee": 200,
            "free_shipping_minimum": 5000
        }
    return {
        "shipping_fee": settings.get("shipping_fee", 200),
        "free_shipping_minimum": settings.get("free_shipping_minimum", 5000)
    }

@api_router.get("/admin/shipping")
async def get_shipping_settings(request: Request):
    await require_admin(request)
    
    settings = await db.settings.find_one({"type": "shipping"}, {"_id": 0})
    if not settings:
        return {
            "shipping_fee": 200,
            "free_shipping_minimum": 5000
        }
    return settings

@api_router.put("/admin/shipping")
async def update_shipping_settings(request: Request):
    await require_admin(request)
    
    body = await request.json()
    shipping_fee = float(body.get("shipping_fee", 200))
    free_shipping_minimum = float(body.get("free_shipping_minimum", 5000))
    
    await db.settings.update_one(
        {"type": "shipping"},
        {"$set": {
            "type": "shipping",
            "shipping_fee": shipping_fee,
            "free_shipping_minimum": free_shipping_minimum
        }},
        upsert=True
    )
    
    return {"message": "Shipping settings updated"}

# ==================== THEME SETTINGS ====================

class ThemeSettings(BaseModel):
    primary_color: str = "#FF8FAB"
    secondary_color: str = "#FFD166"
    accent_color: str = "#06D6A0"
    text_color: str = "#1A1A1A"
    background_color: str = "#FDFBF7"
    button_text_color: str = "#FFFFFF"
    # Watermark settings
    watermark_text: Optional[str] = None
    watermark_image: Optional[str] = None
    watermark_opacity: float = 0.1
    watermark_position: str = "center"  # center, top-left, top-right, bottom-left, bottom-right

# ==================== SITE CONTENT SETTINGS ====================

class SiteContentSettings(BaseModel):
    # Hero Section
    hero_title: str = "More Than a Bag. It's Your Signature."
    hero_subtitle: str = "Express your unique style with our collection of standout handbags."
    hero_image: Optional[str] = None
    
    # Footer
    footer_description: str = "Express your unique style with our collection of standout handbags."
    
    # Stylish Text Settings
    stylish_text: Optional[dict] = None
    
    # Payment Settings
    payment_settings: Optional[dict] = None
    
    # Popularity Badge Settings
    popularity_badge: Optional[dict] = None
    
    # Service Features
    service_features: Optional[list] = None
    
    # Delivery Info
    delivery_info: Optional[dict] = None
    
    # About Us
    about_title: str = "About GoJuniors"
    about_content: str = "Welcome to GoJuniors!"
    about_image: Optional[str] = None
    
    # Contact
    contact_email: str = "info@gojuniors.com"
    contact_phone: str = "0306 0634634"
    contact_address: str = "Lahore, Pakistan"
    contact_hours: str = "Mon-Sat: 9AM - 6PM"
    
    # FAQ
    faqs: Optional[list] = None
    
    # Terms & Privacy
    terms_content: str = "Terms and conditions..."
    privacy_content: str = "Privacy policy..."

@api_router.get("/settings/content")
async def get_site_content():
    """Public endpoint to get site content"""
    settings = await db.settings.find_one({"type": "content"}, {"_id": 0})
    if not settings:
        return {
            "hero_title": "More Than a Bag. It's Your Signature.",
            "hero_subtitle": "Express your unique style with our collection of standout handbags.",
            "hero_image": None,
            "footer_description": "Express your unique style with our collection of standout handbags.",
            "service_features": [
                {"icon": "🚚", "title": "Free Delivery", "description": "On orders over Rs. 5000"},
                {"icon": "📦", "title": "Free Shipping", "description": "On order over Rs. 2000"},
                {"icon": "✅", "title": "Quality Guarantee", "description": "30-day return policy"}
            ],
            "delivery_info": {
                "shipping_text": "Free 5000+",
                "cod_text": "Available",
                "returns_text": "20 Days"
            },
            "about_title": "About GoJuniors",
            "about_content": "Welcome to GoJuniors! We are dedicated to providing the best quality products.",
            "about_image": None,
            "contact_email": "info@gojuniors.com",
            "contact_phone": "0306 0634634",
            "contact_address": "Lahore, Pakistan",
            "contact_hours": "Mon-Sat: 9AM - 6PM",
            "faqs": [
                {"question": "What payment methods do you accept?", "answer": "We accept Cash on Delivery (COD) only."},
                {"question": "How long does delivery take?", "answer": "Delivery usually takes 3-5 business days."},
                {"question": "Can I return a product?", "answer": "Yes, you can return products within the return period."}
            ],
            "terms_content": "Terms and Conditions for GoJuniors...",
            "privacy_content": "Privacy Policy for GoJuniors..."
        }
    return settings

@api_router.post("/admin/settings/content")
async def update_site_content(content: SiteContentSettings, request: Request):
    await require_admin(request)
    
    await db.settings.update_one(
        {"type": "content"},
        {"$set": {
            "type": "content",
            **content.model_dump()
        }},
        upsert=True
    )
    
    return {"message": "Site content updated"}

@api_router.get("/settings/theme")
async def get_theme_settings():
    """Public endpoint to get theme colors"""
    settings = await db.settings.find_one({"type": "theme"}, {"_id": 0})
    if not settings:
        return {
            "primary_color": "#FF8FAB",
            "secondary_color": "#FFD166",
            "accent_color": "#06D6A0",
            "text_color": "#1A1A1A",
            "background_color": "#FDFBF7",
            "button_text_color": "#FFFFFF",
            "watermark_text": None,
            "watermark_image": None,
            "watermark_opacity": 0.1,
            "watermark_position": "center"
        }
    return {
        "primary_color": settings.get("primary_color", "#FF8FAB"),
        "secondary_color": settings.get("secondary_color", "#FFD166"),
        "accent_color": settings.get("accent_color", "#06D6A0"),
        "text_color": settings.get("text_color", "#1A1A1A"),
        "background_color": settings.get("background_color", "#FDFBF7"),
        "button_text_color": settings.get("button_text_color", "#FFFFFF"),
        "watermark_text": settings.get("watermark_text"),
        "watermark_image": settings.get("watermark_image"),
        "watermark_opacity": settings.get("watermark_opacity", 0.1),
        "watermark_position": settings.get("watermark_position", "center")
    }

@api_router.post("/admin/settings/theme")
async def update_theme_settings(theme: ThemeSettings, request: Request):
    await require_admin(request)
    
    await db.settings.update_one(
        {"type": "theme"},
        {"$set": {
            "type": "theme",
            **theme.model_dump()
        }},
        upsert=True
    )
    
    return {"message": "Theme settings updated"}

# ==================== GALLERY ====================

class WhatsAppSettings(BaseModel):
    enabled: bool = False
    notify_number: Optional[str] = None  # Admin's WhatsApp number to receive order alerts, e.g. 92XXXXXXXXXX
    message_template: str = (
        "New Order Received 🎉\n\n"
        "Order ID: #{order_id}\n"
        "Customer: {customer_name}\n"
        "Phone: {phone}\n"
        "Products: {products}\n"
        "Total: Rs. {total}\n"
        "Payment Method: {payment_method}\n"
        "Delivery Address: {address}\n\n"
        "Please check the Admin Panel for complete order details."
    )
    # Customer-facing "Order on WhatsApp" button controls
    ordering_enabled: bool = True  # master toggle for the customer-facing order button
    show_on_product_page: bool = True
    show_floating_button: bool = True
    order_message_template: str = (
        "Hello, I want to order:\n\n"
        "Product: {{product_name}}\n"
        "Price: Rs. {{price}}\n"
        "Quantity: {{quantity}}\n"
        "Product Link: {{product_url}}"
    )

@api_router.get("/admin/settings/whatsapp")
async def get_whatsapp_settings(request: Request):
    await require_admin(request)
    settings = await db.settings.find_one({"type": "whatsapp"}, {"_id": 0})
    if not settings:
        return WhatsAppSettings().model_dump()
    settings.pop("type", None)
    return settings

@api_router.post("/admin/settings/whatsapp")
async def update_whatsapp_settings(settings: WhatsAppSettings, request: Request):
    await require_admin(request)
    await db.settings.update_one(
        {"type": "whatsapp"},
        {"$set": {"type": "whatsapp", **settings.model_dump()}},
        upsert=True
    )
    return {"message": "WhatsApp settings updated"}

@api_router.get("/settings/whatsapp")
async def get_public_whatsapp_settings():
    """Public, read-only: only exposes what the storefront needs to build an
    'Order on WhatsApp' link. Never exposes API tokens/credentials."""
    settings = await db.settings.find_one({"type": "whatsapp"}, {"_id": 0})
    if not settings:
        settings = WhatsAppSettings().model_dump()
    return {
        "ordering_enabled": settings.get("ordering_enabled", True),
        "notify_number": settings.get("notify_number"),
        "show_on_product_page": settings.get("show_on_product_page", True),
        "show_floating_button": settings.get("show_floating_button", True),
        "order_message_template": settings.get("order_message_template", WhatsAppSettings().order_message_template),
    }

async def send_whatsapp_order_notification(order: dict) -> bool:
    """
    Sends an order notification via the official WhatsApp Cloud API (Meta).
    Requires WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID env vars to be set
    (never exposed to frontend). If not configured, this safely no-ops and logs,
    so order processing is never blocked or broken.
    """
    try:
        settings = await db.settings.find_one({"type": "whatsapp"}, {"_id": 0})
        if not settings or not settings.get("enabled") or not settings.get("notify_number"):
            return False

        access_token = os.environ.get("WHATSAPP_ACCESS_TOKEN")
        phone_number_id = os.environ.get("WHATSAPP_PHONE_NUMBER_ID")
        if not access_token or not phone_number_id:
            logging.warning("WhatsApp notification skipped: WHATSAPP_ACCESS_TOKEN / WHATSAPP_PHONE_NUMBER_ID not configured in environment.")
            return False

        items = order.get("items", [])
        product_names = ", ".join([i.get("name", "") for i in items]) if items else "N/A"
        template = settings.get("message_template") or WhatsAppSettings().message_template
        message = template.format(
            order_id=order.get("order_id", "")[-6:],
            customer_name=order.get("customer_name", order.get("phone", "Customer")),
            phone=order.get("phone", ""),
            products=product_names,
            total=order.get("total_amount", 0),
            payment_method=order.get("payment_method", ""),
            address=f"{order.get('shipping_address', '')}, {order.get('city', '')}"
        )

        to_number = settings["notify_number"].lstrip("+")
        url = f"https://graph.facebook.com/v19.0/{phone_number_id}/messages"
        headers = {"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}
        payload = {
            "messaging_product": "whatsapp",
            "to": to_number,
            "type": "text",
            "text": {"body": message}
        }
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(url, headers=headers, json=payload)
            if resp.status_code >= 400:
                logging.error(f"WhatsApp API error {resp.status_code}: {resp.text}")
                return False
        return True
    except Exception as e:
        logging.error(f"WhatsApp notification failed: {e}")
        return False

class HeroBreakpointConfig(BaseModel):
    scale: float = 1
    x: float = 50
    y: float = 50
    width: float = 100
    height: float = 100

class HeroWatermarkBreakpointConfig(BaseModel):
    scale: float = 1
    x: float = 90
    y: float = 90

DEFAULT_HERO_BP = {"scale": 1, "x": 50, "y": 50, "width": 100, "height": 100}
DEFAULT_WM_BP = {"scale": 1, "x": 90, "y": 90}

class HeroImageConfig(BaseModel):
    url: str = ""
    fit_mode: str = "cover"  # cover | contain | custom
    desktop: dict = Field(default_factory=lambda: dict(DEFAULT_HERO_BP))
    tablet: dict = Field(default_factory=lambda: dict(DEFAULT_HERO_BP))
    mobile: dict = Field(default_factory=lambda: dict(DEFAULT_HERO_BP))

class HeroWatermarkConfig(BaseModel):
    url: str = ""
    opacity: float = 0.5
    desktop: dict = Field(default_factory=lambda: dict(DEFAULT_WM_BP))
    tablet: dict = Field(default_factory=lambda: dict(DEFAULT_WM_BP))
    mobile: dict = Field(default_factory=lambda: dict(DEFAULT_WM_BP))

class HeroSettings(BaseModel):
    media_type: str = "image"  # image | video | animation
    media_enabled: bool = True
    video_url: Optional[str] = None
    animation_url: Optional[str] = None
    image: HeroImageConfig = Field(default_factory=HeroImageConfig)
    watermark: HeroWatermarkConfig = Field(default_factory=HeroWatermarkConfig)

@api_router.get("/settings/hero")
async def get_hero_settings():
    """Public endpoint - homepage reads hero media config from here."""
    settings = await db.settings.find_one({"type": "hero"}, {"_id": 0})
    if not settings:
        return HeroSettings().model_dump()
    settings.pop("type", None)
    return settings

@api_router.post("/admin/settings/hero")
async def update_hero_settings(settings: HeroSettings, request: Request):
    await require_admin(request)
    await db.settings.update_one(
        {"type": "hero"},
        {"$set": {"type": "hero", **settings.model_dump()}},
        upsert=True
    )
    return {"message": "Hero settings updated"}

# ==================== FLASH DEALS (Hero Deals) ====================
class DealCreate(BaseModel):
    title: str
    description: Optional[str] = None
    banner_image: Optional[str] = None
    product_id: Optional[str] = None
    category_id: Optional[str] = None
    original_price: Optional[float] = None
    sale_price: Optional[float] = None
    discount_type: str = "percent"  # "percent" or "amount"
    discount_value: Optional[float] = None
    start_time: str  # ISO datetime
    end_time: str    # ISO datetime
    countdown_enabled: bool = True
    shop_now_text: str = "Shop Now"
    shop_now_link: Optional[str] = None
    review_video_url: Optional[str] = None
    is_active: bool = True
    order: int = 0

def _is_deal_currently_active(deal: dict) -> bool:
    if not deal.get("is_active"):
        return False
    try:
        now = datetime.now(timezone.utc)
        start = datetime.fromisoformat(deal["start_time"].replace("Z", "+00:00"))
        end = datetime.fromisoformat(deal["end_time"].replace("Z", "+00:00"))
        return start <= now < end
    except Exception:
        return False

@api_router.get("/admin/hero-deals")
async def admin_list_deals(request: Request):
    await require_admin(request)
    deals = await db.hero_deals.find({}, {"_id": 0}).sort("order", 1).to_list(1000)
    return deals

@api_router.post("/admin/hero-deals")
async def create_deal(deal: DealCreate, request: Request):
    await require_admin(request)
    count = await db.hero_deals.count_documents({})
    deal_doc = {
        "id": f"deal_{uuid.uuid4().hex[:12]}",
        **deal.model_dump(),
        "order": count,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.hero_deals.insert_one(deal_doc)
    deal_doc.pop("_id", None)
    return deal_doc

@api_router.put("/admin/hero-deals/{deal_id}")
async def update_deal(deal_id: str, deal: DealCreate, request: Request):
    await require_admin(request)
    result = await db.hero_deals.update_one(
        {"id": deal_id},
        {"$set": deal.model_dump(exclude={"order"})}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Deal not found")
    return {"message": "Deal updated"}

@api_router.delete("/admin/hero-deals/{deal_id}")
async def delete_deal(deal_id: str, request: Request):
    await require_admin(request)
    result = await db.hero_deals.delete_one({"id": deal_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Deal not found")
    return {"message": "Deal deleted"}

class DealReorderRequest(BaseModel):
    order: List[str]

@api_router.post("/admin/hero-deals/reorder")
async def reorder_deals(reorder_data: DealReorderRequest, request: Request):
    await require_admin(request)
    for idx, deal_id in enumerate(reorder_data.order):
        await db.hero_deals.update_one({"id": deal_id}, {"$set": {"order": idx}})
    return {"message": "Deals reordered"}

@api_router.get("/deals")
async def get_active_deals():
    """Public: only currently-active deals (enabled + within start/end window),
    no fixed limit on how many can be active at once."""
    all_deals = await db.hero_deals.find({"is_active": True}, {"_id": 0}).sort("order", 1).to_list(1000)
    return [d for d in all_deals if _is_deal_currently_active(d)]

@api_router.get("/hero-deals")
async def get_active_hero_deals():
    """Same active-deal set as /deals, exposed for the homepage carousel."""
    all_deals = await db.hero_deals.find({"is_active": True}, {"_id": 0}).sort("order", 1).to_list(1000)
    return [d for d in all_deals if _is_deal_currently_active(d)]

# ==================== REVIEW VIDEOS (YouTube) ====================
class ReviewVideoCreate(BaseModel):
    customer_name: Optional[str] = None
    video_url: str
    thumbnail_url: Optional[str] = None
    caption: Optional[str] = None
    rating: Optional[int] = 5
    sort_order: Optional[int] = 0
    is_active: bool = True

@api_router.get("/admin/review-videos")
async def admin_list_review_videos(request: Request):
    await require_admin(request)
    videos = await db.review_videos.find({}, {"_id": 0}).sort("sort_order", 1).to_list(500)
    return videos

@api_router.post("/admin/review-videos")
async def create_review_video(video: ReviewVideoCreate, request: Request):
    await require_admin(request)
    doc = {
        "id": f"revv_{uuid.uuid4().hex[:12]}",
        **video.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.review_videos.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.put("/admin/review-videos/{video_id}")
async def update_review_video(video_id: str, request: Request):
    await require_admin(request)
    body = await request.json()
    # Supports partial updates (e.g. just {"is_active": false} for the enable/disable toggle)
    result = await db.review_videos.update_one({"id": video_id}, {"$set": body})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Review video not found")
    return {"message": "Review video updated"}

@api_router.delete("/admin/review-videos/{video_id}")
async def delete_review_video(video_id: str, request: Request):
    await require_admin(request)
    result = await db.review_videos.delete_one({"id": video_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Review video not found")
    return {"message": "Review video deleted"}

@api_router.post("/admin/review-videos/validate")
async def validate_review_video_url(request: Request):
    """Validates a YouTube URL and returns the extracted video ID + embed URL."""
    await require_admin(request)
    body = await request.json()
    url = body.get("url", "")
    match = re.search(r'(?:youtube\.com/watch\?v=|youtu\.be/|youtube\.com/shorts/)([\w-]+)', url)
    if not match:
        raise HTTPException(status_code=400, detail="Not a valid YouTube URL")
    video_id = match.group(1)
    return {"valid": True, "video_id": video_id, "embed_url": f"https://www.youtube.com/embed/{video_id}"}

@api_router.get("/review-videos")
async def get_public_review_videos():
    videos = await db.review_videos.find({"is_active": True}, {"_id": 0}).sort("sort_order", 1).to_list(500)
    return videos

# ==================== ANNOUNCEMENT BAR ====================
class AnnouncementCreate(BaseModel):
    text: str
    is_active: bool = True
    sort_order: int = 0

@api_router.get("/admin/announcements")
async def admin_list_announcements(request: Request):
    await require_admin(request)
    items = await db.announcements.find({}, {"_id": 0}).sort("sort_order", 1).to_list(200)
    return items

@api_router.post("/admin/announcements")
async def create_announcement(item: AnnouncementCreate, request: Request):
    await require_admin(request)
    count = await db.announcements.count_documents({})
    doc = {
        "id": f"ann_{uuid.uuid4().hex[:12]}",
        **item.model_dump(),
        "sort_order": count,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.announcements.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.put("/admin/announcements/{ann_id}")
async def update_announcement(ann_id: str, request: Request):
    await require_admin(request)
    body = await request.json()
    result = await db.announcements.update_one({"id": ann_id}, {"$set": body})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Announcement not found")
    return {"message": "Announcement updated"}

@api_router.delete("/admin/announcements/{ann_id}")
async def delete_announcement(ann_id: str, request: Request):
    await require_admin(request)
    result = await db.announcements.delete_one({"id": ann_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Announcement not found")
    return {"message": "Announcement deleted"}

class AnnouncementReorderRequest(BaseModel):
    order: List[str]

@api_router.post("/admin/announcements/reorder")
async def reorder_announcements(reorder_data: AnnouncementReorderRequest, request: Request):
    await require_admin(request)
    for idx, ann_id in enumerate(reorder_data.order):
        await db.announcements.update_one({"id": ann_id}, {"$set": {"sort_order": idx}})
    return {"message": "Announcements reordered"}

@api_router.get("/announcements")
async def get_public_announcements():
    items = await db.announcements.find({"is_active": True}, {"_id": 0}).sort("sort_order", 1).to_list(200)
    return items

class GalleryImage(BaseModel):
    title: Optional[str] = None
    image_url: str
    description: Optional[str] = None

@api_router.get("/admin/gallery")
async def get_gallery_images(request: Request):
    """Get all gallery images"""
    await require_admin(request)
    images = await db.gallery.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return images

@api_router.post("/admin/gallery")
async def add_gallery_image(image_data: GalleryImage, request: Request):
    """Add a new image to gallery"""
    await require_admin(request)
    
    image_id = f"gallery_{uuid.uuid4().hex[:12]}"
    image_doc = {
        "image_id": image_id,
        "title": image_data.title or "Untitled",
        "image_url": image_data.image_url,
        "description": image_data.description,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.gallery.insert_one(image_doc)
    return {"image_id": image_id, **image_doc}

@api_router.delete("/admin/gallery/{image_id}")
async def delete_gallery_image(image_id: str, request: Request):
    """Delete a gallery image"""
    await require_admin(request)
    
    result = await db.gallery.delete_one({"image_id": image_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Image not found")
    
    return {"message": "Image deleted"}

@api_router.get("/gallery")
async def get_public_gallery():
    """Public endpoint to get gallery images"""
    images = await db.gallery.find({}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return images

# ==================== DATA EXPORT/IMPORT ====================

@api_router.get("/admin/export-data")
async def export_all_data(request: Request):
    """Export all products and categories as JSON for backup/transfer"""
    await require_admin(request)
    import json
    
    # Get all products
    products = []
    async for product in db.products.find({}, {"_id": 0}):
        products.append(product)
    
    # Get all categories
    categories = []
    async for category in db.categories.find({}, {"_id": 0}):
        categories.append(category)
    
    # Get custom attributes
    attributes = []
    async for attr in db.attributes.find({}, {"_id": 0}):
        attributes.append(attr)
    
    # Get shipping settings
    shipping = await db.settings.find_one({"type": "shipping"}, {"_id": 0})
    
    # Get site content
    site_content = await db.settings.find_one({"type": "content"}, {"_id": 0})
    
    # Get theme settings
    theme_settings = await db.settings.find_one({"type": "theme"}, {"_id": 0})
    
    export_data = {
        "export_date": datetime.now(timezone.utc).isoformat(),
        "products": products,
        "categories": categories,
        "custom_attributes": attributes,
        "shipping_settings": shipping,
        "site_content": site_content,
        "theme_settings": theme_settings
    }
    
    # Also save to file for auto-deployment
    try:
        with open(DATA_BACKUP_FILE, 'w') as f:
            json.dump(export_data, f, indent=2, default=str)
        print(f"Data backup saved to {DATA_BACKUP_FILE}")
    except Exception as e:
        print(f"Error saving backup file: {e}")
    
    return export_data

@api_router.post("/admin/import-data")
async def import_all_data(request: Request):
    """Import products and categories from JSON backup"""
    await require_admin(request)
    
    body = await request.json()
    
    imported = {
        "products": 0,
        "categories": 0,
        "custom_attributes": 0
    }
    
    # Import categories first (products depend on them)
    if "categories" in body and body["categories"]:
        for category in body["categories"]:
            # Check if category already exists
            existing = await db.categories.find_one({"id": category.get("id")})
            if not existing:
                await db.categories.insert_one(category)
                imported["categories"] += 1
            else:
                # Update existing category
                await db.categories.update_one(
                    {"id": category.get("id")},
                    {"$set": category}
                )
                imported["categories"] += 1
    
    # Import products
    if "products" in body and body["products"]:
        for product in body["products"]:
            # Check if product already exists
            existing = await db.products.find_one({"product_id": product.get("product_id")})
            if not existing:
                await db.products.insert_one(product)
                imported["products"] += 1
            else:
                # Update existing product
                await db.products.update_one(
                    {"product_id": product.get("product_id")},
                    {"$set": product}
                )
                imported["products"] += 1
    
    # Import custom attributes
    if "custom_attributes" in body and body["custom_attributes"]:
        for attr in body["custom_attributes"]:
            existing = await db.attributes.find_one({"id": attr.get("id")})
            if not existing:
                await db.attributes.insert_one(attr)
                imported["custom_attributes"] += 1
            else:
                await db.attributes.update_one(
                    {"id": attr.get("id")},
                    {"$set": attr}
                )
                imported["custom_attributes"] += 1
    
    # Import shipping settings
    if "shipping_settings" in body and body["shipping_settings"]:
        await db.settings.update_one(
            {"type": "shipping"},
            {"$set": body["shipping_settings"]},
            upsert=True
        )
    
    return {
        "message": "Data imported successfully",
        "imported": imported
    }

# ==================== SEED DATA ====================

@api_router.post("/seed")
async def seed_data():
    # No default products - user will add their own
    # Only create admin user if not exists
    
    # Create admin user
    admin_user = {
        "user_id": f"user_{uuid.uuid4().hex[:12]}",
        "name": "Admin",
        "email": "admin@gojuniors.com",
        "password": hash_password("admin123"),
        "picture": None,
        "is_admin": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    existing_admin = await db.users.find_one({"email": "admin@gojuniors.com"})
    if not existing_admin:
        await db.users.insert_one(admin_user)
    
    return {"message": "Data seeded successfully", "admin_created": not existing_admin}

# ============ SEO ENDPOINTS ============
# Sitemap.xml - Dynamic sitemap for Google indexing
@api_router.get("/sitemap.xml")
async def sitemap_xml():
    """Generate dynamic XML sitemap for SEO"""
    from fastapi.responses import Response
    
    base_url = "https://gojuniors.com"
    
    # Static pages
    static_pages = [
        {"loc": "/", "priority": "1.0", "changefreq": "daily"},
        {"loc": "/products", "priority": "0.9", "changefreq": "daily"},
        {"loc": "/categories", "priority": "0.9", "changefreq": "weekly"},
        {"loc": "/about", "priority": "0.5", "changefreq": "monthly"},
        {"loc": "/contact", "priority": "0.5", "changefreq": "monthly"},
        {"loc": "/faq", "priority": "0.5", "changefreq": "monthly"},
        {"loc": "/terms", "priority": "0.3", "changefreq": "yearly"},
        {"loc": "/privacy", "priority": "0.3", "changefreq": "yearly"},
    ]
    
    # Build XML
    xml_content = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml_content += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    
    # Add static pages
    for page in static_pages:
        xml_content += f'''  <url>
    <loc>{base_url}{page["loc"]}</loc>
    <changefreq>{page["changefreq"]}</changefreq>
    <priority>{page["priority"]}</priority>
  </url>\n'''
    
    # Add category pages
    try:
        categories = await db.categories.find({}, {"_id": 0}).to_list(500)
        for cat in categories:
            cat_id = cat.get("category_id") or cat.get("id")
            if cat_id:
                xml_content += f'''  <url>
    <loc>{base_url}/products/{cat_id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n'''
    except Exception as e:
        print(f"Error fetching categories for sitemap: {e}")
    
    # Add product pages
    try:
        products = await db.products.find({}, {"_id": 0, "product_id": 1, "updated_at": 1}).to_list(5000)
        for product in products:
            product_id = product.get("product_id")
            if product_id:
                xml_content += f'''  <url>
    <loc>{base_url}/product/{product_id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>\n'''
    except Exception as e:
        print(f"Error fetching products for sitemap: {e}")
    
    xml_content += '</urlset>'
    
    return Response(content=xml_content, media_type="application/xml")

# Robots.txt endpoint (also available from /api/robots.txt)
@api_router.get("/robots.txt")
async def robots_txt():
    """Return robots.txt for search engine crawlers"""
    from fastapi.responses import PlainTextResponse
    
    robots_content = """User-agent: *
Allow: /

# Sitemap
Sitemap: https://gojuniors.com/api/sitemap.xml

# Disallow admin and private pages
Disallow: /admin/
Disallow: /checkout
Disallow: /order-success
Disallow: /profile
Disallow: /login
Disallow: /register

# Allow crawling of all public pages
Allow: /products
Allow: /product/
Allow: /categories
Allow: /about
Allow: /contact
Allow: /faq
Allow: /terms
Allow: /privacy
"""
    return PlainTextResponse(content=robots_content, media_type="text/plain")

# Include the router in the main app
app.include_router(api_router)

# CORS configuration - Allow specific origins for API access
# Note: When allow_credentials=True, cannot use "*" for origins
# Get CORS origins from environment or use defaults
CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '*')
if CORS_ORIGINS == '*':
    # For wildcard, we'll handle CORS dynamically via middleware
    cors_origins_list = ["*"]
else:
    cors_origins_list = [origin.strip() for origin in CORS_ORIGINS.split(',')]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=86400,
)

# Additional middleware to handle preflight for any origin
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

class CORSPreflight(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        if request.method == "OPTIONS":
            response = Response()
            response.headers["Access-Control-Allow-Origin"] = request.headers.get("origin", "*")
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
            response.headers["Access-Control-Allow-Headers"] = "*"
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Max-Age"] = "86400"
            return response
        
        response = await call_next(request)
        origin = request.headers.get("origin", "")
        if origin:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
        return response

app.add_middleware(CORSPreflight)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
