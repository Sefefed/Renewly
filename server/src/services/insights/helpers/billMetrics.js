const TRACKED_STATUSES = new Set(["pending", "overdue"]);

const parseBillAmount = (bill) => Number(bill.amount) || 0;

export const calculateMonthlyBills = (bills) =>
  bills
    .filter((bill) => TRACKED_STATUSES.has(bill.status))
    .reduce((total, bill) => total + parseBillAmount(bill), 0);

export const calculateYearlyBills = (bills) =>
  bills.reduce((total, bill) => total + parseBillAmount(bill) * 12, 0);
