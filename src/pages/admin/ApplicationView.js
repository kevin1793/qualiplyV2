import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { ref, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase";
import { useNavigate } from "react-router-dom";

export default function ApplicationView() {
  const { applicationId } = useParams(); // Get application ID from URL
  const navigate = useNavigate();

  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplication = async () => {
    try {
      const docRef = doc(db, "applications", applicationId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        let resumeURL = "";
        if (data.resumePath) {
          // If you stored the path in Firebase Storage
          resumeURL = await getDownloadURL(ref(storage, data.resumePath));
        }

        setApp({ applicationId: docSnap.id, resumeURL, ...data });
      } else {
        console.warn("No such application!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
    fetchApplication();
  }, [applicationId]);

  if (loading) return <div className="p-6 text-center">Loading application…</div>;
  if (!app) return <div className="p-6 text-center text-red-600">Application not found</div>;

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <button
        onClick={() => navigate(-1)}
        className="text-slate-700 hover:underline"
      >
        &larr; Back
      </button>
      <div className="max-w-3xl mx-auto space-y-6">

        <h1 className="text-3xl font-bold text-gray-900 text-center">Application Details</h1>

        {/* Personal Info */}
        <div className="bg-white shadow rounded-lg p-6 space-y-3">
          <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-2">Personal & Contact Info</h2>
          <p><span className="font-medium">Full Name:</span> {app.fullName}</p>
          <p><span className="font-medium">Email:</span> {app.email}</p>
          <p><span className="font-medium">Phone:</span> {app.phone}</p>
          <p><span className="font-medium">Address:</span> {app.address}</p>
          <p><span className="font-medium">Date of Birth:</span> {app.dob}</p>
          <p><span className="font-medium">Availability:</span> {app.availability?.join(", ")}</p>
        </div>

        {/* Certification & Licenses */}
        <div className="bg-white shadow rounded-lg p-6 space-y-3">
          <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-2">Certifications & Licenses</h2>
          <p><span className="font-medium">HHA Certified:</span> {app.hhaCertified}</p>
          <p>
            <span className="font-medium">Professional License:</span> {app.licenseNumber} ({app.licenseState})
          </p><p>
            <span className="font-medium">License Expiration:</span> {app.licenseExpiration || "N/A"}
          </p>
          <p><span className="font-medium">CPR Certified:</span> {app.cprCertified ? "Yes" : "No"}</p>
          <p><span className="font-medium">First Aid Certified:</span> {app.firstAidCertified ? "Yes" : "No"}</p>
          <p><span className="font-medium">Other Certifications:</span> {app.otherCertifications}</p>
        </div>

        {/* Education & Training */}
        <div className="bg-white shadow rounded-lg p-6 space-y-3">
          <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-2">Education & Training</h2>
          <p><span className="font-medium">Highest Education:</span> {app.education}</p>
          <p><span className="font-medium">Graduated:</span> {app.graduated}</p>
          <p><span className="font-medium">Training Programs:</span> {app.training || "N/A"}</p>
        </div>

        {/* Work Experience */}
        <div className="bg-white shadow rounded-lg p-6 space-y-3">
          <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-2">Work Experience</h2>
          <p><span className="font-medium">Previous Roles:</span> {app.experience}</p>
          <p><span className="font-medium">Patient Experience:</span> {app.patientExperience}</p>
          <p><span className="font-medium">References:</span> {app.references}</p>
        </div>

        {/* Skills & Competencies */}
        <div className="bg-white shadow rounded-lg p-6 space-y-3">
          <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-2">Skills & Competencies</h2>
          <p><span className="font-medium">Languages:</span> {app.languages?.join(", ")}</p>
          <p><span className="font-medium">Transportation:</span> {app.transportation || "N/A"}</p>
          <p><span className="font-medium">Work Preference:</span> {app.workPreference || "N/A"}</p>
        </div>

        {/* Background & Legal */}
        <div className="bg-white shadow rounded-lg p-6 space-y-3">
          <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-2">Background & Legal</h2>
          <p><span className="font-medium">Eligible to Work in U.S.:</span> {app.eligibility ? "Yes" : "No"}</p>
          <p><span className="font-medium">Criminal Background:</span> {app.criminalBackground ? "No convictions" : "Yes"}</p>
        </div>

        {/* Additional */}
        <div className="bg-white shadow rounded-lg p-6 space-y-3">
          <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-2">Additional Information</h2>
          <p><span className="font-medium">Cover Letter:</span> {app.coverLetter || "N/A"}</p>
          {app.resumePath && (
            <p>
              <a
                    href={app.resumeURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View Resume
                  </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
