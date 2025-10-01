import PropTypes from "prop-types";
import { formatCurrency } from "../../../utils/formatters";

const SmartRecommendations = ({ opportunities, currency }) => {
  if (!opportunities?.length) {
    return (
      <div className="rounded-2xl border border-gray-700/40 bg-gradient-to-br from-gray-800/70 to-gray-900/70 p-6 text-sm text-gray-400">
        No savings opportunities detected yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {opportunities.map((opportunity) => (
        <div
          key={`${opportunity.type}-${opportunity.subscriptionIds?.join("-")}`}
          className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 to-teal-500/10 p-5 transition-all duration-300 hover:border-emerald-400/60"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-emerald-200">
                {opportunity.title}
              </p>
              <p className="mt-2 text-sm text-emerald-100/80">
                {opportunity.description}
              </p>
            </div>
            {typeof opportunity.potentialSavings === "number" && (
              <div className="text-right">
                <p className="text-sm font-medium text-emerald-200">
                  Potential savings
                </p>
                <p className="text-lg font-semibold text-white">
                  {formatCurrency(opportunity.potentialSavings, currency)}
                </p>
              </div>
            )}
          </div>
        </div>
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
};

SmartRecommendations.defaultProps = {
  opportunities: [],
  currency: "USD",
};

export default SmartRecommendations;
