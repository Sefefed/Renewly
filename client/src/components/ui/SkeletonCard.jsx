import PropTypes from "prop-types";

const SkeletonCard = ({ lines, showIcon, className, pulseOnly, style }) => {
  const lineArray = Array.from({ length: lines });

  return (
    <div
      className={`bg-gradient-to-br from-white via-slate-50 to-slate-100 rounded-2xl border border-slate-200 shadow-lg overflow-hidden ${
        className || ""
      }`}
      style={style}
    >
      <div className={pulseOnly ? "animate-pulse" : "animate-pulse"}>
        <div className="flex items-center justify-between gap-6 p-6">
          <div className="space-y-3 w-full">
            {lineArray.map((_, index) => {
              const heightClass = index === 0 ? "h-4" : "h-3";
              const widthClass =
                index === 0 ? "w-24" : index === 1 ? "w-32" : "w-20";
              return (
                <div
                  key={`skeleton-line-${index}`}
                  className={`${heightClass} ${widthClass} rounded-lg bg-slate-200/80 bg-size-200 animate-shimmer`}
                ></div>
              );
            })}
          </div>
          {showIcon && (
            <div className="flex w-14 h-14 rounded-2xl bg-slate-200/80 bg-size-200 animate-shimmer"></div>
          )}
        </div>
      </div>
    </div>
  );
};

SkeletonCard.propTypes = {
  lines: PropTypes.number,
  showIcon: PropTypes.bool,
  className: PropTypes.string,
  pulseOnly: PropTypes.bool,
  style: PropTypes.object,
};

SkeletonCard.defaultProps = {
  lines: 2,
  showIcon: true,
  className: "",
  pulseOnly: false,
  style: undefined,
};

export default SkeletonCard;
