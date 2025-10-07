import PropTypes from "prop-types";
import { PRIORITY_BADGE, formatLabel } from "../utils/alertFormatting";

const AlertSummaryCard = ({ alert }) => {
  if (!alert) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Predictive Alert
          </p>
          <h1 className="mt-2 text-xl font-semibold text-slate-900">
            {alert.title || "Alert details"}
          </h1>
        </div>
        {alert.priority && (
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              PRIORITY_BADGE[alert.priority] ?? PRIORITY_BADGE.low
            }`}
          >
            {formatLabel(alert.priority)}
          </span>
        )}
      </div>

      {alert.message && (
        <p className="mb-4 mt-4 text-sm leading-relaxed text-slate-700">
          {alert.message}
        </p>
      )}

      <dl className="mt-6 grid grid-cols-1 gap-3 text-sm text-slate-600 sm:grid-cols-2">
        {alert.type && (
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Alert type
            </dt>
            <dd className="mt-1 font-medium text-slate-700">
              {formatLabel(alert.type)}
            </dd>
          </div>
        )}
        {alert.subscriptionId && (
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Subscription
            </dt>
            <dd className="mt-1 truncate text-xs font-medium text-slate-700">
              {alert.subscriptionId}
            </dd>
          </div>
        )}
        {alert.renewalDate && (
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Renewal date
            </dt>
            <dd className="mt-1 font-medium text-slate-700">
              {new Date(alert.renewalDate).toLocaleDateString()}
            </dd>
          </div>
        )}
        {alert.predictedImpact && (
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Predicted impact
            </dt>
            <dd className="mt-1 font-medium text-slate-700">
              {alert.predictedImpact}
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
};

AlertSummaryCard.propTypes = {
  alert: PropTypes.shape({
    title: PropTypes.string,
    priority: PropTypes.string,
    message: PropTypes.string,
    type: PropTypes.string,
    subscriptionId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    renewalDate: PropTypes.string,
    predictedImpact: PropTypes.string,
  }),
};

AlertSummaryCard.defaultProps = {
  alert: null,
};

export default AlertSummaryCard;
