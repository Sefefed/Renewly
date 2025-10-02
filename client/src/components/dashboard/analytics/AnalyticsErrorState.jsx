import PropTypes from "prop-types";

const AnalyticsErrorState = ({ error, onRetry }) => (
  <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-rose-600 shadow-sm">
    <h3 className="text-xl font-semibold text-rose-700">
      We couldn&apos;t load smart insights
    </h3>
    <p className="mt-2 text-sm text-rose-500">{error}</p>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-100 hover:text-rose-700"
      >
        Try again
      </button>
    )}
  </div>
);

AnalyticsErrorState.propTypes = {
  error: PropTypes.string.isRequired,
  onRetry: PropTypes.func,
};

AnalyticsErrorState.defaultProps = {
  onRetry: undefined,
};

export default AnalyticsErrorState;
