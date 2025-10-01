// Centralized API utilities for consistent API calls
import { useMemo } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export class ApiClient {
  constructor(token) {
    this.token = token;
  }

  async request(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    return response.json();
  }

  // Subscription methods
  async getSubscriptions() {
    return this.request("/api/v1/subscriptions");
  }

  async createSubscription(data) {
    return this.request("/api/v1/subscriptions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateSubscription(id, data) {
    return this.request(`/api/v1/subscriptions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteSubscription(id) {
    return this.request(`/api/v1/subscriptions/${id}`, {
      method: "DELETE",
    });
  }

  // Bill methods
  async getBills() {
    return this.request("/api/v1/bills");
  }

  async createBill(data) {
    return this.request("/api/v1/bills", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateBill(id, data) {
    return this.request(`/api/v1/bills/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async markBillPaid(id) {
    return this.request(`/api/v1/bills/${id}/paid`, {
      method: "PATCH",
    });
  }

  async deleteBill(id) {
    return this.request(`/api/v1/bills/${id}`, {
      method: "DELETE",
    });
  }

  // Budget methods
  async getBudget() {
    return this.request("/api/v1/budgets");
  }

  async updateBudget(data) {
    return this.request("/api/v1/budgets", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // Insights methods
  async getInsights() {
    return this.request("/api/v1/insights");
  }

  async getEnhancedInsights(timeRange = "monthly") {
    const params = new URLSearchParams({ timeRange });
    return this.request(`/api/v1/insights/enhanced?${params.toString()}`);
  }

  async getSmartInsights(period = "30d") {
    const params = new URLSearchParams({ period });
    return this.request(`/api/v1/insights/smart?${params.toString()}`);
  }

  async searchSubscriptions(query = "", filters = {}) {
    const params = new URLSearchParams();

    if (query) {
      params.append("q", query);
    }

    if (filters.category?.length) {
      params.append("category", filters.category.join(","));
    }

    if (filters.priceRange) {
      const { min, max } = filters.priceRange;
      if (min !== undefined && min !== "") {
        params.append("minPrice", min);
      }
      if (max !== undefined && max !== "") {
        params.append("maxPrice", max);
      }
    }

    if (filters.status?.length) {
      params.append("status", filters.status.join(","));
    }

    if (filters.renewalDate) {
      const { start, end } = filters.renewalDate;
      if (start) {
        params.append("startDate", start);
      }
      if (end) {
        params.append("endDate", end);
      }
    }

    if (filters.sortBy) {
      params.append("sortBy", filters.sortBy);
    }

    if (filters.sortOrder) {
      params.append("sortOrder", filters.sortOrder);
    }

    params.append("page", filters.page ?? 1);
    params.append("limit", filters.limit ?? 20);

    const queryString = params.toString();
    return this.request(
      `/api/v1/search/subscriptions${queryString ? `?${queryString}` : ""}`
    );
  }

  async getSearchSuggestions(query) {
    if (!query) {
      return { data: [] };
    }
    const params = new URLSearchParams({ q: query });
    return this.request(
      `/api/v1/search/subscriptions/suggestions?${params.toString()}`
    );
  }

  async getPopularSearches(limit = 5) {
    const params = new URLSearchParams({ limit: String(limit) });
    return this.request(
      `/api/v1/search/subscriptions/popular?${params.toString()}`
    );
  }

  // Assistant methods
  async assistantQuery(query, context = {}) {
    return this.request("/api/v1/assistant/query", {
      method: "POST",
      body: JSON.stringify({ query, context }),
    });
  }

  async getAssistantInsights() {
    return this.request("/api/v1/assistant/insights");
  }

  async sendAssistantFeedback(payload) {
    return this.request("/api/v1/assistant/feedback", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  // Workflow methods
  async sendReminder(subscriptionId, immediate = false) {
    return this.request("/api/v1/workflows/subscription/reminder", {
      method: "POST",
      body: JSON.stringify({
        subscriptionId,
        immediate,
      }),
    });
  }

  // Calendar export
  async exportCalendar() {
    return this.request("/api/v1/calendar.ics");
  }

  // Notification methods
  async getNotifications(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = `/api/v1/notifications${query ? `?${query}` : ""}`;
    return this.request(endpoint);
  }

  async getUnreadNotificationCount() {
    return this.request("/api/v1/notifications/unread-count");
  }

  async markNotificationAsRead(notificationId) {
    return this.request(`/api/v1/notifications/${notificationId}/read`, {
      method: "PATCH",
    });
  }

  async markAllNotificationsAsRead() {
    return this.request("/api/v1/notifications/mark-all-read", {
      method: "PATCH",
    });
  }

  async deleteNotification(notificationId) {
    return this.request(`/api/v1/notifications/${notificationId}`, {
      method: "DELETE",
    });
  }
}

// Hook for using API client
export const useApi = (token) => {
  return useMemo(() => new ApiClient(token), [token]);
};
