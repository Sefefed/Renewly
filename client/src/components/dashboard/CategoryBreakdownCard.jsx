import PropTypes from "prop-types";
import { PieChart } from "../Charts";
import { formatCurrency } from "../../utils/formatters";

export default function CategoryBreakdownCard({ breakdown, isLoading }) {
  const hasBreakdown = breakdown && Object.keys(breakdown).length > 0;

  return (
    <div className="dashboard-card">
      <h2 className="mb-6 text-2xl font-semibold text-primary">
        Category Breakdown
      </h2>
      {hasBreakdown ? (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
          <div className="relative min-h-[260px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:min-h-[320px] lg:flex-[1.25] lg:min-w-0">
            {isLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/80">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
              </div>
            )}
            <PieChart data={breakdown} height={240} />
          </div>
          <div className="min-w-0 space-y-5 lg:max-h-80 lg:flex-1 lg:overflow-y-auto lg:pr-1">
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
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        
                        <div>
                          <p className="text-lg font-semibold text-primary capitalize">
                            {category}
                          </p>
                          {count !== null && (
                            <p className="text-xs text-tertiary">
                              {count} item{count === 1 ? "" : "s"}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-emerald-600">
                          {formatCurrency(amount)}
                        </p>
                        {percentage !== null && (
                          <p className="text-xs text-tertiary">
                            {percentage}% of total
                          </p>
                        )}
                      </div>
                    </div>
                    {percentage !== null && (
                      <div className="mt-4">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500"
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
        <div className="flex items-center justify-center rounded-xl border border-dashed border-slate-200 py-16 text-secondary">
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
