import api from './axios';
export async function getAllDepartments(token){
    const res = await api.get(`/all-departments`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        return res;
}
export async function addNewDepartment(token,department,autoAssign,assignTo,escalationDays){
    const res = await api.post(
        `add-department`,
        {
          branchName: department,
          escalationDays:escalationDays,
          autoAssign:autoAssign,
          assignTo:assignTo,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return res;
}

export async function deleteTheDepartment(token,id){
     const res = await api.delete(
        `/all-departments/delete-department/${id}`,

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return res;

}
export async function modifyDepartment(token,id,department,escalationDays,autoAssign,assignTo){
    const res = await api.put(
        `/all-departments/modify-department/${id}`,
        {
          branchName: department,
          escalationDays:escalationDays,
          autoAssign:autoAssign,
          assignTo:assignTo,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return res
}