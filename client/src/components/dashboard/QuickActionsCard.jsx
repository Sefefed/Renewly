import PropTypes from "prop-types";

export default function QuickActionsCard({ actions }) {
  if (actions.length === 0) {
    return null;
  }

  return (
    <div className="dashboard-card">
      <h2 className="mb-6 text-2xl font-semibold text-primary">
        Quick Actions
      </h2>
      <div className="space-y-4">
        {actions.map(({ label, icon, onClick, gradient }) => (
          <button
            key={label}
            onClick={onClick}
            className="group flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 text-base font-semibold text-primary shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
          >
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r ${gradient} text-white transition-transform duration-200 group-hover:scale-110`}
            >
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
