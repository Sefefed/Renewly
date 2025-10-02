import PropTypes from "prop-types";
import { formatCurrency } from "../../utils/formatters";

export default function RecommendationsCard({ recommendations }) {
  return (
    <div className="dashboard-card">
      <h2 className="mb-6 text-2xl font-semibold text-primary">
        Recommendations
      </h2>
      <div className="space-y-4">
        {recommendations.length > 0 ? (
          recommendations.map((rec, index) => (
            <div
              key={`${rec.message}-${index}`}
              className="group rounded-xl border border-amber-200 bg-amber-50 p-5 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              <p className="text-base font-semibold text-amber-700 transition-colors group-hover:text-amber-600">
                {rec.message}
              </p>
              {rec.potentialSavings && (
                <p className="mt-3 text-sm font-medium text-amber-600">
                  💰 Potential savings: {formatCurrency(rec.potentialSavings)}
                </p>
              )}
            </div>
          ))
        ) : (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100">
              <span className="text-2xl">✅</span>
            </div>
            <p className="text-lg text-secondary">
              No recommendations at this time
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

RecommendationsCard.propTypes = {
  recommendations: PropTypes.arrayOf(
    PropTypes.shape({
      message: PropTypes.string.isRequired,
      potentialSavings: PropTypes.number,
    })
  ),
};

RecommendationsCard.defaultProps = {
  recommendations: [],
};
