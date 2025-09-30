const parsePrice = (value) => Number(value) || 0;

export const getMonthlySubscriptionValue = (subscription) => {
  const price = parsePrice(subscription.price);

  switch (subscription.frequency) {
    case "monthly":
      return price;
    case "yearly":
      return price / 12;
    case "weekly":
      return price * 4.33;
    case "daily":
      return price * 30;
    default:
      return 0;
  }
};

export const getYearlySubscriptionValue = (subscription) => {
  const price = parsePrice(subscription.price);

  switch (subscription.frequency) {
    case "monthly":
      return price * 12;
    case "yearly":
      return price;
    case "weekly":
      return price * 52;
    case "daily":
      return price * 365;
    default:
      return 0;
  }
};

export const normalizeSubscriptionAmount = (subscription) =>
  getMonthlySubscriptionValue(subscription);

export const calculateMonthlySubscriptions = (subscriptions) =>
  subscriptions.reduce(
    (total, subscription) => total + getMonthlySubscriptionValue(subscription),
    0
  );

export const calculateYearlySubscriptions = (subscriptions) =>
  subscriptions.reduce(
    (total, subscription) => total + getYearlySubscriptionValue(subscription),
    0
  );
