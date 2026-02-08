import { Routes, Route } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import AdminLogin from "./admin/AdminLogin";
import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/AdminDashboard";
import AdminCoupons from "./admin/AdminCoupons";
import AdminSubmissions from "./admin/AdminSubmissions";
import AdminContracts from "./admin/AdminContracts";
import AdminRepresentatives from "./admin/AdminRepresentatives";
import AdminCommissions from "./admin/AdminCommissions";
import { Loader2 } from "lucide-react";

const Admin = () => {
  const { isAuthenticated, loading, login, logout } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-slate-blue flex items-center justify-center">
        <Loader2 size={32} className="text-base-color animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={login} />;
  }

  return (
    <Routes>
      <Route element={<AdminLayout onLogout={logout} />}>
        <Route index element={<AdminDashboard />} />
        <Route path="cupons" element={<AdminCoupons />} />
        <Route path="formularios" element={<AdminSubmissions />} />
        <Route path="contratos" element={<AdminContracts />} />
        <Route path="representantes" element={<AdminRepresentatives />} />
        <Route path="comissoes" element={<AdminCommissions />} />
      </Route>
    </Routes>
  );
};

export default Admin;
