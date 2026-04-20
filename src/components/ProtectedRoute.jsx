// // import { Navigate, Outlet } from "react-router-dom";
// // import { useAuth } from "../context/AuthContext";

// // // ProtectedRoute — Guards routes based on auth and role
// // // Usage in App.jsx:
// // //   <Route element={<ProtectedRoute />}>            → any logged-in user
// // //   <Route element={<ProtectedRoute adminOnly />}>  → admin only

// // const ProtectedRoute = ({ adminOnly = false }) => {
// //   const { user, role, loading } = useAuth();

// //   // Still resolving Firebase auth state
// //   if (loading) {
// //     return (
// //       <div className="flex items-center justify-center h-screen bg-gray-50">
// //         <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
// //       </div>
// //     );
// //   }

// //   // Not logged in → go to login
// //   if (!user) {
// //     return <Navigate to="/login" replace />;
// //   }

// //   // Admin-only route but user is not admin → go to dashboard
// //   if (adminOnly && role !== "admin") {
// //     return <Navigate to="/dashboard" replace />;
// //   }

// //   // All good → render the child route
// //   return <Outlet />;
// // };

// // export default ProtectedRoute;



// import { Outlet } from "react-router-dom";

// const ProtectedRoute = () => {
//   return <Outlet />; // ✅ sabko allow kar dega
// };

// export default ProtectedRoute;





import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ProtectedRoute — Guards routes based on auth and role
// Usage in App.jsx:
//   <Route element={<ProtectedRoute />}>             → any logged-in user
//   <Route element={<ProtectedRoute adminOnly />}>   → admin only

const ProtectedRoute = ({ adminOnly = false }) => {
  const { user, isAdmin, loading } = useAuth();

  // Still resolving Firebase auth state + DB user fetch
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in → go to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Admin-only route but user is not admin → go to dashboard
  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // All good → render the child route
  return <Outlet />;
};

export default ProtectedRoute;

