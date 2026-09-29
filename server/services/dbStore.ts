import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

export interface UserDoc {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: 'customer' | 'admin';
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductDoc {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  category: string;
  brand: string;
  stock: number;
  sku: string;
  images: string[];
  rating: number;
  numReviews: number;
  isFeatured: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItemDoc {
  product: string;
  name: string;
  qty: number;
  price: number;
  image: string;
}

export interface OrderDoc {
  _id: string;
  user: string;
  orderItems: OrderItemDoc[];
  shippingAddress: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  paymentMethod: 'credit_card' | 'paypal' | 'cod';
  paymentResult?: {
    id?: string;
    status?: string;
    update_time?: string;
    email_address?: string;
    last4?: string;
  };
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  discountPrice: number;
  totalPrice: number;
  couponCode?: string;
  isPaid: boolean;
  paidAt?: Date;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  idempotencyKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewDoc {
  _id: string;
  user: string;
  userName: string;
  userEmail: string;
  product: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CouponDoc {
  _id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  expiryDate: Date;
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

class ResilientStore {
  private users: UserDoc[] = [];
  private products: ProductDoc[] = [];
  private orders: OrderDoc[] = [];
  private reviews: ReviewDoc[] = [];
  private coupons: CouponDoc[] = [];
  private initialized = false;

  private generateId(): string {
    return new mongoose.Types.ObjectId().toString();
  }

  public async init(): Promise<void> {
    if (this.initialized) return;

    // Seed default admin and customer with securely hashed passwords
    const adminPasswordHash = await bcrypt.hash('AdminPass123!', 10);
    const customerPasswordHash = await bcrypt.hash('CustomerPass123!', 10);

    const adminUser: UserDoc = {
      _id: '65f1a0000000000000000001',
      name: 'Store Administrator',
      email: 'admin@novastore.com',
      password: adminPasswordHash,
      role: 'admin',
      phone: '+1 (555) 019-2831',
      address: {
        street: '100 Enterprise Way, Suite 400',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94105',
        country: 'US',
      },
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    };

    const customerUser: UserDoc = {
      _id: '65f1a0000000000000000002',
      name: 'Sarah Jenkins',
      email: 'customer@novastore.com',
      password: customerPasswordHash,
      role: 'customer',
      phone: '+1 (555) 742-9901',
      address: {
        street: '742 Evergreen Terrace',
        city: 'Seattle',
        state: 'WA',
        postalCode: '98101',
        country: 'US',
      },
      createdAt: new Date('2025-01-10'),
      updatedAt: new Date('2025-01-10'),
    };

    this.users.push(adminUser, customerUser);

    // Seed realistic production products
    const seedProducts: Omit<ProductDoc, '_id' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: 'AcousticPro Wireless ANC Headphones',
        slug: 'acousticpro-wireless-anc-headphones',
        description: 'Engineered for audio purists. Features dual active noise cancellation, custom 40mm titanium diaphragm drivers, 45-hour battery life, and plush memory foam ear cushions.',
        price: 299.99,
        compareAtPrice: 349.99,
        category: 'Audio',
        brand: 'SoundCraft',
        stock: 24,
        sku: 'AUD-APRO-01',
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80',
        ],
        rating: 4.8,
        numReviews: 14,
        isFeatured: true,
        tags: ['headphones', 'bluetooth', 'anc', 'wireless', 'audio'],
      },
      {
        name: 'Vanguard Chrono Smartwatch',
        slug: 'vanguard-chrono-smartwatch',
        description: 'Aerospace-grade titanium chassis with sapphire crystal display. Continuous ECG heart rate monitoring, dual-band GPS, 100m water resistance, and 7-day battery runtime.',
        price: 399.0,
        compareAtPrice: 449.0,
        category: 'Wearables',
        brand: 'Krono',
        stock: 15,
        sku: 'WR-VAN-02',
        images: [
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80',
        ],
        rating: 4.9,
        numReviews: 22,
        isFeatured: true,
        tags: ['smartwatch', 'fitness', 'gps', 'wearables', 'titanium'],
      },
      {
        name: 'ErgoComfort Mechanical Keyboard',
        slug: 'ergocomfort-mechanical-keyboard',
        description: 'Hot-swappable custom lubricated linear switches, solid anodized aluminum body, sound-dampening silicone gasket mount, and per-key RGB backlighting.',
        price: 159.5,
        compareAtPrice: 189.99,
        category: 'Workstation',
        brand: 'KeySmith',
        stock: 32,
        sku: 'KB-ERG-03',
        images: [
          'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&auto=format&fit=crop&q=80',
        ],
        rating: 4.7,
        numReviews: 9,
        isFeatured: true,
        tags: ['keyboard', 'mechanical', 'rgb', 'desk-setup'],
      },
      {
        name: 'StudioPrecision Ultra Ergonomic Mouse',
        slug: 'studioprecision-ultra-ergonomic-mouse',
        description: 'Precision 26,000 DPI optical sensor, ultra-quiet tactile switches, textured thumb grip with gesture button, and multi-device Bluetooth/2.4GHz wireless pairing.',
        price: 89.99,
        compareAtPrice: 109.99,
        category: 'Workstation',
        brand: 'KeySmith',
        stock: 45,
        sku: 'MS-STU-04',
        images: [
          'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80',
        ],
        rating: 4.6,
        numReviews: 18,
        isFeatured: false,
        tags: ['mouse', 'ergonomic', 'wireless', 'office'],
      },
      {
        name: 'Lumina 4K Portable Creator Monitor',
        slug: 'lumina-4k-portable-creator-monitor',
        description: '15.6-inch 4K UHD OLED portable display with 100% DCI-P3 color gamut, 500 nits brightness, magnetic stand cover, and dual USB-C Thunderbolt input.',
        price: 449.0,
        compareAtPrice: 529.0,
        category: 'Electronics',
        brand: 'VisualEdge',
        stock: 10,
        sku: 'MON-LUM-05',
        images: [
          'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1547658719-da2b51169166?w=800&auto=format&fit=crop&q=80',
        ],
        rating: 4.9,
        numReviews: 8,
        isFeatured: true,
        tags: ['monitor', 'oled', 'creator', '4k', 'display'],
      },
      {
        name: 'Nomad Cordura Travel Tech Backpack',
        slug: 'nomad-cordura-travel-tech-backpack',
        description: 'Weatherproof 1000D Cordura ballistic nylon with dedicated 16-inch padded laptop sleeve, quick-access passport pocket, and luggage pass-through.',
        price: 139.0,
        compareAtPrice: 169.0,
        category: 'Accessories',
        brand: 'Nomad Gear',
        stock: 28,
        sku: 'BAG-NOM-06',
        images: [
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&auto=format&fit=crop&q=80',
        ],
        rating: 4.7,
        numReviews: 31,
        isFeatured: false,
        tags: ['backpack', 'travel', 'tech-bag', 'accessories'],
      },
      {
        name: 'PulseFlow High-Res Wireless Earbuds',
        slug: 'pulseflow-high-res-wireless-earbuds',
        description: 'IPX7 waterproof earbuds with adaptive transparency mode, 11mm beryllium drivers, Qi wireless charging case, and 32 hours total playback.',
        price: 149.99,
        compareAtPrice: 179.99,
        category: 'Audio',
        brand: 'SoundCraft',
        stock: 50,
        sku: 'AUD-PUL-07',
        images: [
          'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800&auto=format&fit=crop&q=80',
        ],
        rating: 4.5,
        numReviews: 12,
        isFeatured: false,
        tags: ['earbuds', 'wireless', 'audio', 'waterproof'],
      },
      {
        name: 'AeroStand CNC Anodized Laptop Riser',
        slug: 'aerostand-cnc-anodized-laptop-riser',
        description: 'Precision CNC-machined solid aluminum riser. Optimizes airflow for passive cooling and positions displays at ergonomic eye level.',
        price: 49.99,
        compareAtPrice: 65.0,
        category: 'Workstation',
        brand: 'KeySmith',
        stock: 60,
        sku: 'STD-AER-08',
        images: [
          'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
        ],
        rating: 4.8,
        numReviews: 15,
        isFeatured: false,
        tags: ['laptop-stand', 'aluminum', 'desk-setup', 'ergonomic'],
      },
    ];

    let pIdx = 10;
    for (const p of seedProducts) {
      const id = `65f1b00000000000000000${pIdx++}`;
      this.products.push({
        ...p,
        _id: id,
        createdAt: new Date('2025-01-15'),
        updatedAt: new Date('2025-01-15'),
      });
    }

    // Seed promotional coupons
    this.coupons.push(
      {
        _id: '65f1c0000000000000000001',
        code: 'SAVE10',
        discountType: 'percentage',
        discountValue: 10,
        minOrderValue: 50,
        maxDiscount: 50,
        expiryDate: new Date('2028-12-31'),
        usageLimit: 500,
        usageCount: 42,
        isActive: true,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      },
      {
        _id: '65f1c0000000000000000002',
        code: 'WELCOME20',
        discountType: 'percentage',
        discountValue: 20,
        minOrderValue: 100,
        maxDiscount: 100,
        expiryDate: new Date('2028-12-31'),
        usageLimit: 200,
        usageCount: 15,
        isActive: true,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      },
      {
        _id: '65f1c0000000000000000003',
        code: 'FIXED25',
        discountType: 'fixed',
        discountValue: 25,
        minOrderValue: 120,
        expiryDate: new Date('2028-12-31'),
        usageLimit: 100,
        usageCount: 8,
        isActive: true,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      }
    );

    // Seed verified past delivered order for customerUser so verified review testing works out of the box
    const customerDeliveredOrder: OrderDoc = {
      _id: '65f1d0000000000000000001',
      user: customerUser._id,
      orderItems: [
        {
          product: this.products[0]._id, // AcousticPro Headphones
          name: this.products[0].name,
          qty: 1,
          price: this.products[0].price,
          image: this.products[0].images[0],
        },
      ],
      shippingAddress: {
        fullName: 'Sarah Jenkins',
        street: '742 Evergreen Terrace',
        city: 'Seattle',
        state: 'WA',
        postalCode: '98101',
        country: 'US',
        phone: '+1 (555) 742-9901',
      },
      paymentMethod: 'credit_card',
      paymentResult: {
        id: 'pi_mock_past_order_01',
        status: 'succeeded',
        last4: '4242',
      },
      itemsPrice: 299.99,
      taxPrice: 24.0,
      shippingPrice: 0.0,
      discountPrice: 0.0,
      totalPrice: 323.99,
      isPaid: true,
      paidAt: new Date('2025-02-01'),
      status: 'delivered',
      createdAt: new Date('2025-02-01'),
      updatedAt: new Date('2025-02-05'),
    };
    this.orders.push(customerDeliveredOrder);

    // Seed initial verified review
    this.reviews.push({
      _id: '65f1e0000000000000000001',
      user: customerUser._id,
      userName: customerUser.name,
      userEmail: customerUser.email,
      product: this.products[0]._id,
      rating: 5,
      title: 'Flawless soundstage and comfort',
      comment: 'I wear these for 8+ hours of coding daily. The noise cancelling blocks background chatter effortlessly and the battery lasts almost a full workweek.',
      verifiedPurchase: true,
      createdAt: new Date('2025-02-10'),
      updatedAt: new Date('2025-02-10'),
    });

    this.initialized = true;
    console.log('[ResilientStore] In-memory database initialized with seed data.');
  }

  // --- Users Operations ---
  public async findUserByEmail(email: string): Promise<UserDoc | null> {
    await this.init();
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  public async findUserById(id: string): Promise<UserDoc | null> {
    await this.init();
    return this.users.find((u) => u._id.toString() === id.toString()) || null;
  }

  public async createUser(data: Omit<UserDoc, '_id' | 'createdAt' | 'updatedAt'>): Promise<UserDoc> {
    await this.init();
    const newUser: UserDoc = {
      ...data,
      _id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.push(newUser);
    return newUser;
  }

  public async updateUser(id: string, updates: Partial<UserDoc>): Promise<UserDoc | null> {
    await this.init();
    const index = this.users.findIndex((u) => u._id.toString() === id.toString());
    if (index === -1) return null;
    this.users[index] = {
      ...this.users[index],
      ...updates,
      updatedAt: new Date(),
    };
    return this.users[index];
  }

  // --- Products Operations ---
  public async getProducts(filter: {
    category?: string;
    brand?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    sort?: string;
    page?: number;
    limit?: number;
  }): Promise<{ products: ProductDoc[]; total: number; page: number; pages: number }> {
    await this.init();
    let result = [...this.products];

    if (filter.category && filter.category !== 'all') {
      result = result.filter(
        (p) => p.category.toLowerCase() === filter.category!.toLowerCase()
      );
    }

    if (filter.brand && filter.brand !== 'all') {
      result = result.filter(
        (p) => p.brand.toLowerCase() === filter.brand!.toLowerCase()
      );
    }

    if (filter.search) {
      const q = filter.search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (filter.minPrice !== undefined && !isNaN(filter.minPrice)) {
      result = result.filter((p) => p.price >= filter.minPrice!);
    }

    if (filter.maxPrice !== undefined && !isNaN(filter.maxPrice)) {
      result = result.filter((p) => p.price <= filter.maxPrice!);
    }

    if (filter.inStock) {
      result = result.filter((p) => p.stock > 0);
    }

    // Sort
    switch (filter.sort) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating-desc':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      default:
        // featured / relevance
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }

    const total = result.length;
    const page = Math.max(1, filter.page || 1);
    const limit = Math.max(1, filter.limit || 12);
    const pages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginated = result.slice(startIndex, startIndex + limit);

    return { products: paginated, total, page, pages };
  }

  public async getProductById(id: string): Promise<ProductDoc | null> {
    await this.init();
    return this.products.find((p) => p._id.toString() === id.toString()) || null;
  }

  public async getProductBySlug(slug: string): Promise<ProductDoc | null> {
    await this.init();
    return this.products.find((p) => p.slug === slug.toLowerCase()) || null;
  }

  public async getCategories(): Promise<{ name: string; count: number }[]> {
    await this.init();
    const map = new Map<string, number>();
    for (const p of this.products) {
      map.set(p.category, (map.get(p.category) || 0) + 1);
    }
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }

  public async createProduct(data: Omit<ProductDoc, '_id' | 'createdAt' | 'updatedAt' | 'rating' | 'numReviews'>): Promise<ProductDoc> {
    await this.init();
    const newProduct: ProductDoc = {
      ...data,
      _id: this.generateId(),
      rating: 0,
      numReviews: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.products.unshift(newProduct);
    return newProduct;
  }

  public async updateProduct(id: string, updates: Partial<ProductDoc>): Promise<ProductDoc | null> {
    await this.init();
    const idx = this.products.findIndex((p) => p._id.toString() === id.toString());
    if (idx === -1) return null;
    this.products[idx] = {
      ...this.products[idx],
      ...updates,
      updatedAt: new Date(),
    };
    return this.products[idx];
  }

  public async deleteProduct(id: string): Promise<boolean> {
    await this.init();
    const idx = this.products.findIndex((p) => p._id.toString() === id.toString());
    if (idx === -1) return false;
    this.products.splice(idx, 1);
    return true;
  }

  public async adjustProductStock(id: string, delta: number): Promise<boolean> {
    await this.init();
    const p = this.products.find((x) => x._id.toString() === id.toString());
    if (!p) return false;
    if (p.stock + delta < 0) return false;
    p.stock += delta;
    p.updatedAt = new Date();
    return true;
  }

  public async recalculateProductRating(productId: string): Promise<void> {
    await this.init();
    const prodReviews = this.reviews.filter((r) => r.product.toString() === productId.toString());
    const prod = this.products.find((p) => p._id.toString() === productId.toString());
    if (prod) {
      prod.numReviews = prodReviews.length;
      if (prodReviews.length > 0) {
        const sum = prodReviews.reduce((acc, r) => acc + r.rating, 0);
        prod.rating = parseFloat((sum / prodReviews.length).toFixed(1));
      } else {
        prod.rating = 0;
      }
      prod.updatedAt = new Date();
    }
  }

  // --- Orders Operations ---
  public async findOrderByIdempotencyKey(key: string): Promise<OrderDoc | null> {
    await this.init();
    if (!key) return null;
    return this.orders.find((o) => o.idempotencyKey === key) || null;
  }

  public async findOrderById(id: string): Promise<OrderDoc | null> {
    await this.init();
    return this.orders.find((o) => o._id.toString() === id.toString()) || null;
  }

  public async findOrdersByUser(userId: string): Promise<OrderDoc[]> {
    await this.init();
    return this.orders
      .filter((o) => o.user.toString() === userId.toString())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  public async getAllOrders(): Promise<OrderDoc[]> {
    await this.init();
    return [...this.orders].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  public async createOrder(data: Omit<OrderDoc, '_id' | 'createdAt' | 'updatedAt'>): Promise<OrderDoc> {
    await this.init();
    const newOrder: OrderDoc = {
      ...data,
      _id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.orders.unshift(newOrder);
    return newOrder;
  }

  public async updateOrderStatus(id: string, status: OrderDoc['status']): Promise<OrderDoc | null> {
    await this.init();
    const order = this.orders.find((o) => o._id.toString() === id.toString());
    if (!order) return null;
    order.status = status;
    order.updatedAt = new Date();
    return order;
  }

  // --- Reviews Operations ---
  public async getProductReviews(productId: string): Promise<ReviewDoc[]> {
    await this.init();
    return this.reviews
      .filter((r) => r.product.toString() === productId.toString())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  public async checkUserHasPurchasedProduct(userId: string, productId: string): Promise<boolean> {
    await this.init();
    return this.orders.some(
      (o) =>
        o.user.toString() === userId.toString() &&
        ['delivered', 'shipped', 'processing'].includes(o.status) &&
        o.orderItems.some((item) => item.product.toString() === productId.toString())
    );
  }

  public async findReviewByUserAndProduct(userId: string, productId: string): Promise<ReviewDoc | null> {
    await this.init();
    return (
      this.reviews.find(
        (r) =>
          r.user.toString() === userId.toString() &&
          r.product.toString() === productId.toString()
      ) || null
    );
  }

  public async createReview(data: Omit<ReviewDoc, '_id' | 'createdAt' | 'updatedAt'>): Promise<ReviewDoc> {
    await this.init();
    const newReview: ReviewDoc = {
      ...data,
      _id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.reviews.unshift(newReview);
    await this.recalculateProductRating(data.product);
    return newReview;
  }

  // --- Coupons Operations ---
  public async findCouponByCode(code: string): Promise<CouponDoc | null> {
    await this.init();
    return this.coupons.find((c) => c.code.toUpperCase() === code.toUpperCase().trim()) || null;
  }

  public async getAllCoupons(): Promise<CouponDoc[]> {
    await this.init();
    return [...this.coupons].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  public async createCoupon(data: Omit<CouponDoc, '_id' | 'createdAt' | 'updatedAt' | 'usageCount'>): Promise<CouponDoc> {
    await this.init();
    const newCoupon: CouponDoc = {
      ...data,
      _id: this.generateId(),
      code: data.code.toUpperCase().trim(),
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.coupons.unshift(newCoupon);
    return newCoupon;
  }

  public async deleteCoupon(id: string): Promise<boolean> {
    await this.init();
    const idx = this.coupons.findIndex((c) => c._id.toString() === id.toString());
    if (idx === -1) return false;
    this.coupons.splice(idx, 1);
    return true;
  }

  public async incrementCouponUsage(code: string): Promise<void> {
    await this.init();
    const coupon = this.coupons.find((c) => c.code.toUpperCase() === code.toUpperCase().trim());
    if (coupon) {
      coupon.usageCount += 1;
      coupon.updatedAt = new Date();
    }
  }
}

export const dbStore = new ResilientStore();
