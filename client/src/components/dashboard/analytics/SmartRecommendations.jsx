import PropTypes from "prop-types";
import { formatCurrency } from "../../../utils/formatters";

const SmartRecommendations = ({ opportunities, currency }) => {
  if (!opportunities?.length) {
    return (
      <div className="dashboard-card dashboard-card--compact text-sm text-secondary">
        No savings opportunities detected yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {opportunities.map((opportunity) => (
        <div
          key={`${opportunity.type}-${opportunity.subscriptionIds?.join("-")}`}
          className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-emerald-600">
                {opportunity.title}
              </p>
              <p className="mt-2 text-sm text-emerald-600/90">
                {opportunity.description}
              </p>
            </div>
            {typeof opportunity.potentialSavings === "number" && (
              <div className="text-right">
                <p className="text-sm font-medium text-emerald-600">
                  Potential savings
                </p>
                <p className="text-lg font-semibold text-emerald-700">
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
