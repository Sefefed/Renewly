import PropTypes from "prop-types";

const RecommendedStepsCard = ({ actions }) => {
  if (!actions?.length) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-5 shadow-sm transition-all duration-300 hover:shadow-md">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-blue-600">
        Recommended steps
      </p>
      <ul className="space-y-2 text-sm text-blue-900">
        {actions.map((action) => (
          <li key={action.label} className="flex items-start gap-2">
            <span aria-hidden className="mt-1 text-lg">
              •
            </span>
            <div>
              <p className="font-medium">{action.label}</p>
              {action.query && (
                <p className="mt-1 text-xs text-blue-800/80">{action.query}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

RecommendedStepsCard.propTypes = {
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      query: PropTypes.string,
    })
  ),
};

RecommendedStepsCard.defaultProps = {
  actions: [],
};

export default RecommendedStepsCard;
