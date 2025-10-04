import PropTypes from "prop-types";
import { formatCurrency, formatDate } from "../../../utils/formatters";
import { DEFAULT_CURRENCY } from "../../../constants/preferences";

const DrilldownModal = ({ data, currency, onClose }) => {
  if (!data) return null;

  const renderContent = () => {
    if (data?.type === "spike" || data?.type === "drop") {
      return (
        <div className="space-y-3">
          <p className="text-sm text-gray-300">
            The system detected a{" "}
            {data.type === "spike" ? "spending spike" : "drop"} on{" "}
            <span className="font-semibold text-white">
              {formatDate(data.date)}
            </span>
            .
          </p>
          <p className="text-sm text-gray-400">
            Amount recorded: {formatCurrency(data.amount, currency)} (Deviation
            of {data.deviation}% from your average daily spend in this period.)
          </p>
        </div>
      );
    }

    if (data?.title && data?.description) {
      return (
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-white">{data.title}</h4>
          <p className="text-sm leading-relaxed text-gray-300">
            {data.description}
          </p>
          {typeof data.potentialSavings === "number" && (
            <p className="text-sm text-emerald-300">
              Potential savings:{" "}
              {formatCurrency(data.potentialSavings, currency)}
            </p>
          )}
        </div>
      );
    }

    if (data?.label && data?.value) {
      return (
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-white">{data.label}</h4>
          <p className="text-sm text-gray-400">
            Total spend: {formatCurrency(data.value, currency)}
          </p>
        </div>
      );
    }

    if (data?.name && data?.renewalDate) {
      return (
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-white">{data.name}</h4>
          <p className="text-sm text-gray-300">
            Renewal on {formatDate(data.renewalDate)}
          </p>
        </div>
      );
    }

    return (
      <pre className="rounded-xl bg-gray-900/80 p-4 text-xs text-gray-300">
        {JSON.stringify(data, null, 2)}
      </pre>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-8">
      <div className="relative w-full max-w-lg rounded-3xl border border-gray-700/50 bg-gradient-to-br from-gray-800 to-gray-900 p-8 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 text-2xl text-gray-400 transition-colors hover:text-white"
          aria-label="Close insight details"
        >
          ×
        </button>
        <div className="space-y-4">
          <h3 className="text-2xl font-semibold text-white">Insight Details</h3>
          {renderContent()}
        </div>
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-gray-800 px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

DrilldownModal.propTypes = {
  data: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  currency: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};

DrilldownModal.defaultProps = {
  data: null,
  currency: DEFAULT_CURRENCY,
};

export default DrilldownModal;
