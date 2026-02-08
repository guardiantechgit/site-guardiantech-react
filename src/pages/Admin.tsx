import { Routes, Route } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import AdminLogin from "./admin/AdminLogin";
import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/AdminDashboard";
import AdminCoupons from "./admin/AdminCoupons";
import AdminSubmissions from "./admin/AdminSubmissions";

const Admin = () => {
  const { isAuthenticated, login, logout } = useAdminAuth();

  if (!isAuthenticated) {
    return <AdminLogin onLogin={login} />;
  }

  return (
    <Routes>
      <Route element={<AdminLayout onLogout={logout} />}>
        <Route index element={<AdminDashboard />} />
        <Route path="cupons" element={<AdminCoupons />} />
        <Route path="formularios" element={<AdminSubmissions />} />
      </Route>
    </Routes>
  );
};

export default Admin;
