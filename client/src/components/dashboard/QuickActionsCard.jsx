import PropTypes from "prop-types";

export default function QuickActionsCard({ actions }) {
  if (actions.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-7 shadow-2xl border border-gray-700/30 backdrop-blur-sm">
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
        Quick Actions
      </h2>
      <div className="space-y-4">
        {actions.map(({ label, icon, onClick, gradient }) => (
          <button
            key={label}
            onClick={onClick}
            className={`w-full py-4 px-5 rounded-xl text-base font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-3 group bg-gradient-to-r ${gradient}`}
          >
            <span className="text-xl group-hover:scale-110 transition-transform">
              {icon}
            </span>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

QuickActionsCard.propTypes = {
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      icon: PropTypes.node.isRequired,
      onClick: PropTypes.func.isRequired,
      gradient: PropTypes.string.isRequired,
    })
  ),
};

QuickActionsCard.defaultProps = {
  actions: [],
};
