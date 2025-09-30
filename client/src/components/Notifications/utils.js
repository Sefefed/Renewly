export const notificationIcons = {
  renewal: "🔄",
  budget: "💰",
  recommendation: "💡",
  warning: "⚠️",
  system: "ℹ️",
  bill: "📅",
};

export const getNotificationIcon = (type) => notificationIcons[type] || "📢";
