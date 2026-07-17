"""
Test Suite for Price Variation System - P0 Blocker Fix
Tests the Combined Variations Matrix feature for Color-Size combinations with individual pricing
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://gojuniors-ecom-test.preview.emergentagent.com')

# Test credentials
ADMIN_EMAIL = "admin@gojuniors.com"
ADMIN_PASSWORD = "admin123"


class TestAuthAndSetup:
    """Authentication tests for admin access"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "token" in data, "No token in response"
        return data["token"]
    
    def test_admin_login(self, auth_token):
        """Test admin can login successfully"""
        assert auth_token is not None
        assert len(auth_token) > 0
        print(f"✅ Admin login successful, token obtained")


class TestProductCreationWithVariations:
    """Test product creation with combined color-size variations"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        return response.json()["token"]
    
    @pytest.fixture(scope="class")
    def auth_headers(self, auth_token):
        """Get headers with auth token"""
        return {
            "Authorization": f"Bearer {auth_token}",
            "Content-Type": "application/json"
        }
    
    def test_create_product_with_combined_variations(self, auth_headers):
        """
        Test creating a product with multiple colors (Red, Blue) and sizes (S, M, L)
        with individual prices for each Color-Size combination
        """
        unique_id = uuid.uuid4().hex[:8]
        product_data = {
            "name": f"TEST_Variation_Product_{unique_id}",
            "description": "Test product with combined color-size variations",
            "price": 1000.0,  # Base price
            "discount_price": 900.0,
            "category": "clothes",
            "image_url": "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400",
            "image_urls": ["https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400"],
            "stock": 100,
            "sku": f"TEST-VAR-{unique_id}",
            "sizes": ["S", "M", "L"],
            "colors": ["Red", "Blue"],
            "size_variations": [
                {"name": "S", "stock": 30},
                {"name": "M", "stock": 40},
                {"name": "L", "stock": 30}
            ],
            "color_variations": [
                {"name": "Red", "code": "#FF0000", "images": [], "price": 1000, "discount_price": 900, "stock": 50},
                {"name": "Blue", "code": "#0066CC", "images": [], "price": 1000, "discount_price": 900, "stock": 50}
            ],
            # Combined variations with INDIVIDUAL PRICES for each Color-Size combination
            "variations": [
                {"color": "Red", "size": "S", "price": 1000, "discount_price": 900, "stock": 10, "sku": f"TEST-RED-S-{unique_id}", "images": []},
                {"color": "Red", "size": "M", "price": 1100, "discount_price": 1000, "stock": 15, "sku": f"TEST-RED-M-{unique_id}", "images": []},
                {"color": "Red", "size": "L", "price": 1200, "discount_price": 1100, "stock": 10, "sku": f"TEST-RED-L-{unique_id}", "images": []},
                {"color": "Blue", "size": "S", "price": 1000, "discount_price": 900, "stock": 10, "sku": f"TEST-BLUE-S-{unique_id}", "images": []},
                {"color": "Blue", "size": "M", "price": 1100, "discount_price": 1000, "stock": 15, "sku": f"TEST-BLUE-M-{unique_id}", "images": []},
                {"color": "Blue", "size": "L", "price": 1200, "discount_price": 1100, "stock": 10, "sku": f"TEST-BLUE-L-{unique_id}", "images": []}
            ],
            "is_sold_out": False
        }
        
        response = requests.post(f"{BASE_URL}/api/products", json=product_data, headers=auth_headers)
        
        # Assert creation successful
        assert response.status_code == 200, f"Product creation failed: {response.text}"
        
        created_product = response.json()
        assert "product_id" in created_product, "No product_id in response"
        
        product_id = created_product["product_id"]
        print(f"✅ Product created with ID: {product_id}")
        
        # Verify variations were saved
        assert created_product.get("variations") is not None, "Variations not saved"
        assert len(created_product["variations"]) == 6, f"Expected 6 variations, got {len(created_product['variations'])}"
        
        # Verify individual prices are different
        variations = created_product["variations"]
        red_s = next((v for v in variations if v["color"] == "Red" and v["size"] == "S"), None)
        red_m = next((v for v in variations if v["color"] == "Red" and v["size"] == "M"), None)
        red_l = next((v for v in variations if v["color"] == "Red" and v["size"] == "L"), None)
        
        assert red_s is not None, "Red-S variation not found"
        assert red_m is not None, "Red-M variation not found"
        assert red_l is not None, "Red-L variation not found"
        
        assert red_s["price"] == 1000, f"Red-S price should be 1000, got {red_s['price']}"
        assert red_m["price"] == 1100, f"Red-M price should be 1100, got {red_m['price']}"
        assert red_l["price"] == 1200, f"Red-L price should be 1200, got {red_l['price']}"
        
        print(f"✅ Individual prices verified: Red-S=1000, Red-M=1100, Red-L=1200")
        
        return product_id
    
    def test_get_product_with_variations(self, auth_headers):
        """Test retrieving a product and verifying variations are loaded correctly"""
        # First create a product
        unique_id = uuid.uuid4().hex[:8]
        product_data = {
            "name": f"TEST_Get_Variation_{unique_id}",
            "description": "Test product for GET verification",
            "price": 500.0,
            "category": "clothes",
            "image_url": "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400",
            "stock": 100,
            "sizes": ["S", "M"],
            "colors": ["Red", "Blue"],
            "variations": [
                {"color": "Red", "size": "S", "price": 500, "discount_price": 450, "stock": 25, "images": []},
                {"color": "Red", "size": "M", "price": 550, "discount_price": 500, "stock": 25, "images": []},
                {"color": "Blue", "size": "S", "price": 500, "discount_price": 450, "stock": 25, "images": []},
                {"color": "Blue", "size": "M", "price": 550, "discount_price": 500, "stock": 25, "images": []}
            ]
        }
        
        create_response = requests.post(f"{BASE_URL}/api/products", json=product_data, headers=auth_headers)
        assert create_response.status_code == 200
        product_id = create_response.json()["product_id"]
        
        # Now GET the product
        get_response = requests.get(f"{BASE_URL}/api/products/{product_id}")
        assert get_response.status_code == 200, f"GET product failed: {get_response.text}"
        
        product = get_response.json()
        
        # Verify variations are present
        assert product.get("variations") is not None, "Variations not returned in GET"
        assert len(product["variations"]) == 4, f"Expected 4 variations, got {len(product['variations'])}"
        
        # Verify each variation has required fields
        for variation in product["variations"]:
            assert "color" in variation, "Variation missing 'color' field"
            assert "size" in variation, "Variation missing 'size' field"
            assert "price" in variation, "Variation missing 'price' field"
            assert "stock" in variation, "Variation missing 'stock' field"
        
        print(f"✅ GET product with variations successful, {len(product['variations'])} variations loaded")
        
        return product_id
    
    def test_update_product_variations(self, auth_headers):
        """Test updating a product's variation prices"""
        # Create product first
        unique_id = uuid.uuid4().hex[:8]
        product_data = {
            "name": f"TEST_Update_Variation_{unique_id}",
            "description": "Test product for UPDATE verification",
            "price": 600.0,
            "category": "clothes",
            "image_url": "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400",
            "stock": 100,
            "sizes": ["S", "M"],
            "colors": ["Red"],
            "variations": [
                {"color": "Red", "size": "S", "price": 600, "discount_price": None, "stock": 50, "images": []},
                {"color": "Red", "size": "M", "price": 650, "discount_price": None, "stock": 50, "images": []}
            ]
        }
        
        create_response = requests.post(f"{BASE_URL}/api/products", json=product_data, headers=auth_headers)
        assert create_response.status_code == 200
        product_id = create_response.json()["product_id"]
        
        # Update with new prices
        updated_data = product_data.copy()
        updated_data["variations"] = [
            {"color": "Red", "size": "S", "price": 700, "discount_price": 650, "stock": 40, "images": []},
            {"color": "Red", "size": "M", "price": 750, "discount_price": 700, "stock": 60, "images": []}
        ]
        
        update_response = requests.put(f"{BASE_URL}/api/products/{product_id}", json=updated_data, headers=auth_headers)
        assert update_response.status_code == 200, f"Update failed: {update_response.text}"
        
        # Verify update by GET
        get_response = requests.get(f"{BASE_URL}/api/products/{product_id}")
        assert get_response.status_code == 200
        
        updated_product = get_response.json()
        variations = updated_product.get("variations", [])
        
        red_s = next((v for v in variations if v["color"] == "Red" and v["size"] == "S"), None)
        red_m = next((v for v in variations if v["color"] == "Red" and v["size"] == "M"), None)
        
        assert red_s is not None, "Red-S variation not found after update"
        assert red_s["price"] == 700, f"Red-S price should be 700 after update, got {red_s['price']}"
        assert red_s["discount_price"] == 650, f"Red-S discount_price should be 650, got {red_s['discount_price']}"
        
        assert red_m is not None, "Red-M variation not found after update"
        assert red_m["price"] == 750, f"Red-M price should be 750 after update, got {red_m['price']}"
        
        print(f"✅ Product variations updated successfully: Red-S=700, Red-M=750")
        
        return product_id


class TestVariationDataIntegrity:
    """Test data integrity for variations"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        return response.json()["token"]
    
    @pytest.fixture(scope="class")
    def auth_headers(self, auth_token):
        return {
            "Authorization": f"Bearer {auth_token}",
            "Content-Type": "application/json"
        }
    
    def test_variation_stock_tracking(self, auth_headers):
        """Test that each variation has independent stock"""
        unique_id = uuid.uuid4().hex[:8]
        product_data = {
            "name": f"TEST_Stock_Variation_{unique_id}",
            "description": "Test stock tracking per variation",
            "price": 800.0,
            "category": "clothes",
            "image_url": "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400",
            "stock": 100,
            "sizes": ["S", "M", "L"],
            "colors": ["Red", "Blue"],
            "variations": [
                {"color": "Red", "size": "S", "price": 800, "stock": 5, "images": []},
                {"color": "Red", "size": "M", "price": 850, "stock": 10, "images": []},
                {"color": "Red", "size": "L", "price": 900, "stock": 0, "images": []},  # Out of stock
                {"color": "Blue", "size": "S", "price": 800, "stock": 15, "images": []},
                {"color": "Blue", "size": "M", "price": 850, "stock": 20, "images": []},
                {"color": "Blue", "size": "L", "price": 900, "stock": 8, "images": []}
            ]
        }
        
        response = requests.post(f"{BASE_URL}/api/products", json=product_data, headers=auth_headers)
        assert response.status_code == 200
        
        product = response.json()
        variations = product.get("variations", [])
        
        # Verify different stock levels
        red_l = next((v for v in variations if v["color"] == "Red" and v["size"] == "L"), None)
        blue_m = next((v for v in variations if v["color"] == "Blue" and v["size"] == "M"), None)
        
        assert red_l is not None
        assert red_l["stock"] == 0, f"Red-L should be out of stock (0), got {red_l['stock']}"
        
        assert blue_m is not None
        assert blue_m["stock"] == 20, f"Blue-M stock should be 20, got {blue_m['stock']}"
        
        print(f"✅ Stock tracking per variation verified: Red-L=0 (out of stock), Blue-M=20")
    
    def test_variation_discount_prices(self, auth_headers):
        """Test that discount prices are saved correctly per variation"""
        unique_id = uuid.uuid4().hex[:8]
        product_data = {
            "name": f"TEST_Discount_Variation_{unique_id}",
            "description": "Test discount prices per variation",
            "price": 1000.0,
            "category": "clothes",
            "image_url": "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400",
            "stock": 100,
            "sizes": ["S", "M"],
            "colors": ["Red"],
            "variations": [
                {"color": "Red", "size": "S", "price": 1000, "discount_price": 800, "stock": 50, "images": []},  # 20% off
                {"color": "Red", "size": "M", "price": 1100, "discount_price": 990, "stock": 50, "images": []}   # 10% off
            ]
        }
        
        response = requests.post(f"{BASE_URL}/api/products", json=product_data, headers=auth_headers)
        assert response.status_code == 200
        
        product = response.json()
        variations = product.get("variations", [])
        
        red_s = next((v for v in variations if v["color"] == "Red" and v["size"] == "S"), None)
        red_m = next((v for v in variations if v["color"] == "Red" and v["size"] == "M"), None)
        
        assert red_s["discount_price"] == 800, f"Red-S discount should be 800, got {red_s['discount_price']}"
        assert red_m["discount_price"] == 990, f"Red-M discount should be 990, got {red_m['discount_price']}"
        
        print(f"✅ Discount prices per variation verified: Red-S=800 (20% off), Red-M=990 (10% off)")


class TestExistingProductWithVariations:
    """Test loading existing products with variations"""
    
    def test_get_existing_product_with_variations(self):
        """Test that existing products with variations load correctly"""
        # Get products list
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        
        products = response.json()
        
        # Find a product with variations
        product_with_variations = None
        for product in products:
            if product.get("variations") and len(product["variations"]) > 0:
                product_with_variations = product
                break
        
        if product_with_variations:
            product_id = product_with_variations["product_id"]
            
            # GET the specific product
            get_response = requests.get(f"{BASE_URL}/api/products/{product_id}")
            assert get_response.status_code == 200
            
            product = get_response.json()
            
            # Verify variations structure
            assert "variations" in product
            assert len(product["variations"]) > 0
            
            # Check first variation has required fields
            first_var = product["variations"][0]
            assert "color" in first_var or "size" in first_var, "Variation missing color/size"
            assert "price" in first_var, "Variation missing price"
            assert "stock" in first_var, "Variation missing stock"
            
            print(f"✅ Existing product '{product['name']}' loaded with {len(product['variations'])} variations")
        else:
            print("⚠️ No existing products with variations found - skipping test")
            pytest.skip("No products with variations in database")


class TestCleanup:
    """Cleanup test data"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["token"]
        return None
    
    @pytest.fixture(scope="class")
    def auth_headers(self, auth_token):
        if auth_token:
            return {
                "Authorization": f"Bearer {auth_token}",
                "Content-Type": "application/json"
            }
        return {}
    
    def test_cleanup_test_products(self, auth_headers):
        """Clean up TEST_ prefixed products"""
        if not auth_headers:
            pytest.skip("No auth token available")
        
        # Get all products
        response = requests.get(f"{BASE_URL}/api/products")
        if response.status_code != 200:
            pytest.skip("Could not fetch products")
        
        products = response.json()
        deleted_count = 0
        
        for product in products:
            if product.get("name", "").startswith("TEST_"):
                delete_response = requests.delete(
                    f"{BASE_URL}/api/products/{product['product_id']}", 
                    headers=auth_headers
                )
                if delete_response.status_code == 200:
                    deleted_count += 1
        
        print(f"✅ Cleaned up {deleted_count} test products")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
