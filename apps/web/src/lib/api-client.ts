/**
 * ESUM API Client
 * Centralized API client for all backend communication
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  requiresAuth?: boolean;
}

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, requiresAuth = false } = options;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (requiresAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      method,
      headers,
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // ============================================================================
  // AUTH ENDPOINTS
  // ============================================================================

  async login(email: string, password: string) {
    const response = await this.request<{
      success: boolean;
      data: {
        access_token: string;
        expires_at: string;
        user: { id: string; email: string; name: string; role: string };
        organisation: { id: string; name: string; type: string };
      };
    }>('/api/v1/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    return response.data;
  }

  async logout() {
    return this.request<{ success: boolean; data: { message: string } }>('/api/v1/auth/logout', {
      method: 'POST',
      requiresAuth: true,
    });
  }

  async registerOrganisation(data: {
    name: string;
    email: string;
    type: string;
    province?: string;
    city?: string;
    address?: string;
    postalCode?: string;
  }) {
    return this.request<{ success: boolean; data: { organisation_id: string } }>(
      '/api/v1/auth/register/org',
      {
        method: 'POST',
        body: data,
      }
    );
  }

  async registerUser(data: {
    email: string;
    password: string;
    organisation_id: string;
    name?: string;
    role?: string;
  }) {
    return this.request<{ success: boolean; data: { user_id: string } }>(
      '/api/v1/auth/register/user',
      {
        method: 'POST',
        body: data,
      }
    );
  }

  // ============================================================================
  // ORGANISATION ENDPOINTS
  // ============================================================================

  async getMyOrganisation() {
    return this.request<{ success: boolean; data: any }>('/api/v1/organisations/me', {
      requiresAuth: true,
    });
  }

  // ============================================================================
  // MARKET/INSTRUMENT ENDPOINTS
  // ============================================================================

  async getInstruments(params?: { page?: number; limit?: number; type?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.type) queryParams.set('type', params.type);

    return this.request<{ success: boolean; data: any[]; pagination: any }>(
      `/api/v1/instruments?${queryParams}`,
      { requiresAuth: true }
    );
  }

  async getInstrument(id: string) {
    return this.request<{ success: boolean; data: any }>(`/api/v1/instruments/${id}`, {
      requiresAuth: true,
    });
  }

  async getOrderBook(instrumentId: string) {
    return this.request<{ success: boolean; data: { bids: any[]; asks: any[] } }>(
      `/api/v1/order-book/${instrumentId}`,
      { requiresAuth: true }
    );
  }

  // ============================================================================
  // ORDER ENDPOINTS
  // ============================================================================

  async createOrder(data: {
    instrument_id: string;
    side: 'buy' | 'sell';
    volume_mwh: number;
    limit_price_zar: number;
    time_in_force?: 'gtc' | 'day' | 'ioc';
  }) {
    return this.request<{ success: boolean; data: { order_id: string } }>('/api/v1/orders', {
      method: 'POST',
      body: data,
      requiresAuth: true,
    });
  }

  async getOrders(params?: { page?: number; limit?: number; status?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.status) queryParams.set('status', params.status);

    return this.request<{ success: boolean; data: any[]; pagination: any }>(
      `/api/v1/orders?${queryParams}`,
      { requiresAuth: true }
    );
  }

  async cancelOrder(id: string) {
    return this.request<{ success: boolean; data: { message: string } }>(
      `/api/v1/orders/${id}/cancel`,
      {
        method: 'PATCH',
        requiresAuth: true,
      }
    );
  }

  // ============================================================================
  // TRADE ENDPOINTS
  // ============================================================================

  async getTrades(params?: { page?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());

    return this.request<{ success: boolean; data: any[]; pagination: any }>(
      `/api/v1/trades?${queryParams}`,
      { requiresAuth: true }
    );
  }

  // ============================================================================
  // CONTRACT ENDPOINTS
  // ============================================================================

  async getContracts(params?: { page?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());

    return this.request<{ success: boolean; data: any[]; pagination: any }>(
      `/api/v1/contracts?${queryParams}`,
      { requiresAuth: true }
    );
  }

  // ============================================================================
  // CARBON ENDPOINTS
  // ============================================================================

  async getCarbonCredits(params?: { page?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());

    return this.request<{ success: boolean; data: any[]; pagination: any }>(
      `/api/v1/carbon/credits?${queryParams}`,
      { requiresAuth: true }
    );
  }

  async retireCarbonCredits(data: { credit_ids: string[]; beneficiary?: string }) {
    return this.request<{ success: boolean; data: { message: string } }>(
      '/api/v1/carbon/credits/retire',
      {
        method: 'POST',
        body: data,
        requiresAuth: true,
      }
    );
  }

  // ============================================================================
  // AUCTION ENDPOINTS
  // ============================================================================

  async getAuctions(params?: { page?: number; limit?: number; status?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.status) queryParams.set('status', params.status);

    return this.request<{ success: boolean; data: any[]; pagination: any }>(
      `/api/v1/auctions?${queryParams}`
    );
  }

  async getAuction(id: string) {
    return this.request<{ success: boolean; data: any }>(`/api/v1/auctions/${id}`);
  }

  async placeAuctionBid(
    auctionId: string,
    data: { volume_mwh: number; bid_price_zar: number }
  ) {
    return this.request<{ success: boolean; data: { bid_id: string } }>(
      `/api/v1/auctions/${auctionId}/bids`,
      {
        method: 'POST',
        body: data,
        requiresAuth: true,
      }
    );
  }

  // ============================================================================
  // PORTFOLIO/DASHBOARD ENDPOINTS
  // ============================================================================

  async getDashboardStats() {
    return this.request<{
      success: boolean;
      data: {
        total_energy_traded_mwh: number;
        carbon_credits_tco2e: number;
        active_contracts: number;
        portfolio_value_zar: number;
        energy_mix: { solar: number; wind: number; grid: number };
        recent_trades: any[];
        market_overview: any[];
      };
    }>('/api/v1/dashboard/stats', { requiresAuth: true });
  }

  async getPortfolio() {
    return this.request<{
      success: boolean;
      data: {
        holdings: any[];
        contracts: any[];
        total_value_zar: number;
        monthly_revenue_zar: number;
      };
    }>('/api/v1/portfolio', { requiresAuth: true });
  }

  // ============================================================================
  // NOTIFICATION ENDPOINTS
  // ============================================================================

  async getNotifications(params?: { page?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());

    return this.request<{ success: boolean; data: any[]; pagination: any }>(
      `/api/v1/notifications?${queryParams}`,
      { requiresAuth: true }
    );
  }

  async markNotificationRead(id: string) {
    return this.request<{ success: boolean; data: { message: string } }>(
      `/api/v1/notifications/${id}/read`,
      {
        method: 'PATCH',
        requiresAuth: true,
      }
    );
  }

  // ============================================================================
  // IPP PROJECT ENDPOINTS
  // ============================================================================

  async getIPPProjects(params?: { page?: number; limit?: number; status?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.status) queryParams.set('status', params.status);

    return this.request<{ success: boolean; data: any[]; pagination: any }>(
      `/api/v1/ipp-projects?${queryParams}`,
      { requiresAuth: true }
    );
  }

  async getIPPProject(id: string) {
    return this.request<{ success: boolean; data: any }>(`/api/v1/ipp-projects/${id}`, {
      requiresAuth: true,
    });
  }

  async getProjectMilestones(projectId: string) {
    return this.request<{ success: boolean; data: any[] }>(
      `/api/v1/ipp-projects/${projectId}/milestones`,
      { requiresAuth: true }
    );
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
