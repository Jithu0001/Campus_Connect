import React from 'react'

function ComplaintDetailsModal({complaint}) {
  return (
    <>
    <div
          class="modal modal-lg fade "
          id="ComplaintDetails"
          data-bs-backdrop="static"
          data-bs-keyboard="false"
          tabindex="-1"
          aria-labelledby="ComplaintDetails"
          aria-hidden="true"
        >
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
              <div class="modal-header bg-gradient-blue text-light">
                <h1 class=" fs-5 mt-2 " id="ComplaintDetails">
                  Complaint
                </h1>
                <button
                  type="button"
                  class="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div class="modal-body">
                <div className="d-flex flex-row gap-5 w-100">
                  <div className="w-25">
                    <p className="mb-0">Title</p>
                    <p className="outfit-font-lighter mt-0">
                      Library Ac is not Working
                    </p>
                  </div>
                  <div className="w-50">
                    <p className="mb-0">Urgency</p>
                    <p className="outfit-font-lighter mt-0">High</p>
                  </div>
                </div>

                <div className="d-flex flex-row w-100 gap-3">
                  <div className="w-50">
                    <p className="mb-0">Date of Submission</p>
                    <p className="outfit-font-lighter mt-0">20/11/2025</p>
                  </div>
                  <div className="w-25">
                    <p className="mb-0">Department</p>
                    <p className="outfit-font-lighter mt-0">Academic</p>
                  </div>
                  <div className="w-25">
                    <p className="mb-0">Status</p>
                    <p className="outfit-font-lighter mt-0">Pending</p>
                  </div>
                </div>
                <div>
                  <p className="mb-0">Description</p>
                  <p className="outfit-font-lighter mt-0">
                    Library Ac is not WorkingLibrary Ac is not Working.
                  </p>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-danger">
                  Withdraw Complaint
                </button>
              </div>
            </div>
          </div>
        </div>
        </>
  )
}

export default ComplaintDetailsModal