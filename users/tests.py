from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()


class UserAuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@novamart.com',
            password='testpassword123',
            phone='9876543210',
            address='123 Test St',
            city='Mumbai',
            state='Maharashtra',
            pincode='400001'
        )

    def test_user_creation(self):
        self.assertEqual(self.user.username, 'testuser')
        self.assertEqual(self.user.email, 'test@novamart.com')
        self.assertTrue(self.user.check_password('testpassword123'))
        self.assertEqual(self.user.city, 'Mumbai')

    def test_user_login_api(self):
        response = self.client.post('/api/auth/login/', {
            'username': 'testuser',
            'password': 'testpassword123'
        }, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['success'])

    def test_user_login_invalid(self):
        response = self.client.post('/api/auth/login/', {
            'username': 'testuser',
            'password': 'wrongpassword'
        }, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertFalse(response.data['success'])

    def test_user_registration_api(self):
        response = self.client.post('/api/auth/register/', {
            'username': 'newuser',
            'email': 'newuser@novamart.com',
            'password': 'newpassword123',
            'password2': 'newpassword123',
            'phone': '9123456789'
        }, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertTrue(User.objects.filter(username='newuser').exists())

    def test_user_registration_mismatch_passwords(self):
        response = self.client.post('/api/auth/register/', {
            'username': 'anotheruser',
            'email': 'another@novamart.com',
            'password': 'passwordA123',
            'password2': 'passwordB123',
        }, format='json')
        self.assertEqual(response.status_code, 400)

    def test_user_profile_api(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/auth/profile/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['username'], 'testuser')

        # Update profile
        update_res = self.client.put('/api/auth/profile/', {
            'first_name': 'Tester',
            'city': 'Pune'
        }, format='json')
        self.assertEqual(update_res.status_code, 200)
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, 'Tester')
        self.assertEqual(self.user.city, 'Pune')
