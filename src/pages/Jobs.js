import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedJobId, setExpandedJobId] = useState(null); // track expanded job

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobsRef = collection(db, "jobs");
        const q = query(jobsRef, where("status", "==", "Live"));
        const snapshot = await getDocs(q);

        const jobsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setJobs(jobsData);
      } catch (err) {
        console.error("Error fetching jobs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  if (loading) return <div className="p-6 text-center">Loading jobs…</div>;
  if (jobs.length === 0)
    return <div className="p-6 text-center">No jobs available</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">
          Open Positions
        </h1>

        <div className="space-y-4">
          {jobs.map((job) => {
            const isExpanded = expandedJobId === job.id;
            return (
              <div
                key={job.id}
                className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition"
              >
                {/* Job header */}
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() =>
                    setExpandedJobId(isExpanded ? null : job.id)
                  }
                >
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      {job.jobTitle || job.title}
                    </h2>
                    <p className="text-slate-500">
                      {job.location && <span>{job.location}</span>}
                      {job.employmentType && (
                        <span> | {job.employmentType.join("/")}</span>
                      )}
                      {job.salaryMin && job.salaryMax && (
                        <span> | ${job.salaryMin} - ${job.salaryMax}</span>
                      )}
                      {job.hourlyMin && job.hourlyMax && (
                        <span> | ${job.hourlyMin} - ${job.hourlyMax}</span>
                      )}
                      {!job.hourlyMin && !job.salaryMin && (
                        <span> | Competitive Pay</span>
                      )}
                    </p>
                  </div>
                  <button className="text-slate-700 font-medium hover:underline">
                    {isExpanded ? "Hide Details" : "View Details"}
                  </button>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="mt-4 space-y-3 text-slate-700">
                    {job.jobDescription && (
                      <div>
                        <h3 className="font-semibold text-slate-800 mb-1">
                          Job Description
                        </h3>
                        <p className="whitespace-pre-line">{job.jobDescription}</p>
                      </div>
                    )}
                    {job.responsibilities && (
                      <div>
                        <h3 className="font-semibold text-slate-800 mb-1">
                          Responsibilities
                        </h3>
                        <p className="whitespace-pre-line">{job.responsibilities}</p>
                      </div>
                    )}
                    {job.qualifications && (
                      <div>
                        <h3 className="font-semibold text-slate-800 mb-1">
                          Qualifications
                        </h3>
                        <p className="whitespace-pre-line">{job.qualifications}</p>
                      </div>
                    )}
                    {job.benefits && (
                      <div>
                        <h3 className="font-semibold text-slate-800 mb-1">
                          Benefits
                        </h3>
                        <p className="whitespace-pre-line">{job.benefits}</p>
                      </div>
                    )}

                    {/* Apply button at bottom */}
                    <Link
                      to={`/apply/${job.id}`}
                      className="mt-4 inline-block bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition"
                    >
                      Apply
                    </Link>
                    
                    {/* Equal Opportunity Employer notice */}
                    <div className="mt-6 text-sm text-gray-500">
                      <p>
                        <strong>Restorative Care Home Health Services</strong> is an Equal Opportunity
                        Employer and values diversity at all levels of its organization. All qualified
                        applicants will receive consideration for employment without regard to race,
                        color, religion, sex, national origin, disability, or protected veteran status.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
