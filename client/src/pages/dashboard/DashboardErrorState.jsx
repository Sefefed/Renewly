const DashboardErrorState = ({ onRetry, onNavigateSubscriptions }) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 flex items-center justify-center px-4 text-white">
    <div className="max-w-md w-full rounded-3xl border border-red-500/20 bg-gradient-to-br from-gray-800/90 to-gray-900/90 p-12 text-center shadow-2xl backdrop-blur-xl">
      <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-red-500/20 animate-gentle-bounce">
        <span className="text-3xl">⚠️</span>
      </div>
      <h2 className="mb-4 text-2xl font-bold bg-gradient-to-r from-red-400 via-orange-400 to-amber-300 bg-clip-text text-transparent">
        Oops! Something went wrong
      </h2>
      <p className="mb-10 text-sm leading-relaxed text-gray-300">
        We couldn&apos;t load your dashboard data. This is usually temporary.
        Try refreshing the data or revisit your subscriptions to make sure
        everything looks good.
      </p>
      <div className="space-y-4">
        <button
          onClick={onRetry}
          className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 py-4 text-base font-semibold shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:scale-[1.02]"
        >
          Try Again
        </button>
        <button
          onClick={onNavigateSubscriptions}
          className="w-full rounded-xl border border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900 py-4 text-base font-semibold text-gray-200 transition-all duration-300 hover:border-gray-500 hover:text-white"
        >
          Go to Subscriptions
        </button>
      </div>
    </div>
  </div>
);

export default DashboardErrorState;
