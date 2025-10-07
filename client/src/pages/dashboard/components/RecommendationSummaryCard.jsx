import PropTypes from "prop-types";
import { formatCurrency } from "../../../utils/formatters";
import { DEFAULT_CURRENCY } from "../../../constants/preferences";

const RecommendationSummaryCard = ({ recommendation, currency }) => {
  if (!recommendation) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
        We couldn’t load the recommendation details. Return to the dashboard and
        try another one.
      </div>
    );
  }

  const {
    title,
    description,
    potentialSavings,
    type,
    subscriptionIds,
    metadata,
  } = recommendation;

  const formattedSavings =
    typeof potentialSavings === "number"
      ? formatCurrency(potentialSavings, currency)
      : null;

  const typedLabel = type
    ? type
        .split(/[-_]/)
        .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
        .join(" ")
    : null;

  const listSubscriptions = Array.isArray(subscriptionIds)
    ? subscriptionIds.filter(Boolean)
    : [];

  const metadataEntries =
    metadata && typeof metadata === "object"
      ? Object.entries(metadata).filter(([, value]) => value != null)
      : [];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Smart Recommendation
      </p>
      <h1 className="mt-2 text-xl font-semibold text-slate-900">
        {title || "Recommendation"}
      </h1>

      {description && (
        <p className="mt-4 text-sm leading-relaxed text-slate-700">
          {description}
        </p>
      )}

      <div className="mt-6 space-y-4 text-sm text-slate-700">
        {formattedSavings && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
              Estimated savings
            </p>
            <p className="mt-1 text-lg font-semibold text-emerald-700">
              {formattedSavings}
            </p>
          </div>
        )}

        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {typedLabel && (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Recommendation type
              </dt>
              <dd className="mt-1 font-medium text-slate-700">{typedLabel}</dd>
            </div>
          )}

          {listSubscriptions.length > 0 && (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Related subscriptions
              </dt>
              <dd className="mt-2 flex flex-wrap gap-2">
                {listSubscriptions.map((id) => (
                  <span
                    key={id}
                    className="inline-flex items-center rounded-full bg-violet-50 py-1 text-xs font-medium text-violet-700"
                  >
                    {id}
                  </span>
                ))}
              </dd>
            </div>
          )}
        </dl>

        {metadataEntries.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Additional context
            </p>
            <dl className="mt-3 space-y-2 text-xs text-slate-600">
              {metadataEntries.map(([key, value]) => (
                <div key={key} className="flex justify-between gap-4">
                  <dt className="font-medium capitalize text-slate-500">
                    {key.replace(/[-_]/g, " ")}
                  </dt>
                  <dd className="text-right text-slate-700">
                    {typeof value === "number"
                      ? value.toLocaleString()
                      : String(value)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>
    </div>
  );
};

RecommendationSummaryCard.propTypes = {
  recommendation: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    potentialSavings: PropTypes.number,
    type: PropTypes.string,
    subscriptionIds: PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    ),
    metadata: PropTypes.object,
  }),
  currency: PropTypes.string,
};

RecommendationSummaryCard.defaultProps = {
  recommendation: null,
  currency: DEFAULT_CURRENCY,
};

export default RecommendationSummaryCard;
