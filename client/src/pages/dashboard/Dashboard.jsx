export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="border-b border-gray-800 bg-gray-950/70 px-6 py-4">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-gray-400">
          This is a placeholder view. Wire up real data when the backend is
          ready.
        </p>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-10">
        <section className="rounded-xl border border-dashed border-gray-700 bg-gray-900/40 p-8 text-center">
          <p className="text-lg font-medium">✅ Everything is wired up!</p>
          <p className="mt-2 text-sm text-gray-400">
            Add widgets or charts here to give users insight into their
            subscription renewals.
          </p>
        </section>
      </main>
    </div>
  );
}
