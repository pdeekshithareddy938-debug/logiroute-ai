import axios from 'axios';

const API_BASE = import.meta.env.VITE_BACKEND_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 3000, // 3s failover to demo mode if backend is unreachable or sleeping
});

// Interceptor to attach Bearer token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('delivery_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle auth token expiration or forbidden access
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

// Helper to check if Demo Mode is explicitly active or backend has failed over
export const isDemoModeActive = () => {
  return (
    localStorage.getItem('logiroute_demo_mode') === 'true' ||
    (localStorage.getItem('delivery_token') || '').startsWith('demo_')
  );
};

export const setDemoModeActive = (active = true) => {
  if (active) {
    localStorage.setItem('logiroute_demo_mode', 'true');
  } else {
    localStorage.removeItem('logiroute_demo_mode');
  }
};

// ============================================================================
// REALISTIC INTERACTIVE DEMO DATASET (Synced to localStorage for live demo)
// ============================================================================
const DEMO_STORAGE_KEY = 'logiroute_mock_orders_v1';
const DEMO_HISTORY_KEY = 'logiroute_mock_history_v1';

export const DEFAULT_MOCK_ORDERS = [
  {
    id: 'LOGI-3447',
    customer: 'Sophia Martinez',
    customer_name: 'Sophia Martinez',
    address: '550 Montgomery St, San Francisco, CA 94111',
    delivery_address: '550 Montgomery St, San Francisco, CA 94111',
    lat: 37.7946,
    latitude: 37.7946,
    lng: -122.4034,
    longitude: -122.4034,
    packageDesc: 'Office Snacks, Artisan Bakery & Cold Brew',
    package_details: 'Office Snacks, Artisan Bakery & Cold Brew',
    weightKg: 2.4,
    weight_kg: 2.4,
    priority: 'HIGH',
    status: 'pending',
    waveId: 'wave-alpha',
    courierId: 'courier-c1',
    items: ['Cold Brew Coffee (Bottle)', 'Butter Croissant x2', 'Avocado Toast'],
    totalAmount: 24.50,
    estimatedMinutes: 8,
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: 'LOGI-7821',
    customer: 'Liam Chen',
    customer_name: 'Liam Chen',
    address: '850 Brannan St, San Francisco, CA 94103',
    delivery_address: '850 Brannan St, San Francisco, CA 94103',
    lat: 37.7719,
    latitude: 37.7719,
    lng: -122.4048,
    longitude: -122.4048,
    packageDesc: 'Precision Medical Kit & Electrolyte Pack',
    package_details: 'Precision Medical Kit & Electrolyte Pack',
    weightKg: 1.8,
    weight_kg: 1.8,
    priority: 'URGENT',
    status: 'in-transit',
    waveId: 'wave-alpha',
    courierId: 'courier-c1',
    items: ['Organic Electrolytes', 'First-Aid Kit', 'Thermal Ice Pack'],
    totalAmount: 18.20,
    estimatedMinutes: 5,
    createdAt: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
  },
  {
    id: 'LOGI-9102',
    customer: 'Emma Watson',
    customer_name: 'Emma Watson',
    address: '1200 Van Ness Ave, San Francisco, CA 94109',
    delivery_address: '1200 Van Ness Ave, San Francisco, CA 94109',
    lat: 37.7869,
    latitude: 37.7869,
    lng: -122.4218,
    longitude: -122.4218,
    packageDesc: 'Organic Cold Brew Pack & Berry Gelato',
    package_details: 'Organic Cold Brew Pack & Berry Gelato',
    weightKg: 3.2,
    weight_kg: 3.2,
    priority: 'MEDIUM',
    status: 'delivered',
    waveId: 'wave-alpha',
    courierId: 'courier-c1',
    items: ['Wild Berry Gelato Pint', 'Nitro Cold Brew Can 4-Pack'],
    totalAmount: 32.00,
    estimatedMinutes: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 'LOGI-1145',
    customer: 'David Miller',
    customer_name: 'David Miller',
    address: '2100 Mission St, San Francisco, CA 94110',
    delivery_address: '2100 Mission St, San Francisco, CA 94110',
    lat: 37.7632,
    latitude: 37.7632,
    lng: -122.4192,
    longitude: -122.4192,
    packageDesc: 'Roasted Espresso Beans (5kg Commercial Bag)',
    package_details: 'Roasted Espresso Beans (5kg Commercial Bag)',
    weightKg: 5.0,
    weight_kg: 5.0,
    priority: 'LOW',
    status: 'pending',
    waveId: 'wave-beta',
    courierId: 'courier-c2',
    items: ['Espresso Blend Roast 5kg', 'Paper Filters 100-Pack'],
    totalAmount: 45.00,
    estimatedMinutes: 14,
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
  },
  {
    id: 'LOGI-4523',
    customer: 'Olivia Johnson',
    customer_name: 'Olivia Johnson',
    address: '3000 24th St, San Francisco, CA 94110',
    delivery_address: '3000 24th St, San Francisco, CA 94110',
    lat: 37.7525,
    latitude: 37.7525,
    lng: -122.4116,
    longitude: -122.4116,
    packageDesc: 'Fresh Farm Produce, Sourdough & French Butter',
    package_details: 'Fresh Farm Produce, Sourdough & French Butter',
    weightKg: 2.8,
    weight_kg: 2.8,
    priority: 'MEDIUM',
    status: 'pending',
    waveId: 'wave-beta',
    courierId: 'courier-c2',
    items: ['San Francisco Sourdough Loaf', 'Cultured French Butter', 'Organic Hass Avocados x4'],
    totalAmount: 22.40,
    estimatedMinutes: 11,
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
  },
  {
    id: 'LOGI-6789',
    customer: 'Noah Williams',
    customer_name: 'Noah Williams',
    address: '450 10th St, San Francisco, CA 94103',
    delivery_address: '450 10th St, San Francisco, CA 94103',
    lat: 37.7725,
    latitude: 37.7725,
    lng: -122.4132,
    longitude: -122.4132,
    packageDesc: 'Audio Peripherals & Gourmet Power Snack Pack',
    package_details: 'Audio Peripherals & Gourmet Power Snack Pack',
    weightKg: 3.5,
    weight_kg: 3.5,
    priority: 'HIGH',
    status: 'in-transit',
    waveId: 'wave-beta',
    courierId: 'courier-c2',
    items: ['Dark Chocolate Covered Almonds', 'Organic Energy Booster Drink'],
    totalAmount: 27.80,
    estimatedMinutes: 6,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  },
  {
    id: 'LOGI-8910',
    customer: 'Ava Brown',
    customer_name: 'Ava Brown',
    address: '1500 Haight St, San Francisco, CA 94117',
    delivery_address: '1500 Haight St, San Francisco, CA 94117',
    lat: 37.7699,
    latitude: 37.7699,
    lng: -122.4468,
    longitude: -122.4468,
    packageDesc: 'Gelato Popsicles & Ice Pops (Dry Ice Insulated)',
    package_details: 'Gelato Popsicles & Ice Pops (Dry Ice Insulated)',
    weightKg: 1.5,
    weight_kg: 1.5,
    priority: 'URGENT',
    status: 'pending',
    waveId: 'wave-gamma',
    courierId: 'courier-c3',
    items: ['Madagascar Vanilla Gelato Pops', 'Sicilian Pistachio Pint'],
    totalAmount: 19.50,
    estimatedMinutes: 9,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 'LOGI-2234',
    customer: 'Lucas Garcia',
    customer_name: 'Lucas Garcia',
    address: '700 Lombard St, San Francisco, CA 94133',
    delivery_address: '700 Lombard St, San Francisco, CA 94133',
    lat: 37.8021,
    latitude: 37.8021,
    lng: -122.4158,
    longitude: -122.4158,
    packageDesc: 'Quick Kitchen Pantry Essentials & Pastured Eggs',
    package_details: 'Quick Kitchen Pantry Essentials & Pastured Eggs',
    weightKg: 4.2,
    weight_kg: 4.2,
    priority: 'MEDIUM',
    status: 'pending',
    waveId: 'wave-gamma',
    courierId: 'courier-c3',
    items: ['Pasture-Raised Eggs 12ct', 'Extra Virgin Olive Oil 500ml', 'Sea Salt Flakes'],
    totalAmount: 26.00,
    estimatedMinutes: 12,
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  },
  {
    id: 'LOGI-5567',
    customer: 'Maya Patel',
    customer_name: 'Maya Patel',
    address: '201 3rd St, San Francisco, CA 94103',
    delivery_address: '201 3rd St, San Francisco, CA 94103',
    lat: 37.7854,
    latitude: 37.7854,
    lng: -122.4002,
    longitude: -122.4002,
    packageDesc: 'Hydroponic Greens & Cold-Pressed Juices',
    package_details: 'Hydroponic Greens & Cold-Pressed Juices',
    weightKg: 2.1,
    weight_kg: 2.1,
    priority: 'LOW',
    status: 'delivered',
    waveId: 'wave-gamma',
    courierId: 'courier-c3',
    items: ['Hydroponic Butter Lettuce', 'Green Goddess Cold-Pressed Juice x2'],
    totalAmount: 16.80,
    estimatedMinutes: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
  },
];

export const DEFAULT_MOCK_WAVES = [
  {
    id: 'wave-alpha',
    name: 'Wave Alpha – Hyper-Local Express',
    corridor: 'Downtown Core & Financial Pod',
    status: 'in-transit',
    courierId: 'courier-c1',
    courier: {
      id: 'courier-c1',
      name: 'Delivery Partner #DP-402 (Alex Rivera)',
      vehicle: 'Ather 450X (EV-Fleet)',
      battery: 92,
      status: 'in-transit',
      rating: 4.95,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=faces'
    },
    orders: []
  },
  {
    id: 'wave-beta',
    name: 'Wave Beta – Mission & SOMA Corridor',
    corridor: 'Mission & 24th St Staging',
    status: 'staging',
    courierId: 'courier-c2',
    courier: {
      id: 'courier-c2',
      name: 'Delivery Partner #DP-108 (Marcus Vance)',
      vehicle: 'Ola S1 Pro (EV-Fleet)',
      battery: 85,
      status: 'in-transit',
      rating: 4.88,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=faces'
    },
    orders: []
  },
  {
    id: 'wave-gamma',
    name: 'Wave Gamma – Sunset & Presidio Ring',
    corridor: 'Haight-Ashbury & Lombard',
    status: 'staging',
    courierId: 'courier-c3',
    courier: {
      id: 'courier-c3',
      name: 'Delivery Partner #DP-215 (Elena Rostova)',
      vehicle: 'River Indie EV (EV-Fleet)',
      battery: 78,
      status: 'idle',
      rating: 4.92,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=faces'
    },
    orders: []
  }
];

export const DEFAULT_MOCK_COURIERS = [
  {
    id: 'courier-c1',
    name: 'Delivery Partner #DP-402 (Alex Rivera)',
    vehicle: 'Ather 450X (EV-Fleet)',
    battery: 92,
    status: 'in-transit',
    rating: 4.95,
    speed: '28 km/h',
    lat: 37.7885,
    lng: -122.4072,
  },
  {
    id: 'courier-c2',
    name: 'Delivery Partner #DP-108 (Marcus Vance)',
    vehicle: 'Ola S1 Pro (EV-Fleet)',
    battery: 85,
    status: 'in-transit',
    rating: 4.88,
    speed: '31 km/h',
    lat: 37.7650,
    lng: -122.4150,
  },
  {
    id: 'courier-c3',
    name: 'Delivery Partner #DP-215 (Elena Rostova)',
    vehicle: 'River Indie EV (EV-Fleet)',
    battery: 78,
    status: 'idle',
    rating: 4.92,
    speed: '0 km/h',
    lat: 37.7937,
    lng: -122.3965,
  }
];

// Helper to get stored orders or initialize default
const getStoredOrders = () => {
  try {
    const raw = localStorage.getItem(DEMO_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('[Demo API] Error reading mock orders from storage:', e);
  }
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(DEFAULT_MOCK_ORDERS));
  return DEFAULT_MOCK_ORDERS;
};

// Helper to save orders to localStorage
const saveStoredOrders = (orders) => {
  try {
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(orders));
  } catch (e) {
    console.warn('[Demo API] Error saving mock orders:', e);
  }
};

// Compute dynamic dashboard metrics
const computeMockDashboard = () => {
  const orders = getStoredOrders();
  const totalOrders = orders.length;
  const pending = orders.filter((o) => (o.status || '').toLowerCase() === 'pending').length;
  const activeEnRoute = orders.filter(
    (o) =>
      (o.status || '').toLowerCase() === 'in-transit' ||
      (o.status || '').toLowerCase() === 'in_transit' ||
      (o.status || '').toLowerCase() === 'packed'
  ).length;
  const completed = orders.filter((o) => (o.status || '').toLowerCase() === 'delivered').length;

  // Build waves with attached orders
  const waves = DEFAULT_MOCK_WAVES.map((w) => ({
    ...w,
    orders: orders.filter((o) => o.waveId === w.id),
  }));

  return {
    summary: {
      totalOrders,
      pending,
      activeEnRoute,
      completed,
      distanceSavedKm: 14.8,
      distanceSavedPct: 24.6,
    },
    waves,
    orders,
    couriers: DEFAULT_MOCK_COURIERS,
  };
};

// ============================================================================
// AUTHENTICATION API (Live with Seamless Mock Fallback)
// ============================================================================
export const authAPI = {
  login: async (email, password, requestedRole = 'ADMIN') => {
    // If explicitly in demo mode, return mock user directly
    if (isDemoModeActive()) {
      return getMockAuthUser(email, requestedRole);
    }

    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
        requestedRole,
      });
      return response.data;
    } catch (err) {
      console.warn('[Auth API] Remote server unreachable or error. Automatically falling back to Mock Demo Session:', err.message);
      setDemoModeActive(true);
      return getMockAuthUser(email, requestedRole);
    }
  },

  getMe: async () => {
    if (isDemoModeActive()) {
      const saved = localStorage.getItem('delivery_user');
      return saved ? JSON.parse(saved) : getMockAuthUser('admin@logiroute.ai', 'ADMIN').user;
    }

    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (err) {
      const saved = localStorage.getItem('delivery_user');
      return saved ? JSON.parse(saved) : getMockAuthUser('admin@logiroute.ai', 'ADMIN').user;
    }
  },
};

function getMockAuthUser(email, role) {
  const normRole = (role || 'ADMIN').toUpperCase();
  const userName =
    normRole === 'ADMIN'
      ? 'Deekshitha Reddy'
      : normRole === 'RIDER'
      ? 'Alex Rivera (DP-402)'
      : 'Sophia Martinez';

  const user = {
    id: `demo-${normRole.toLowerCase()}-1`,
    email: email || (normRole === 'ADMIN' ? 'admin@logiroute.ai' : normRole === 'RIDER' ? 'rider@logiroute.ai' : 'customer@gmail.com'),
    name: userName,
    full_name: userName,
    role: normRole,
    isDemo: true,
  };

  const token = `demo_jwt_token_logiroute_ai_${Date.now()}`;
  localStorage.setItem('delivery_token', token);
  localStorage.setItem('delivery_user', JSON.stringify(user));
  localStorage.setItem('logiroute_demo_mode', 'true');

  return { token, user };
}

// ============================================================================
// DISPATCH & OPERATIONS API (Interactive Mock Engine with Backend Failover)
// ============================================================================
export const dispatchAPI = {
  // GET /api/dispatch/dashboard
  getDashboard: async () => {
    if (isDemoModeActive()) {
      return computeMockDashboard();
    }
    try {
      const response = await apiClient.get('/dispatch/dashboard');
      return response.data;
    } catch (err) {
      console.warn('[API Fallback] Backend unreachable, returning interactive mock dashboard:', err.message);
      setDemoModeActive(true);
      return computeMockDashboard();
    }
  },

  // GET /api/orders
  getOrders: async (params = {}) => {
    if (isDemoModeActive()) {
      let orders = getStoredOrders();
      if (params.status && params.status !== 'ALL') {
        const target = params.status.toLowerCase();
        orders = orders.filter((o) => (o.status || '').toLowerCase() === target);
      }
      if (params.search) {
        const query = params.search.toLowerCase();
        orders = orders.filter(
          (o) =>
            (o.customer || '').toLowerCase().includes(query) ||
            (o.address || '').toLowerCase().includes(query) ||
            (o.id || '').toLowerCase().includes(query)
        );
      }
      return orders;
    }
    try {
      const response = await apiClient.get('/orders', { params });
      return response.data;
    } catch (err) {
      console.warn('[API Fallback] Using mock orders list:', err.message);
      setDemoModeActive(true);
      return getStoredOrders();
    }
  },

  // PATCH /api/dispatch/waves/:id/dispatch
  dispatchWave: async (waveId) => {
    if (isDemoModeActive()) {
      const orders = getStoredOrders().map((o) =>
        o.waveId === waveId && (o.status === 'pending' || o.status === 'staging')
          ? { ...o, status: 'in-transit', updatedAt: new Date().toISOString() }
          : o
      );
      saveStoredOrders(orders);
      return { success: true, message: `Wave ${waveId} dispatched to courier fleet en-route.` };
    }
    try {
      const response = await apiClient.patch(`/dispatch/waves/${waveId}/dispatch`);
      return response.data;
    } catch (err) {
      console.warn('[API Fallback] Dispatched wave in mock store:', waveId);
      const orders = getStoredOrders().map((o) =>
        o.waveId === waveId && (o.status === 'pending' || o.status === 'staging')
          ? { ...o, status: 'in-transit', updatedAt: new Date().toISOString() }
          : o
      );
      saveStoredOrders(orders);
      return { success: true, message: `Wave ${waveId} dispatched in demo mode.` };
    }
  },

  // POST /api/dispatch/orders/optimize (2-Opt Algorithmic Solver)
  optimizeRoutes: async (corridorId = 'wave-alpha') => {
    if (isDemoModeActive()) {
      return {
        success: true,
        message: '2-Opt algorithmic solver completed: 14.8 km saved (-24.6%) across corridors.',
        corridorId,
        metrics: {
          baselineDistanceKm: 60.1,
          optimizedDistanceKm: 45.3,
          distanceSavedKm: 14.8,
          distanceSavedPct: 24.6,
          corridorsOptimized: 3,
          slaAdherence: '99.4%',
          routeGeometry: 'POINT_OPTIMIZED_SF_BAY',
        },
      };
    }
    try {
      const response = await apiClient.post('/dispatch/orders/optimize', { corridorId });
      return response.data;
    } catch (err) {
      console.warn('[API Fallback] Mock 2-Opt solver executed:', corridorId);
      return {
        success: true,
        message: '2-Opt algorithmic solver completed: 14.8 km saved (-24.6%) across corridors.',
        corridorId,
        metrics: {
          baselineDistanceKm: 60.1,
          optimizedDistanceKm: 45.3,
          distanceSavedKm: 14.8,
          distanceSavedPct: 24.6,
          corridorsOptimized: 3,
          slaAdherence: '99.4%',
        },
      };
    }
  },

  // GET /api/dispatch/couriers/:id/active-trip (Real-Time Rider HUD State)
  getCourierActiveTrip: async (courierId = 'courier-c1') => {
    const orders = getStoredOrders();
    const activeTrip = orders.find(
      (o) =>
        ((o.status || '').toLowerCase() === 'in-transit' ||
          (o.status || '').toLowerCase() === 'in_transit' ||
          (o.status || '').toLowerCase() === 'packed') &&
        (o.courierId === courierId || !o.courierId)
    );

    const incomingOrder = activeTrip
      ? null
      : orders.find(
          (o) =>
            (o.status || '').toLowerCase() === 'pending' &&
            (o.courierId === courierId || o.waveId === 'wave-alpha')
        ) || orders.find((o) => (o.status || '').toLowerCase() === 'pending');

    const completedOrdersCount = orders.filter(
      (o) => (o.status || '').toLowerCase() === 'delivered'
    ).length;

    const mockCourierTrip = {
      courier: {
        id: courierId,
        name: 'Delivery Partner #DP-402 (Alex Rivera)',
        vehicle: 'Ather 450X (EV-Fleet)',
        battery: 92,
        status: activeTrip ? 'in-transit' : 'idle',
      },
      incomingOrder,
      activeTrip,
      completedOrdersCount,
    };

    if (isDemoModeActive()) {
      return mockCourierTrip;
    }

    try {
      const response = await apiClient.get(`/dispatch/couriers/${courierId}/active-trip`);
      return response.data;
    } catch (err) {
      console.warn('[API Fallback] Using mock courier active trip:', err.message);
      setDemoModeActive(true);
      return mockCourierTrip;
    }
  },

  // POST /api/dispatch/orders/:id/accept
  acceptOrder: async (orderId) => {
    const orders = getStoredOrders().map((o) =>
      o.id === orderId
        ? {
            ...o,
            status: 'in-transit',
            courierId: 'courier-c1',
            updatedAt: new Date().toISOString(),
          }
        : o
    );
    saveStoredOrders(orders);
    const updated = orders.find((o) => o.id === orderId);

    if (isDemoModeActive()) {
      return { success: true, message: 'Order accepted by courier #DP-402', order: updated };
    }

    try {
      const response = await apiClient.post(`/dispatch/orders/${orderId}/accept`);
      return response.data;
    } catch (err) {
      console.warn('[API Fallback] Order accepted in mock store:', orderId);
      return { success: true, message: 'Order accepted by courier #DP-402', order: updated };
    }
  },

  // POST /api/dispatch/orders/:id/decline
  declineOrder: async (orderId) => {
    if (isDemoModeActive()) {
      return { success: true, message: 'Order declined and reassigned to pool' };
    }
    try {
      const response = await apiClient.post(`/dispatch/orders/${orderId}/decline`);
      return response.data;
    } catch (err) {
      return { success: true, message: 'Order declined in demo mode' };
    }
  },

  // PATCH /api/dispatch/orders/:id/pickup
  pickupOrder: async (orderId) => {
    const orders = getStoredOrders().map((o) =>
      o.id === orderId
        ? { ...o, status: 'in-transit', updatedAt: new Date().toISOString() }
        : o
    );
    saveStoredOrders(orders);
    const updated = orders.find((o) => o.id === orderId);

    if (isDemoModeActive()) {
      return { success: true, message: 'Bag verified at Dark Store Bay', order: updated };
    }
    try {
      const response = await apiClient.patch(`/dispatch/orders/${orderId}/pickup`);
      return response.data;
    } catch (err) {
      return { success: true, message: 'Bag verified in demo mode', order: updated };
    }
  },

  // PATCH /api/dispatch/waves/:id/pickup
  confirmPickup: async (waveId) => {
    return dispatchAPI.dispatchWave(waveId);
  },

  // PATCH /api/dispatch/orders/:id/deliver (Marks Order as Delivered)
  deliverOrder: async (orderId) => {
    const orders = getStoredOrders().map((o) =>
      o.id === orderId
        ? {
            ...o,
            status: 'delivered',
            completedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        : o
    );
    saveStoredOrders(orders);
    const deliveredOrder = orders.find((o) => o.id === orderId);

    // Save to demo history
    try {
      const historyRaw = localStorage.getItem(DEMO_HISTORY_KEY);
      const history = historyRaw ? JSON.parse(historyRaw) : [];
      history.unshift({
        id: `TRP-${(orderId || '9120').replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase()}`,
        orderId,
        customer: deliveredOrder?.customer || 'Customer',
        address: deliveredOrder?.address || '100 Market St, San Francisco',
        durationMinutes: '11m 45s',
        distanceKm: '3.2',
        distanceSavedKm: '1.4',
        distanceSavedPct: '24.6%',
        batteryUsedPct: '6%',
        completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', Today',
        status: 'Delivered',
        courier: {
          name: 'Delivery Partner #DP-402 (Alex Rivera)',
          vehicle: 'Ather 450X (EV-Fleet)',
        },
      });
      localStorage.setItem(DEMO_HISTORY_KEY, JSON.stringify(history.slice(0, 30)));
    } catch (e) {
      console.warn('Error archiving delivered order to mock history:', e);
    }

    if (isDemoModeActive()) {
      return { success: true, message: 'Order marked Delivered successfully!', order: deliveredOrder };
    }

    try {
      const response = await apiClient.patch(`/dispatch/orders/${orderId}/deliver`);
      return response.data;
    } catch (err) {
      console.warn('[API Fallback] Marked delivered in mock store:', orderId);
      return { success: true, message: 'Order marked Delivered in demo mode!', order: deliveredOrder };
    }
  },

  // GET /api/rider/active-wave
  getRiderActiveWave: async () => {
    const orders = getStoredOrders();
    const activeOrders = orders.filter((o) => o.courierId === 'courier-c1' && o.status !== 'delivered');
    return {
      wave: {
        id: 'wave-alpha',
        name: 'Wave Alpha – Hyper-Local Express',
        corridor: 'Downtown Core & Financial Pod',
        status: 'in-transit',
      },
      stops: activeOrders,
    };
  },

  // GET /api/customer/orders/active
  getCustomerActiveOrder: async (orderId = null) => {
    const orders = getStoredOrders();
    let found = null;
    if (orderId) {
      found = orders.find((o) => o.id === orderId);
    }
    if (!found) {
      found =
        orders.find((o) => o.id === 'LOGI-3447') ||
        orders.find((o) => o.status === 'in-transit' || o.status === 'pending') ||
        orders[0];
    }

    const mockCustomerOrder = {
      ...found,
      status: found?.status || 'in-transit',
      rider: {
        name: 'Alex Rivera (#DP-402)',
        phone: '+1-415-555-0199',
        rating: 4.95,
        vehicle: 'Ather 450X Electric Scooter',
        plateNumber: 'CA-9E281',
        currentLat: 37.7885,
        currentLng: -122.4072,
      },
      items: found?.items || ['Cold Brew Coffee (Bottle)', 'Butter Croissant x2', 'Avocado Toast'],
      totalAmount: found?.totalAmount || 24.50,
      estimatedDeliveryMinutes: found?.status === 'delivered' ? 0 : 7,
      timeline: [
        { title: 'Order Placed', time: '10:02 AM', completed: true },
        { title: 'Packed at Dark Store HUB-01', time: '10:04 AM', completed: true },
        {
          title: 'Out for Delivery (Rider Dispatched)',
          time: '10:06 AM',
          completed: found?.status === 'in-transit' || found?.status === 'delivered',
        },
        {
          title: 'Delivered at Doorstep',
          time: found?.status === 'delivered' ? '10:14 AM' : 'Est. 10:15 AM',
          completed: found?.status === 'delivered',
        },
      ],
    };

    if (isDemoModeActive()) {
      return mockCustomerOrder;
    }

    try {
      const response = await apiClient.get('/customer/orders/active', {
        params: orderId ? { orderId } : {},
      });
      return response.data;
    } catch (err) {
      console.warn('[API Fallback] Using mock active customer order:', err.message);
      setDemoModeActive(true);
      return mockCustomerOrder;
    }
  },

  // GET /api/orders/:id
  getOrder: async (orderId) => {
    const orders = getStoredOrders();
    const found = orders.find((o) => o.id === orderId);
    if (found) return found;

    try {
      const response = await apiClient.get(`/orders/${orderId}`);
      return response.data;
    } catch (err) {
      return found || { id: orderId, status: 'pending', customer: 'Demo Customer' };
    }
  },

  // POST /api/dispatch/orders (Customer or Admin Creates Order)
  createOrder: async (orderData) => {
    const newId = `LOGI-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder = {
      id: newId,
      customer: orderData.customer || orderData.customer_name || 'Quick Commerce Shopper',
      customer_name: orderData.customer || orderData.customer_name || 'Quick Commerce Shopper',
      address: orderData.address || orderData.delivery_address || '100 Market St, San Francisco, CA',
      delivery_address: orderData.address || orderData.delivery_address || '100 Market St, San Francisco, CA',
      lat: orderData.lat || orderData.latitude || 37.7937,
      latitude: orderData.lat || orderData.latitude || 37.7937,
      lng: orderData.lng || orderData.longitude || -122.3965,
      longitude: orderData.lng || orderData.longitude || -122.3965,
      packageDesc: orderData.packageDesc || orderData.package_details || 'Instant Grocery Basket',
      package_details: orderData.packageDesc || orderData.package_details || 'Instant Grocery Basket',
      weightKg: orderData.weightKg || orderData.weight_kg || 2.0,
      weight_kg: orderData.weightKg || orderData.weight_kg || 2.0,
      priority: (orderData.priority || 'MEDIUM').toUpperCase(),
      status: 'pending',
      waveId: 'wave-alpha',
      courierId: 'courier-c1',
      items: orderData.items || ['Fresh Organic Grocery Basket'],
      totalAmount: orderData.totalAmount || 18.50,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const orders = getStoredOrders();
    orders.unshift(newOrder);
    saveStoredOrders(orders);

    if (isDemoModeActive()) {
      return newOrder;
    }

    try {
      const response = await apiClient.post('/dispatch/orders', orderData);
      return response.data;
    } catch (err) {
      console.warn('[API Fallback] Created order in mock store:', newId);
      return newOrder;
    }
  },

  // POST /api/seed (Resets simulation database)
  seedDatabase: async () => {
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(DEFAULT_MOCK_ORDERS));
    if (isDemoModeActive()) {
      return {
        success: true,
        message: 'Live dispatch pool refreshed with 9 orders across 3 corridors',
        dashboard: computeMockDashboard(),
      };
    }
    try {
      const response = await apiClient.post('/seed');
      return response.data;
    } catch (err) {
      console.warn('[API Fallback] Simulation pool reset locally.');
      return {
        success: true,
        message: 'Live dispatch pool refreshed with 9 orders across 3 corridors (Mock Mode)',
        dashboard: computeMockDashboard(),
      };
    }
  },

  // PATCH /api/dispatch/orders/:id/status
  updateOrderStatus: async (orderId, status) => {
    const orders = getStoredOrders().map((o) =>
      o.id === orderId
        ? { ...o, status: status.toLowerCase(), updatedAt: new Date().toISOString() }
        : o
    );
    saveStoredOrders(orders);
    const updated = orders.find((o) => o.id === orderId);

    if (isDemoModeActive()) {
      return { success: true, order: updated };
    }

    try {
      const response = await apiClient.patch(`/dispatch/orders/${orderId}/status`, { status });
      return response.data;
    } catch (err) {
      return { success: true, order: updated };
    }
  },

  // GET /api/dispatch/history
  getHistory: async () => {
    let history = [];
    try {
      const raw = localStorage.getItem(DEMO_HISTORY_KEY);
      if (raw) history = JSON.parse(raw);
    } catch (e) {
      // ignore
    }

    if (!history || history.length === 0) {
      history = [
        {
          id: 'TRP-9102',
          waveId: 'wave-alpha',
          waveName: 'Wave Alpha – Hyper-Local Express',
          corridor: 'Downtown Core & Financial Pod',
          courier: {
            name: 'Delivery Partner #DP-402 (Alex Rivera)',
            vehicle: 'Ather 450X (EV-Fleet)',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=faces',
          },
          totalStops: 3,
          durationMinutes: '12m 40s',
          distanceKm: '3.5',
          distanceSavedKm: '1.4',
          distanceSavedPct: '24.6%',
          batteryUsedPct: '7%',
          completedAt: '10:45 AM, Today',
          status: 'Delivered',
          waypoints: [
            { name: 'HUB-01 Market St Pod', time: '10:15 AM', lat: 37.7937, lng: -122.3965 },
            { name: '1200 Van Ness Ave', customer: 'Emma Watson', time: '10:45 AM', lat: 37.7869, lng: -122.4218 },
          ],
        },
        {
          id: 'TRP-5567',
          waveId: 'wave-gamma',
          waveName: 'Wave Gamma – Sunset & Presidio Ring',
          corridor: 'Haight-Ashbury & Lombard',
          courier: {
            name: 'Delivery Partner #DP-215 (Elena Rostova)',
            vehicle: 'River Indie EV (EV-Fleet)',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=faces',
          },
          totalStops: 2,
          durationMinutes: '9m 15s',
          distanceKm: '2.8',
          distanceSavedKm: '1.1',
          distanceSavedPct: '28.2%',
          batteryUsedPct: '5%',
          completedAt: '09:55 AM, Today',
          status: 'Delivered',
          waypoints: [
            { name: 'HUB-01 Market St Pod', time: '09:30 AM', lat: 37.7937, lng: -122.3965 },
            { name: '201 3rd St', customer: 'Maya Patel', time: '09:55 AM', lat: 37.7854, lng: -122.4002 },
          ],
        },
        {
          id: 'TRP-3312',
          waveId: 'wave-beta',
          waveName: 'Wave Beta – Mission & SOMA Corridor',
          corridor: 'Mission & 24th St Staging',
          courier: {
            name: 'Delivery Partner #DP-108 (Marcus Vance)',
            vehicle: 'Ola S1 Pro (EV-Fleet)',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=faces',
          },
          totalStops: 4,
          durationMinutes: '14m 20s',
          distanceKm: '4.6',
          distanceSavedKm: '1.8',
          distanceSavedPct: '28.1%',
          batteryUsedPct: '9%',
          completedAt: '09:20 AM, Today',
          status: 'Delivered',
          waypoints: [
            { name: 'HUB-01 Market St Pod', time: '08:50 AM', lat: 37.7937, lng: -122.3965 },
            { name: '850 Brannan St', customer: 'Liam Chen', time: '09:20 AM', lat: 37.7719, lng: -122.4048 },
          ],
        },
      ];
    }

    if (isDemoModeActive()) {
      return history;
    }

    try {
      const response = await apiClient.get('/dispatch/history');
      return response.data;
    } catch (err) {
      console.warn('[API Fallback] Using mock history list:', err.message);
      setDemoModeActive(true);
      return history;
    }
  },

  // POST /api/routes/commit
  commitRoute: async (routeData) => {
    if (isDemoModeActive()) {
      return { success: true, message: 'Optimized corridor route committed to active courier fleet.' };
    }
    try {
      const response = await apiClient.post('/routes/commit', routeData);
      return response.data;
    } catch (err) {
      return { success: true, message: 'Optimized corridor route committed (Mock Mode).' };
    }
  },

  // GET /api/analytics
  getAnalytics: async () => {
    const mockAnalytics = {
      summary: {
        slaAdherencePct: 94.2,
        slaAdherenceDelta: '+2.4%',
        totalDistanceSavedKm: 48.6,
        distanceSavedPct: 24.6,
        fleetBatteryEfficiency: '2.1% / km',
        fleetBatteryHealthPct: 96.4,
        carbonOffsetKg: 18.4,
        treesEquivalent: 0.9,
        avgDispatchSeconds: 142,
        totalFulfilledWaves: 28,
      },
      dailyVolumes: [
        { day: 'Mon', total: 64, onTime: 61, distanceKm: 210, savedKm: 52 },
        { day: 'Tue', total: 72, onTime: 69, distanceKm: 234, savedKm: 58 },
        { day: 'Wed', total: 85, onTime: 81, distanceKm: 280, savedKm: 69 },
        { day: 'Thu', total: 79, onTime: 75, distanceKm: 258, savedKm: 64 },
        { day: 'Fri', total: 98, onTime: 93, distanceKm: 320, savedKm: 78 },
        { day: 'Sat', total: 114, onTime: 106, distanceKm: 382, savedKm: 94 },
        { day: 'Sun', total: 92, onTime: 87, distanceKm: 304, savedKm: 75 },
      ],
      hourlyDistribution: [
        { hour: '08:00', orders: 12, rush: 'Breakfast Sprint' },
        { hour: '10:00', orders: 24, rush: 'Morning Grocery' },
        { hour: '12:00', orders: 58, rush: 'Lunch Peak' },
        { hour: '14:00', orders: 32, rush: 'Afternoon Refill' },
        { hour: '17:00', orders: 68, rush: 'Evening Grocery' },
        { hour: '20:00', orders: 45, rush: 'Late Night Treats' },
      ],
      corridorEfficiency: [
        { corridor: 'Downtown Core (Alpha)', savingsKm: 18.4, savingsPct: '26.2%', activeFleet: 4 },
        { corridor: 'Mission & SOMA (Beta)', savingsKm: 16.2, savingsPct: '24.1%', activeFleet: 3 },
        { corridor: 'Sunset & Presidio (Gamma)', savingsKm: 14.0, savingsPct: '23.5%', activeFleet: 3 },
      ],
      courierLeaderboard: [
        { rank: 1, name: 'Alex Rivera (#DP-402)', trips: 14, savedKm: 12.8, batteryUsed: '48%', score: 99 },
        { rank: 2, name: 'Elena Rostova (#DP-215)', trips: 12, savedKm: 10.4, batteryUsed: '42%', score: 98 },
        { rank: 3, name: 'Marcus Vance (#DP-108)', trips: 11, savedKm: 9.6, batteryUsed: '45%', score: 96 },
      ],
    };

    if (isDemoModeActive()) {
      return mockAnalytics;
    }

    try {
      const response = await apiClient.get('/analytics');
      return response.data;
    } catch (err) {
      console.warn('[API Fallback] Using mock analytics dataset:', err.message);
      setDemoModeActive(true);
      return mockAnalytics;
    }
  },

  // GET /api/health
  checkHealth: async () => {
    if (isDemoModeActive()) {
      return { status: 'ok', mode: 'demo' };
    }
    try {
      const response = await apiClient.get('/health');
      return response.data;
    } catch (err) {
      return { status: 'offline', mode: 'demo-fallback' };
    }
  },
};

export default dispatchAPI;
