"use client";
import { useState } from "react";
import { User } from "@/types";
import LoginPage from "@/components/LoginPage";
import CustomerDashboard from "@/components/CustomerDashboard";
import AdminPanel from "@/components/AdminPanel";

type Page = "login" | "dashboard" | "admin";

export default function Home() {
  const [page, setPage] = useState<Page>("login");
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLogin = (user: User) => { setCurrentUser(user); setPage("dashboard"); };
  const handleAdminLogin = () => setPage("admin");
  const handleLogout = () => { setCurrentUser(null); setPage("login"); };

  if (page === "admin") return <AdminPanel onLogout={handleLogout} />;
  if (page === "dashboard" && currentUser) return <CustomerDashboard user={currentUser} onLogout={handleLogout} />;
  return <LoginPage onLogin={handleLogin} onAdminLogin={handleAdminLogin} />;
}
