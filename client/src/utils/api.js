// Centralized API utilities for consistent API calls

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
}

// Hook for using API client
export const useApi = (token) => {
  return new ApiClient(token);
};
