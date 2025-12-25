import requests
import sys
import json
import os
from datetime import datetime
import uuid

class SkillProofAPITester:
    def __init__(self, base_url="https://skillshare-demo.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_id = None
        self.test_user_email = f"test_user_{datetime.now().strftime('%H%M%S')}@example.com"
        self.test_user_password = "TestPass123!"
        self.test_user_name = f"Test User {datetime.now().strftime('%H%M%S')}"
        self.tests_run = 0
        self.tests_passed = 0
        self.created_post_id = None

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
    def make_request(self, method, endpoint, data=None, files=None, expected_status=200):
        """Make HTTP request with proper headers"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'
        
        if files:
            # Remove Content-Type for multipart/form-data
            headers.pop('Content-Type', None)
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                if files:
                    response = requests.post(url, data=data, files=files, headers=headers)
                else:
                    response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)
            
            success = response.status_code == expected_status
            return success, response
            
        except Exception as e:
            print(f"Request failed: {str(e)}")
            return False, None

    def test_user_registration(self):
        """Test user registration"""
        data = {
            "email": self.test_user_email,
            "password": self.test_user_password,
            "display_name": self.test_user_name,
            "skill_category": "Coding & Programming"
        }
        
        success, response = self.make_request('POST', 'auth/register', data, expected_status=200)
        
        if success and response:
            try:
                result = response.json()
                if 'token' in result and 'user' in result:
                    self.token = result['token']
                    self.user_id = result['user']['id']
                    self.log_test("User Registration", True)
                    return True
                else:
                    self.log_test("User Registration", False, "Missing token or user in response")
                    return False
            except:
                self.log_test("User Registration", False, "Invalid JSON response")
                return False
        else:
            error_msg = response.text if response else "No response"
            self.log_test("User Registration", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            return False

    def test_user_login(self):
        """Test user login"""
        data = {
            "email": self.test_user_email,
            "password": self.test_user_password
        }
        
        success, response = self.make_request('POST', 'auth/login', data, expected_status=200)
        
        if success and response:
            try:
                result = response.json()
                if 'token' in result:
                    self.token = result['token']
                    self.log_test("User Login", True)
                    return True
                else:
                    self.log_test("User Login", False, "Missing token in response")
                    return False
            except:
                self.log_test("User Login", False, "Invalid JSON response")
                return False
        else:
            error_msg = response.text if response else "No response"
            self.log_test("User Login", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            return False

    def test_get_current_user(self):
        """Test getting current user info"""
        success, response = self.make_request('GET', 'auth/me', expected_status=200)
        
        if success and response:
            try:
                user = response.json()
                if 'id' in user and 'email' in user:
                    self.log_test("Get Current User", True)
                    return True
                else:
                    self.log_test("Get Current User", False, "Missing user fields")
                    return False
            except:
                self.log_test("Get Current User", False, "Invalid JSON response")
                return False
        else:
            error_msg = response.text if response else "No response"
            self.log_test("Get Current User", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            return False

    def test_create_post(self):
        """Test creating a post with video upload"""
        # Create a simple test video file (minimal MP4 header)
        test_video_content = b'\x00\x00\x00\x20ftypmp42\x00\x00\x00\x00mp42isom\x00\x00\x00\x08free'
        
        data = {
            'title': 'Test Skill Proof',
            'description': 'This is a test skill demonstration video',
            'skill_category': 'Coding & Programming'
        }
        
        files = {
            'video': ('test_video.mp4', test_video_content, 'video/mp4')
        }
        
        success, response = self.make_request('POST', 'posts', data, files=files, expected_status=200)
        
        if success and response:
            try:
                result = response.json()
                if 'id' in result:
                    self.created_post_id = result['id']
                    self.log_test("Create Post", True)
                    return True
                else:
                    self.log_test("Create Post", False, "Missing post ID in response")
                    return False
            except:
                self.log_test("Create Post", False, "Invalid JSON response")
                return False
        else:
            error_msg = response.text if response else "No response"
            self.log_test("Create Post", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            return False

    def test_get_posts(self):
        """Test getting all posts"""
        success, response = self.make_request('GET', 'posts', expected_status=200)
        
        if success and response:
            try:
                posts = response.json()
                if isinstance(posts, list):
                    self.log_test("Get Posts", True)
                    return True
                else:
                    self.log_test("Get Posts", False, "Response is not a list")
                    return False
            except:
                self.log_test("Get Posts", False, "Invalid JSON response")
                return False
        else:
            error_msg = response.text if response else "No response"
            self.log_test("Get Posts", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            return False

    def test_get_single_post(self):
        """Test getting a single post"""
        if not self.created_post_id:
            self.log_test("Get Single Post", False, "No post ID available")
            return False
            
        success, response = self.make_request('GET', f'posts/{self.created_post_id}', expected_status=200)
        
        if success and response:
            try:
                post = response.json()
                if 'id' in post and 'title' in post:
                    self.log_test("Get Single Post", True)
                    return True
                else:
                    self.log_test("Get Single Post", False, "Missing post fields")
                    return False
            except:
                self.log_test("Get Single Post", False, "Invalid JSON response")
                return False
        else:
            error_msg = response.text if response else "No response"
            self.log_test("Get Single Post", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            return False

    def test_validate_post(self):
        """Test validating a post"""
        if not self.created_post_id:
            self.log_test("Validate Post", False, "No post ID available")
            return False
            
        success, response = self.make_request('POST', f'posts/{self.created_post_id}/validate', expected_status=200)
        
        if success and response:
            try:
                result = response.json()
                if 'message' in result:
                    self.log_test("Validate Post", True)
                    return True
                else:
                    self.log_test("Validate Post", False, "Missing message in response")
                    return False
            except:
                self.log_test("Validate Post", False, "Invalid JSON response")
                return False
        else:
            error_msg = response.text if response else "No response"
            self.log_test("Validate Post", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            return False

    def test_duplicate_validation(self):
        """Test that duplicate validation is prevented"""
        if not self.created_post_id:
            self.log_test("Duplicate Validation Prevention", False, "No post ID available")
            return False
            
        success, response = self.make_request('POST', f'posts/{self.created_post_id}/validate', expected_status=400)
        
        if success:
            self.log_test("Duplicate Validation Prevention", True)
            return True
        else:
            self.log_test("Duplicate Validation Prevention", False, f"Expected 400, got {response.status_code if response else 'None'}")
            return False

    def test_get_user_profile(self):
        """Test getting user profile"""
        if not self.user_id:
            self.log_test("Get User Profile", False, "No user ID available")
            return False
            
        success, response = self.make_request('GET', f'users/{self.user_id}', expected_status=200)
        
        if success and response:
            try:
                user = response.json()
                if 'id' in user and 'display_name' in user and 'posts_count' in user:
                    self.log_test("Get User Profile", True)
                    return True
                else:
                    self.log_test("Get User Profile", False, "Missing user profile fields")
                    return False
            except:
                self.log_test("Get User Profile", False, "Invalid JSON response")
                return False
        else:
            error_msg = response.text if response else "No response"
            self.log_test("Get User Profile", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            return False

    def test_get_skill_categories(self):
        """Test getting skill categories"""
        success, response = self.make_request('GET', 'skill-categories', expected_status=200)
        
        if success and response:
            try:
                result = response.json()
                if 'categories' in result and isinstance(result['categories'], list):
                    self.log_test("Get Skill Categories", True)
                    return True
                else:
                    self.log_test("Get Skill Categories", False, "Missing categories or not a list")
                    return False
            except:
                self.log_test("Get Skill Categories", False, "Invalid JSON response")
                return False
        else:
            error_msg = response.text if response else "No response"
            self.log_test("Get Skill Categories", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            return False

    def test_search_posts(self):
        """Test searching posts"""
        success, response = self.make_request('GET', 'posts/search?query=test', expected_status=200)
        
        if success and response:
            try:
                posts = response.json()
                if isinstance(posts, list):
                    self.log_test("Search Posts", True)
                    return True
                else:
                    self.log_test("Search Posts", False, "Response is not a list")
                    return False
            except:
                self.log_test("Search Posts", False, "Invalid JSON response")
                return False
        else:
            error_msg = response.text if response else "No response"
            self.log_test("Search Posts", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            return False

    def test_filter_posts_by_category(self):
        """Test filtering posts by skill category"""
        success, response = self.make_request('GET', 'posts/search?skill_category=Coding & Programming', expected_status=200)
        
        if success and response:
            try:
                posts = response.json()
                if isinstance(posts, list):
                    self.log_test("Filter Posts by Category", True)
                    return True
                else:
                    self.log_test("Filter Posts by Category", False, "Response is not a list")
                    return False
            except:
                self.log_test("Filter Posts by Category", False, "Invalid JSON response")
                return False
        else:
            error_msg = response.text if response else "No response"
            self.log_test("Filter Posts by Category", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            return False

    def test_get_leaderboard(self):
        """Test getting leaderboard"""
        success, response = self.make_request('GET', 'leaderboard', expected_status=200)
        
        if success and response:
            try:
                users = response.json()
                if isinstance(users, list):
                    self.log_test("Get Leaderboard", True)
                    return True
                else:
                    self.log_test("Get Leaderboard", False, "Response is not a list")
                    return False
            except:
                self.log_test("Get Leaderboard", False, "Invalid JSON response")
                return False
        else:
            error_msg = response.text if response else "No response"
            self.log_test("Get Leaderboard", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            return False

    def test_upload_avatar(self):
        """Test uploading user avatar"""
        # Create a simple test image file (minimal PNG header)
        test_image_content = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde'
        
        files = {
            'avatar': ('test_avatar.png', test_image_content, 'image/png')
        }
        
        success, response = self.make_request('POST', 'users/avatar', files=files, expected_status=200)
        
        if success and response:
            try:
                result = response.json()
                if 'avatar_url' in result and 'message' in result:
                    self.log_test("Upload Avatar", True)
                    return True
                else:
                    self.log_test("Upload Avatar", False, "Missing avatar_url or message in response")
                    return False
            except:
                self.log_test("Upload Avatar", False, "Invalid JSON response")
                return False
        else:
            error_msg = response.text if response else "No response"
            self.log_test("Upload Avatar", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            return False

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting SkillProof API Tests...")
        print(f"Testing against: {self.base_url}")
        print("=" * 50)
        
        # Test skill categories first
        self.test_get_skill_categories()
        
        # Test authentication flow
        if not self.test_user_registration():
            print("❌ Registration failed, stopping tests")
            return False
            
        if not self.test_user_login():
            print("❌ Login failed, stopping tests")
            return False
            
        if not self.test_get_current_user():
            print("❌ Get current user failed")
            
        # Test avatar upload
        self.test_upload_avatar()
            
        # Test post creation and retrieval
        if not self.test_create_post():
            print("❌ Post creation failed, skipping post-related tests")
        else:
            self.test_get_single_post()
            self.test_validate_post()
            self.test_duplicate_validation()
            
        # Test feed and user endpoints
        self.test_get_posts()
        self.test_get_user_profile()
        self.test_get_user_posts()
        
        # Test new search and filter features
        self.test_search_posts()
        self.test_filter_posts_by_category()
        
        # Test leaderboard
        self.test_get_leaderboard()
        
        # Print results
        print("=" * 50)
        print(f"📊 Tests completed: {self.tests_passed}/{self.tests_run} passed")
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"📈 Success rate: {success_rate:.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    tester = SkillProofAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())