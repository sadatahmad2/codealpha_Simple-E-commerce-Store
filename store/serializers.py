from rest_framework import serializers
from .models import Category, Product, ProductImage, Order, OrderItem, Review


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'is_primary']


class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    discount_percent = serializers.ReadOnlyField()
    average_rating = serializers.ReadOnlyField()
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'short_description',
            'category', 'price', 'discount_price', 'discount_percent',
            'stock', 'image', 'is_featured', 'is_trending', 'is_bestseller',
            'average_rating', 'images',
        ]


class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    total = serializers.ReadOnlyField(source='total')

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'quantity', 'price', 'total']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = '__all__'


class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField(read_only=True)
    product = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'user', 'product', 'rating', 'comment', 'created_at']

    def get_user(self, obj):
        return obj.user.username
