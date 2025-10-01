import PropTypes from "prop-types";
import { formatCurrency } from "../../../utils/formatters";

const TREND_STYLES = {
  up: { emoji: "📈", className: "text-green-400" },
  down: { emoji: "📉", className: "text-red-400" },
  stable: { emoji: "➡️", className: "text-gray-400" },
  opportunity: { emoji: "💰", className: "text-amber-300" },
  alert: { emoji: "⚠️", className: "text-orange-400" },
};

const COLOR_BG = {
  blue: "from-blue-500/20",
  green: "from-emerald-500/20",
  purple: "from-purple-500/20",
  orange: "from-orange-500/20",
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
    <div className="relative overflow-hidden rounded-2xl border border-gray-700/40 bg-gradient-to-br from-gray-800/70 to-gray-900/70 p-6 shadow-2xl transition-all duration-500 hover:border-blue-500/40">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${
              COLOR_BG[color] ?? COLOR_BG.blue
            }`}
          >
            <span className="text-2xl" aria-hidden="true">
              {icon}
            </span>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-400">
              {title}
            </p>
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          </div>
        </div>
        <div
          className={`flex items-center gap-1 text-sm font-medium ${trendMeta.className}`}
        >
          <span>{trendMeta.emoji}</span>
        </div>
      </div>

      <div className="mt-6 text-3xl font-bold text-white">{displayValue}</div>

      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 hover:opacity-100">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-transparent" />
      </div>
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
