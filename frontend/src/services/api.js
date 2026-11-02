import axios from 'axios';

const API_BASE = import.meta.env.VITE_BACKEND_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
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
    // Return error directly so caller can inspect status and error message
    return Promise.reject(error);
  }
);

export const authAPI = {
  // POST /api/auth/login — Strictly role gated
  login: async (email, password, requestedRole) => {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
      requestedRole,
    });
    return response.data;
  },

  // GET /api/auth/me — Current session profile
  getMe: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};

export const dispatchAPI = {
  // GET /api/dispatch/dashboard — Returns aggregate metrics, waves with couriers, and orders
  getDashboard: async () => {
    const response = await apiClient.get('/dispatch/dashboard');
    return response.data;
  },

  // GET /api/orders — Returns all master orders with optional search, status, and priority
  getOrders: async (params = {}) => {
    const response = await apiClient.get('/orders', { params });
    return response.data;
  },

  // PATCH /api/dispatch/waves/:id/dispatch — Dispatches wave and updates status to in-transit (ADMIN)
  dispatchWave: async (waveId) => {
    const response = await apiClient.patch(`/dispatch/waves/${waveId}/dispatch`);
    return response.data;
  },

  // POST /api/dispatch/orders/optimize — Runs 2-Opt solver on wave corridor (ADMIN)
  optimizeRoutes: async (corridorId = 'wave-alpha') => {
    const response = await apiClient.post('/dispatch/orders/optimize', { corridorId });
    return response.data;
  },

  // GET /api/dispatch/couriers/:id/active-trip — Active courier navigation & incoming broadcast
  getCourierActiveTrip: async (courierId = 'courier-c1') => {
    const response = await apiClient.get(`/dispatch/couriers/${courierId}/active-trip`);
    return response.data;
  },

  // POST /api/dispatch/orders/:id/accept — Rider accepts incoming broadcast order
  acceptOrder: async (orderId) => {
    const response = await apiClient.post(`/dispatch/orders/${orderId}/accept`);
    return response.data;
  },

  // POST /api/dispatch/orders/:id/decline — Rider declines incoming broadcast order
  declineOrder: async (orderId) => {
    const response = await apiClient.post(`/dispatch/orders/${orderId}/decline`);
    return response.data;
  },

  // PATCH /api/dispatch/orders/:id/pickup — Rider confirms bag pickup at Dark Store Bay
  pickupOrder: async (orderId) => {
    const response = await apiClient.patch(`/dispatch/orders/${orderId}/pickup`);
    return response.data;
  },

  // PATCH /api/dispatch/waves/:id/pickup — Rider confirms bag pickup at dark store bay (RIDER/ADMIN)
  confirmPickup: async (waveId) => {
    const response = await apiClient.patch(`/dispatch/waves/${waveId}/pickup`);
    return response.data;
  },

  // PATCH /api/dispatch/orders/:id/deliver — Rider marks stop delivered (RIDER/ADMIN)
  deliverOrder: async (orderId) => {
    const response = await apiClient.patch(`/dispatch/orders/${orderId}/deliver`);
    return response.data;
  },

  // GET /api/rider/active-wave — Returns active queue & stops for rider
  getRiderActiveWave: async () => {
    const response = await apiClient.get('/rider/active-wave');
    return response.data;
  },

  // GET /api/customer/orders/active — Returns latest active order for customer
  getCustomerActiveOrder: async () => {
    const response = await apiClient.get('/customer/orders/active');
    return response.data;
  },

  // POST /api/dispatch/orders — Creates and persists a customer order (CUSTOMER/ADMIN)
  createOrder: async (orderData) => {
    const response = await apiClient.post('/dispatch/orders', orderData);
    return response.data;
  },

  // POST /api/seed — Populates/resets database with 8 demo orders across 3 corridors
  seedDatabase: async () => {
    const response = await apiClient.post('/seed');
    return response.data;
  },

  // PATCH /api/dispatch/orders/:id/status — Update single order status
  updateOrderStatus: async (orderId, status) => {
    const response = await apiClient.patch(`/dispatch/orders/${orderId}/status`, { status });
    return response.data;
  },

  // GET /api/dispatch/history — Returns historical completed route trips
  getHistory: async () => {
    const response = await apiClient.get('/dispatch/history');
    return response.data;
  },

  // POST /api/routes/commit — Commits reordered / optimized route to courier fleet
  commitRoute: async (routeData) => {
    const response = await apiClient.post('/routes/commit', routeData);
    return response.data;
  },

  // GET /api/analytics — Returns executive KPI aggregates, charts, and courier leaderboard
  getAnalytics: async () => {
    const response = await apiClient.get('/analytics');
    return response.data;
  },

  // GET /api/health — Server health check
  checkHealth: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  },
};

export default dispatchAPI;
