import React from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import DashboardCards from "./DashboardCards";
import { useEffect, useState } from "react";
import axios from "axios";
import StatusModal from "./StatusModal";
import { getMyComplaints } from "../api/complaints";
import { getAllDepartments } from "../api/departments";
import { withdrawMyComplaint } from "../api/complaints";
import { raiseComplaint } from "../api/complaints";
function StudentDashboard() {
  const [myComplaints, setMyComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState({});
  const [complaintTitle, setComplaintTitle] = useState("");
  const [complaintDescription, setComplaintDescription] = useState("");
  const [department, setDepartment] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState("");
  const name = localStorage.getItem("name") || "";
  const [departments, setDepartments] = useState([]);
  const [imageFile, setImageFile] = useState(null);


  useEffect(() => {
    getComplaints();
    getDepartments();
  }, []);


  async function withdrawComplaint(id) {
    try {
      const token = localStorage.getItem("token");

      const res = await withdrawMyComplaint(token, id);
      setMyComplaints((prev) =>
        prev.filter((complaint) => complaint._id != id),
      );
      setStatus(res.data.success);
      setMessage(res.data.message || "Complaint Withdrawn successfully!");
      const modal = new window.bootstrap.Modal(
        document.getElementById("statusModal"),
      );
      modal.show();
    } catch (err) {
      console.log(err);
      setStatus(false);
      setMessage("Failed to raise complaint. Please try again.");
      const modal = new window.bootstrap.Modal(
        document.getElementById("statusModal"),
      );
      modal.show();
    }
  }

  async function raiseMyComplaint(e) {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const res = await raiseComplaint(
        complaintTitle,
        complaintDescription,
        department,
        isAnonymous,
        token,
        imageFile,
      );

      if (res.data.complaint) {
        setMyComplaints((prev) => [...prev, res.data.complaint]);
      }

      setComplaintTitle("");
      setComplaintDescription("");
      setDepartment("");
      setIsAnonymous(false);
      setImageFile(null);

      setStatus(res.data.success);
      setMessage(res.data.message || "Complaint raised successfully!");
      const modal = new window.bootstrap.Modal(
        document.getElementById("statusModal"),
      );
      modal.show();
    } catch (err) {
      console.log(err);

      // Show modal with error message
      setStatus(false);
      setMessage("Failed to raise complaint. Please try again.");
      const modal = new window.bootstrap.Modal(
        document.getElementById("statusModal"),
      );
      modal.show();
    }
  }
  async function getComplaints() {
    try {
      const token = localStorage.getItem("token");
      const studentPinNo = localStorage.getItem("pinNo");
      const res = await getMyComplaints(token, studentPinNo);
      res.data.myComplaints && setMyComplaints(res.data.myComplaints);
    } catch (err) {
      console.log(err);
    }
  }
  async function getDepartments() {
    try {
      const token = localStorage.getItem("token");

      const res = await getAllDepartments(token);
      res.data.departments && setDepartments(res.data.departments);
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div>
      <Navbar dashboard="Student" name={name} />

      {myComplaints.length > 0 ? (
        <DashboardCards complaints={myComplaints} />
      ) : (
        ""
      )}
      <StatusModal success={status} message={message} />

      <div className="container-fluid text-center cards d-flex justify-content-center align-items-center mt-5">
        {myComplaints.length > 0 ? (
          <div className="row gap-3 justify-content-center w-100">
            <button
              className="btn btn-primary py-2 w-75 mt-3 "
              data-bs-toggle="modal"
              data-bs-target="#RaiseComplaint"
            >
              <i className="fa-solid fa-plus "></i> New Complaint
            </button>
          </div>
        ) : (
          ""
        )}
      </div>
      <div className="d-flex justify-content-center mt-3">
        <div className="student-complaint-table d-flex flex-column justify-content-center align-items-center mt-5 ">
          {myComplaints.length > 0 ? (
            <div className="row border p-1 complaints-header  text-dark card dashboard-cards">
              <div className="col-lg-12 col-md-3 col-sm-11">
                <p className="mt-3 fs-4 text-dark">My Complaints</p>
              </div>
            </div>
          ) : (
            ""
          )}

          {myComplaints.length > 0 ? (
            myComplaints.map((complaint) => (
              <div
                className="row border complaints align-items-center "
                key={complaint._id}
              >
                <div className="d-flex flex-row justify-content-center align-items-center card dashboard-cards">
                  <div className="card-img text-start px-2 pt-1 pb-0 mb-0 mt-2">
                    <p className="mb-1">{complaint.complaintTitle}</p>
                    <p className="d-flex outfit-font-lighter mb-1 font-small">
                      Urgency:
                      <span>{complaint.urgency}</span>
                    </p>
                    <p className="outfit-font-lighter">
                      Branch: {complaint.branchName}
                    </p>
                  </div>
                  <div className="d-flex flex-row gap-4 w-100 justify-content-end px-2 ">
                    <div className="status gap-1 d-inline text-start ">
                      <i
                        className={`fa-solid fa-${
                          complaint.status === "Re-Solved"
                            ? "circle-check text-success"
                            : complaint.status === "In-Progress"
                              ? "hourglass-half text-primary"
                              : complaint.status === "Submitted"
                                ? "check-double text-primary"
                                : "clock primary"
                        } text-center  mt-1 fs-5`}
                      ></i>
                      <span className="text-start">{complaint.status}</span>
                    </div>

                    <div
                      className="d-flex flex-row text-danger cursor-pointer mt-1 text-start"
                      data-bs-toggle="modal"
                      data-bs-target="#ComplaintDetails"
                      onClick={() => setSelectedComplaint(complaint)}
                    >
                      <i className="fa-solid fa-eye text-center mt-1 text-danger"></i>
                      <span>View</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div>
              <p className="text-center fs-5">No Complaints yet</p>
              <p
                className="text-center text-primary cursor-pointer"
                data-bs-toggle="modal"
                data-bs-target="#RaiseComplaint"
              >
                Raise Complaint
              </p>
            </div>
          )}

          {/* Complaint Details */}

          <div
            className="modal modal-lg fade "
            id="ComplaintDetails"
            data-bs-backdrop="static"
            data-bs-keyboard="false"
            tabIndex="-1"
            aria-labelledby="ComplaintDetails"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header bg-gradient-blue text-light">
                  <h1 className=" fs-5 mt-2 " id="ComplaintDetails">
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
                        {selectedComplaint.createdAt
                          ? new Date(
                              selectedComplaint.createdAt,
                            ).toLocaleDateString()
                          : "No date"}
                      </p>
                    </div>
                    <div className="w-25">
                      <p className="mb-0">Department</p>
                      <p className="outfit-font-lighter mt-0">
                        {selectedComplaint.branchName}
                      </p>
                    </div>
                    <div className="w-25">
                      <p className="mb-0 ms-1">Status</p>
                      <p className="outfit-font-lighter mt-0">
                        <span>
                          <i
                            className={`fa-solid fa-${
                              selectedComplaint.status === "Re-Solved"
                                ? "circle-check text-success"
                                : selectedComplaint.status === "In-Progress"
                                  ? "hourglass-half text-primary"
                                  : selectedComplaint.status === "Submitted"
                                    ? "check-double text-primary"
                                    : "clock primary"
                            } text-center  mt-1 fs-5`}
                          ></i>
                          {selectedComplaint.status}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="mb-0">Description</p>
                    <p className="outfit-font-lighter mt-0">
                      {selectedComplaint.complaintDescription}
                    </p>
                  </div>
                  {selectedComplaint.image && (
                    <div className="mt-3">
                      <p className="mb-2">Attached Image:</p>
                      <img
                        src={`http://localhost:8000/${selectedComplaint.image}`}
                        alt="Complaint attachment"
                        className="img-fluid rounded"
                        style={{ maxWidth: '100%', maxHeight: '300px' }}
                      />
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => withdrawComplaint(selectedComplaint._id)}
                    data-bs-dismiss="modal"
                  >
                    Withdraw Complaint
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Complaint form */}
      <div
        className="modal fade"
        id="RaiseComplaint"
        tabIndex="-1"
        aria-labelledby="RaiseComplaint"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header bg-gradient-blue">
              <h1 className="modal-title fs-5 text-light" id="RaiseComplaint">
                New Complaint
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form onSubmit={raiseMyComplaint}>
                <div className="mb-3">
                  <label htmlFor="title" className="col-form-label">
                    Complaint Title:
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="title"
                    value={complaintTitle}
                    onChange={(e) => setComplaintTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="Description" className="col-form-label">
                    Complaint Description:
                  </label>
                  <textarea
                    className="form-control"
                    id="Description"
                    value={complaintDescription}
                    onChange={(e) => setComplaintDescription(e.target.value)}
                    required
                  ></textarea>
                </div>
                <div className="mb-3">
                  <label htmlFor="image" className="col-form-label">
                    Upload Image (Optional):
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    id="image"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files[0])}
                  />
                  <small className="text-muted">Supported formats: JPEG, PNG, GIF. Max size: 5MB</small>
                </div>
                <div className="mb-3">
                  <label htmlFor="">Department:</label>
                  <select
                    className="form-select form-select-md border rounded mt-2"
                    id="Department"
                    onChange={(e) => setDepartment(e.target.value)}
                    required
                    value={department}
                  >
                    <option value="" className="outfit-font-lighter">
                      Department
                    </option>
                    {departments.map((department) => (
                      <option
                        value={`${department.branchName}`}
                        key={department._id}
                      >
                        {department.branchName}
                      </option>
                    ))}

                    <option value="MECH">MECH</option>
                  </select>
                </div>
                <div className="form-check mb-3">
                  <input
                    className="form-check-input cursor-pointer"
                    type="checkbox"
                    id="anonymous"
                    name="anonymous"
                    value={isAnonymous}
                    onClick={() => setIsAnonymous(!isAnonymous)}
                  />
                  <label className="form-check-label mt-1" htmlFor="anonymous">
                    Submit anonymously
                  </label>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    data-bs-dismiss="modal"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    data-bs-dismiss={
                      complaintTitle && complaintDescription && department
                        ? "modal"
                        : undefined
                    }
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
