import api from './axios'

export async function getAllHods(token){
    const res = await api.get(`/hods`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        return res
}

export async function getAllStudents(token){
    const res = await api.get(`/students`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        return res
}

export async function getAllAdmins(token){
    const res = await api.get(`/admins`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        return res
}

export async function registerHod(token,userName,email,id,department,pass){
     const res = await api.post(
        `/register-hod`,
        {
          name: userName,
          email:email,
          hodId: id,
          branch: department,
          password: pass,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return res;
}
export async function registerStudent(token,userName,email,id,department,pass,studyYear){
    const res = await api.post(
        `/register-student`,
        {
          name: userName,
          email:email,
          pinNo: id,
          branch: department,
          password: pass,
          yearOfStudy: studyYear,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
    return res;
}
export async function registerAdmin(token,userName,email,id,pass){
    const res = await api.post(
        `/register-admin`,
        {
          name: userName,
          email:email,
          adminId: id,
          password: pass,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return res
}