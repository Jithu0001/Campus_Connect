import React from 'react'
import { Link } from "react-router-dom";

function Navbar({dashboard, name}) {
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
            <Link
              to="/"
              className=" text-primary fw-bold text-decoration-none text-dark border-none"
            >
              <i className="fa-solid fa-arrow-right-from-bracket me-1 logout-icon"></i>
              Log out
            </Link>
          </div>
        </nav>
      </div></div>
  )
}

export default Navbar