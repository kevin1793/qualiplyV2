export default function Dashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-4">
        Admin Dashboard
      </h1>
      <p className="text-slate-600">
        Welcome! From here, you can manage applications, jobs, and users.
      </p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="font-semibold text-slate-800">Applications</h2>
          <p className="text-slate-500 mt-2">View and manage all applications.</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="font-semibold text-slate-800">Jobs</h2>
          <p className="text-slate-500 mt-2">Create or edit job listings.</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="font-semibold text-slate-800">Users</h2>
          <p className="text-slate-500 mt-2">Manage admin and applicant accounts.</p>
        </div>
      </div>
    </div>
  );
}
