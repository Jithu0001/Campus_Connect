import React from "react";
import navImg from "../assets/nav-img.jpg";
import logo from "../assets/logo.png";
import {Link} from 'react-router-dom'
function Home() {
    const scrollToSection = () => { document.getElementById("learn-more").scrollIntoView({ behavior: "smooth" }); };
  return (
    <div>
      <div className=" w-100">
        <img
          src={navImg}
          alt="nav-image"
          className="w-100  object-fit-cover nav-img"
        />

        <div className="position-absolute top-0 start-0 w-100 nav-img d-flex flex-column bg-gradient-blue text-light">
          {/* Navbar */}
          <nav className="navbar w-100 d-flex justify-content-between">
            <div className="d-flex flex-row align-items-center">
              <img
                src={logo}
                alt="logo"
                className="logo mt-2 img-fluid cursor-pointer"
              />
              <div className="cursor-pointer">
                <p className="navbar-brand mb-0 text-light">Campus Connect</p>
                <p className="mb-0 font-light outfit-font-lighter">Your Voice Matters</p>
              </div>
            </div>
            <div>
              <Link
                to="/login"
                className="me-4 text-primary fw-bold text-decoration-none btn btn-light btn-animated px-3 text-dark "
              >
                Sign In
              </Link>
            </div>
          </nav>

          {/* Hero Content */}
          <div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center text-center px-4 welcome">
            <h1 className="display-5 fw-bold ">Welcome to Campus Connect</h1>
            <p className="mb-4">
              A centralized platform for students to raise concerns and for
              administration to efficiently address them.
            </p>
            <div>
              <Link to='/login'
                className="btn btn-primary text-dark fw-semibold me-2 btn-animated"
              >
                Get Started
              </Link>
              <button
                onClick={scrollToSection}
                className="btn btn-primary text-dark fw-semibold btn-animated ms-2"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
        <div className="container-fluid text-center cards d-flex justify-content-center align-items-center mt-5">
          <div className="row gap-3 justify-content-center w-100">
            {/* Card 1 */}
            <div className="col-lg-3 col-md-3 col-sm-9">
              <div className="card card-shadow">
                <div className="card-img text-center p-3 mt-2">
                  <i className="fa-solid fa-circle-check icons"></i>
                  <p className="mt-4">100+</p>
                  <p>Problems Solved</p>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="col-lg-3 col-md-3 col-sm-9">
              <div className="card card-shadow">
                <div className="card-img text-center p-3 mt-2 ">
                  <i className="fa-solid fa-circle-user icons"></i>
                  <p className="mt-4">1000+</p>
                  <p>Active Students</p>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="col-lg-3 col-md-3 col-sm-9">
              <div className="card card-shadow">
                <div className="card-img text-center p-3 mt-2">
                  <i className="fa-solid fa-clock icons"></i>
                  <p className="mt-4">24-48 hours</p>
                  <p>Average Response Time</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-5 text-center">
          <p className="fs-3 mb-1">Portal Acess</p>
          <p className="outfit-font-lighter mt-0">
            Different dashboards for different user roles
          </p>
          <div className="row gap-3 justify-content-center w-100 text-center align-items-center">
            {/* Card 1 */}

            {/* Card 2 */}
            <div className="col-lg-3 col-md-3 col-sm-9">
              <div className="card card-shadow portal-cards shadow-lg bg-gradient-violet">
                <div className="card-body p-3 d-flex flex-column justify-content-between">
                  <div className="text-start">
                    <i className="fa-solid fa-circle-user fs-1 text-dark"></i>

                    <p className="mt-4 fw-bold">Student Portal</p>
                    <p className="outfit-font-lighter">
                      Submit complaints, track status, and receive updates on
                      your submissions
                    </p>
                  </div>
                  <button className="btn btn-light w-100 mt-3 align-self-end violet">
                    Student Login
                  </button>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="col-lg-3 col-md-3 col-sm-9">
              <div className="card card-shadow portal-cards shadow-lg bg-gradient-orange">
                <div className="card-body p-3 d-flex flex-column justify-content-between ">
                  <div className="text-start">
                    <i className="fa-solid fa-file fs-2 text-dark"></i>
                    <p className="mt-4 fw-bold">HOD Portal</p>
                    <p className="outfit-font-lighter">
                      View department complaints, update status, and manage
                      resolutions
                    </p>
                  </div>
                  <button className="btn btn-light w-100 mt-3 align-self-end orange">
                    HOD Login
                  </button>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-3 col-sm-9">
              <div className="card card-shadow portal-cards shadow-lg bg-gradient-pink">
                <div className="card-body p-3 d-flex flex-column justify-content-between">
                  <div className="text-start">
                    <i className="fa-solid fa-gear fs-2"></i>
                    <p className="mt-4 fw-bold">Admin Portal</p>
                    <p className="outfit-font-lighter">
                      Manage all complaints, reassign, configure settings, and
                      view analytics
                    </p>
                  </div>
                  <button className="btn btn-light w-100 mt-3 align-self-end pink">
                    Admin Login
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-5 text-center" id="learn-more">
          <p className=" fs-4">Key Features</p>
          <p className="px-3 outfit-font-lighter">
            Our platform provides comprehensive tools for efficient complaint
            management
          </p>
          <div className="row gap-3  justify-content-center w-100 mt-3 feature-cards">
            {/* Card 1 */}
            <div className="col-lg-3 col-md-3 col-sm-9">
              <div className="card card-shadow featured-cards">
                <div className="card-img text-start p-3 mt-2">
                  <i className="fa-solid fa-file fs-2 text-primary"></i>
                  <p className="mt-4">Easy Submission</p>
                  <p className="outfit-font-lighter">
                    Students can easily submit complaints with detailed
                    descriptions, categories, and attachments.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="col-lg-3 col-md-3 col-sm-9">
              <div className="card card-shadow featured-cards">
                <div className="card-img text-start p-3 mt-2">
                  <i className="fa-solid fa-gear fs-2 text-success"></i>
                  <p className="mt-4">Auto Assignment</p>
                  <p className="outfit-font-lighter">
                    Complaints are automatically assigned to the relevant
                    department HOD based on category.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="col-lg-3 col-md-3 col-sm-9">
              <div className="card card-shadow featured-cards">
                <div className="card-img text-start p-3 mt-2">
                  <i className="fa-solid fa-circle-user fs-2 text-info"></i>
                  <p className="mt-4">Real-time Tracking</p>
                  <p className="outfit-font-lighter">
                    Track the status of your complaints in real-time with
                    notifications on updates.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="row gap-3 justify-content-center w-100 mt-4 feature-cards">
            {/* Card 1 */}
            <div className="col-lg-3 col-md-3 col-sm-9">
              <div className="card card-shadow featured-cards">
                <div className="card-img text-start p-3 mt-2">
                  <i className="fa-solid fa-comment fs-2 text-dark"></i>
                  <p className="mt-4">Direct Communication</p>
                  <p className="outfit-font-lighter">
                    HODs can view detailed complaints and take appropriate
                    action efficiently.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="col-lg-3 col-md-3 col-sm-9">
              <div className="card card-shadow featured-cards">
                <div className="card-img text-start p-3 mt-2 ">
                  <i className="fa-solid fa-circle-check fs-2 text-warning"></i>
                  <p className="mt-4">Admin Control</p>
                  <p className="outfit-font-lighter">
                    Super admin can reassign complaints, manage departments, and
                    configure settings.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="col-lg-3 col-md-3 col-sm-9">
              <div className="card card-shadow featured-cards">
                <div className="card-img text-start p-3 mt-2">
                  <i className="fa-solid fa-clock fs-2 text-danger"></i>
                  <p className="mt-4">Priority Management</p>
                  <p className="outfit-font-lighter">
                    Complaints are prioritized based on urgency to ensure
                    critical issues are addressed first.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container voice-card mb-5">
        <div className=" card text-center mt-5 bg-gradient-violet shadow-lg text-white py-2">
          <h4 className="pt-4">Ready to Make Your Voice Heard?</h4>
          <p className="mt-1">
            Join hundreds of students who are already using our platform to
            improve campus life.
          </p>
          <div>
            <Link to='/login' className="btn btn-light px-3 my-3  text-dark">Sign In Now</Link>
          </div>
        </div>


        
      </div>
      <footer className="">
            <hr />

      <div className="container mt-5">
            <div className="d-flex flex-row gap-2">
                <img
                src={logo}
                alt="logo"
                className="footer-logo mt-2 img-fluid cursor-pointer"
              />
        <p className="fs-5 mt-3">Campus Connect </p>
            </div>
           
        
        <p className="outfit-font-lighter">Making campus life better through effective complaint management system.</p>
        
        <hr />
        <div className="text-center ">
            <i className="fa-brands fa-linkedin cursor-pointer"></i>
            <i className="fa-brands fa-github cursor-pointer"></i>
            <i className="fa-brands fa-twitter cursor-pointer"></i>

        </div>
        <p className="text-center mb-1">Made With 💖 by Jithendra Bonthu.</p>
        <p className="text-center outfit-font-lighter">&copy; 2026 Campus Connect. All Rights Reserved.</p>
        </div>
        
        </footer>
    </div>
  );
}

export default Home;
