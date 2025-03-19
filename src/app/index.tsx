import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from './auth/Login'
import { QrAttendance } from './QrAttendance'
import Students from './admin/Students'
import Courses from './admin/Courses'
import Sections from './admin/Sections'
import Faculty from './admin/Faculty'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={'/'} element={<QrAttendance />}/>
        <Route path={'/login'} element={<Login />}/>
        <Route path={'/admin/studentsLists'} element={<Students />}/>
        <Route path={'/admin/coursesLists'} element={<Courses />}/>
        <Route path={'/admin/sectionsLists'} element={<Sections />}/>
        <Route path={'/admin/faculty'} element={<Faculty />}/>
        {/* <Route path={'/admin/accounts'} element={<Users />}/> */}
      </Routes>
    </BrowserRouter>
  )
}

export default App
