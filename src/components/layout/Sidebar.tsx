// File: src/components/layout/Sidebar.tsx
// Sidebar navigasi dengan fitur collapse dan responsive mobile

import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import {
  BookOpen,
  Users,
  Building2,
  Tag,
  Package,
  Store,
  TruckIcon,
  RotateCcw,
  LayoutDashboard,
  UserCircle,
  LogOut,
  Archive,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface SidebarProps {
  isOpen: boolean;
  isMobileOpen: boolean;
  onToggle: () => void;
  onMobileToggle: () => void;
}

export const Sidebar = ({
  isOpen,
  isMobileOpen,
  onToggle,
  onMobileToggle,
}: SidebarProps) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    { icon: BookOpen, label: "Buku", path: "/buku" },
    { icon: Users, label: "Penulis", path: "/penulis" },
    { icon: Building2, label: "Penerbit", path: "/penerbit" },
    { icon: Tag, label: "Kategori", path: "/kategori" },
    { icon: Archive, label: "Rak", path: "/rak" },
    { icon: Package, label: "Stok Buku", path: "/stok-buku" },
    { icon: Store, label: "Toko", path: "/toko" },
    { icon: TruckIcon, label: "Distribusi", path: "/distribusi" },
    { icon: RotateCcw, label: "Retur Buku", path: "/retur" },
  ];

  const handleNavClick = () => {
    if (window.innerWidth < 1024) {
      onMobileToggle();
    }
  };

  return (
    <>
      {/* Overlay untuk mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileToggle}
        />
      )}

      {/* Sidebar Desktop - Icon Only on Mobile */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 z-50",
          // Desktop
          "hidden lg:flex",
          isOpen ? "lg:w-64" : "lg:w-20",
          // Mobile - Always show icons only
          "lg:translate-x-0"
        )}
      >
        {/* Header Desktop */}
        <div
          className={cn(
            "p-6 border-b border-sidebar-border transition-all duration-300",
            !isOpen && "lg:p-3"
          )}
        >
          <div
            className={cn(
              "flex items-center gap-3",
              !isOpen && "lg:flex-col lg:gap-2"
            )}
          >
            <div
              className={cn(
                "p-3 bg-primary/10 rounded-full flex-shrink-0",
                !isOpen && "lg:p-2"
              )}
            >
              <img
                src={Logo}
                alt="Logo"
                className={cn(
                  "object-contain",
                  isOpen ? "h-12 w-12" : "lg:h-8 lg:w-8"
                )}
              />
            </div>

            {isOpen && (
              <div className="min-w-0 flex-1 lg:block hidden">
                <h1 className="text-lg font-bold text-sidebar-foreground truncate">
                  SIPIB Buku
                </h1>
                <p className="text-xs text-sidebar-foreground/60">
                  Manajemen Penerbitan
                </p>
              </div>
            )}
          </div>

          {/* Toggle Button Desktop */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className={cn(
              "mt-4 w-full hidden lg:flex bg-[#ba3838] hover:bg-[#c12727]",
              !isOpen && "justify-center"
            )}
          >
            {isOpen ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation Desktop */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
                !isOpen && "lg:justify-center lg:px-2"
              )}
              activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
              title={!isOpen ? item.label : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {isOpen && <span className="lg:block hidden">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User Info Desktop */}
        <div className="p-4 border-t border-sidebar-border">
          {isOpen ? (
            <>
              <div className="flex items-center gap-3 mb-3 px-2 lg:flex hidden">
                <UserCircle className="h-8 w-8 text-sidebar-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {user?.nama_lengkap}
                  </p>
                  <p className="text-xs text-sidebar-foreground/60 capitalize">
                    {user?.role}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="w-full justify-start gap-2 border-sidebar-border hover:bg-sidebar-accent lg:flex hidden"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="icon"
              onClick={logout}
              className="w-full border-sidebar-border hover:bg-sidebar-accent lg:flex hidden"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </aside>

      {/* Sidebar Mobile - Full Width Slide */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300 z-50",
          "lg:hidden",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header Mobile */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-full">
                <img
                  src={Logo}
                  alt="Logo"
                  className="h-12 w-12 object-contain"
                />
              </div>
              <div>
                <h1 className="text-lg font-bold text-sidebar-foreground">
                  SIM Buku
                </h1>
                <p className="text-xs text-sidebar-foreground/60">
                  Manajemen Penerbitan
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onMobileToggle}
              className="lg:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Navigation Mobile */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
              activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Info Mobile */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 mb-3 px-2">
            <UserCircle className="h-8 w-8 text-sidebar-primary" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.nama_lengkap}
              </p>
              <p className="text-xs text-sidebar-foreground/60 capitalize">
                {user?.role}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="w-full justify-start gap-2 border-sidebar-border hover:bg-sidebar-accent"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>
    </>
  );
};
