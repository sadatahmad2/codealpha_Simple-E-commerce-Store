from decimal import Decimal
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from store.models import Category, Product, Order, OrderItem, Review

User = get_user_model()


class StoreModuleTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='shopper',
            email='shopper@novamart.com',
            password='shopperpassword123',
            phone='9876543210'
        )

        self.category = Category.objects.create(
            name='Gadgets',
            slug='gadgets',
            description='Smart devices and electronics'
        )

        self.product = Product.objects.create(
            category=self.category,
            name='Nova Wireless Earbuds',
            slug='nova-wireless-earbuds',
            description='Premium noise cancelling audio earbuds',
            short_description='True wireless audio earbuds',
            price=Decimal('2999.00'),
            discount_price=Decimal('1999.00'),
            stock=15,
            is_active=True,
            is_featured=True,
            is_trending=True,
            is_bestseller=True
        )

    def test_product_model_properties(self):
        self.assertEqual(self.product.discount_percent, 33)
        self.assertEqual(self.product.average_rating, 0)

    def test_category_list_api(self):
        response = self.client.get('/api/categories/')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(len(response.data) >= 1)
        self.assertEqual(response.data[0]['slug'], 'gadgets')

    def test_product_list_api(self):
        response = self.client.get('/api/products/')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['count'] >= 1)

    def test_product_detail_api(self):
        response = self.client.get(f'/api/products/{self.product.slug}/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['name'], 'Nova Wireless Earbuds')

    def test_cart_operations(self):
        # 1. Add to cart
        add_res = self.client.post('/api/cart/', {
            'product_id': self.product.id,
            'quantity': 2
        }, format='json')
        self.assertEqual(add_res.status_code, 200)

        # 2. View cart
        get_res = self.client.get('/api/cart/')
        self.assertEqual(get_res.status_code, 200)
        self.assertEqual(len(get_res.data['items']), 1)
        self.assertEqual(get_res.data['items'][0]['quantity'], 2)

        # 3. Update quantity
        put_res = self.client.put('/api/cart/', {
            'product_id': self.product.id,
            'quantity': 3
        }, format='json')
        self.assertEqual(put_res.status_code, 200)

        # 4. Remove item
        del_res = self.client.delete('/api/cart/', {
            'product_id': self.product.id
        }, format='json')
        self.assertEqual(del_res.status_code, 200)

    def test_checkout_and_stock_reduction(self):
        self.client.force_authenticate(user=self.user)

        # Add item to session cart
        self.client.post('/api/cart/', {
            'product_id': self.product.id,
            'quantity': 3
        }, format='json')

        initial_stock = self.product.stock

        # Submit checkout
        checkout_res = self.client.post('/api/checkout/', {
            'full_name': 'Test Shopper',
            'email': 'shopper@novamart.com',
            'phone': '9876543210',
            'shipping_address': '456 Market Lane',
            'city': 'Bangalore',
            'state': 'Karnataka',
            'pincode': '560001',
            'payment_method': 'cod'
        }, format='json')

        self.assertEqual(checkout_res.status_code, 201)
        order_number = checkout_res.data['order_number']
        self.assertTrue(order_number.startswith('NM'))

        # Check stock reduced by 3
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, initial_stock - 3)

        # Check order exists in database
        order = Order.objects.get(order_number=order_number)
        self.assertEqual(order.user, self.user)
        self.assertEqual(order.items.count(), 1)
        self.assertEqual(order.payment_method, 'cod')

    def test_reviews_api(self):
        self.client.force_authenticate(user=self.user)
        res = self.client.post('/api/reviews/create/', {
            'product_id': self.product.id,
            'rating': 5,
            'comment': 'Outstanding audio quality and comfortable fit!'
        }, format='json')
        self.assertEqual(res.status_code, 201)
        self.assertEqual(Review.objects.filter(product=self.product).count(), 1)
        self.product.refresh_from_db()
        self.assertEqual(self.product.average_rating, 5.0)

    def test_pages_render_html(self):
        # Home
        res = self.client.get('/')
        self.assertEqual(res.status_code, 200)

        # Products Listing
        res = self.client.get('/products/')
        self.assertEqual(res.status_code, 200)

        # Product Detail
        res = self.client.get(f'/products/{self.product.slug}/')
        self.assertEqual(res.status_code, 200)

        # Cart
        res = self.client.get('/cart/')
        self.assertEqual(res.status_code, 200)

        # Login page
        res = self.client.get('/login/')
        self.assertEqual(res.status_code, 200)

        # Register page
        res = self.client.get('/register/')
        self.assertEqual(res.status_code, 200)
