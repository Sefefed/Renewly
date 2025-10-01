import { formatCurrency } from "../../utils/formatters";

const renderSpendingSummary = (data, isDark) => {
  if (!data) return null;

  const background = isDark
    ? "bg-gray-600/30 text-gray-200"
    : "bg-blue-50 text-gray-700";
  const subtitle = isDark ? "text-gray-300" : "text-gray-500";
  const listColor = isDark ? "text-gray-200" : "text-gray-600";
  const totalColor = isDark ? "text-green-400" : "text-emerald-600";

  return (
    <div className={`mt-3 space-y-2 rounded-xl p-3 text-xs ${background}`}>
      <div className="flex justify-between">
        <span className={isDark ? "text-gray-200" : "text-gray-600"}>
          Monthly total
        </span>
        <span className={`font-semibold ${totalColor}`}>
          {formatCurrency(data.monthlySpending)}
        </span>
      </div>
      {data.topCategories?.length ? (
        <div>
          <p className={`mb-1 ${subtitle}`}>Top categories</p>
          <ul className={`space-y-1 ${listColor}`}>
            {data.topCategories.map((category) => (
              <li key={category.name} className="flex justify-between">
                <span className="capitalize">{category.name}</span>
                <span>{formatCurrency(category.amount)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
};

const renderSavingsRecommendation = (data, isDark) => {
  if (!data?.opportunities?.length) return null;

  const container = isDark
    ? "bg-emerald-600/10 text-emerald-100"
    : "bg-emerald-50 text-emerald-700";
  const heading = isDark ? "text-emerald-300" : "text-emerald-600";

  return (
    <div className={`mt-3 rounded-xl p-3 text-xs ${container}`}>
      <p className={`mb-2 ${heading}`}>Quick wins</p>
      <ul className="space-y-1">
        {data.opportunities.map((item, index) => (
          <li key={`${item.title}-${index}`} className="flex justify-between">
            <span className="mr-2 flex-1 text-left">{item.title}</span>
            {item.potentialSavings ? (
              <span>{formatCurrency(item.potentialSavings)}</span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
};

const renderTrendOverview = (data, isDark) => {
  if (!data) return null;

  const container = isDark ? "bg-blue-600/10" : "bg-blue-50";
  const textColor = isDark ? "text-blue-200" : "text-blue-700";
  const subtle = isDark ? "text-blue-100" : "text-blue-600";

  return (
    <div className={`mt-3 space-y-2 rounded-xl p-3 text-xs ${container}`}>
      {data.predictedSpending ? (
        <div className={`flex justify-between ${textColor}`}>
          <span>Forecast</span>
          <span className="font-semibold">
            {formatCurrency(data.predictedSpending.predictedAmount)}
          </span>
        </div>
      ) : null}
      {data.anomalies?.length ? (
        <div className={subtle}>
          {data.anomalies.length} anomaly
          {data.anomalies.length === 1 ? "" : "ies"} detected
        </div>
      ) : (
        <div className={subtle}>No anomalies detected</div>
      )}
    </div>
  );
};

const renderAlertSummary = (data, isDark) => {
  if (!data?.alerts?.length) return null;

  const container = isDark ? "bg-orange-600/10" : "bg-orange-50";
  const textColor = isDark ? "text-orange-200" : "text-orange-700";
  const bodyColor = isDark ? "text-orange-100/80" : "text-orange-600/80";

  return (
    <div className={`mt-3 space-y-2 rounded-xl p-3 text-xs ${container}`}>
      {data.alerts.slice(0, 3).map((alert, index) => (
        <div
          key={`${alert.title}-${index}`}
          className={`flex items-start justify-between gap-3 ${textColor}`}
        >
          <div>
            <p className="font-semibold">{alert.title}</p>
            <p className={`text-[11px] ${bodyColor}`}>{alert.message}</p>
          </div>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] uppercase ${
              alert.severity === "high"
                ? isDark
                  ? "bg-red-500/20 text-red-300"
                  : "bg-red-100 text-red-600"
                : isDark
                ? "bg-orange-500/20 text-orange-300"
                : "bg-orange-100 text-orange-600"
            }`}
          >
            {alert.severity}
          </span>
        </div>
      ))}
    </div>
  );
};

export const renderDataBlock = (type, data, isDark) => {
  switch (type) {
    case "spendingSummary":
      return renderSpendingSummary(data, isDark);
    case "savingsRecommendation":
      return renderSavingsRecommendation(data, isDark);
    case "trendOverview":
      return renderTrendOverview(data, isDark);
    case "alerts":
      return renderAlertSummary(data, isDark);
    default:
      return null;
  }
};
