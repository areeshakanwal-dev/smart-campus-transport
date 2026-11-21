// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import { AuthProvider } from "./context/AuthContext";
// import ProtectedRoute from "./components/ProtectedRoute";
// import Navbar from "./components/Navbar";
// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import Unauthorized from "./pages/Unauthorized"; // <-- Add this
// import AdminDashboard from "./pages/AdminDashboard";
// import DriverDashboard from "./pages/DriverDashboard";
// import ParentDashboard from "./pages/ParentDashboard";
// import LandingPage from "./pages/LandingPage";

// export default function App() {
//   return (
//     <AuthProvider>
//       <BrowserRouter>
//         <Navbar />
//         <Routes>
//           <Route path="/login" element={<Login />} />
//           <Route path="/register" element={<Register />} />
//           <Route path="/unauthorized" element={<Unauthorized />} />{" "}
//           {/* <-- Add this */}
//           <Route path="/" element={<LandingPage />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="/register" element={<Register />} />
//           <Route
//             path="/admin"
//             element={
//               <ProtectedRoute allowedRoles={["admin"]}>
//                 <AdminDashboard />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/driver"
//             element={
//               <ProtectedRoute allowedRoles={["driver"]}>
//                 <DriverDashboard />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/parent"
//             element={
//               <ProtectedRoute allowedRoles={["parent"]}>
//                 <ParentDashboard />
//               </ProtectedRoute>
//             }
//           />
//           <Route path="*" element={<Navigate to="/" replace />} />
//         </Routes>
//       </BrowserRouter>
//     </AuthProvider>
//   );
// }


import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LiveFleet from './pages/admin/LiveFleet';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import BusManagement from './pages/admin/BusManagement';
import DriverManagement from './pages/admin/DriverManagement';
// import StudentManagement from './pages/admin/StudentManagement'; 
// import LiveFleet from './pages/admin/LiveFleet';

// Driver & Parent Pages
import DriverDashboard from './pages/DriverDashboard';
import ParentDashboard from './pages/ParentDashboard';



export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ADMIN ROUTES (Nested) */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard /> {/* This contains the Sidebar and Navbar */}
              </ProtectedRoute>
            }
          >
            {/* These pages will render inside the <Outlet /> of AdminDashboard */}
            <Route path="buses" element={<BusManagement />} />
            <Route path="drivers" element={<DriverManagement />} />
            <Route path="buses" element={<BusManagement />} />
            <Route path="fleet" element={<LiveFleet />} />
            {/* <Route path="students" element={<StudentManagement />} /> */}
            {/* <Route path="live-fleet" element={<LiveFleet />} /> */}
          </Route>

          {/* DRIVER ROUTES */}
          <Route path="/driver" element={
            <ProtectedRoute allowedRoles={['driver']}>
              <DriverDashboard />
            </ProtectedRoute>
          } />

          {/* PARENT ROUTES */}
          <Route path="/parent" element={
            <ProtectedRoute allowedRoles={['parent']}>
              <ParentDashboard />
            </ProtectedRoute>
          } />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}