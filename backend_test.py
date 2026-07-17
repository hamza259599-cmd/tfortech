import requests
import sys
import json
from datetime import datetime

class GOJUNIORSAPITester:
    def __init__(self, base_url="https://gojuniors-ecom-test.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)
        
        if self.token and 'Authorization' not in test_headers:
            test_headers['Authorization'] = f'Bearer {self.token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if not success:
                details += f", Expected: {expected_status}"
                try:
                    error_data = response.json()
                    details += f", Error: {error_data.get('detail', 'Unknown error')}"
                except:
                    details += f", Response: {response.text[:100]}"

            self.log_test(name, success, details)
            return success, response.json() if success and response.content else {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_seed_data(self):
        """Test seeding initial data"""
        print("\n🌱 Testing Data Seeding...")
        success, response = self.run_test(
            "Seed Data",
            "POST",
            "seed",
            200
        )
        return success

    def test_categories(self):
        """Test categories endpoint"""
        print("\n📂 Testing Categories...")
        success, response = self.run_test(
            "Get Categories",
            "GET",
            "categories",
            200
        )
        if success and len(response) >= 3:
            self.log_test("Categories Count", True, f"Found {len(response)} categories")
        elif success:
            self.log_test("Categories Count", False, f"Expected 3+ categories, got {len(response)}")
        return success

    def test_products(self):
        """Test product endpoints"""
        print("\n📦 Testing Products...")
        
        # Get all products
        success, products = self.run_test(
            "Get All Products",
            "GET",
            "products",
            200
        )
        
        if not success:
            return False
            
        # Get featured products
        self.run_test(
            "Get Featured Products",
            "GET",
            "products/featured",
            200
        )
        
        # Test category filtering
        self.run_test(
            "Get Products by Category",
            "GET",
            "products?category=clothes",
            200
        )
        
        # Test search
        self.run_test(
            "Search Products",
            "GET",
            "products?search=shirt",
            200
        )
        
        # Get single product (if products exist)
        if products and len(products) > 0:
            product_id = products[0]['product_id']
            self.run_test(
                "Get Single Product",
                "GET",
                f"products/{product_id}",
                200
            )
            return product_id
        
        return None

    def test_user_registration(self):
        """Test user registration"""
        print("\n👤 Testing User Registration...")
        
        test_user_data = {
            "name": "Test User",
            "email": f"test_{datetime.now().strftime('%H%M%S')}@test.com",
            "password": "testpass123"
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            test_user_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.log_test("Registration Token", True, "Token received")
            return test_user_data
        else:
            self.log_test("Registration Token", False, "No token in response")
            return None

    def test_admin_login(self):
        """Test admin login"""
        print("\n🔐 Testing Admin Login...")
        
        admin_data = {
            "email": "admin@gojuniors.com",
            "password": "admin123"
        }
        
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            admin_data
        )
        
        if success and 'token' in response:
            self.admin_token = response['token']
            self.log_test("Admin Token", True, "Admin token received")
            self.log_test("Admin Flag", response.get('is_admin', False), f"is_admin: {response.get('is_admin')}")
            return True
        else:
            self.log_test("Admin Token", False, "No admin token received")
            return False

    def test_auth_endpoints(self):
        """Test authentication endpoints"""
        print("\n🔑 Testing Auth Endpoints...")
        
        # Test /auth/me
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )
        
        if success:
            self.log_test("User Data", True, f"User: {response.get('name', 'Unknown')}")
        
        return success

    def test_cart_operations(self, product_id):
        """Test cart operations"""
        print("\n🛒 Testing Cart Operations...")
        
        if not product_id:
            self.log_test("Cart Test Skipped", False, "No product ID available")
            return False
        
        # Get empty cart
        self.run_test(
            "Get Empty Cart",
            "GET",
            "cart",
            200
        )
        
        # Add to cart
        cart_item = {
            "product_id": product_id,
            "quantity": 2,
            "size": "4-5Y"
        }
        
        success, response = self.run_test(
            "Add to Cart",
            "POST",
            "cart/add",
            200,
            cart_item
        )
        
        if success:
            # Get cart with items
            success, cart = self.run_test(
                "Get Cart with Items",
                "GET",
                "cart",
                200
            )
            
            if success and cart.get('items'):
                self.log_test("Cart Items", True, f"Found {len(cart['items'])} items")
                
                # Update quantity
                self.run_test(
                    "Update Cart Quantity",
                    "PUT",
                    f"cart/{product_id}",
                    200,
                    {"product_id": product_id, "quantity": 3}
                )
                
                # Remove from cart
                self.run_test(
                    "Remove from Cart",
                    "DELETE",
                    f"cart/{product_id}",
                    200
                )
                
                return True
        
        return False

    def test_order_creation(self, product_id):
        """Test order creation"""
        print("\n📋 Testing Order Creation...")
        
        if not product_id:
            self.log_test("Order Test Skipped", False, "No product ID available")
            return None
        
        # Add item to cart first
        cart_item = {
            "product_id": product_id,
            "quantity": 1,
            "size": "4-5Y"
        }
        
        self.run_test(
            "Add Item for Order",
            "POST",
            "cart/add",
            200,
            cart_item
        )
        
        # Create order
        order_data = {
            "items": [cart_item],
            "shipping_address": "Test Address 123",
            "city": "Test City",
            "phone": "03001234567",
            "payment_method": "cod",
            "total_amount": 25.99
        }
        
        success, response = self.run_test(
            "Create Order",
            "POST",
            "orders",
            200,
            order_data
        )
        
        if success and 'order_id' in response:
            order_id = response['order_id']
            self.log_test("Order ID", True, f"Order created: {order_id}")
            
            # Get user orders
            self.run_test(
                "Get User Orders",
                "GET",
                "orders",
                200
            )
            
            # Get specific order
            self.run_test(
                "Get Specific Order",
                "GET",
                f"orders/{order_id}",
                200
            )
            
            return order_id
        
        return None

    def test_admin_endpoints(self):
        """Test admin endpoints"""
        print("\n👑 Testing Admin Endpoints...")
        
        if not self.admin_token:
            self.log_test("Admin Tests Skipped", False, "No admin token available")
            return False
        
        # Switch to admin token
        old_token = self.token
        self.token = self.admin_token
        
        # Get admin stats
        success, stats = self.run_test(
            "Get Admin Stats",
            "GET",
            "admin/stats",
            200
        )
        
        if success:
            self.log_test("Stats Data", True, f"Orders: {stats.get('total_orders', 0)}, Products: {stats.get('total_products', 0)}")
        
        # Get admin products
        self.run_test(
            "Get Admin Products",
            "GET",
            "admin/products",
            200
        )
        
        # Get admin orders
        self.run_test(
            "Get Admin Orders",
            "GET",
            "admin/orders",
            200
        )
        
        # Test product creation
        new_product = {
            "name": "Test Product",
            "description": "Test product description",
            "price": 19.99,
            "category": "toys",
            "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
            "stock": 10,
            "ages": "3+ years"
        }
        
        success, response = self.run_test(
            "Create Product",
            "POST",
            "products",
            200,
            new_product
        )
        
        created_product_id = None
        if success and 'product_id' in response:
            created_product_id = response['product_id']
            self.log_test("Product Created", True, f"Product ID: {created_product_id}")
            
            # Test product update
            updated_product = new_product.copy()
            updated_product['price'] = 24.99
            
            self.run_test(
                "Update Product",
                "PUT",
                f"products/{created_product_id}",
                200,
                updated_product
            )
            
            # Test product deletion
            self.run_test(
                "Delete Product",
                "DELETE",
                f"products/{created_product_id}",
                200
            )
        
        # Restore user token
        self.token = old_token
        return True

    def test_categories_crud(self):
        """Test Categories CRUD operations (Priority High)"""
        print("\n📂 Testing Categories CRUD...")
        
        if not self.admin_token:
            self.log_test("Categories CRUD Skipped", False, "No admin token available")
            return False
        
        # Switch to admin token
        old_token = self.token
        self.token = self.admin_token
        
        # Test creating a new category
        new_category = {
            "name": "Winter Collection",
            "icon": "❄️",
            "image_url": None
        }
        
        success, response = self.run_test(
            "Create Category",
            "POST",
            "admin/categories",
            200,
            new_category
        )
        
        created_category_id = None
        if success and 'id' in response:
            created_category_id = response['id']
            self.log_test("Category Created", True, f"Category ID: {created_category_id}")
            
            # Test updating the category
            updated_category = {
                "name": "Winter Collection Updated",
                "icon": "🌨️",
                "image_url": None
            }
            
            self.run_test(
                "Update Category",
                "PUT",
                f"admin/categories/{created_category_id}",
                200,
                updated_category
            )
            
            # Test deleting the category
            self.run_test(
                "Delete Category",
                "DELETE",
                f"admin/categories/{created_category_id}",
                200
            )
        
        # Restore user token
        self.token = old_token
        return success

    def test_shipping_settings(self):
        """Test Shipping Settings (Priority High)"""
        print("\n🚚 Testing Shipping Settings...")
        
        if not self.admin_token:
            self.log_test("Shipping Settings Skipped", False, "No admin token available")
            return False
        
        # Switch to admin token
        old_token = self.token
        self.token = self.admin_token
        
        # Get current shipping settings
        success, current_settings = self.run_test(
            "Get Shipping Settings",
            "GET",
            "admin/shipping",
            200
        )
        
        if success:
            self.log_test("Shipping Settings Retrieved", True, f"Free shipping minimum: {current_settings.get('free_shipping_minimum', 'N/A')}")
            
            # Update shipping settings
            updated_settings = {
                "free_shipping_minimum": 3000,
                "standard_shipping_fee": 200,
                "express_shipping_fee": 500,
                "delivery_time_standard": "3-5 days",
                "delivery_time_express": "1-2 days"
            }
            
            success, response = self.run_test(
                "Update Shipping Settings",
                "PUT",
                "admin/shipping",
                200,
                updated_settings
            )
            
            if success:
                # Verify the settings were saved
                success, verify_settings = self.run_test(
                    "Verify Shipping Settings",
                    "GET",
                    "admin/shipping",
                    200
                )
                
                if success and verify_settings.get('free_shipping_minimum') == 3000:
                    self.log_test("Shipping Settings Persisted", True, "Settings saved correctly")
                else:
                    self.log_test("Shipping Settings Persisted", False, f"Expected 3000, got {verify_settings.get('free_shipping_minimum')}")
        
        # Restore user token
        self.token = old_token
        return success

    def test_image_upload(self):
        """Test Image Upload API (Priority High)"""
        print("\n🖼️ Testing Image Upload...")
        
        if not self.admin_token:
            self.log_test("Image Upload Skipped", False, "No admin token available")
            return False
        
        # Switch to admin token
        old_token = self.token
        self.token = self.admin_token
        
        # Create a dummy base64 image (1x1 pixel PNG)
        dummy_base64_image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
        
        image_data = {
            "image": dummy_base64_image
        }
        
        success, response = self.run_test(
            "Upload Image",
            "POST",
            "upload/image",
            200,
            image_data
        )
        
        if success and 'image_url' in response:
            image_url = response['image_url']
            image_id = response.get('image_id')
            self.log_test("Image Upload Success", True, f"Image URL: {image_url}")
            
            # Test retrieving the uploaded image
            if image_id:
                # Test the image retrieval endpoint
                url = f"{self.api_url}/images/{image_id}"
                try:
                    import requests
                    response = requests.get(url)
                    if response.status_code == 200:
                        self.log_test("Image Retrieval", True, f"Image retrieved successfully")
                    else:
                        self.log_test("Image Retrieval", False, f"Status: {response.status_code}")
                except Exception as e:
                    self.log_test("Image Retrieval", False, f"Exception: {str(e)}")
        
        # Restore user token
        self.token = old_token
        return success

    def test_stripe_endpoints(self, order_id):
        """Test Stripe payment endpoints"""
        print("\n💳 Testing Stripe Endpoints...")
        
        if not order_id:
            self.log_test("Stripe Tests Skipped", False, "No order ID available")
            return False
        
        # Test checkout session creation
        checkout_data = {
            "order_id": order_id,
            "origin_url": "https://gojuniors-ecom-test.preview.emergentagent.com"
        }
        
        success, response = self.run_test(
            "Create Checkout Session",
            "POST",
            "checkout/create-session",
            200,
            checkout_data
        )
        
        if success and 'session_id' in response:
            session_id = response['session_id']
            self.log_test("Checkout Session", True, f"Session ID: {session_id}")
            
            # Test checkout status
            self.run_test(
                "Get Checkout Status",
                "GET",
                f"checkout/status/{session_id}",
                200
            )
            
            return True
        
        return False

    def test_wishlist_api(self, product_id):
        """Test Wishlist API endpoints (NEW - Priority High)"""
        print("\n❤️ Testing Wishlist API...")
        
        if not product_id:
            self.log_test("Wishlist Tests Skipped", False, "No product ID available")
            return False
        
        if not self.token:
            self.log_test("Wishlist Tests Skipped", False, "No authentication token")
            return False
        
        # Test getting empty wishlist
        success, response = self.run_test(
            "Get Empty Wishlist",
            "GET",
            "wishlist",
            200
        )
        
        if success:
            self.log_test("Empty Wishlist", True, f"Items: {len(response.get('items', []))}")
        
        # Test adding product to wishlist
        wishlist_item = {
            "product_id": product_id
        }
        
        success, response = self.run_test(
            "Add to Wishlist",
            "POST",
            "wishlist/add",
            200,
            wishlist_item
        )
        
        if success:
            # Test checking if product is in wishlist
            success, response = self.run_test(
                "Check Wishlist Status",
                "GET",
                f"wishlist/check/{product_id}",
                200
            )
            
            if success and response.get('in_wishlist'):
                self.log_test("Wishlist Check", True, "Product found in wishlist")
                
                # Test getting wishlist with items
                success, response = self.run_test(
                    "Get Wishlist with Items",
                    "GET",
                    "wishlist",
                    200
                )
                
                if success and len(response.get('items', [])) > 0:
                    self.log_test("Wishlist Items", True, f"Found {len(response['items'])} items")
                    
                    # Test removing from wishlist
                    success, response = self.run_test(
                        "Remove from Wishlist",
                        "POST",
                        "wishlist/remove",
                        200,
                        wishlist_item
                    )
                    
                    if success:
                        # Verify removal
                        success, response = self.run_test(
                            "Verify Wishlist Removal",
                            "GET",
                            f"wishlist/check/{product_id}",
                            200
                        )
                        
                        if success and not response.get('in_wishlist'):
                            self.log_test("Wishlist Removal", True, "Product removed from wishlist")
                            return True
                        else:
                            self.log_test("Wishlist Removal", False, "Product still in wishlist")
                    
                else:
                    self.log_test("Wishlist Items", False, "No items found after adding")
            else:
                self.log_test("Wishlist Check", False, "Product not found in wishlist after adding")
        
        return False

    def test_reviews_api(self, product_id):
        """Test Reviews API endpoints (NEW - Priority High)"""
        print("\n⭐ Testing Reviews API...")
        
        if not product_id:
            self.log_test("Reviews Tests Skipped", False, "No product ID available")
            return False
        
        # Test getting reviews for product (no auth required)
        success, response = self.run_test(
            "Get Product Reviews",
            "GET",
            f"products/{product_id}/reviews",
            200
        )
        
        if success:
            initial_review_count = len(response)
            self.log_test("Initial Reviews", True, f"Found {initial_review_count} reviews")
        else:
            return False
        
        if not self.token:
            self.log_test("Review Creation Skipped", False, "No authentication token")
            return False
        
        # Test adding a review (requires auth)
        review_data = {
            "rating": 5,
            "comment": "Excellent product! My kids love it. Great quality and fast delivery."
        }
        
        success, response = self.run_test(
            "Add Product Review",
            "POST",
            f"products/{product_id}/reviews",
            200,
            review_data
        )
        
        if success and 'review_id' in response:
            review_id = response['review_id']
            self.log_test("Review Created", True, f"Review ID: {review_id}")
            
            # Test getting reviews after adding one
            success, response = self.run_test(
                "Get Reviews After Adding",
                "GET",
                f"products/{product_id}/reviews",
                200
            )
            
            if success and len(response) == initial_review_count + 1:
                self.log_test("Review Count Updated", True, f"Reviews increased to {len(response)}")
                
                # Verify review content
                latest_review = response[0]  # Reviews are sorted by created_at desc
                if (latest_review.get('rating') == 5 and 
                    'Excellent product' in latest_review.get('comment', '')):
                    self.log_test("Review Content", True, "Review content matches")
                else:
                    self.log_test("Review Content", False, "Review content doesn't match")
                
                # Test duplicate review prevention
                success, response = self.run_test(
                    "Prevent Duplicate Review",
                    "POST",
                    f"products/{product_id}/reviews",
                    400,  # Should return 400 for duplicate
                    review_data
                )
                
                if success:  # Success here means we got the expected 400 error
                    self.log_test("Duplicate Prevention", True, "Duplicate review blocked")
                else:
                    self.log_test("Duplicate Prevention", False, "Duplicate review not blocked")
                
                # Test product rating update
                success, product = self.run_test(
                    "Check Product Rating Update",
                    "GET",
                    f"products/{product_id}",
                    200
                )
                
                if success and product.get('rating') is not None:
                    self.log_test("Product Rating Updated", True, f"Rating: {product.get('rating')}")
                    self.log_test("Review Count Updated", True, f"Review count: {product.get('review_count', 0)}")
                    return True
                else:
                    self.log_test("Product Rating Updated", False, "Rating not updated")
            else:
                self.log_test("Review Count Updated", False, f"Expected {initial_review_count + 1}, got {len(response) if success else 'error'}")
        else:
            self.log_test("Review Created", False, "No review ID returned")
        
        return False

    def run_all_tests(self):
        """Run all tests"""
        print("🚀 Starting GOJUNIORS E-commerce API Tests")
        print("=" * 50)
        
        # Test basic endpoints
        self.test_seed_data()
        self.test_categories()
        product_id = self.test_products()
        
        # Test user registration and auth
        user_data = self.test_user_registration()
        if user_data:
            self.test_auth_endpoints()
            self.test_cart_operations(product_id)
            order_id = self.test_order_creation(product_id)
            self.test_stripe_endpoints(order_id)
            
            # Test NEW Daraz-style features (Priority High)
            print("\n🎯 Testing NEW Daraz-style Features...")
            self.test_wishlist_api(product_id)
            self.test_reviews_api(product_id)
        
        # Test admin functionality
        admin_success = self.test_admin_login()
        if admin_success:
            self.test_admin_endpoints()
            
            # Test Priority High Features
            print("\n🎯 Testing Priority High Features...")
            self.test_categories_crud()
            self.test_shipping_settings()
            self.test_image_upload()
        
        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            return 1

def main():
    tester = GOJUNIORSAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())