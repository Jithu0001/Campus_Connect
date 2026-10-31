import React from "react";
import DashboardCards from "./DashboardCards";
import Navbar from "./Navbar";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import StatusModal from "./StatusModal";
import { deleteTheDepartment, getAllDepartments,modifyDepartment,addNewDepartment } from "../api/departments";
import { getAllAdmins, getAllHods, getAllStudents,registerHod,registerStudent,registerAdmin } from "../api/users";
function AdminDashboardSettings() {
  const name = localStorage.getItem("name");
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState({ hods: [], students: [], admins: [] });
  const [formData, setFormData] = useState({
    department: "",
    assignTo: "",
    escalationDays: "",
    autoAssign: false,
    userName: "",
    email: "",
    id: "",
    pass: "",
    studyYear: "",
  });
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedDepartment) {
      setFormData({
        ...formData,
        department: selectedDepartment.branchName || "",
        escalationDays: selectedDepartment.escalationDays || "",
        autoAssign: selectedDepartment.autoAssign || false,
      });
    }
  }, [selectedDepartment]);

  const fetchData = async () => {
    await Promise.all([getDepartments(), getHods(), getStudents(), getAdmins()]);
  };

  const updateFormData = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  async function addDepartment(e) {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await addNewDepartment(token, formData.department, formData.autoAssign, formData.assignTo, formData.escalationDays);
      if (res.data.newBranch) {
        setDepartments((prev) => [...prev, res.data.newBranch]);
      }
      setStatus(res.data.success);
      setMessage(res.data.message || "New department added successfully!");
      const modal = new window.bootstrap.Modal(document.getElementById("statusModal"));
      modal.show();
      setFormData({ ...formData, department: "", assignTo: "", escalationDays: "", autoAssign: false });
    } catch (err) {
      console.log(err);
      setStatus(false);
      setMessage("Failed to add department");
      const modal = new window.bootstrap.Modal(document.getElementById("statusModal"));
      modal.show();
    }
  }

  async function getDepartments() {
    try {
      const token = localStorage.getItem("token");
      const res = await getAllDepartments(token);
      if (res.data.departments) setDepartments(res.data.departments);
    } catch (err) {
      console.log(err);
    }
  }

  async function getHods() {
    try {
      const token = localStorage.getItem("token");
      const res = await getAllHods(token);
      if (res.data.hods) setUsers((prev) => ({ ...prev, hods: res.data.hods }));
    } catch (err) {
      console.log(err);
    }
  }

  async function getStudents() {
    try {
      const token = localStorage.getItem("token");
      const res = await getAllStudents(token);
      if (res.data.students) setUsers((prev) => ({ ...prev, students: res.data.students }));
    } catch (err) {
      console.log(err);
    }
  }

  async function getAdmins() {
    try {
      const token = localStorage.getItem("token");
      const res = await getAllAdmins(token);
      if (res.data.admins) setUsers((prev) => ({ ...prev, admins: res.data.admins }));
    } catch (err) {
      console.log(err);
    }
  }

  async function deleteDepartment() {
    try {
      const token = localStorage.getItem("token");
      const res = await deleteTheDepartment(token, selectedDepartment._id);
      setDepartments((prev) => prev.filter((dept) => dept._id !== selectedDepartment._id));
      setStatus(res.data.success);
      setMessage(res.data.message || "Department deleted successfully!");
      const modal = new window.bootstrap.Modal(document.getElementById("statusModal"));
      modal.show();
    } catch (err) {
      console.log(err);
      setStatus(false);
      setMessage("Failed to delete the department!");
      const modal = new window.bootstrap.Modal(document.getElementById("statusModal"));
      modal.show();
    }
  }

  async function addHod(e) {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await registerHod(token, formData.userName, formData.email, formData.id, formData.department, formData.pass);
      setStatus(true);
      setMessage(res.data.message || "New HOD added successfully!");
      const modal = new window.bootstrap.Modal(document.getElementById("statusModal"));
      modal.show();
      setFormData({ ...formData, userName: "", email: "", id: "", department: "", pass: "" });
      await getHods(); // Refresh list
    } catch (err) {
      console.log(err);
      setStatus(false);
      setMessage("Failed to add hod. Please try again.");
      const modal = new window.bootstrap.Modal(document.getElementById("statusModal"));
      modal.show();
    }
  }

  async function updateDepartment(e) {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await modifyDepartment(token, selectedDepartment._id, formData.department, formData.escalationDays, formData.autoAssign, formData.assignTo);
      setDepartments((prevDepartments) =>
        prevDepartments.map((dept) =>
          dept._id === selectedDepartment._id ? { ...dept, ...res.data.department } : dept
        )
      );
      setStatus(res.data.success);
      setMessage(res.data.message || "Department updated successfully!");
      const modal = new window.bootstrap.Modal(document.getElementById("statusModal"));
      modal.show();
      setFormData({ ...formData, department: "", assignTo: "", escalationDays: "", autoAssign: false });
    } catch (err) {
      console.log(err);
      setStatus(false);
      setMessage("Failed to update details!");
      const modal = new window.bootstrap.Modal(document.getElementById("statusModal"));
      modal.show();
    }
  }

  async function addStudent(e) {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await registerStudent(token, formData.userName, formData.email, formData.id, formData.department, formData.pass, formData.studyYear);
      setStatus(true);
      setMessage(res.data.message || "New Student added successfully!");
      const modal = new window.bootstrap.Modal(document.getElementById("statusModal"));
      modal.show();
      setFormData({ ...formData, userName: "", email: "", id: "", department: "", pass: "", studyYear: "" });
      await getStudents(); // Refresh list
    } catch (err) {
      console.log(err);
      setStatus(false);
      setMessage("Failed to add student. Please try again.");
      const modal = new window.bootstrap.Modal(document.getElementById("statusModal"));
      modal.show();
    }
  }

  async function addAdmin(e) {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await registerAdmin(token, formData.userName, formData.email, formData.id, formData.pass);
      setStatus(true);
      setMessage(res.data.message || "New admin added successfully!");
      const modal = new window.bootstrap.Modal(document.getElementById("statusModal"));
      modal.show();
      setFormData({ ...formData, userName: "", email: "", id: "", pass: "" });
      await getAdmins(); // Refresh list
    } catch (err) {
      console.log(err);
      setStatus(false);
      setMessage("Failed to add admin. Please try again.");
      const modal = new window.bootstrap.Modal(document.getElementById("statusModal"));
      modal.show();
    }
  }

  async function testEmail(e) {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8000/api/test-email', {
        email: formData.testEmail
      });

      if (res.data.success) {
        setStatus(true);
        setMessage(`Test email sent successfully! Message ID: ${res.data.messageId}`);
      } else {
        setStatus(false);
        setMessage(`Failed to send test email: ${res.data.error || res.data.message}`);
      }
      const modal = new window.bootstrap.Modal(document.getElementById("statusModal"));
      modal.show();
    } catch (err) {
      console.log(err);
      setStatus(false);
      setMessage("Failed to send test email. Check console for details.");
      const modal = new window.bootstrap.Modal(document.getElementById("statusModal"));
      modal.show();
    }
  }

  return (
    <div>
      <div>
        <Navbar dashboard="Admin" name={name} />
        <div className="container-fluid pt-3 border">
          <div className="d-flex flex-row  gap-5 text-start justify-content-center align-items-center pb-">
            <Link
              to="/admin-dashboard"
              className="cursor-pointer  text-decoration-none admin-nav"
            >
              <i className="fa-regular fa-chart-bar"></i> Overview
            </Link>

            <Link
              to="/admin-dashboard/all-complaints"
              className="cursor-pointer text-decoration-none admin-nav"
            >
              <i className="fa-solid fa-file text-secondary"></i> All Complaints
            </Link>
            <div className="admin-bg py-2">
              <Link
                to="/admin-dashboard/settings"
                className="cursor-pointer text-decoration-none"
              >
                <i className="fa-solid fa-gears"></i> Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
      <StatusModal message={message} success={status} />
      <div className="container card mt-3 p-3 dashboard-cards ">
        <div>
          <p className="text-start m-3 fs-5">Department Settings</p>

          {departments.map((department) => (
            <div className="container card mb-3" key={department._id}>
              <div className="row align-items-center ">
                <div className="  d-flex flex-row justify-content-center align-items-center ">
                  <div className="card-img text-start p-2 mt-2 ">
                    <p>{department.branchName}</p>
                  </div>
                  <div className="text-end">
                    <button
                      className="btn btn-primary"
                      data-bs-toggle="modal"
                      data-bs-target="#manageDepartment"
                      onClick={() => setSelectedDepartment(department)}
                    >
                      Manage
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button
            className="btn btn-primary w-100 mb-2 mt-2"
            data-bs-toggle="modal"
            data-bs-target="#addDepartment"
          >
            <i className="fa-solid fa-plus"></i> Add Department
          </button>
        </div>
      </div>

      <div className="container card mt-3 p-3 dashboard-cards ">
        <div>
          <p className="text-start m-3 fs-5">User Settings</p>
          <div className="container card mb-3">
            <div className="row align-items-center">
              <div className=" d-flex flex-row justify-content-center align-items-center">
                <div className="card-img text-start p-2 mt-2">
                  <p>Students </p>
                </div>
                <div className="d-flex flex-row gap-2 align-items-center mt-3">
                  <div className="text-end">
                    <p
                      className=" ms-2 text-danger cursor-pointer"
                      data-bs-toggle="modal"
                      data-bs-target="#viewStudentsModal"
                    >
                      <span>
                        <i className="fa-solid fa-eye d-inline"></i>
                        View
                      </span>
                    </p>
                  </div>
                  <div
                    className=" ms-2 cursor-pointer"
                    data-bs-toggle="modal"
                    data-bs-target="#AddStudent"
                  >
                    <p>
                      <span className="btn btn-primary">
                        <i className="fa-solid fa-plus d-inline me-1 "></i>Add
                        <span className="ms-1">New</span>
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="container card mb-3">
            <div className="row align-items-center">
              <div className=" d-flex flex-row justify-content-center align-items-center">
                <div className="card-img text-start p-2 mt-2">
                  <p>HODS </p>
                </div>
                <div className="d-flex flex-row gap-2 align-items-center mt-3">
                  <div className="text-end">
                    <p
                      className=" ms-2 text-danger cursor-pointer"
                      data-bs-toggle="modal"
                      data-bs-target="#viewHods"
                    >
                      <span>
                        <i className="fa-solid fa-eye d-inline"></i>
                        View
                      </span>
                    </p>
                  </div>
                  <div className="text-end">
                    <p
                      className=" ms-2 cursor-pointer"
                      data-bs-toggle="modal"
                      data-bs-target="#AddHod"
                    >
                      <span className="btn btn-primary">
                        <i className="fa-solid fa-plus d-inline me-1"></i>Add
                        <span className="ms-1">New</span>
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="container card mb-3">
            <div className="row align-items-center">
              <div className=" d-flex flex-row justify-content-center align-items-center">
                <div className="card-img text-start p-2 mt-2">
                  <p>Admins </p>
                </div>
                <div className="d-flex flex-row gap-2 align-items-center mt-3">
                  <div className="text-end">
                    <p
                      className=" ms-2 text-danger cursor-pointer"
                      data-bs-toggle="modal"
                      data-bs-target="#viewAdmins"
                    >
                      <span>
                        <i className="fa-solid fa-eye d-inline"></i>
                        View
                      </span>
                    </p>
                  </div>
                  <div className="text-end">
                    <p
                      className=" ms-2 cursor-pointer"
                      data-bs-toggle="modal"
                      data-bs-target="#AddAdmin"
                    >
                      <span className="btn btn-primary">
                        <i className="fa-solid fa-plus d-inline me-1"></i>Add
                        <span className="ms-1">New</span>
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Department */}
      <div
        className="modal fade"
        id="addDepartment"
        tabIndex="-1"
        aria-labelledby="addDepartment"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header bg-gradient-blue  text-light">
              <h1 className="modal-title fs-5" id="addDepartment">
                New Department
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form onSubmit={addDepartment}>
                <div className="mb-3">
                  <label htmlFor="department" className="col-form-label">
                    Department:
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="department"
                    placeholder="Enter Department"
                    onChange={(e) => updateFormData('department', e.target.value)}
                    required
                    value={formData.department}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="assignTo">Assign:</label>
                  <select
                    className="form-select form-select-md border rounded"
                    id="assignTo"
                    aria-placeholder="Hod"
                    onChange={(e) => updateFormData('assignTo', e.target.value)}
                    value={formData.assignTo}
                    required
                  >
                    <option value="" className="outfit-font-lighter">
                      HOD
                    </option>
                    {users.hods.map((department) => (
                      <option
                        value={`${department.branch}`}
                        key={department._id}
                      >
                        {department.branch}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="escalationDays" className="col-form-label">
                    Escalation Days:
                  </label>
                  <input
                    type="Number"
                    className="form-control"
                    id="escalationDays"
                    min="0"
                    placeholder="Enter Escalation days"
                    onChange={(e) => updateFormData('escalationDays', e.target.value)}
                    required
                    value={formData.escalationDays}
                  />
                </div>
                <div className="form-check mb-3">
                  <input
                    className="form-check-input cursor-pointer"
                    type="checkbox"
                    id="anonymous"
                    name="anonymous"
                    onChange={(e) => updateFormData('autoAssign', e.target.checked)}
                    value={formData.autoAssign}
                    checked={formData.autoAssign}
                  />
                  <label className="form-check-label mt-1" htmlFor="anonymous">
                    Auto Assign
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
                      formData.escalationDays && formData.department && formData.assignTo
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
      {/* Manage Department */}
      <div
        className="modal fade"
        id="manageDepartment"
        tabIndex="-1"
        aria-labelledby="manageDepartment"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header bg-gradient-blue text-light">
              <h1 className="modal-title fs-5" id="manageDepartment">
                {selectedDepartment?.branchName} Department
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form onSubmit={updateDepartment}>
                <div className="mb-3">
                  <label htmlFor="Department">Assign To:</label>
                  <p className="outfit-font-lighter my-1">
                    Current Assignment ({selectedDepartment?.branchName})
                  </p>
                  <select
                    className="form-select form-select-md border rounded"
                    id="Department"
                    value={formData.department}
                    onChange={(e) => updateFormData('department', e.target.value)}
                  >
                    <option value="" className="outfit-font-lighter">
                      HOD
                    </option>
                    {departments.map((dept) => (
                      <option value={dept.branchName} key={dept._id}>
                        {dept.branchName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="title" className="col-form-label">
                    Escalation Days:
                    <p className="outfit-font-lighter mb-1 mt-1">
                      Current Escalation Days (
                      {selectedDepartment?.escalationDays})
                    </p>
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="title"
                    min="0"
                    placeholder="Enter Escalation days"
                    value={formData.escalationDays}
                    onChange={(e) => updateFormData('escalationDays', e.target.value)}
                  />
                </div>

                <div className="form-check mb-3">
                  <input
                    className="form-check-input cursor-pointer"
                    type="checkbox"
                    id="autoAssign"
                    name="autoAssign"
                    checked={formData.autoAssign}
                    onChange={(e) => updateFormData('autoAssign', e.target.checked)}
                  />
                  <label className="form-check-label mt-1" htmlFor="autoAssign">
                    Auto Assign
                  </label>
                </div>
                <div className="modal-footer mb-0">
                  <button
                    type="button"
                    className="btn btn-danger mb-0"
                    onClick={() => deleteDepartment()}
                    data-bs-dismiss="modal"
                  >
                    Remove Department
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary mb-0"
                    data-bs-dismiss="modal"
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Add Student */}
      <div
        className="modal fade"
        id="AddStudent"
        tabIndex="-1"
        aria-labelledby="AddStudent"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header bg-gradient-blue  text-light">
              <h1 className="modal-title fs-5" id="AddStudent">
                Add Student
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form onSubmit={addStudent}>
                <div className="mb-3">
                  <label htmlFor="studentName" className="col-form-label">
                    Name:
                  </label>
                  <input
                    type="String"
                    className="form-control"
                    id="studentName"
                    min="0"
                    placeholder="Enter Student Name"
                    required
                    value={formData.userName}
                    onChange={(e) => updateFormData('userName', e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="studentPinNo" className="col-form-label">
                    Student Pin No:
                  </label>
                  <input
                    type="String"
                    className="form-control"
                    id="studentPinNo"
                    min="0"
                    placeholder="Enter Student Pin No"
                    required
                    value={formData.id}
                    onChange={(e) => updateFormData('id', e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="studentBranch">Branch:</label>
                  <select
                    className="form-select form-select-md border rounded"
                    id="studentBranch"
                    aria-placeholder="Hod"
                    required
                    value={formData.department}
                    onChange={(e) => updateFormData('department', e.target.value)}
                  >
                    <option value="" className="outfit-font-lighter">
                      Select Branch
                    </option>
                    {departments.map((department) => (
                      <option
                        value={`${department.branchName}`}
                        key={department._id}
                      >
                        {department.branchName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="year" className="col-form-label">
                    Year of Study:
                  </label>
                  <input
                    type="Number"
                    className="form-control"
                    id="year"
                    min="1"
                    max="4"
                    placeholder="Enter Student Year of Study"
                    required
                    value={formData.studyYear}
                    onChange={(e) => updateFormData('studyYear', e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="studentEmail" className="col-form-label">
                    Email:
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="studentEmail"
                    min="0"
                    placeholder="Enter Student Email"
                    required
                    onChange={(e) => updateFormData('email', e.target.value)}
                    value={formData.email}
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="studentPass" className="col-form-label">
                    Password:
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="studentPass"
                    min="0"
                    placeholder="Enter New Password"
                    onChange={(e) => updateFormData('pass', e.target.value)}
                    autoComplete=""
                    required
                    value={formData.pass}
                  />
                </div>
                <div className="modal-footer mb-0 mt-5">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    data-bs-dismiss={
                      formData.userName && formData.email && formData.department && formData.pass && formData.studyYear && formData.id
                        ? "modal"
                        : undefined
                    }
                  >
                    Register Student
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Add Admin */}

      <div
        className="modal fade"
        id="AddAdmin"
        tabIndex="-1"
        aria-labelledby="AddAdmin"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header bg-gradient-blue  text-light">
              <h1 className="modal-title fs-5" id="AddAdmin">
                Register Admin
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form onSubmit={addAdmin}>
                <div className="mb-3">
                  <label htmlFor="adminName" className="col-form-label">
                    Name:
                  </label>
                  <input
                    type="String"
                    className="form-control"
                    id="adminName"
                    placeholder="Enter Admin Name"
                    required
                    onChange={(e) => updateFormData('userName', e.target.value)}
                    value={formData.userName}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="hodId" className="col-form-label">
                    Admin Id:
                  </label>
                  <input
                    type="String"
                    className="form-control"
                    id="adminId"
                    placeholder="Enter new Admin Id"
                    required
                    onChange={(e) => updateFormData('id', e.target.value)}
                    value={formData.id}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="adminEmail" className="col-form-label">
                    Email:
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="admineEmail"
                    min="0"
                    placeholder="Enter Admin Email"
                    required
                    onChange={(e) => updateFormData('email', e.target.value)}
                    value={formData.email}
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="adminPass" className="col-form-label">
                    Password:
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="adminPass"
                    min="0"
                    placeholder="Enter New Password"
                    onChange={(e) => updateFormData('pass', e.target.value)}
                    autoComplete=""
                    required
                    value={formData.pass}
                  />
                </div>
                <div className="modal-footer mb-0 mt-5">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    data-bs-dismiss={
                      formData.userName && formData.email && formData.pass && formData.id ? "modal" : undefined
                    }
                  >
                    Register Admin
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Add Hod */}

      <div
        className="modal fade"
        id="AddHod"
        aria-labelledby="AddHod"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header bg-gradient-blue  text-light">
              <h1 className="modal-title fs-5" id="AddHod">
                Register Hod
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form onSubmit={addHod}>
                <div className="mb-3">
                  <label htmlFor="hodName" className="col-form-label">
                    Name:
                  </label>
                  <input
                    type="String"
                    className="form-control"
                    id="hodName"
                    placeholder="Enter Hod Name"
                    onChange={(e) => updateFormData('userName', e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="hodId" className="col-form-label">
                    Hod Id:
                  </label>
                  <input
                    type="String"
                    className="form-control"
                    id="hodId"
                    placeholder="Enter new Hod Id"
                    onChange={(e) => updateFormData('id', e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="hodBranch">Branch:</label>
                  <input
                    type="String"
                    className="form-control"
                    id="hodBranch"
                    placeholder="Enter Branch"
                    onChange={(e) => updateFormData('department', e.target.value)}
                    required
                  />
                </div>
                <div className="mb-2">
                  <label htmlFor="hodEmail" className="col-form-label">
                    Email:
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="hodEmail"
                    min="0"
                    placeholder="Enter Hod Email"
                    onChange={(e) => updateFormData('email', e.target.value)}
                    required
                  />
                </div>

                <div className="mb-5">
                  <label htmlFor="hodPass" className="col-form-label">
                    Password:
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="hodPass"
                    min="0"
                    placeholder="Enter New Password"
                    onChange={(e) => updateFormData('pass', e.target.value)}
                    autoComplete=""
                    required
                  />
                </div>
                <div className="modal-footer">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    data-bs-dismiss={
                      formData.id && formData.userName && formData.email.length > 0 && formData.department && formData.pass
                        ? "modal"
                        : undefined
                    }
                  >
                    Register HOD
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* View Students */}

      <div
        className="modal fade"
        id="viewStudentsModal"
        tabIndex="-1"
        aria-labelledby="viewStudentsModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header bg-gradient-blue text-light">
              <h5 className="modal-title" id="viewStudentsModalLabel">
                All Students
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>

            <div className="modal-body">
              {users.students && users.students.length > 0 ? (
                <table className="border w-100 text-center">
                  <thead className="">
                    <tr className="border">
                      <td className="p-3">S.No</td>
                      <td>Name</td>
                      <td>Pin No</td>
                    </tr>
                  </thead>

                  {users.students.map((student, index) => {
                    return (
                      <tbody key={student._id}>
                        <tr className="border ">
                          <td className="p-3">#{index + 1}</td>
                          <td>{student.name}</td>
                          <td>{student.pinNo}</td>
                        </tr>
                      </tbody>
                    );
                  })}
                </table>
              ) : (
                <p className="text-muted">No students available.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* View Hods */}
      <div
        className="modal fade"
        id="viewHods"
        tabIndex="-1"
        aria-labelledby="viewHodsLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header bg-gradient-blue text-light">
              <h5 className="modal-title" id="viewHodsLabel">
                All Hods
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>

            <div className="modal-body">
              {users.hods && users.hods.length > 0 ? (
                <table className="border w-100 text-center">
                  <thead className="">
                    <tr className="border">
                      <td className="p-3">S.No</td>
                      <td>Name</td>
                      <td>Hod Id</td>
                      <td>Department</td>

                    </tr>
                  </thead>

                  {users.hods.map((hod, index) => {
                    return (
                      <tbody key={hod._id}>
                        <tr className="border ">
                          <td className="p-3">#{index + 1}</td>
                          <td>{hod.name}</td>
                          <td>{hod.hodId}</td>
                          <td>{hod.branch}</td>

                        </tr>
                      </tbody>
                    );
                  })}
                </table>
              ) : (
                <p className="text-muted">No hods available.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* View Admins */}
      <div
        className="modal fade"
        id="viewAdmins"
        tabIndex="-1"
        aria-labelledby="viewAdminsLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header bg-gradient-blue text-light">
              <h5 className="modal-title" id="viewAdminsLabel">
                All Admins
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>

            <div className="modal-body">
              {users.admins && users.admins.length > 0 ? (
                <table className="border w-100 text-center">
                  <thead className="">
                    <tr className="border">
                      <td className="p-3">S.No</td>
                      <td>Name</td>
                      <td>Admin Id</td>
                    </tr>
                  </thead>

                  {users.admins.map((admin, index) => {
                    return (
                      <tbody key={admin._id}>
                        <tr className="border">
                          <td className="p-3">#{index + 1}</td>
                          <td>{admin.name}</td>
                          <td>{admin.adminId}</td>
                        </tr>
                      </tbody>
                    );
                  })}
                </table>
              ) : (
                <p className="text-muted">No admins available.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Email Test Section */}
      <div className="container card mb-3 mt-4">
        <div className="row align-items-center">
          <div className="d-flex flex-row justify-content-center align-items-center">
            <div className="card-img text-start p-2 mt-2">
              <p>Email Configuration Test</p>
              <small className="text-muted">Test if email notifications are working</small>
            </div>
            <div className="d-flex flex-row gap-2 align-items-center mt-3">
              <button
                className="btn btn-info"
                data-bs-toggle="modal"
                data-bs-target="#testEmailModal"
              >
                <i className="fa-solid fa-envelope me-2"></i>Test Email
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Test Email Modal */}
      <div
        className="modal fade"
        id="testEmailModal"
        tabIndex="-1"
        aria-labelledby="testEmailModal"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header bg-gradient-blue text-light">
              <h1 className="modal-title fs-5" id="testEmailModal">
                Test Email Configuration
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="alert alert-info">
                <strong>Gmail Setup Required:</strong>
                <ol className="mb-0 mt-2">
                  <li>Enable 2-factor authentication on your Gmail account</li>
                  <li>Generate an App Password: <a href="https://support.google.com/accounts/answer/185833" target="_blank" rel="noopener noreferrer">Google Help</a></li>
                  <li>Update EMAIL_USER and EMAIL_PASS in backend/.env file</li>
                </ol>
              </div>
              <form onSubmit={testEmail}>
                <div className="mb-3">
                  <label htmlFor="testEmailAddress" className="col-form-label">
                    Test Email Address:
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="testEmailAddress"
                    placeholder="Enter email to test"
                    required
                    value={formData.testEmail || ''}
                    onChange={(e) => updateFormData('testEmail', e.target.value)}
                  />
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
                  >
                    Send Test Email
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

export default AdminDashboardSettings;
