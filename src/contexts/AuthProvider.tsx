import { ReactNode, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { db, User } from "@/db/database";

interface AuthProviderProps {
  children: ReactNode;
}
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  // ✅ LOGIN HARUS DI SINI
  const login = async (
    username: string,
    password: string,
  ): Promise<boolean> => {
    const foundUser = await db.users.get(username);
    if (!foundUser || foundUser.password !== password) return false;

    setUser(foundUser);
    setIsAuthenticated(true);
    localStorage.setItem("currentUser", JSON.stringify(foundUser));
    return true;
  };

  // ✅ LOGOUT HARUS DI SINI
  const logout = async (): Promise<void> => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("currentUser");
  };

  // ❗ BARU RETURN
  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
