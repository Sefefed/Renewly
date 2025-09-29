import PropTypes from "prop-types";
import { formatCurrency } from "../../utils/formatters";

export default function RecommendationsCard({ recommendations }) {
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-7 shadow-2xl border border-gray-700/30 backdrop-blur-sm">
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
        Recommendations
      </h2>
      <div className="space-y-4">
        {recommendations.length > 0 ? (
          recommendations.map((rec, index) => (
            <div
              key={`${rec.message}-${index}`}
              className="p-5 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 rounded-xl border-l-4 border-yellow-500 hover:from-yellow-500/20 hover:to-yellow-600/20 transition-all duration-300 group transform hover:scale-[1.02]"
            >
              <p className="text-base font-semibold text-white group-hover:text-yellow-100 transition-colors">
                {rec.message}
              </p>
              {rec.potentialSavings && (
                <p className="text-sm font-medium mt-3 bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent">
                  💰 Potential savings: {formatCurrency(rec.potentialSavings)}
                </p>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✅</span>
            </div>
            <p className="text-gray-400 text-lg">
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
