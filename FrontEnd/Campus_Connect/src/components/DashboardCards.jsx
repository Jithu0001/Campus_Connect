import React, {useState} from 'react'
import { Link } from 'react-router-dom'
function DashboardCards({complaints}) {




    function resolvedComplaints(complaints) {
    const resolvedComplaints =  complaints.filter((complaint) => complaint.status == "Re-Solved");
    return resolvedComplaints.length

  }

  function pendingComplaints(complaints) {
    const pendingComplaints=  complaints.filter((complaint) => complaint.status != "Re-Solved");
    return pendingComplaints.length
  }
  return (
    <div>
        <div className="container-fluid text-center cards d-flex justify-content-center align-items-center mt-5">
        <div className="row gap-3 justify-content-center w-100">
          <div className="col-lg-3 col-md-3 col-sm-9">
            <div className="card dashboard-cards d-flex flex-row justify-content-center align-items-center border-left">
              <div className="card-img text-start p-4 mt-2">
                <p>Total Complaints</p>
                <p className="outfit-font-lighter ms-1">{complaints.length}</p>
              </div>
              <div>
                <i className="fa-solid fa-file dashboard-icons text-center text-warning"></i>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-3 col-sm-9">
            <div className="card dashboard-cards d-flex flex-row justify-content-center align-items-center border-left">
              <div className="card-img text-start p-4 mt-2">
                <p>Resolved Complaints</p>
                <p className="outfit-font-lighter ms-1">{resolvedComplaints(complaints)}</p>
              </div>
              <div>
                <i className="fa-solid fa-circle-check dashboard-icons text-center text-success"></i>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-3 col-sm-9">
            <div className="card dashboard-cards d-flex flex-row justify-content-center align-items-center border-left">
              <div className="card-img text-start p-4 mt-2">
                <p>Pending Complaints</p>
                <p className="outfit-font-lighter ms-1">{pendingComplaints(complaints)}</p>
              </div>
              <div>
                <i className="fa-solid fa-clock dashboard-icons text-center text-danger"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardCards