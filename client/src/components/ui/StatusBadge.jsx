// Reusable status badge component
import { getStatusColor, getStatusTextColor } from "../../utils/formatters";

export default function StatusBadge({ status, showDot = true }) {
  return (
    <div className="flex items-center gap-2">
      {showDot && (
        <div className={`w-2 h-2 rounded-full ${getStatusColor(status)}`}></div>
      )}
      <span className={`text-sm capitalize ${getStatusTextColor(status)}`}>
        {status}
      </span>
    </div>
  );
}
