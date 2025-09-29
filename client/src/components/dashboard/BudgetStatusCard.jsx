import PropTypes from "prop-types";
import { formatCurrency } from "../../utils/formatters";

export default function BudgetStatusCard({ analysis }) {
  if (!analysis) {
    return null;
  }

  const entertainment = analysis.categoryAnalysis?.entertainment;

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-7 shadow-2xl border border-gray-700/30 backdrop-blur-sm">
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
        Budget Status
      </h2>
      <div className="space-y-7">
        <div>
          <div className="flex justify-between text-base mb-3">
            <span className="font-semibold text-gray-200">Monthly Budget</span>
            <span className="text-gray-300 font-medium">
              {formatCurrency(analysis.currentSpending)} /{" "}
              {formatCurrency(analysis.monthlyLimit)}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-1000 shadow-lg"
              style={{ width: `${Math.min(analysis.percentageUsed, 100)}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-400 mt-3 font-medium">
            {analysis.percentageUsed.toFixed(1)}% used
          </p>
        </div>

        {entertainment && (
          <div>
            <div className="flex justify-between text-base mb-3">
              <span className="font-semibold text-gray-200">Entertainment</span>
              <span className="text-gray-300 font-medium">
                {formatCurrency(entertainment.spent)} /{" "}
                {formatCurrency(entertainment.limit)}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
              <div
                className={`h-3 rounded-full transition-all duration-1000 shadow-lg ${
                  entertainment.overBudget
                    ? "bg-gradient-to-r from-red-500 to-red-600"
                    : "bg-gradient-to-r from-green-500 to-green-600"
                }`}
                style={{ width: `${Math.min(entertainment.percentage, 100)}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

BudgetStatusCard.propTypes = {
  analysis: PropTypes.shape({
    monthlyLimit: PropTypes.number,
    currentSpending: PropTypes.number,
    percentageUsed: PropTypes.number,
    categoryAnalysis: PropTypes.shape({
      entertainment: PropTypes.shape({
        spent: PropTypes.number,
        limit: PropTypes.number,
        overBudget: PropTypes.bool,
        percentage: PropTypes.number,
      }),
    }),
  }),
};

BudgetStatusCard.defaultProps = {
  analysis: null,
};
