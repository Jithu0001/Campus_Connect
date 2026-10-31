import api from "./axios";

export async function getMyComplaints(token, studentPinNo) {
  const res = await api.get(`/my-complaints/${studentPinNo}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res;
}
export async function withdrawMyComplaint(token, id) {
  const res = await api.delete(`/my-complaints/withdraw-complaint/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res;
}
export async function raiseComplaint(
  complaintTitle,
  complaintDescription,
  department,
  isAnonymous,
  token,
  imageFile = null,
) {
  const formData = new FormData();
  formData.append('complaintTitle', complaintTitle);
  formData.append('complaintDescription', complaintDescription);
  formData.append('branchName', department);
  formData.append('anonymous', isAnonymous);

  if (imageFile) {
    formData.append('image', imageFile);
  }

  const res = api.post(
    `/raise-complaint`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    },
  );
  return res;
}

export async function getAssignedComplaints(token, id) {
  const res = await api.get(`/my-assigned-complaints/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res;
}

export async function updateAssignedComplaint(token, id, complaintStatus) {
  const res = await api.put(
    `/modify-complaint/${id}`,
    {
      status: complaintStatus,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return res;
}

export async function getAllComplaints(token) {
  const res = await api.get(`/all-complaints`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res
}

export async function reassignTheComplaint(token,id,reassignTo){
     const res = await api.put(
        `/all-complaints/modify-complaint/${id}`,
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
      return res;
}
