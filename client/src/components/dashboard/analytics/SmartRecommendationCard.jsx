import PropTypes from "prop-types";
import { formatCurrency } from "../../../utils/formatters";

const SmartRecommendationCard = ({ opportunity, currency, onAskAssistant }) => {
  const { title, description, potentialSavings, type, subscriptionIds } =
    opportunity;

  const handleAskAssistant = () => {
    onAskAssistant?.(opportunity);
  };

  const hasSubscriptions =
    Array.isArray(subscriptionIds) && subscriptionIds.length > 0;

  return (
    <div className="rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 via-sky-100/70 to-white p-5 shadow-sm ring-1 ring-white/40 transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <p className="text-base font-semibold text-sky-800">{title}</p>
          {description ? (
            <p className="text-sm font-medium text-sky-700/90">{description}</p>
          ) : null}
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-violet-500">
            {type ? (
              <span className="rounded-full bg-white/80 px-3 py-1 text-violet-600 shadow-sm ring-1 ring-violet-200">
                {type}
              </span>
            ) : null}
            {hasSubscriptions ? (
              <span className="rounded-full bg-white/80 px-3 py-1 text-violet-600 shadow-sm ring-1 ring-violet-200">
                {subscriptionIds.length} linked subscription
                {subscriptionIds.length > 1 ? "s" : ""}
              </span>
            ) : null}
          </div>
        </div>
        {typeof potentialSavings === "number" ? (
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">
              Potential savings
            </p>
            <p className="text-xl font-bold text-sky-800">
              {formatCurrency(potentialSavings, currency)}
            </p>
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={handleAskAssistant}
          className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/40 transition hover:bg-sky-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!onAskAssistant}
        >
          <span aria-hidden="true" role="img">
            🤖
          </span>
          Ask AI for next steps
        </button>
      </div>
    </div>
  );
};

SmartRecommendationCard.propTypes = {
  opportunity: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    potentialSavings: PropTypes.number,
    type: PropTypes.string,
    subscriptionIds: PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    ),
  }).isRequired,
  currency: PropTypes.string,
  onAskAssistant: PropTypes.func,
};

SmartRecommendationCard.defaultProps = {
  currency: "USD",
  onAskAssistant: undefined,
};

export default SmartRecommendationCard;
