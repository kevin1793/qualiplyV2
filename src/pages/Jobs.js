import { Link } from "react-router-dom";

// Example jobs data — replace with API / Firestore later
const jobs = [
  { id: "frontend", title: "Frontend Developer", location: "Remote" },
  { id: "backend", title: "Backend Developer", location: "Remote" },
  { id: "designer", title: "UI/UX Designer", location: "On-site" },
];

export default function Jobs() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">
          Open Positions
        </h1>

        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white shadow-md rounded-lg p-6 flex justify-between items-center hover:shadow-lg transition"
            >
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {job.title}
                </h2>
                <p className="text-slate-500">{job.location}</p>
              </div>
              <Link
                to={`/apply/${job.id}`}
                className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition"
              >
                Apply
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
