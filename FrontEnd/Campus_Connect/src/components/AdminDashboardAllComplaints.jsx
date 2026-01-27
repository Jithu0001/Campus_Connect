import React, { useEffect, useState } from "react";
import DashboardCards from "./DashboardCards";
import Navbar from "./Navbar";
import { Link } from "react-router-dom";
import axios from "axios";
import StatusModal from "./StatusModal";

function AdminDashboardAllComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState({});
  const [reassignTo, setReassignTo] = useState("");
  const name = localStorage.getItem("name") || "";
  const [modalStatus, setStatus] = useState(null);
  const [message, setMessage] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [departments, setDepartments] = useState([])
  useEffect(() => {
    async function getComplaints() {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(`http://localhost:8000/all-complaints`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        res.data.complaints && setComplaints(res.data.complaints);
      } catch (err) {
        console.log(err);
      }
    }
    getComplaints();
    async function getDepartments() {
            try {
              const token = localStorage.getItem("token");
      
              const res = await axios.get(
                `http://localhost:8000/all-departments`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              res.data.departments && setDepartments(res.data.departments);
            } catch (err) {
              console.log(err);
            }
          }
          getDepartments();
       
  }, []);
  async function reassignComplaint(e) {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      const res = await axios.put(
        `http://localhost:8000/all-complaints/modify-complaint/${selectedComplaint._id}`,
        {
          branchName: reassignTo,
          status: "Re-Assigned",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      res.data.message === "Complaint details updated successfully!" &&
        setComplaints((prev) =>
          prev.map((complaint) =>
            complaint._id === selectedComplaint._id
              ? { ...complaint, branchName: reassignTo, status: "Re-Assigned", assignedTo: res.data.complaint.assignedTo }
              : complaint
          )
        );

      setStatus(res.data.success);
      setMessage(res.data.message || "Complaint Re-assigned successfully!");
      const modal = new window.bootstrap.Modal(
        document.getElementById("statusModal")
      );
      modal.show();
      setReassignTo("");
    } catch (err) {
      console.error("Error reassigning complaint:", err);
     
      setStatus(false);
      setMessage("Failed to Re-assign Complaint!");
      const modal = new window.bootstrap.Modal(
        document.getElementById("statusModal")
      );
      modal.show();
    }
  }
  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredComplaints = complaints.filter((complaint) => {
    const title = (complaint.complaintTitle || "").toLowerCase();
    const pinNo = (complaint.studentPinNo || "").toLowerCase();

    const matchesStatus = !filterStatus || complaint.status === filterStatus;

    const matchesSearch =
      !normalizedSearch ||
      title.includes(normalizedSearch) ||
      pinNo.includes(normalizedSearch);

    return matchesStatus && matchesSearch;
  });


  return (
    <div>
      <Navbar dashboard="Admin" name={name} />
      <StatusModal message={message} success={modalStatus} />
      <div>
        <div className="container-fluid pt-3 border">
          <div className="d-flex flex-row  gap-5 text-start justify-content-center align-items-center ">
            <Link
              to="/admin-dashboard"
              className="cursor-pointer  text-decoration-none admin-nav"
            >
              <i className="fa-regular fa-chart-bar"></i> Overview
            </Link>
            <div className="admin-bg py-2">
              <Link
                to="/admin-dashboard/all-complaints"
                className="cursor-pointer text-decoration-none"
              >
                <i className="fa-solid fa-file"></i> All Complaints
              </Link>
            </div>
            <Link
              to="/admin-dashboard/settings"
              className="cursor-pointer text-decoration-none admin-nav"
            >
              <i className="fa-solid fa-gears"></i> Settings
            </Link>
          </div>
        </div>
      </div>
      {complaints && complaints.length > 0 ? (
        <>
          <div className="px-4">
            <div className="container-fluid card dashboard-cards rounded justify-content-center align-items-center mt-5 p-4 ">
              <div className="w-100 p-0">
                <form className="row g-3 align-items-center">
                  <div className="col-12 col-md-8">
                    <div className="position-relative w-100">
                      <i className="fa fa-search position-absolute top-50 start-0 translate-middle-y ms-2 text-secondary"></i>
                      <input
                        type="text"
                        placeholder="Search by Student roll number, complaint title..."
                        className="form-control ps-5"
                        onChange={(e) => setSearchTerm(e.target.value.trim())}
                      />
                    </div>
                  </div>
                  <div className="col-12 col-md-4 d-flex flex-row gap-1  text-secondary">
                    <i className="fa-solid fa-filter pt-2 fs-5"></i>
                    <select
                      className="form-select text-dark"
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="" >
                        All Complaints
                      </option>
                      <option value="Pending">Pending</option>
                      <option value="Re-Solved">Resolved</option>
                      <option value="In-Progress">In-Progress</option>
                      <option value="Re-Assigned">Re-Assigned</option>
                    </select>
                  </div>
                </form>
              </div>
            </div>
          </div>
          {filteredComplaints && filteredComplaints.length > 0 ? <div className=" container-fluid d-flex flex-column mt-3 w-100 justify-content-center dashboard-cards">
            <div className="flex-grow-1">
              <h4 className="text-center mt-3">Complaints</h4>
              <div className="px-3 table-responsive card">
                <table className="table table  text-white text-center  table-responsive">
                  <thead className="border-radius ">
                    <tr className="border-radius py-5 ">
                      <th scope="col" className="p-3 text-primary">
                        ID
                      </th>
                      <th scope="col" className="p-3 text-primary">
                        Title
                      </th>
                      <th scope="col" className="p-3 text-primary">
                        Student
                      </th>
                      <th scope="col" className="p-3 text-primary">
                        Branch
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
                    {filteredComplaints.map((complaint, index) => {
                      return (
                        <tr className="" key={complaint._id}>
                          <td className="py-3">#{index + 1}</td>
                          <td className="py-3">{complaint.complaintTitle}</td>
                          <td className="py-3">
                            {complaint.anonymous != true
                              ? complaint.studentPinNo
                              : "Anonymous"}
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
                          <td className="py-3">{complaint.status}
                            <span className="text-danger"><br />{complaint.assignedTo === null ? "Not Assigned Yet" : ""}</span>
                          </td>
                          <td className="py-3">
                            {new Date(complaint.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 text-danger cursor-pointer">
                            <span
                              data-bs-toggle="modal"
                              data-bs-target="#complaintInfo"
                              onClick={() => setSelectedComplaint(complaint)}
                            >
                              <i className="fa-solid fa-eye text-center mt-1 "></i>
                            </span>

                            <span
                              className="mt-1 ms-3"
                              data-bs-toggle="modal"
                              data-bs-target="#complaintReassign"
                              onClick={() => setSelectedComplaint(complaint)}
                            >
                              <i className="fa-solid fa-paper-plane pt-2 text-primary"></i>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="text-center d-none">
              <p>No Complaints assigned Yet</p>
            </div>
          </div> : <div className="text-center fs-4 mt-5">Oops!! No complaints found!</div>}
          

          {/* Re-Assign Complaint */}
          <div
            className="modal modal-md fade "
            id="complaintReassign"
            data-bs-backdrop="static"
            data-bs-keyboard="false"
            tabIndex="-1"
            aria-labelledby="staticBackdropLabel"
            aria-hidden="true"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header bg-gradient-blue">
                  <h1 className=" fs-5 text-white pt-2" id="staticBackdropLabel">
                    Reassign Complaint
                  </h1>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  ></button>
                </div>
                <form onSubmit={reassignComplaint}>
                  <div className="modal-body">
                    <div>
                      <p className="mb-0"> Current Assignment</p>
                      <p className="outfit-font-lighter">
                        {selectedComplaint.assignedTo != null ? selectedComplaint.branchName : "Not Assigned"}
                      </p>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="department">Department:</label>
                      <select
                        className="form-select form-select-md border rounded mt-2"
                        id="Department"
                        onChange={(e) => setReassignTo(e.target.value)}
                        required
                        value={reassignTo}
                      >
                        <option
                          value=""
                          
                          className="outfit-font-lighter"
                        >
                          Department
                        </option>
                        {departments.map(department => <option value={`${department.branchName}`} key={department._id}>{department.branchName}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      data-bs-dismiss={
                        reassignTo && reassignTo.length > 0
                          ? "modal"
                          : undefined
                      }
                    >
                      Reassign
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      data-bs-dismiss="modal"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          

          {/* Complaint Details */}
          <div
            className="modal modal-lg fade"
            id="complaintInfo"
            data-bs-backdrop="static"
            data-bs-keyboard="false"
            tabIndex="-1"
            aria-labelledby="staticBackdropLabel"
            aria-hidden="true"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header bg-gradient-blue">
                  <h1 className=" fs-5 text-white pt-2" id="staticBackdropLabel">
                    Complaint Details
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
                          selectedComplaint.createdAt
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
                  <div className="w-25">
                      <p className="mb-0">Submitted By</p>
                      <p className="outfit-font-lighter mt-0">
                        {selectedComplaint.studentPinNo}
                      </p>
                    </div>
                  <div>
                    <p className="mb-0">Description</p>
                    <p className="outfit-font-lighter mt-0">
                      {selectedComplaint.complaintDescription}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

         

        </>
      ) : (
        <div className="text-center fs-5">No Complaint filed Yet!!</div>
      )}
    </div>
  );
}

export default AdminDashboardAllComplaints;
