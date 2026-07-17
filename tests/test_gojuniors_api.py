"""
GOJUNIORS E-commerce API Tests
Tests for: Auth, Products, Categories, Cart, Orders, Admin endpoints
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://gojuniors-ecom-test.preview.emergentagent.com')

# Test credentials
ADMIN_EMAIL = "admin@gojuniors.com"
ADMIN_PASSWORD = "admin123"

class TestHealthCheck:
    """Health check endpoint tests"""
    
    def test_health_endpoint(self):
        """Test /health endpoint"""
        response = requests.get(f"{BASE_URL}/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
    
    def test_api_health_endpoint(self):
        """Test /api/health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"


class TestAuth:
    """Authentication endpoint tests"""
    
    def test_login_success(self):
        """Test successful admin login"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user_id" in data
        assert data["email"] == ADMIN_EMAIL
        assert data["is_admin"] == True
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "wrong@example.com",
            "password": "wrongpass"
        })
        assert response.status_code == 401
    
    def test_register_new_user(self):
        """Test user registration"""
        unique_email = f"test_{uuid.uuid4().hex[:8]}@test.com"
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "name": "Test User",
            "email": unique_email,
            "password": "testpass123"
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert data["email"] == unique_email
    
    def test_get_me_without_auth(self):
        """Test /auth/me without authentication"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401


class TestProducts:
    """Product endpoint tests"""
    
    def test_get_products(self):
        """Test GET /api/products"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_featured_products(self):
        """Test GET /api/products/featured"""
        response = requests.get(f"{BASE_URL}/api/products/featured")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) <= 8  # Featured products limited to 8
    
    def test_get_products_by_category(self):
        """Test GET /api/products with category filter"""
        response = requests.get(f"{BASE_URL}/api/products?category=clothes")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # All products should be in clothes category
        for product in data:
            assert product["category"] == "clothes"
    
    def test_get_product_by_id(self):
        """Test GET /api/products/{product_id}"""
        # First get a product ID
        products_response = requests.get(f"{BASE_URL}/api/products")
        products = products_response.json()
        if len(products) > 0:
            product_id = products[0]["product_id"]
            response = requests.get(f"{BASE_URL}/api/products/{product_id}")
            assert response.status_code == 200
            data = response.json()
            assert data["product_id"] == product_id
    
    def test_get_nonexistent_product(self):
        """Test GET /api/products/{product_id} with invalid ID"""
        response = requests.get(f"{BASE_URL}/api/products/nonexistent_id")
        assert response.status_code == 404


class TestCategories:
    """Category endpoint tests"""
    
    def test_get_categories(self):
        """Test GET /api/categories"""
        response = requests.get(f"{BASE_URL}/api/categories")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # Check that categories have required fields
        for cat in data:
            assert "name" in cat
            assert "icon" in cat
    
    def test_categories_have_counts(self):
        """Test that categories include subcategory_count and product_count"""
        response = requests.get(f"{BASE_URL}/api/categories")
        assert response.status_code == 200
        data = response.json()
        for cat in data:
            assert "subcategory_count" in cat
            assert "product_count" in cat


class TestCart:
    """Cart endpoint tests (requires authentication)"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Authentication failed")
    
    def test_get_cart(self, auth_token):
        """Test GET /api/cart"""
        response = requests.get(
            f"{BASE_URL}/api/cart",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
    
    def test_add_to_cart(self, auth_token):
        """Test POST /api/cart/add"""
        # First get a product ID
        products_response = requests.get(f"{BASE_URL}/api/products")
        products = products_response.json()
        if len(products) == 0:
            pytest.skip("No products available")
        
        product_id = products[0]["product_id"]
        response = requests.post(
            f"{BASE_URL}/api/cart/add",
            json={"product_id": product_id, "quantity": 1},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Item added to cart"


class TestAdminEndpoints:
    """Admin endpoint tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Admin authentication failed")
    
    def test_admin_stats(self, auth_token):
        """Test GET /api/admin/stats"""
        response = requests.get(
            f"{BASE_URL}/api/admin/stats",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "total_orders" in data
        assert "total_products" in data
        assert "total_users" in data
        assert "total_revenue" in data
    
    def test_admin_products(self, auth_token):
        """Test GET /api/admin/products"""
        response = requests.get(
            f"{BASE_URL}/api/admin/products",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_admin_orders(self, auth_token):
        """Test GET /api/admin/orders"""
        response = requests.get(
            f"{BASE_URL}/api/admin/orders",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_admin_users(self, auth_token):
        """Test GET /api/admin/users"""
        response = requests.get(
            f"{BASE_URL}/api/admin/users",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "users" in data
        assert "stats" in data
        assert isinstance(data["users"], list)
    
    def test_admin_shipping(self, auth_token):
        """Test GET /api/admin/shipping"""
        response = requests.get(
            f"{BASE_URL}/api/admin/shipping",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "shipping_fee" in data
        assert "free_shipping_minimum" in data


class TestCategoryAdmin:
    """Admin category management tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Admin authentication failed")
    
    def test_create_update_delete_category(self, auth_token):
        """Test category CRUD operations"""
        # Create category
        create_response = requests.post(
            f"{BASE_URL}/api/admin/categories",
            json={
                "name": f"TEST_Category_{uuid.uuid4().hex[:6]}",
                "icon": "🧪",
                "image_url": None,
                "parent_id": None
            },
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert create_response.status_code == 200
        created_cat = create_response.json()
        assert "category_id" in created_cat
        cat_id = created_cat["category_id"]
        
        # Update category
        update_response = requests.put(
            f"{BASE_URL}/api/admin/categories/{cat_id}",
            json={
                "name": "TEST_Updated_Category",
                "icon": "✅",
                "image_url": None,
                "parent_id": None
            },
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert update_response.status_code == 200
        
        # Delete category
        delete_response = requests.delete(
            f"{BASE_URL}/api/admin/categories/{cat_id}",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert delete_response.status_code == 200


class TestShipping:
    """Shipping endpoint tests"""
    
    def test_public_shipping(self):
        """Test GET /api/shipping (public endpoint)"""
        response = requests.get(f"{BASE_URL}/api/shipping")
        assert response.status_code == 200
        data = response.json()
        assert "shipping_fee" in data
        assert "free_shipping_minimum" in data


class TestWishlist:
    """Wishlist endpoint tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Authentication failed")
    
    def test_get_wishlist(self, auth_token):
        """Test GET /api/wishlist"""
        response = requests.get(
            f"{BASE_URL}/api/wishlist",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "items" in data


class TestOrders:
    """Order endpoint tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Authentication failed")
    
    def test_get_user_orders(self, auth_token):
        """Test GET /api/orders"""
        response = requests.get(
            f"{BASE_URL}/api/orders",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
