from decimal import Decimal

from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import get_object_or_404, render
from django.views import View
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Category, Order, OrderItem, Product, Review
from .serializers import (CategorySerializer, OrderSerializer, ProductSerializer,
                           ReviewSerializer)


# ─── Template Views ──────────────────────────────────────────────────────────

class HomeView(View):
    def get(self, request):
        featured = Product.objects.filter(is_featured=True, is_active=True)[:8]
        trending = Product.objects.filter(is_trending=True, is_active=True)[:8]
        bestsellers = Product.objects.filter(is_bestseller=True, is_active=True)[:8]
        categories = Category.objects.all()
        context = {
            'featured_products': featured,
            'trending_products': trending,
            'bestseller_products': bestsellers,
            'categories': categories,
        }
        return render(request, 'store/home.html', context)


class ProductListView(View):
    def get(self, request):
        categories = Category.objects.all()
        return render(request, 'store/products.html', {'categories': categories})


class ProductDetailView(View):
    def get(self, request, slug):
        product = get_object_or_404(Product, slug=slug, is_active=True)
        reviews = product.reviews.all()
        related = Product.objects.filter(category=product.category, is_active=True).exclude(id=product.id)[:4]
        context = {
            'product': product,
            'reviews': reviews,
            'related_products': related,
        }
        return render(request, 'store/product_detail.html', context)


class CartView(View):
    def get(self, request):
        return render(request, 'store/cart.html')


class CheckoutView(LoginRequiredMixin, View):
    def get(self, request):
        return render(request, 'store/checkout.html')


class OrderSuccessView(LoginRequiredMixin, View):
    def get(self, request, order_number):
        order = get_object_or_404(Order, order_number=order_number, user=request.user)
        return render(request, 'store/order_success.html', {'order': order})


class DashboardView(LoginRequiredMixin, View):
    def get(self, request):
        orders = Order.objects.filter(user=request.user).order_by('-created_at')
        total_spent = sum(o.total_amount for o in orders)
        return render(request, 'store/dashboard.html', {
            'orders': orders,
            'total_spent': f"{total_spent:.2f}"
        })


# ─── REST API Views ───────────────────────────────────────────────────────────

class CategoryListAPI(ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class ProductPagination(PageNumberPagination):
    page_size = 12


class ProductListAPI(ListAPIView):
    serializer_class = ProductSerializer
    pagination_class = ProductPagination

    def get_queryset(self):
        qs = Product.objects.filter(is_active=True)
        search = self.request.query_params.get('search')
        category_slug = self.request.query_params.get('category')
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        sort = self.request.query_params.get('sort', 'newest')

        if search:
            qs = qs.filter(name__icontains=search)
        if category_slug:
            qs = qs.filter(category__slug=category_slug)
        if min_price:
            qs = qs.filter(price__gte=Decimal(min_price))
        if max_price:
            qs = qs.filter(price__lte=Decimal(max_price))

        if sort == 'price_asc':
            qs = qs.order_by('price')
        elif sort == 'price_desc':
            qs = qs.order_by('-price')
        elif sort == 'name':
            qs = qs.order_by('name')
        else:
            qs = qs.order_by('-created_at')

        return qs


class ProductDetailAPI(RetrieveAPIView):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    lookup_field = 'slug'


class FeaturedProductsAPI(ListAPIView):
    serializer_class = ProductSerializer

    def get_queryset(self):
        return Product.objects.filter(is_featured=True, is_active=True)[:8]


class TrendingProductsAPI(ListAPIView):
    serializer_class = ProductSerializer

    def get_queryset(self):
        return Product.objects.filter(is_trending=True, is_active=True)[:8]


class BestsellerProductsAPI(ListAPIView):
    serializer_class = ProductSerializer

    def get_queryset(self):
        return Product.objects.filter(is_bestseller=True, is_active=True)[:8]


class CartAPI(APIView):
    def _get_cart(self, request):
        return request.session.get('cart', {})

    def _save_cart(self, request, cart):
        request.session['cart'] = cart
        request.session.modified = True

    def get(self, request):
        cart = self._get_cart(request)
        items = []
        for product_id, item in cart.items():
            try:
                product = Product.objects.get(id=int(product_id), is_active=True)
                price = float(item.get('price', product.discount_price or product.price))
                qty = item.get('quantity', 1)
                items.append({
                    'product_id': int(product_id),
                    'name': product.name,
                    'price': price,
                    'quantity': qty,
                    'image': request.build_absolute_uri(product.image.url) if product.image else None,
                    'subtotal': round(price * qty, 2),
                })
            except Product.DoesNotExist:
                pass
        return Response({'items': items})

    def post(self, request):
        product_id = str(request.data.get('product_id'))
        quantity = int(request.data.get('quantity', 1))
        try:
            product = Product.objects.get(id=int(product_id), is_active=True)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found.'}, status=404)

        if product.stock < quantity:
            return Response({'error': 'Insufficient stock.'}, status=400)

        cart = self._get_cart(request)
        if product_id in cart:
            new_qty = cart[product_id]['quantity'] + quantity
            if product.stock < new_qty:
                return Response({'error': 'Insufficient stock.'}, status=400)
            cart[product_id]['quantity'] = new_qty
        else:
            cart[product_id] = {
                'quantity': quantity,
                'price': float(product.discount_price if product.discount_price else product.price),
            }
        self._save_cart(request, cart)
        return Response({'success': True, 'message': 'Item added to cart.'})

    def put(self, request):
        product_id = str(request.data.get('product_id'))
        quantity = int(request.data.get('quantity', 1))
        cart = self._get_cart(request)
        if product_id not in cart:
            return Response({'error': 'Item not in cart.'}, status=404)
        if quantity <= 0:
            del cart[product_id]
        else:
            try:
                product = Product.objects.get(id=int(product_id))
            except Product.DoesNotExist:
                return Response({'error': 'Product not found.'}, status=404)
            if product.stock < quantity:
                return Response({'error': 'Insufficient stock.'}, status=400)
            cart[product_id]['quantity'] = quantity
        self._save_cart(request, cart)
        return Response({'success': True, 'message': 'Cart updated.'})

    def delete(self, request):
        product_id = request.data.get('product_id')
        cart = self._get_cart(request)
        if product_id is not None:
            product_id = str(product_id)
            if product_id in cart:
                del cart[product_id]
                self._save_cart(request, cart)
        else:
            cart = {}
            self._save_cart(request, cart)
        return Response({'success': True, 'message': 'Cart updated.'})


class CheckoutAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        cart = request.session.get('cart', {})
        if not cart:
            return Response({'error': 'Cart is empty.'}, status=400)

        required = ['full_name', 'email', 'phone', 'shipping_address', 'city', 'state', 'pincode']
        for field in required:
            if not request.data.get(field):
                return Response({'error': f'{field} is required.'}, status=400)

        # Validate stock
        order_items_data = []
        subtotal = Decimal('0.00')
        for product_id, item in cart.items():
            try:
                product = Product.objects.get(id=int(product_id), is_active=True)
            except Product.DoesNotExist:
                return Response({'error': f'Product id {product_id} not found.'}, status=400)
            qty = item['quantity']
            if product.stock < qty:
                return Response({'error': f'Insufficient stock for {product.name}.'}, status=400)
            price = Decimal(str(item['price']))
            subtotal += price * qty
            order_items_data.append({'product': product, 'quantity': qty, 'price': price})

        shipping_charge = Decimal('0.00') if subtotal >= Decimal('500') else Decimal('50.00')
        total_amount = subtotal + shipping_charge

        order = Order.objects.create(
            user=request.user,
            full_name=request.data['full_name'],
            email=request.data['email'],
            phone=request.data['phone'],
            shipping_address=request.data['shipping_address'],
            city=request.data['city'],
            state=request.data['state'],
            pincode=request.data['pincode'],
            subtotal=subtotal,
            shipping_charge=shipping_charge,
            total_amount=total_amount,
            payment_method=request.data.get('payment_method', 'cod'),
        )

        for item_data in order_items_data:
            OrderItem.objects.create(
                order=order,
                product=item_data['product'],
                quantity=item_data['quantity'],
                price=item_data['price'],
            )
            item_data['product'].stock -= item_data['quantity']
            item_data['product'].save()

        # Clear cart
        request.session['cart'] = {}
        request.session.modified = True

        return Response({'success': True, 'order_number': order.order_number}, status=201)


class OrderListAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(user=request.user).order_by('-created_at')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)


class OrderDetailAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, order_number):
        order = get_object_or_404(Order, order_number=order_number, user=request.user)
        serializer = OrderSerializer(order)
        return Response(serializer.data)


class ReviewCreateAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        product_id = request.data.get('product') or request.data.get('product_id')
        try:
            product = Product.objects.get(id=product_id, is_active=True)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found.'}, status=404)

        if Review.objects.filter(user=request.user, product=product).exists():
            return Response({'error': 'You have already reviewed this product.'}, status=400)

        serializer = ReviewSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user, product=product)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class ReviewListAPI(ListAPIView):
    serializer_class = ReviewSerializer

    def get_queryset(self):
        product_id = self.request.query_params.get('product_id') or self.kwargs.get('product_id')
        if product_id:
            return Review.objects.filter(product_id=product_id).order_by('-created_at')
        return Review.objects.none()
