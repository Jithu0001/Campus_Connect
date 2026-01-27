import { useState } from 'react'
import {Routes, Route, BrowserRouter} from 'react-router-dom'
import logo from './assets/logo.png'
import './App.css'
import Home from './components/Home'
import Login from './components/Login'
import StudentDashboard from './components/StudentDashboard'
import HodDashboard from './components/HodDashboard'
import AdminDashboard from './components/AdminDashboard'
import AdminDashboardAllComplaints from './components/AdminDashboardAllComplaints'
import AdminDashboardSettings from './components/AdminDashboardSettings'
function App() {

  return (
    <>
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<Home />}/>
      <Route path='/login' element={<Login />}></Route>
      <Route path='/student-dashboard' element={<StudentDashboard />}></Route>
      <Route path='/hod-dashboard' element={<HodDashboard />}></Route>
      <Route path='/admin-dashboard' element={<AdminDashboard />}></Route>
      <Route path='/admin-dashboard/all-complaints' element={<AdminDashboardAllComplaints />}></Route>
      <Route path='/admin-dashboard/settings' element={<AdminDashboardSettings />}></Route>


    </Routes>
    </BrowserRouter>
    


    </>
  )
}

export default App
