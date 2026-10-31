import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/logo.png";
import StatusModal from "./StatusModal";
import {login} from '../api/login';
function Login() {
  const navigateTo = useNavigate();
  const [seePassword, setSeePassword] = useState(false);
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState("");



  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await login(role,email,password);
    localStorage.setItem("token", res.data.token);
    if (res.data.refreshToken) {
      localStorage.setItem("refreshToken", res.data.refreshToken);
    }

    if (role === "student") {
      localStorage.setItem("pinNo", res.data.studentPinNo);
      localStorage.setItem("name", res.data.studentName);
    } else if (role === "hod") {
      localStorage.setItem("name", res.data.hodName);
      localStorage.setItem("id", res.data.hod._id);
    } else {
      localStorage.setItem("name", res.data.admin.name);
    }

      
        setStatus(res.data.success);
      setMessage(res.data.message || "Logged in sucessfully");
      const modal = new window.bootstrap.Modal(
        document.getElementById("statusModal")
      );
      if (res.data.success) {
        navigateTo(`/${role}-dashboard`);
      }
      modal.show();
    } catch (err) {
       setStatus(false);
      setMessage( "Failed to Login. Please try again.");
      const modal = new window.bootstrap.Modal(
        document.getElementById("statusModal")
      );
      modal.show();
    }
  }
  return (
    <div className="container-login">
      <StatusModal message={message} success={status}/>
      <div className="card-dark shadow-lg">
        <div className="card-body">
          <div className="text-center d-flex flex-column justify-content-center gap-3 align-items-center">
            <img
              src={logo}
              alt="logo"
              className="footer-logo img-fluid cursor-pointer"
            />
            <p className="fs-5">Campus Connect</p>
          </div>
          <div className="card-title text-center outfit-font-lighter">
            Sign In to Continue
          </div>

          <form action="" onSubmit={handleSubmit}>
            <div className="btn-group w-100 mt-3" role="group">
              <input
                type="radio"
                className="btn-check"
                name="role"
                id="student"
                autoComplete="off"
                checked={role === "student"}
                onChange={() => setRole("student")}
              />
              <label className="btn btn-outline-primary" htmlFor="student">
                Student
              </label>

              <input
                type="radio"
                className="btn-check"
                name="role"
                id="hod"
                autoComplete="off"
                checked={role === "hod"}
                onChange={() => setRole("hod")}
              />
              <label className="btn btn-outline-primary" htmlFor="hod">
                HOD
              </label>

              <input
                type="radio"
                className="btn-check"
                name="role"
                id="admin"
                autoComplete="off"
                checked={role === "admin"}
                onChange={() => setRole("admin")}
              />
              <label className="btn btn-outline-primary" htmlFor="admin">
                Admin
              </label>
            </div>
            <div className="d-flex flex-column">
              <div className="text-center mt-4">
                <input
                  type="email"
                  id="name"
                  placeholder="Enter your email"
                  className="mb-4 w-100"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="position-relative">
                <input
                  type={seePassword ? "text" : "password"}
                  id="password"
                  className="w-100"
                  autoComplete="off"
                  placeholder="Enter password"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <i
                  className={
                    seePassword
                      ? "fa-solid fa-eye-slash position-absolute eye ease-animation"
                      : "fa-solid fa-eye position-absolute eye ease-animation"
                  }
                  onClick={() => setSeePassword(!seePassword)}
                ></i>
              </div>

              <button className="text-center py-2 btn-register btn-animated text-dark mt-5">
                Login as {role}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
