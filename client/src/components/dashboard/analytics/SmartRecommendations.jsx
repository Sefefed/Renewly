import PropTypes from "prop-types";
import SmartRecommendationCard from "./SmartRecommendationCard";
import { DEFAULT_CURRENCY } from "../../../constants/preferences";

const SmartRecommendations = ({ opportunities, currency, onAskAssistant }) => {
  if (!opportunities?.length) {
    return (
      <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-violet-100/70 p-6 text-center shadow-sm">
        <p className="text-sm font-medium text-violet-600">
          No savings opportunities detected yet.
        </p>
        {onAskAssistant ? (
          <button
            type="button"
            onClick={() => onAskAssistant(null)}
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:bg-violet-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            <span aria-hidden="true" role="img">
              🤖
            </span>
            Ask AI for savings ideas
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {opportunities.map((opportunity) => (
        <SmartRecommendationCard
          key={`${opportunity.type ?? "generic"}-${
            opportunity.subscriptionIds?.join("-") ?? opportunity.title
          }`}
          opportunity={opportunity}
          currency={currency}
          onAskAssistant={onAskAssistant}
        />
      ))}
    </div>
  );
};

SmartRecommendations.propTypes = {
  opportunities: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      description: PropTypes.string,
      potentialSavings: PropTypes.number,
      type: PropTypes.string,
      subscriptionIds: PropTypes.arrayOf(
        PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      ),
    })
  ),
  currency: PropTypes.string,
  onAskAssistant: PropTypes.func,
};

SmartRecommendations.defaultProps = {
  opportunities: [],
  currency: DEFAULT_CURRENCY,
  onAskAssistant: undefined,
};

export default SmartRecommendations;
