import PropTypes from "prop-types";
import { PieChart } from "../Charts";
import { formatCurrency } from "../../utils/formatters";

export default function CategoryBreakdownCard({ breakdown, isLoading }) {
  const hasBreakdown = breakdown && Object.keys(breakdown).length > 0;

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-7 shadow-2xl border border-gray-700/30 backdrop-blur-sm">
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
        Category Breakdown
      </h2>
      {hasBreakdown ? (
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div className="relative h-80 rounded-2xl border border-gray-700/30 bg-gray-900/40 p-4">
            {isLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-gray-900/80">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
              </div>
            )}
            <PieChart data={breakdown} height={240} />
          </div>
          <div className="space-y-5 max-h-80 overflow-y-auto pr-1">
            {Object.entries(breakdown)
              .sort((a, b) => {
                const getAmount = (entry) =>
                  typeof entry === "number" ? entry : entry?.amount || 0;
                return getAmount(b[1]) - getAmount(a[1]);
              })
              .map(([category, info]) => {
                const amount =
                  typeof info === "number" ? info : info?.amount || 0;
                const percentage =
                  typeof info === "number" ? null : info?.percentage ?? null;
                const count =
                  typeof info === "number" ? null : info?.count ?? null;

                return (
                  <div
                    key={category}
                    className="rounded-xl border border-gray-700/20 bg-gradient-to-r from-gray-700/30 to-gray-800/30 p-4 transition-all duration-300 hover:from-gray-700/50 hover:to-gray-800/50"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg">
                          <span className="text-sm">📊</span>
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-white capitalize">
                            {category}
                          </p>
                          {count !== null && (
                            <p className="text-xs text-gray-400">
                              {count} item{count === 1 ? "" : "s"}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-green-300">
                          {formatCurrency(amount)}
                        </p>
                        {percentage !== null && (
                          <p className="text-xs text-gray-400">
                            {percentage}% of total
                          </p>
                        )}
                      </div>
                    </div>
                    {percentage !== null && (
                      <div className="mt-4">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-700">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-green-400 to-green-500"
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-gray-700 py-16 text-gray-400">
          No spending categories yet. Add subscriptions or bills to see
          insights.
        </div>
      )}
    </div>
  );
}

CategoryBreakdownCard.propTypes = {
  breakdown: PropTypes.objectOf(
    PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.shape({
        amount: PropTypes.number,
        count: PropTypes.number,
        percentage: PropTypes.number,
      }),
    ])
  ),
  isLoading: PropTypes.bool,
};

CategoryBreakdownCard.defaultProps = {
  breakdown: {},
  isLoading: false,
};
