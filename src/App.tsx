import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { seedInitialData } from "@/db/database";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Buku from "./pages/Buku";
import Penulis from "./pages/Penulis";
import Penerbit from "./pages/Penerbit";
import Kategori from "./pages/Kategori";
import Rak from "./pages/Rak";
import StokBuku from "./pages/StokBuku";
import Toko from "./pages/Toko";
import Distribusi from "./pages/Distribusi";
import ReturBuku from "./pages/ReturBuku";
import NotFound from "./pages/NotFound";

import InstallPWA from "./components/InstallPWA";

import "./App.css";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    seedInitialData();
  }, []);

  return (
    <>
      {/* InstallPWA dipindahkan ke sini, di dalam BrowserRouter */}
      <InstallPWA />

      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/buku"
          element={
            <ProtectedRoute>
              <Buku />
            </ProtectedRoute>
          }
        />
        <Route
          path="/penulis"
          element={
            <ProtectedRoute>
              <Penulis />
            </ProtectedRoute>
          }
        />
        <Route
          path="/penerbit"
          element={
            <ProtectedRoute>
              <Penerbit />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kategori"
          element={
            <ProtectedRoute>
              <Kategori />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rak"
          element={
            <ProtectedRoute>
              <Rak />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stok-buku"
          element={
            <ProtectedRoute>
              <StokBuku />
            </ProtectedRoute>
          }
        />
        <Route
          path="/toko"
          element={
            <ProtectedRoute>
              <Toko />
            </ProtectedRoute>
          }
        />
        <Route
          path="/distribusi"
          element={
            <ProtectedRoute>
              <Distribusi />
            </ProtectedRoute>
          }
        />
        <Route
          path="/retur"
          element={
            <ProtectedRoute>
              <ReturBuku />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
