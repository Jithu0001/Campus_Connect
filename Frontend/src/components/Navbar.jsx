import React from 'react'
import { useNavigate } from "react-router-dom";
import { logout } from "../api/login";

function Navbar({dashboard, name}) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    try {
      if (refreshToken) {
        await logout(refreshToken);
      }
    } catch (err) {
      console.warn("Logout API failed", err);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("name");
    localStorage.removeItem("pinNo");
    localStorage.removeItem("id");
    navigate("/");
  };

  return (
    <div><div>
        <nav className="navbar w-100 d-flex justify-content-between border position-sticky student-dashboard-nav">
          <div className="d-flex flex-row align-items-center justify-content-center">
            <div className="">
              <p className="navbar-brand mb-0 text-primary">
                {dashboard} Dashboard
              </p>
              <p className="mb-0 outfit-font-lighter">Welcome back, {name}</p>
            </div>
          </div>
          <div>
            <button
              type="button"
              onClick={handleLogout}
              className="btn btn-link text-primary fw-bold text-decoration-none text-dark border-none"
            >
              <i className="fa-solid fa-arrow-right-from-bracket me-1 logout-icon"></i>
              Log out
            </button>
          </div>
        </nav>
      </div></div>
  )
}

export default Navbar