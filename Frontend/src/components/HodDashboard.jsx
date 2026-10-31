import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import DashboardCards from "./DashboardCards";
import StatusModal from "./StatusModal";
import { getAssignedComplaints } from "../api/complaints";
import { updateAssignedComplaint } from "../api/complaints";
import axios from "axios";
function HodDashboard() {
  const [myAssignedComplaints, setMyAssignedComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState({});
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState("");
  const name = localStorage.getItem("name");
  const id = localStorage.getItem("id");
  const [filterStatus, setFilterStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const backendUrl = "http://localhost:8000"; // Replace with your actual backend URL/port

  // 2. Format the path: Handle potential nulls, and replace backslashes (\) with forward slashes (/)
  const formattedPath = selectedComplaint?.image
    ? selectedComplaint.image.replace(/\\/g, "/")
    : "";

  // 3. Combine them to get the final usable URL
  const fullImageUrl = formattedPath ? `${backendUrl}/${formattedPath}` : "";
  console.log(selectedComplaint);
  useEffect(() => {
    getMyComplaints();
  }, []);
  async function getMyComplaints() {
    try {
      const token = localStorage.getItem("token");

      const res = await getAssignedComplaints(token, id);
      console.log(res);
      res.data.myComplaints && setMyAssignedComplaints(res.data.myComplaints);
    } catch (err) {
      console.log(err);
    }
  }
  async function updateComplaint(id, complaintStatus) {
    const token = localStorage.getItem("token");

    try {
      const res = await updateAssignedComplaint(token, id, complaintStatus);
      res.data.message === "Status updated successfully!" &&
        setMyAssignedComplaints((prev) =>
          prev.map((complaint) =>
            complaint._id === id
              ? { ...complaint, status: complaintStatus }
              : complaint,
          ),
        );
      setStatus(res.data.success);
      setMessage(res.data.message || "Status Updated successfully!");
      const modal = new window.bootstrap.Modal(
        document.getElementById("statusModal"),
      );
      modal.show();
    } catch (err) {
      console.log(err);
    }
  }

  const filteredComplaints = myAssignedComplaints.filter((complaint) => {
    const matchesStatus =
      filterStatus === "" || complaint.status === filterStatus;
    const matchesSearch =
      searchTerm === "" ||
      complaint.complaintTitle
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      complaint.studentPinNo.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });
  return (
    <>
      <div>
        <Navbar dashboard="HOD" name={name} />
      </div>

      <div
        className={`container-fluid w-100 ${myAssignedComplaints.length == 0 && "d-none"}`}
      >
        <DashboardCards complaints={myAssignedComplaints} />
        <StatusModal success={status} message={message} />

        <div className="container-fluid dashboard-cards card w-75 justify-content-center align-items-center mt-5 p-3 ">
          <div className="w-100 p-0">
            <form className="row g-3 align-items-center">
              <div className="col-12 col-md-8">
                <div className="position-relative w-100">
                  <i className="fa fa-search position-absolute top-50 start-0 translate-middle-y ms-2 text-secondary"></i>
                  <input
                    type="text"
                    placeholder="Search by complaint title, student pinNo..."
                    className="form-control ps-5"
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-12 col-md-4 d-flex flex-row gap-1  text-secondary">
                <i className="fa-solid fa-filter pt-2 fs-5"></i>
                <select
                  className="form-select text-dark"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="">All Complaints</option>
                  <option value="Pending">Pending</option>
                  <option value="Re-Solved">Resolved</option>
                  <option value="In-Progress">In-Progress</option>
                  <option value="Submitted">Submitted</option>
                </select>
              </div>
            </form>
          </div>
        </div>
        {filteredComplaints.length > 0 && filteredComplaints ? (
          <div className=" container-fluid d-flex flex-column mt-3 hod-complaint-table justify-content-center dashboard-cards">
            <div className="flex-grow-1">
              <h4 className="text-center mt-3">Complaints</h4>

              <div className="px-3 table-responsive w-100 d-flex align-items-center text-center justify-content-center">
                <table className="table table  text-white text-center rounded table- table-responsive w-100">
                  <thead className="border-radius">
                    <tr className="border-radius py-5 ">
                      <th scope="col" className="p-3 text-primary">
                        ID
                      </th>
                      <th scope="col" className="p-3 text-primary">
                        Title
                      </th>
                      <th scope="col" className="p-3 text-primary">
                        Student Pin
                      </th>
                      <th scope="col" className="p-3 text-primary">
                        Category
                      </th>
                      <th scope="col" className="p-3 text-primary">
                        Urgency
                      </th>
                      <th scope="col" className="p-3 text-primary">
                        Status
                      </th>
                      <th scope="col" className="p-3 text-primary">
                        Date
                      </th>
                      <th scope="col" className="p-3 text-primary">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="align-items-center">
                    {filteredComplaints.map((complaint, index) => (
                      <tr className="" key={complaint._id}>
                        <td className="py-3">#{index + 1}</td>
                        <td className="py-3">{complaint.complaintTitle}</td>
                        <td className="py-3">
                          <p className="">
                            {complaint.studentPinNo || "Anonymous"}
                          </p>
                        </td>
                        <td className="py-3">{complaint.branchName}</td>
                        <td
                          className={`py-3 ${
                            complaint.urgency === "High"
                              ? "text-danger"
                              : complaint.urgency === "Medium"
                                ? "text-warning"
                                : "text-success"
                          }`}
                        >
                          {complaint.urgency}
                        </td>
                        <td className="py-3">{complaint.status}</td>
                        <td className="py-3">
                          {new Date(complaint.createdAt).toLocaleDateString()}
                        </td>
                        <td
                          className="py-3 text-danger cursor-pointer"
                          data-bs-toggle="modal"
                          data-bs-target="#complaintDetails"
                          onClick={() => setSelectedComplaint(complaint)}
                        >
                          <i className="fa-solid fa-eye text-center mt-1 "></i>
                          <span>View</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center w-100 mt-5 fs-4">
            <p className="text-center bg-none ">Oops! No Complaints Found</p>
          </div>
        )}

        {/* /Complaint Details Modal */}

        <div
          className="modal fade modal-lg"
          id="complaintDetails"
          data-bs-backdrop="static"
          data-bs-keyboard="false"
          tabIndex="-1"
          aria-labelledby="complaintDetailsLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-centered ">
            <div className="modal-content">
              <div className="modal-header bg-gradient-blue">
                <h1
                  className=" fs-5 pt-1 text-light"
                  id="complaintDetailsLabel"
                >
                  Complaint
                </h1>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <div className="d-flex flex-row gap-5 w-100">
                  <div className="w-25">
                    <p className="mb-0">Title</p>
                    <p className="outfit-font-lighter mt-0">
                      {selectedComplaint.complaintTitle}
                    </p>
                  </div>
                  <div className="w-50">
                    <p className="mb-0">Urgency</p>
                    <p className="outfit-font-lighter mt-0">
                      {selectedComplaint.urgency}
                    </p>
                  </div>
                </div>

                <div className="d-flex flex-row w-100 gap-3">
                  <div className="w-50">
                    <p className="mb-0">Date of Submission</p>
                    <p className="outfit-font-lighter mt-0">
                      {new Date(
                        selectedComplaint.createdAt,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="w-25">
                    <p className="mb-0">Department</p>
                    <p className="outfit-font-lighter mt-0">
                      {selectedComplaint.branchName}
                    </p>
                  </div>
                  <div className="w-25">
                    <p className="mb-0">Status</p>
                    <p className="outfit-font-lighter mt-0">
                      {selectedComplaint.status}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="mb-0">Description</p>
                  <p className="outfit-font-lighter mt-0">
                    {selectedComplaint.complaintDescription}
                  </p>
                </div>
                <div>
                  <p className="mb-0">Image</p>

                  {/* 4. Use the formatted full URL, and optionally only render if an image exists */}
                  {fullImageUrl ? (
                    <img
                      src={fullImageUrl}
                      alt="complaint image"
                      style={{ maxWidth: "100%", height: "250px" }} // Added styling to prevent massive images
                    />
                  ) : (
                    <p>No image provided.</p> // Fallback if there is no image
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() =>
                    updateComplaint(selectedComplaint._id, "Re-Solved")
                  }
                  data-bs-dismiss="modal"
                >
                  Mark as Resolved
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() =>
                    updateComplaint(selectedComplaint._id, "In-Progress")
                  }
                  data-bs-dismiss="modal"
                >
                  Mark as In-Progress
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() =>
                    updateComplaint(selectedComplaint._id, "Pending")
                  }
                  data-bs-dismiss="modal"
                >
                  Mark as Pending
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        className={`text-center mt-5 fs-5 d-flex align-items-center justify-content-center ${
          myAssignedComplaints.length > 0 ? "d-none" : "d-block"
        }`}
      >
        <p className="mt-5">No Complaints Assigned Yet!</p>
      </div>
    </>
  );
}

export default HodDashboard;
