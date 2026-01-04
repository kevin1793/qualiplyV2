import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";

export default function JobView() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const jobDoc = await getDoc(doc(db, "jobs", jobId));
        if (jobDoc.exists()) {
          setJob({ id: jobDoc.id, ...jobDoc.data() });
        } else {
          console.warn("Job not found");
        }
      } catch (err) {
        console.error("Error fetching job:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  if (loading) return <div className="p-6">Loading…</div>;
  if (!job) return <div className="p-6">Job not found</div>;

  return (
    <div className="p-6 space-y-4">
      <button
        onClick={() => navigate(-1)}
        className="text-slate-700 hover:underline"
      >
        &larr; Back
      </button>

      <h1 className="text-2xl font-bold text-slate-800">{job.jobTitle}</h1>
      <p className="text-slate-500">{job.department}</p>

      <div className="bg-slate-100 rounded-xl p-4 space-y-3">
        <p>
          <span className="font-semibold">Location Type:</span> {job.locationType}
        </p>
        {job.location && (
          <p>
            <span className="font-semibold">Location:</span> {job.location}
          </p>
        )}

        <p>
          <span className="font-semibold">Employment Type:</span>{" "}
          {job.employmentType?.join(", ")}
        </p>

        <p>
          <span className="font-semibold">Pay Type:</span> {job.payType}
          {(job.payType === "Salary" || job.payType === "Hourly") && (
            <>
              {" "}
              - {job.payMin || "-"} to {job.payMax || "-"}
            </>
          )}
        </p>

        <p>
          <span className="font-semibold">Status:</span> {job.status}
        </p>
      </div>

      {/* Text areas */}
      {job.jobDescription && (
        <div className="bg-slate-100 rounded-xl p-4">
          <h2 className="font-semibold text-slate-800 mb-2">Job Description</h2>
          <p className="whitespace-pre-line text-slate-700">{job.jobDescription}</p>
        </div>
      )}

      {job.responsibilities && (
        <div className="bg-slate-100 rounded-xl p-4">
          <h2 className="font-semibold text-slate-800 mb-2">Responsibilities</h2>
          <p className="whitespace-pre-line text-slate-700">{job.responsibilities}</p>
        </div>
      )}

      {job.qualifications && (
        <div className="bg-slate-100 rounded-xl p-4">
          <h2 className="font-semibold text-slate-800 mb-2">Qualifications</h2>
          <p className="whitespace-pre-line text-slate-700">{job.qualifications}</p>
        </div>
      )}

      {job.benefits && (
        <div className="bg-slate-100 rounded-xl p-4">
          <h2 className="font-semibold text-slate-800 mb-2">Benefits</h2>
          <p className="whitespace-pre-line text-slate-700">{job.benefits}</p>
        </div>
      )}
    </div>
  );
}
