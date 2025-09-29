import PropTypes from "prop-types";
import { formatCurrency, formatDate } from "../../utils/formatters";

export default function UpcomingRenewalsCard({ renewals }) {
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-7 shadow-2xl border border-gray-700/30 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Upcoming Renewals
        </h2>
        <span className="text-blue-400 text-sm font-medium">
          {renewals.length} items
        </span>
      </div>
      {renewals.length > 0 ? (
        <div className="space-y-4">
          {renewals.map((renewal) => (
            <div
              key={`${renewal.name}-${renewal.renewalDate}`}
              className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-700/50 to-gray-800/50 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 border border-gray-600/30 hover:border-blue-500/30 group cursor-pointer transform hover:scale-[1.02]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg">📅</span>
                </div>
                <div>
                  <p className="font-semibold text-lg text-white group-hover:text-blue-300 transition-colors">
                    {renewal.name}
                  </p>
                  <p className="text-sm text-gray-400">
                    {formatDate(renewal.renewalDate)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-xl text-blue-400">
                  {formatCurrency(renewal.price)}
                </p>
                <p className="text-sm text-gray-400 font-medium">
                  {renewal.frequency}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📅</span>
          </div>
          <p className="text-gray-400 text-lg">No upcoming renewals</p>
        </div>
      )}
    </div>
  );
}

UpcomingRenewalsCard.propTypes = {
  renewals: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      renewalDate: PropTypes.string,
      price: PropTypes.number,
      frequency: PropTypes.string,
    })
  ),
};

UpcomingRenewalsCard.defaultProps = {
  renewals: [],
};
