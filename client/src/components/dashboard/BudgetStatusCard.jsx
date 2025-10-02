import PropTypes from "prop-types";
import { formatCurrency } from "../../utils/formatters";

export default function BudgetStatusCard({ analysis }) {
  if (!analysis) {
    return null;
  }

  const entertainment = analysis.categoryAnalysis?.entertainment;

  return (
    <div className="dashboard-card">
      <h2 className="mb-6 text-2xl font-semibold text-primary">
        Budget Status
      </h2>
      <div className="space-y-7">
        <div>
          <div className="mb-3 flex justify-between text-base">
            <span className="font-semibold text-primary">Monthly Budget</span>
            <span className="font-medium text-secondary">
              {formatCurrency(analysis.currentSpending)} /{" "}
              {formatCurrency(analysis.monthlyLimit)}
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200 shadow-inner">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-1000 shadow-sm"
              style={{ width: `${Math.min(analysis.percentageUsed, 100)}%` }}
            ></div>
          </div>
          <p className="mt-3 text-sm font-medium text-secondary">
            {analysis.percentageUsed.toFixed(1)}% used
          </p>
        </div>

        {entertainment && (
          <div>
            <div className="mb-3 flex justify-between text-base">
              <span className="font-semibold text-primary">Entertainment</span>
              <span className="font-medium text-secondary">
                {formatCurrency(entertainment.spent)} /{" "}
                {formatCurrency(entertainment.limit)}
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200 shadow-inner">
              <div
                className={`h-3 rounded-full transition-all duration-1000 shadow-sm ${
                  entertainment.overBudget
                    ? "bg-gradient-to-r from-rose-500 to-rose-600"
                    : "bg-gradient-to-r from-emerald-500 to-emerald-600"
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
