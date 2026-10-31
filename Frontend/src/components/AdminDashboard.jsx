import React, { useState, useEffect } from "react";
import DashboardCards from "./DashboardCards";
import Navbar from "./Navbar";
import { Link } from "react-router-dom";
import { getAllComplaints } from "../api/complaints";
import { getAllDepartments } from "../api/departments";
import axios from "axios";
function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [department, setDepartment] = useState([]);
  const name = localStorage.getItem("name") || "";
  const date = new Date();
  date.setDate(date.getDate() -2);
  console.log(date)
  useEffect(() => {
    
    
    getDepartments();
    getComplaints();
  }, []);
  async function getDepartments() {
      try {
        const token = localStorage.getItem("token");

        const res = await getAllDepartments(token)
        res.data.departments && setDepartments(res.data.departments);
      } catch (err) {
        console.log(err);
      }
    }
async function getComplaints() {
      try {
        const token = localStorage.getItem("token");
        const res = await getAllComplaints(token)
        res.data.complaints && setComplaints(res.data.complaints);
      } catch (err) {
        console.log(err);
      }
    }
  function getComplaintStatus(branchName) {
    let pending = 0;
    let resolved = 0;
    let inProgress = 0;
    let submitted = 0;
    let totalComplaints = 0;
    let reqComplaints = complaints.filter(
      (complaint) => complaint.branchName === branchName,
    );
    for (let complaint of reqComplaints) {
      complaint.status === "Submitted"
        ? submitted++
        : complaint.status === "In-Progress"
          ? inProgress++
          : complaint.status === "Re-Solved"
            ? resolved++
            : pending++;
      totalComplaints++;
    }
    return {
      pending,
      resolved,
      inProgress,
      submitted,
      totalComplaints,
    };
  }
  return (
    <div>
      <Navbar dashboard="Admin" name={name} />
      <div>
        <div className="container-fluid pt-3 border">
          <div className="d-flex flex-row  gap-5 text-start justify-content-center align-items-center">
            <div className="admin-bg py-2">
              <Link
                to="/admin-dashboard/overview"
                className="cursor-pointer  text-decoration-none"
              >
                <i className="fa-regular fa-chart-bar"></i> Overview
              </Link>
            </div>
            <Link
              to="/admin-dashboard/all-complaints"
              className="cursor-pointer text-decoration-none admin-nav"
            >
              <i className="fa-solid fa-file text-secondary"></i> All Complaints
            </Link>

            <Link
              to="/admin-dashboard/settings"
              className="cursor-pointer text-decoration-none admin-nav"
            >
              <i className="fa-solid fa-gears"></i> Settings
            </Link>
          </div>
        </div>
        {complaints && complaints.length > 0 ? (
          <>
            <div>
              <DashboardCards complaints={complaints} />
            </div>
            <div className="mt-5">
              <p className="text-center fs-4">Department Wise Distribution</p>

              <div className="container-fluid text-center py-3 rounded d-flex justify-content-center align-items-center w-100">
                <div className="row gap-3 justify-content-center w-100">
                  {departments.map((department) => {
                    let statusCount = getComplaintStatus(department.branchName);
                    return (
                      <div
                        className="col-lg-3 col-md-3 col-sm-9"
                        key={department._id}
                      >
                        <div className="card dashboard-cards d-flex flex-row justify-content-center align-items-center">
                          <div className="card-img text-start p-4 mt-2">
                            <p>{department.branchName}</p>
                            <div className="outfit-font-lighter font-small mt-0 pt-0">
                              <span> R:{statusCount.resolved},</span>
                              <span> P:{statusCount.pending},</span>
                              <span> IP:{statusCount.inProgress},</span>
                              <span> S:{statusCount.submitted}</span>
                            </div>
                          </div>
                          <div>
                            <p className="pe-3 text-primary pt-3">
                              {statusCount.totalComplaints}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="d-flex justify-content-center">
              <div className="d-flex flex-column justify-content-center align-items-center mt-5 student-complaint-table">
                <div className="card dashboard-cards row border  complaints-header  text-dark">
                  <div className="col-lg-12 col-md-3 col-sm-11 ">
                    <p className="mt-3 fs-4 ps-2">Recent Complaints</p>
                  </div>
                </div>
                {complaints
                  .filter((complaint) => new Date(complaint.createdAt) >= date)
                  .map((complaint) => {
                    return (
                      <div
                        className="card dashboard-cards row border complaints align-items-center "
                        key={complaint._id}
                      >
                      <div className="d-flex flex-row justify-content-center align-items-center">
                        <div className="card-img text-start px-2 pt-2 mt-2">
                          <p className="mb-1">{complaint.complaintTitle}</p>
                          <p className="d-flex outfit-font-lighter mb-1 font-small">
                            <span
                              className={`${complaint.urgency === "High" ? "text-danger outfit-font" : ""}`}
                            >
                              Urgency: {complaint.urgency}
                            </span>
                          </p>
                          <p className="outfit-font-lighter font-small">
                            Branch: {complaint.branchName}
                          </p>
                        </div>
                        <div className="d-flex flex-row gap-4 w-100 justify-content-end px-2 ps-1">
                          <p className="status gap-1 d-inline">
                            <i
                              className={`fa-solid fa-${
                                complaint.status === "Re-Solved"
                                  ? "circle-check text-success"
                                  : complaint.status === "In-Progress"
                                    ? "hourglass-half text-primary"
                                    : complaint.status === "Submitted"
                                      ? "check-double text-primary"
                                      : "clock text-danger"
                              } text-center  mt-1 fs-5`}
                            ></i>
                            <span>{complaint.status}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center">No Complaints filed Yet!</div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
