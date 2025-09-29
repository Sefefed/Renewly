export const parseApiError = (status, payload, fallbackMessage) => {
  const errors = payload?.errors;
  const details = Array.isArray(errors)
    ? errors
    : errors && typeof errors === "object"
    ? Object.values(errors).flat()
    : [];

  const message =
    payload?.message ||
    payload?.error ||
    details[0] ||
    (status === 0
      ? "Network error. Please check your connection and try again."
      : fallbackMessage);

  return {
    message,
    details,
    status,
  };
};

export const toErrorState = (error, fallbackMessage) => ({
  message: error?.message || fallbackMessage,
  details: error?.details ?? [],
  status: error?.status ?? null,
});
