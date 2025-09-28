import Subscription from "../models/subscriptionModel.js";
import Bill from "../models/billModel.js";

export const exportCalendar = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get all subscriptions and bills for the user
    const [subscriptions, bills] = await Promise.all([
      Subscription.find({ user: userId, status: "active" }),
      Bill.find({ user: userId }),
    ]);

    // Generate ICS content
    let icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Renewly//Subscription Manager//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
    ];

    // Add subscription renewals
    subscriptions.forEach((subscription) => {
      if (subscription.renewalDate) {
        const startDate = formatDateForICS(subscription.renewalDate);
        const endDate = formatDateForICS(
          new Date(subscription.renewalDate.getTime() + 24 * 60 * 60 * 1000)
        );

        icsContent.push(
          "BEGIN:VEVENT",
          `UID:${subscription._id}@renewly.com`,
          `DTSTART:${startDate}`,
          `DTEND:${endDate}`,
          `SUMMARY:${subscription.name} Renewal - $${subscription.price}`,
          `DESCRIPTION:${subscription.name} subscription renewal\\nCategory: ${subscription.category}\\nPayment Method: ${subscription.paymentMethod}`,
          `LOCATION:Online`,
          `STATUS:CONFIRMED`,
          `TRANSP:TRANSPARENT`,
          "END:VEVENT"
        );
      }
    });

    // Add bill due dates
    bills.forEach((bill) => {
      if (bill.dueDate) {
        const startDate = formatDateForICS(bill.dueDate);
        const endDate = formatDateForICS(
          new Date(bill.dueDate.getTime() + 24 * 60 * 60 * 1000)
        );

        icsContent.push(
          "BEGIN:VEVENT",
          `UID:${bill._id}@renewly.com`,
          `DTSTART:${startDate}`,
          `DTEND:${endDate}`,
          `SUMMARY:${bill.name} Due - $${bill.amount}`,
          `DESCRIPTION:${bill.name} bill due\\nCategory: ${bill.category}\\nPayment Method: ${bill.paymentMethod}\\nStatus: ${bill.status}`,
          `LOCATION:Online`,
          `STATUS:CONFIRMED`,
          `TRANSP:TRANSPARENT`,
          "END:VEVENT"
        );
      }
    });

    icsContent.push("END:VCALENDAR");

    // Set headers for file download
    res.setHeader("Content-Type", "text/calendar");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="renewly-calendar.ics"'
    );

    res.send(icsContent.join("\r\n"));
  } catch (error) {
    next(error);
  }
};

// Helper function to format dates for ICS format
const formatDateForICS = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
};
