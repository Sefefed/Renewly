import PropTypes from "prop-types";
import { formatCurrency } from "../../../utils/formatters";

const TREND_STYLES = {
  up: { emoji: "📈", className: "text-emerald-500" },
  down: { emoji: "📉", className: "text-rose-500" },
  stable: { emoji: "➡️", className: "text-tertiary" },
  opportunity: { emoji: "�", className: "text-amber-500" },
  alert: { emoji: "⚠️", className: "text-orange-500" },
};

const COLOR_STYLES = {
  blue: "border-blue-100 bg-blue-50 text-blue-600",
  green: "border-emerald-100 bg-emerald-50 text-emerald-600",
  purple: "border-violet-100 bg-violet-50 text-violet-600",
  orange: "border-amber-100 bg-amber-50 text-amber-600",
};

const InsightCard = ({
  title,
  value,
  trend,
  icon,
  color,
  description,
  currency,
}) => {
  const trendMeta = TREND_STYLES[trend] ?? TREND_STYLES.stable;
  const numericValue = typeof value === "number" ? value : null;
  const displayValue =
    numericValue !== null ? formatCurrency(numericValue, currency) : value;

  return (
    <div
      className="dashboard-card dashboard-card--compact relative overflow-hidden"
      style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-tertiary font-semibold">
              {title}
            </p>
            <p
              className="mt-1 text-base text-secondary"
              style={{ fontWeight: 600 }}
            >
              {description}
            </p>
          </div>
        </div>
        <div
          className={`flex items-center gap-1 text-sm font-medium ${trendMeta.className}`}
        >
          <span>{trendMeta.emoji}</span>
        </div>
      </div>

      <div className="mt-6 text-4xl font-bold text-primary">{displayValue}</div>
    </div>
  );
};

InsightCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  trend: PropTypes.oneOf(["up", "down", "stable", "opportunity", "alert"]),
  icon: PropTypes.string.isRequired,
  color: PropTypes.oneOf(["blue", "green", "purple", "orange"]),
  description: PropTypes.string,
  currency: PropTypes.string,
};

InsightCard.defaultProps = {
  trend: "stable",
  color: "blue",
  description: "",
  currency: "USD",
};

export default InsightCard;
