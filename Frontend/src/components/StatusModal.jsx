import React from "react";

function StatusModal({ success, message }) {
  return (
    <div
      className="modal fade"
      id="statusModal"
      tabIndex="-1"
      aria-labelledby="statusModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content text-center">
            <div className="p-3 text-end">
                <button
              type="button"
              className="btn-close text-dark"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
            </div>
          
          <div className="modal-body pb-5">
            <div className="mb-3">
              {success ? (
                <i className="fa-solid fa-circle-check text-success status-modal-icon"></i>
              ) : (
                <i className="fa-solid fa-circle-xmark text-danger  status-modal-icon"></i>
              )}
            </div>
            <p className="fs-4 pt-2">{message}</p>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default StatusModal;
