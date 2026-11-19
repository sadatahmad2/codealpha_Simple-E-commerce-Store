from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from store.models import Category, Product

User = get_user_model()

CATEGORIES = [
    {'name': 'Electronics', 'slug': 'electronics', 'description': 'Latest gadgets and electronic devices'},
    {'name': 'Fashion', 'slug': 'fashion', 'description': 'Trendy clothes and accessories'},
    {'name': 'Home & Kitchen', 'slug': 'home-kitchen', 'description': 'Everything for your home'},
    {'name': 'Books', 'slug': 'books', 'description': 'Wide range of books across all genres'},
    {'name': 'Sports & Fitness', 'slug': 'sports-fitness', 'description': 'Equipment and gear for sports and fitness'},
    {'name': 'Beauty & Health', 'slug': 'beauty-health', 'description': 'Beauty products and health essentials'},
]

PRODUCTS = [
    # Electronics (4)
    {
        'category_slug': 'electronics',
        'name': 'Wireless Bluetooth Headphones',
        'slug': 'wireless-bluetooth-headphones',
        'description': 'Premium over-ear wireless headphones with active noise cancellation, 40-hour battery life, and crystal-clear sound. Features foldable design for easy portability.',
        'short_description': 'Premium ANC headphones with 40hr battery life',
        'price': 4999, 'discount_price': 3499, 'stock': 50,
        'is_featured': True, 'is_trending': True, 'is_bestseller': False,
    },
    {
        'category_slug': 'electronics',
        'name': 'Smart 4K LED TV 43 Inch',
        'slug': 'smart-4k-led-tv-43-inch',
        'description': 'Ultra HD 4K Smart TV with built-in Android OS, 3 HDMI ports, 2 USB ports, Dolby Vision, and HDR support. Stream your favourite content seamlessly.',
        'short_description': 'Ultra HD 4K Smart TV with Android OS',
        'price': 32999, 'discount_price': 27999, 'stock': 20,
        'is_featured': True, 'is_trending': False, 'is_bestseller': True,
    },
    {
        'category_slug': 'electronics',
        'name': 'Mechanical Gaming Keyboard',
        'slug': 'mechanical-gaming-keyboard',
        'description': 'Full-size mechanical gaming keyboard with RGB backlighting, blue switches, anti-ghosting technology, and durable aluminium frame. Ideal for gamers and typists.',
        'short_description': 'RGB mechanical keyboard with blue switches',
        'price': 2999, 'discount_price': 2299, 'stock': 75,
        'is_featured': False, 'is_trending': True, 'is_bestseller': True,
    },
    {
        'category_slug': 'electronics',
        'name': 'USB-C Fast Charging Power Bank 20000mAh',
        'slug': 'usb-c-fast-charging-power-bank-20000mah',
        'description': '20000mAh power bank with 65W fast charging, dual USB-A ports, one USB-C port, and LED battery indicator. Compatible with laptops, phones, and tablets.',
        'short_description': '20000mAh power bank with 65W fast charging',
        'price': 1999, 'discount_price': 1499, 'stock': 120,
        'is_featured': True, 'is_trending': True, 'is_bestseller': True,
    },
    # Fashion (4)
    {
        'category_slug': 'fashion',
        'name': 'Men\'s Slim Fit Casual Shirt',
        'slug': 'mens-slim-fit-casual-shirt',
        'description': 'Comfortable slim-fit casual shirt made from 100% premium cotton. Available in multiple colours and sizes. Perfect for a relaxed yet stylish look.',
        'short_description': '100% premium cotton slim fit shirt',
        'price': 999, 'discount_price': 699, 'stock': 200,
        'is_featured': False, 'is_trending': True, 'is_bestseller': True,
    },
    {
        'category_slug': 'fashion',
        'name': 'Women\'s Floral Printed Kurti',
        'slug': 'womens-floral-printed-kurti',
        'description': 'Beautiful floral printed kurti crafted from soft rayon fabric. Features a relaxed A-line silhouette, 3/4 sleeves, and intricate embroidery at the hem.',
        'short_description': 'Soft rayon floral printed kurti',
        'price': 799, 'discount_price': 549, 'stock': 180,
        'is_featured': True, 'is_trending': False, 'is_bestseller': True,
    },
    {
        'category_slug': 'fashion',
        'name': 'Leather Formal Shoes for Men',
        'slug': 'leather-formal-shoes-men',
        'description': 'Genuine leather formal shoes with cushioned insole, slip-resistant rubber sole, and classic Oxford styling. Ideal for office and formal occasions.',
        'short_description': 'Genuine leather Oxford formal shoes',
        'price': 2499, 'discount_price': 1899, 'stock': 60,
        'is_featured': True, 'is_trending': False, 'is_bestseller': False,
    },
    {
        'category_slug': 'fashion',
        'name': 'Sports Sneakers Lightweight Running Shoes',
        'slug': 'sports-sneakers-lightweight-running-shoes',
        'description': 'Lightweight sports sneakers with breathable mesh upper, EVA cushioning midsole, and durable rubber outsole. Designed for running, gym and everyday wear.',
        'short_description': 'Breathable mesh lightweight running sneakers',
        'price': 1799, 'discount_price': 1299, 'stock': 90,
        'is_featured': False, 'is_trending': True, 'is_bestseller': False,
    },
    # Home & Kitchen (4)
    {
        'category_slug': 'home-kitchen',
        'name': 'Non-Stick Cookware Set 5 Piece',
        'slug': 'non-stick-cookware-set-5-piece',
        'description': '5-piece non-stick cookware set including fry pan, saucepan, and stockpot. Made with heavy-gauge aluminium and PFOA-free coating. Suitable for all hob types.',
        'short_description': '5-piece PFOA-free non-stick cookware set',
        'price': 2999, 'discount_price': 2199, 'stock': 40,
        'is_featured': True, 'is_trending': False, 'is_bestseller': True,
    },
    {
        'category_slug': 'home-kitchen',
        'name': 'Robot Vacuum Cleaner Auto Sweep',
        'slug': 'robot-vacuum-cleaner-auto-sweep',
        'description': 'Smart robot vacuum cleaner with auto-sweep, mopping function, Wi-Fi control via app, 2500Pa suction power, and 150-minute battery life. Works on all floor types.',
        'short_description': 'Smart Wi-Fi robot vacuum with mopping function',
        'price': 12999, 'discount_price': 9999, 'stock': 25,
        'is_featured': True, 'is_trending': True, 'is_bestseller': False,
    },
    {
        'category_slug': 'home-kitchen',
        'name': 'Electric Kettle 1.7L Stainless Steel',
        'slug': 'electric-kettle-1-7l-stainless-steel',
        'description': '1.7-litre stainless steel electric kettle with 1500W fast boiling, auto shut-off, boil-dry protection, 360-degree cordless base, and cool-touch handle.',
        'short_description': '1500W stainless steel fast-boil electric kettle',
        'price': 999, 'discount_price': 749, 'stock': 150,
        'is_featured': False, 'is_trending': True, 'is_bestseller': True,
    },
    {
        'category_slug': 'home-kitchen',
        'name': 'Memory Foam Orthopaedic Pillow',
        'slug': 'memory-foam-orthopaedic-pillow',
        'description': 'Ergonomic memory foam orthopaedic pillow with contoured design for neck and shoulder support. Hypoallergenic, washable cover and CertiPUR certified foam.',
        'short_description': 'Ergonomic memory foam neck support pillow',
        'price': 1499, 'discount_price': 1099, 'stock': 80,
        'is_featured': False, 'is_trending': False, 'is_bestseller': True,
    },
    # Books (4)
    {
        'category_slug': 'books',
        'name': 'Atomic Habits by James Clear',
        'slug': 'atomic-habits-james-clear',
        'description': 'An Easy & Proven Way to Build Good Habits & Break Bad Ones. This bestselling guide offers a proven framework for improving every day through tiny changes in behaviour.',
        'short_description': 'Proven framework for building good habits',
        'price': 599, 'discount_price': 399, 'stock': 300,
        'is_featured': True, 'is_trending': True, 'is_bestseller': True,
    },
    {
        'category_slug': 'books',
        'name': 'The Alchemist by Paulo Coelho',
        'slug': 'the-alchemist-paulo-coelho',
        'description': 'A magical story about Santiago, an Andalusian shepherd boy who yearns to travel in search of a worldly treasure. A timeless classic about following your dreams.',
        'short_description': 'Timeless classic about following your dreams',
        'price': 399, 'discount_price': 299, 'stock': 250,
        'is_featured': False, 'is_trending': False, 'is_bestseller': True,
    },
    {
        'category_slug': 'books',
        'name': 'Python Crash Course 3rd Edition',
        'slug': 'python-crash-course-3rd-edition',
        'description': 'A hands-on, project-based introduction to programming. Learn the basics of Python quickly and then build real projects including games, data visualisations, and web apps.',
        'short_description': 'Hands-on intro to Python programming',
        'price': 1099, 'discount_price': 849, 'stock': 180,
        'is_featured': True, 'is_trending': True, 'is_bestseller': False,
    },
    {
        'category_slug': 'books',
        'name': 'Rich Dad Poor Dad by Robert Kiyosaki',
        'slug': 'rich-dad-poor-dad-robert-kiyosaki',
        'description': 'What the rich teach their kids about money that the poor and middle class do not. This personal-finance classic challenges conventional wisdom about money and investing.',
        'short_description': 'Personal finance and investing classic',
        'price': 499, 'discount_price': 349, 'stock': 220,
        'is_featured': False, 'is_trending': True, 'is_bestseller': True,
    },
    # Sports & Fitness (4)
    {
        'category_slug': 'sports-fitness',
        'name': 'Adjustable Dumbbell Set 5-25kg',
        'slug': 'adjustable-dumbbell-set-5-25kg',
        'description': 'Space-saving adjustable dumbbell set with quick-change weight dial. Replaces 15 sets of weights. Ideal for home gym workouts. Weight range: 5 to 25kg per dumbbell.',
        'short_description': 'Quick-adjust dumbbells replacing 15 sets',
        'price': 8999, 'discount_price': 6999, 'stock': 30,
        'is_featured': True, 'is_trending': True, 'is_bestseller': False,
    },
    {
        'category_slug': 'sports-fitness',
        'name': 'Yoga Mat Non-Slip 6mm Extra Thick',
        'slug': 'yoga-mat-non-slip-6mm-extra-thick',
        'description': '6mm extra thick TPE yoga mat with non-slip surface, moisture-resistant technology, alignment lines, and carrying strap. Suitable for yoga, Pilates, and floor exercises.',
        'short_description': '6mm non-slip TPE yoga mat with carrying strap',
        'price': 999, 'discount_price': 749, 'stock': 150,
        'is_featured': False, 'is_trending': True, 'is_bestseller': True,
    },
    {
        'category_slug': 'sports-fitness',
        'name': 'Protein Whey Isolate Chocolate 2kg',
        'slug': 'protein-whey-isolate-chocolate-2kg',
        'description': 'Premium whey protein isolate with 27g protein per serving, low carbs, low fat, added BCAAs and digestive enzymes. Available in rich chocolate flavour. 2kg tub.',
        'short_description': '27g protein per serving whey isolate 2kg',
        'price': 3999, 'discount_price': 3199, 'stock': 60,
        'is_featured': True, 'is_trending': False, 'is_bestseller': True,
    },
    {
        'category_slug': 'sports-fitness',
        'name': 'Resistance Bands Set 5 Levels',
        'slug': 'resistance-bands-set-5-levels',
        'description': '5-band resistance set ranging from extra light to extra heavy (10-50 lbs). Made from 100% natural latex. Includes carry bag and exercise guide. Great for home workouts.',
        'short_description': '5-level latex resistance band set with guide',
        'price': 799, 'discount_price': 599, 'stock': 200,
        'is_featured': False, 'is_trending': True, 'is_bestseller': False,
    },
    # Beauty & Health (4)
    {
        'category_slug': 'beauty-health',
        'name': 'Vitamin C Brightening Face Serum 30ml',
        'slug': 'vitamin-c-brightening-face-serum-30ml',
        'description': '15% Vitamin C face serum with hyaluronic acid, niacinamide, and ferulic acid. Brightens skin, reduces dark spots, and boosts collagen production. Dermatologist-tested.',
        'short_description': '15% Vitamin C serum with hyaluronic acid',
        'price': 699, 'discount_price': 499, 'stock': 180,
        'is_featured': True, 'is_trending': True, 'is_bestseller': True,
    },
    {
        'category_slug': 'beauty-health',
        'name': 'Electric Toothbrush Sonic Whitening',
        'slug': 'electric-toothbrush-sonic-whitening',
        'description': 'Sonic electric toothbrush with 5 cleaning modes, 40,000 strokes/min, 2-minute timer, pressure sensor, and USB charging. Includes 2 brush heads. Removes 100% more plaque.',
        'short_description': '40,000 strokes/min sonic electric toothbrush',
        'price': 1999, 'discount_price': 1499, 'stock': 90,
        'is_featured': False, 'is_trending': False, 'is_bestseller': True,
    },
    {
        'category_slug': 'beauty-health',
        'name': 'Blood Pressure Monitor Digital',
        'slug': 'blood-pressure-monitor-digital',
        'description': 'Clinically validated upper arm blood pressure monitor with large LCD display, irregular heartbeat detection, 60-reading memory, and dual-user mode. Includes carry case.',
        'short_description': 'Clinically validated digital BP monitor',
        'price': 2499, 'discount_price': 1899, 'stock': 70,
        'is_featured': True, 'is_trending': False, 'is_bestseller': False,
    },
    {
        'category_slug': 'beauty-health',
        'name': 'Aloe Vera Moisturising Gel 500ml',
        'slug': 'aloe-vera-moisturising-gel-500ml',
        'description': 'Pure 99% aloe vera gel with vitamin E and green tea extract. Soothes sunburn, hydrates skin, reduces redness, and works as a lightweight moisturiser. Alcohol-free.',
        'short_description': '99% pure aloe vera gel with vitamin E',
        'price': 399, 'discount_price': 299, 'stock': 300,
        'is_featured': False, 'is_trending': True, 'is_bestseller': False,
    },
]


class Command(BaseCommand):
    help = 'Seed the database with categories, products, and admin user'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding data...')

        # Create categories
        cat_map = {}
        for cat_data in CATEGORIES:
            cat, created = Category.objects.get_or_create(
                slug=cat_data['slug'],
                defaults={'name': cat_data['name'], 'description': cat_data['description']}
            )
            cat_map[cat_data['slug']] = cat
            if created:
                self.stdout.write(self.style.SUCCESS(f'  Created category: {cat.name}'))
            else:
                self.stdout.write(f'  Category already exists: {cat.name}')

        # Create products
        for prod_data in PRODUCTS:
            cat = cat_map[prod_data['category_slug']]
            prod, created = Product.objects.get_or_create(
                slug=prod_data['slug'],
                defaults={
                    'category': cat,
                    'name': prod_data['name'],
                    'description': prod_data['description'],
                    'short_description': prod_data['short_description'],
                    'price': prod_data['price'],
                    'discount_price': prod_data['discount_price'],
                    'stock': prod_data['stock'],
                    'is_featured': prod_data['is_featured'],
                    'is_trending': prod_data['is_trending'],
                    'is_bestseller': prod_data['is_bestseller'],
                    'is_active': True,
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'  Created product: {prod.name}'))
            else:
                self.stdout.write(f'  Product already exists: {prod.name}')

        # Create superuser
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser(
                username='admin',
                email='admin@novamart.com',
                password='admin123',
            )
            self.stdout.write(self.style.SUCCESS('  Created superuser: admin / admin123'))
        else:
            self.stdout.write('  Superuser already exists: admin')

        self.stdout.write(self.style.SUCCESS('\nDatabase seeded successfully!'))
        self.stdout.write(f'  Categories: {Category.objects.count()}')
        self.stdout.write(f'  Products: {Product.objects.count()}')
        self.stdout.write(f'  Featured: {Product.objects.filter(is_featured=True).count()}')
        self.stdout.write(f'  Trending: {Product.objects.filter(is_trending=True).count()}')
        self.stdout.write(f'  Bestsellers: {Product.objects.filter(is_bestseller=True).count()}')
