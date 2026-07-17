"""
Test suite for Multi-level Categories feature
Tests:
- GET /api/categories returns subcategory_count and product_count
- POST /api/admin/categories creates categories with parent_id
- Multi-level nesting (subcategory within subcategory)
- PUT /api/admin/categories/{id} updates category
- DELETE /api/admin/categories/{id} deletes category
"""

import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestCategoriesMultiLevel:
    """Test multi-level categories feature"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup - login as admin and get token"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login as admin
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@gojuniors.com",
            "password": "admin123"
        })
        
        if login_response.status_code == 200:
            token = login_response.json().get("token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
            self.token = token
        else:
            pytest.skip("Admin login failed - skipping authenticated tests")
        
        # Store created category IDs for cleanup
        self.created_categories = []
        
        yield
        
        # Cleanup - delete created categories in reverse order (children first)
        for cat_id in reversed(self.created_categories):
            try:
                self.session.delete(f"{BASE_URL}/api/admin/categories/{cat_id}")
            except:
                pass
    
    def test_get_categories_returns_counts(self):
        """Test GET /api/categories returns subcategory_count and product_count"""
        response = self.session.get(f"{BASE_URL}/api/categories")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        categories = response.json()
        assert isinstance(categories, list), "Categories should be a list"
        
        if len(categories) > 0:
            cat = categories[0]
            # Check that counts are present
            assert "subcategory_count" in cat, "subcategory_count field missing"
            assert "product_count" in cat, "product_count field missing"
            assert isinstance(cat["subcategory_count"], int), "subcategory_count should be int"
            assert isinstance(cat["product_count"], int), "product_count should be int"
            print(f"✓ Category '{cat.get('name')}' has subcategory_count={cat['subcategory_count']}, product_count={cat['product_count']}")
    
    def test_create_main_category(self):
        """Test creating a main category (no parent)"""
        payload = {
            "name": "TEST_MainCategory",
            "icon": "🧪",
            "image_url": None,
            "parent_id": None
        }
        
        response = self.session.post(f"{BASE_URL}/api/admin/categories", json=payload)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "category_id" in data or "id" in data, "Response should contain category_id or id"
        assert data["name"] == "TEST_MainCategory"
        assert data["parent_id"] is None, "Main category should have null parent_id"
        
        cat_id = data.get("category_id") or data.get("id")
        self.created_categories.append(cat_id)
        print(f"✓ Created main category: {cat_id}")
        
        return cat_id
    
    def test_create_subcategory_level_1(self):
        """Test creating a subcategory (level 1)"""
        # First create parent
        parent_payload = {
            "name": "TEST_ParentCat",
            "icon": "📁",
            "image_url": None,
            "parent_id": None
        }
        parent_response = self.session.post(f"{BASE_URL}/api/admin/categories", json=parent_payload)
        assert parent_response.status_code == 200
        parent_id = parent_response.json().get("category_id") or parent_response.json().get("id")
        self.created_categories.append(parent_id)
        
        # Create subcategory
        sub_payload = {
            "name": "TEST_SubCategory1",
            "icon": "📂",
            "image_url": None,
            "parent_id": parent_id
        }
        
        response = self.session.post(f"{BASE_URL}/api/admin/categories", json=sub_payload)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["parent_id"] == parent_id, f"Subcategory should have parent_id={parent_id}"
        
        sub_id = data.get("category_id") or data.get("id")
        self.created_categories.append(sub_id)
        print(f"✓ Created subcategory: {sub_id} under parent: {parent_id}")
        
        # Verify parent now has subcategory_count > 0
        cats_response = self.session.get(f"{BASE_URL}/api/categories")
        cats = cats_response.json()
        parent_cat = next((c for c in cats if (c.get("category_id") or c.get("id")) == parent_id), None)
        
        assert parent_cat is not None, "Parent category should exist"
        assert parent_cat["subcategory_count"] >= 1, f"Parent should have subcategory_count >= 1, got {parent_cat['subcategory_count']}"
        print(f"✓ Parent category subcategory_count = {parent_cat['subcategory_count']}")
    
    def test_create_subcategory_level_2_multilevel(self):
        """Test creating a subcategory within a subcategory (multi-level nesting)"""
        # Create level 0 (main category)
        main_payload = {
            "name": "TEST_Level0",
            "icon": "🏠",
            "image_url": None,
            "parent_id": None
        }
        main_response = self.session.post(f"{BASE_URL}/api/admin/categories", json=main_payload)
        assert main_response.status_code == 200
        level0_id = main_response.json().get("category_id") or main_response.json().get("id")
        self.created_categories.append(level0_id)
        
        # Create level 1 (subcategory)
        level1_payload = {
            "name": "TEST_Level1",
            "icon": "📁",
            "image_url": None,
            "parent_id": level0_id
        }
        level1_response = self.session.post(f"{BASE_URL}/api/admin/categories", json=level1_payload)
        assert level1_response.status_code == 200
        level1_id = level1_response.json().get("category_id") or level1_response.json().get("id")
        self.created_categories.append(level1_id)
        
        # Create level 2 (sub-subcategory) - THIS IS THE MULTI-LEVEL TEST
        level2_payload = {
            "name": "TEST_Level2",
            "icon": "📂",
            "image_url": None,
            "parent_id": level1_id  # Parent is level1, not level0
        }
        level2_response = self.session.post(f"{BASE_URL}/api/admin/categories", json=level2_payload)
        
        assert level2_response.status_code == 200, f"Expected 200, got {level2_response.status_code}: {level2_response.text}"
        
        level2_data = level2_response.json()
        assert level2_data["parent_id"] == level1_id, f"Level2 should have parent_id={level1_id}"
        
        level2_id = level2_data.get("category_id") or level2_data.get("id")
        self.created_categories.append(level2_id)
        
        print(f"✓ Created multi-level hierarchy: {level0_id} -> {level1_id} -> {level2_id}")
        
        # Verify the hierarchy in GET /categories
        cats_response = self.session.get(f"{BASE_URL}/api/categories")
        cats = cats_response.json()
        
        level0_cat = next((c for c in cats if (c.get("category_id") or c.get("id")) == level0_id), None)
        level1_cat = next((c for c in cats if (c.get("category_id") or c.get("id")) == level1_id), None)
        level2_cat = next((c for c in cats if (c.get("category_id") or c.get("id")) == level2_id), None)
        
        assert level0_cat is not None, "Level 0 category should exist"
        assert level1_cat is not None, "Level 1 category should exist"
        assert level2_cat is not None, "Level 2 category should exist"
        
        assert level1_cat["parent_id"] == level0_id, "Level 1 parent should be Level 0"
        assert level2_cat["parent_id"] == level1_id, "Level 2 parent should be Level 1"
        
        print(f"✓ Multi-level nesting verified: Level0 has {level0_cat['subcategory_count']} direct subcategories")
    
    def test_update_category(self):
        """Test updating a category"""
        # Create a category first
        create_payload = {
            "name": "TEST_ToUpdate",
            "icon": "🔧",
            "image_url": None,
            "parent_id": None
        }
        create_response = self.session.post(f"{BASE_URL}/api/admin/categories", json=create_payload)
        assert create_response.status_code == 200
        cat_id = create_response.json().get("category_id") or create_response.json().get("id")
        self.created_categories.append(cat_id)
        
        # Update the category
        update_payload = {
            "name": "TEST_Updated",
            "icon": "✅",
            "image_url": None,
            "parent_id": None
        }
        
        update_response = self.session.put(f"{BASE_URL}/api/admin/categories/{cat_id}", json=update_payload)
        
        assert update_response.status_code == 200, f"Expected 200, got {update_response.status_code}: {update_response.text}"
        
        # Verify update
        cats_response = self.session.get(f"{BASE_URL}/api/categories")
        cats = cats_response.json()
        updated_cat = next((c for c in cats if (c.get("category_id") or c.get("id")) == cat_id), None)
        
        assert updated_cat is not None, "Updated category should exist"
        assert updated_cat["name"] == "TEST_Updated", f"Name should be updated, got {updated_cat['name']}"
        assert updated_cat["icon"] == "✅", f"Icon should be updated, got {updated_cat['icon']}"
        
        print(f"✓ Category updated successfully: {cat_id}")
    
    def test_delete_category(self):
        """Test deleting a category"""
        # Create a category first
        create_payload = {
            "name": "TEST_ToDelete",
            "icon": "🗑️",
            "image_url": None,
            "parent_id": None
        }
        create_response = self.session.post(f"{BASE_URL}/api/admin/categories", json=create_payload)
        assert create_response.status_code == 200
        cat_id = create_response.json().get("category_id") or create_response.json().get("id")
        
        # Delete the category
        delete_response = self.session.delete(f"{BASE_URL}/api/admin/categories/{cat_id}")
        
        assert delete_response.status_code == 200, f"Expected 200, got {delete_response.status_code}: {delete_response.text}"
        
        # Verify deletion
        cats_response = self.session.get(f"{BASE_URL}/api/categories")
        cats = cats_response.json()
        deleted_cat = next((c for c in cats if (c.get("category_id") or c.get("id")) == cat_id), None)
        
        assert deleted_cat is None, "Deleted category should not exist"
        
        print(f"✓ Category deleted successfully: {cat_id}")
    
    def test_category_response_structure(self):
        """Test that category response has all required fields"""
        response = self.session.get(f"{BASE_URL}/api/categories")
        
        assert response.status_code == 200
        
        categories = response.json()
        if len(categories) > 0:
            cat = categories[0]
            
            # Required fields
            required_fields = ["name", "icon", "subcategory_count", "product_count"]
            for field in required_fields:
                assert field in cat, f"Field '{field}' missing from category response"
            
            # ID field (either category_id or id)
            assert "category_id" in cat or "id" in cat, "Category should have category_id or id"
            
            # parent_id can be null or string
            assert "parent_id" in cat or cat.get("parent_id") is None, "parent_id field should exist"
            
            print(f"✓ Category response structure is valid")


class TestCategoriesUnauthenticated:
    """Test categories endpoints without authentication"""
    
    def test_get_categories_public(self):
        """Test GET /api/categories is public (no auth required)"""
        response = requests.get(f"{BASE_URL}/api/categories")
        
        assert response.status_code == 200, f"GET /api/categories should be public, got {response.status_code}"
        print("✓ GET /api/categories is publicly accessible")
    
    def test_create_category_requires_auth(self):
        """Test POST /api/admin/categories requires authentication"""
        payload = {
            "name": "TEST_Unauthorized",
            "icon": "🚫",
            "image_url": None,
            "parent_id": None
        }
        
        response = requests.post(f"{BASE_URL}/api/admin/categories", json=payload)
        
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✓ POST /api/admin/categories requires authentication")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
