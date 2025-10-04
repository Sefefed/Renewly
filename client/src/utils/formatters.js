// Utility functions for formatting data consistently across the app
import { DEFAULT_CURRENCY } from "../constants/preferences";

export const formatCurrency = (amount, currency = DEFAULT_CURRENCY) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

export const formatDate = (dateString, options = {}) => {
  const defaultOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  };

  return new Date(dateString).toLocaleDateString("en-US", {
    ...defaultOptions,
    ...options,
  });
};

export const formatRelativeDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = date - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return `${Math.abs(diffDays)} days ago`;
  } else if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "Tomorrow";
  } else if (diffDays <= 7) {
    return `In ${diffDays} days`;
  } else {
    return formatDate(dateString);
  }
};

export const getStatusColor = (status) => {
  const statusColors = {
    active: "bg-green-500",
    pending: "bg-yellow-500",
    paid: "bg-green-500",
    overdue: "bg-red-500",
    cancelled: "bg-red-500",
    expired: "bg-gray-500",
  };

  return statusColors[status] || "bg-gray-500";
};

export const getStatusTextColor = (status) => {
  const statusColors = {
    active: "text-green-400",
    pending: "text-yellow-400",
    paid: "text-green-400",
    overdue: "text-red-400",
    cancelled: "text-red-400",
    expired: "text-gray-400",
  };

  return statusColors[status] || "text-gray-400";
};

export const calculateMonthlyAmount = (price, frequency) => {
  switch (frequency) {
    case "monthly":
      return price;
    case "yearly":
      return price / 12;
    case "weekly":
      return price * 4.33;
    case "daily":
      return price * 30;
    default:
      return price;
  }
};

export const calculateYearlyAmount = (price, frequency) => {
  switch (frequency) {
    case "monthly":
      return price * 12;
    case "yearly":
      return price;
    case "weekly":
      return price * 52;
    case "daily":
      return price * 365;
    default:
      return price * 12;
  }
};
