import React, { useState, useEffect } from "react";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import Dashboard from "./components/Dashboard";
import Keuangan from "./components/Keuangan";
import RiwayatPembayaran from "./components/RiwayatPembayaran";
import ManajemenSiswa from "./components/ManajemenSiswa";
import ManajemenUser from "./components/ManajemenUser";
import EditProfile from "./components/EditProfile";
import TambahSiswa from "./components/TambahSiswa";
import EditSiswa from "./components/EditSiswa";
import { User } from "./types";

import iconUser from "./assets/user.png";
import iconDashboard from "./assets/dashboard.png";
import iconPayment from "./assets/payment.png";
import iconHistory from "./assets/history.png";
import iconStudents from "./assets/students.png";
import iconLogout from "./assets/logout.png";

function App() {
  const [currentPage, setCurrentPage] = useState("login");
  const [user, setUser] = useState<User | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [sessionCheckInterval, setSessionCheckInterval] = useState<NodeJS.Timeout | null>(null);

  // Check session on app start
  useEffect(() => {
    checkExistingSession();
  }, []);

  // Set up session monitoring
  useEffect(() => {
    if (user) {
      // Check session every 30 seconds
      const interval = setInterval(async () => {
        try {
          const response = await fetch('http://localhost:5000/api/users/session', {
            headers: {
              'x-session-token': localStorage.getItem('sessionToken') || ''
            }
          });
          
          if (!response.ok) {
            // Session expired or invalid
            handleLogout();
          }
        } catch (error) {
          console.log('Session check failed, logging out...');
          handleLogout();
        }
      }, 30000); // 30 seconds

      setSessionCheckInterval(interval);

      return () => {
        if (interval) clearInterval(interval);
      };
    }
  }, [user]);

  const checkExistingSession = async () => {
    try {
      const sessionToken = localStorage.getItem('sessionToken');
      if (sessionToken) {
        const response = await fetch('http://localhost:5000/api/users/session', {
          headers: {
            'x-session-token': sessionToken
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setCurrentPage("dashboard");
        } else {
          // Session expired, but keep credentials if Remember Me is checked
          localStorage.removeItem('sessionToken');
          
          // Check if we should keep credentials
          const savedCredentials = localStorage.getItem('sipesda_credentials');
          if (savedCredentials) {
            try {
              const credentials = JSON.parse(savedCredentials);
              if (credentials.rememberMe !== true) {
                localStorage.removeItem('sipesda_credentials');
              }
            } catch (error) {
              console.log('Error parsing saved credentials:', error);
              localStorage.removeItem('sipesda_credentials');
            }
          }
        }
      }
    } catch (error) {
      console.log('Session check failed');
      localStorage.removeItem('sessionToken');
      
      // Check if we should keep credentials
      const savedCredentials = localStorage.getItem('sipesda_credentials');
      if (savedCredentials) {
        try {
          const credentials = JSON.parse(savedCredentials);
          if (credentials.rememberMe !== true) {
            localStorage.removeItem('sipesda_credentials');
          }
        } catch (error) {
          console.log('Error parsing saved credentials:', error);
          localStorage.removeItem('sipesda_credentials');
        }
      }
    }
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    setCurrentPage("dashboard");
  };

  const handleShowRegister = () => {
    setCurrentPage("register");
  };

  const handleBackToLogin = () => {
    setCurrentPage("login");
  };

  const handleRegisterSuccess = () => {
    setCurrentPage("login");
  };

  const handleLogout = async () => {
    try {
      const sessionToken = localStorage.getItem('sessionToken');
      if (sessionToken) {
        await fetch('http://localhost:5000/api/users/logout', {
          method: 'POST',
          headers: {
            'x-session-token': sessionToken
          }
        });
      }
    } catch (error) {
      console.log('Logout request failed');
    } finally {
      // Check if Remember Me is enabled before clearing credentials
      const savedCredentials = localStorage.getItem('sipesda_credentials');
      let shouldKeepCredentials = false;
      
      if (savedCredentials) {
        try {
          const credentials = JSON.parse(savedCredentials);
          shouldKeepCredentials = credentials.rememberMe === true;
        } catch (error) {
          console.log('Error parsing saved credentials:', error);
        }
      }
      
      // Clear session token but keep credentials if Remember Me is checked
      localStorage.removeItem('sessionToken');
      
      // Only clear credentials if Remember Me is not checked
      if (!shouldKeepCredentials) {
        localStorage.removeItem('sipesda_credentials');
      }
      
      setUser(null);
      setCurrentPage("login");
      setSelectedStudentId(null);
      
      if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval);
        setSessionCheckInterval(null);
      }
    }
  };

  const handleEditStudent = (studentId: number) => {
    setSelectedStudentId(studentId);
    setCurrentPage("edit-siswa");
  };

  // Show login or register page
  if (!user) {
    if (currentPage === "register") {
      return <RegisterPage onBackToLogin={handleBackToLogin} onRegisterSuccess={handleRegisterSuccess} />;
    }
    return <LoginPage onLogin={handleLogin} onShowRegister={handleShowRegister} />;
  }

  const isAdmin = user.role === 'admin';

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard currentUser={user} />;
      case "keuangan":
        return <Keuangan />;
      case "riwayat":
        return <RiwayatPembayaran />;
      case "manajemen":
        return (
          <ManajemenSiswa
            onEditStudent={handleEditStudent}
            onAddStudent={() => setCurrentPage("tambah-siswa")}
          />
        );
      case "manajemen-user":
        return <ManajemenUser />;
      case "edit-profile":
        return <EditProfile currentUser={user} onBack={() => setCurrentPage("dashboard")} />;
      case "tambah-siswa":
        return <TambahSiswa onBack={() => setCurrentPage("manajemen")} />;
      case "edit-siswa":
        return <EditSiswa studentId={selectedStudentId!} onBack={() => setCurrentPage("manajemen")} />;
      default:
        return <Dashboard currentUser={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#226398] via-[#012246] to-[#254E70]">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 min-h-screen shadow-2xl flex flex-col">
          {/* Bagian Atas (Judul + User Info) */}
          <div className="bg-slate-800">
            <div className="p-6 border-b border-slate-700 flex justify-center">
              <h1 className="text-white text-4xl font-bold">S I P E S D A</h1>
            </div>

            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center space-x-3">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                  <img src={iconUser} alt="User" className="w-12 h-12" />
                </div>
                <div>
                  <p className="text-white font-medium">
                    {user.role === "admin" ? "Administrator" : "Operator"}
                  </p>
                  <p className="text-slate-300 text-sm">{user.username}</p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    user.role === 'admin' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bagian Menu + Logout */}
          <div className="bg-white flex-1 flex flex-col justify-between">
            {/* Menu Navigasi */}
            <nav className="p-4">
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setCurrentPage("dashboard")}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors ${
                      currentPage === "dashboard"
                        ? "bg-blue-600 text-white"
                        : "text-gray-800 hover:bg-blue-100 hover:text-slate-900"
                    }`}
                  >
                    <img
                      src={iconDashboard}
                      alt="Dashboard"
                      className="w-5 h-5"
                    />
                    <span className="font-bold">Dashboard</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentPage("keuangan")}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors ${
                      currentPage === "keuangan"
                        ? "bg-blue-600 text-white"
                        : "text-gray-800 hover:bg-blue-100 hover:text-slate-900"
                    }`}
                  >
                    <img
                      src={iconPayment}
                      alt="Pembayaran"
                      className="w-5 h-5"
                    />
                    <span className="font-bold">Pembayaran</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentPage("riwayat")}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors ${
                      currentPage === "riwayat"
                        ? "bg-blue-600 text-white"
                        : "text-gray-800 hover:bg-blue-100 hover:text-slate-900"
                    }`}
                  >
                    <img src={iconHistory} alt="Riwayat" className="w-5 h-5" />
                    <span className="font-bold">Riwayat Pembayaran</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentPage("manajemen")}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors ${
                      ["manajemen", "tambah-siswa", "edit-siswa"].includes(
                        currentPage
                      )
                        ? "bg-blue-600 text-white"
                        : "text-gray-800 hover:bg-blue-100 hover:text-slate-900"
                    }`}
                  >
                    <img src={iconStudents} alt="Siswa" className="w-5 h-5" />
                    <span className="font-bold">Manajemen Siswa</span>
                  </button>
                </li>
                
                {/* Admin-only menu */}
                {isAdmin && (
                  <li>
                    <button
                      onClick={() => setCurrentPage("manajemen-user")}
                      className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors ${
                        currentPage === "manajemen-user"
                          ? "bg-blue-600 text-white"
                          : "text-gray-800 hover:bg-blue-100 hover:text-slate-900"
                      }`}
                    >
                      <img src={iconUser} alt="User" className="w-5 h-5" />
                      <span className="font-bold">Manajemen User</span>
                    </button>
                  </li>
                )}

                {/* Edit Profile - Available for all users */}
                <li>
                  <button
                    onClick={() => setCurrentPage("edit-profile")}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors ${
                      currentPage === "edit-profile"
                        ? "bg-blue-600 text-white"
                        : "text-gray-800 hover:bg-blue-100 hover:text-slate-900"
                    }`}
                  >
                    <img src={iconUser} alt="Profile" className="w-5 h-5" />
                    <span className="font-bold">Edit Profile</span>
                  </button>
                </li>
              </ul>
            </nav>

            {/* Tombol Logout */}
            <div className="border-t border-gray-300 px-4 py-6">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-2 px-4 py-3 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                <img src={iconLogout} alt="Logout" className="w-5 h-5" />
                <span className="font-bold">Keluar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">{renderCurrentPage()}</div>
      </div>
    </div>
  );
}

export default App;
