import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, StaffSubType, LoginCredentials, VerifyOtpRequest } from '@/types/auth';
import { authApi } from '@/api/authApi';
import { DEMO_USERS } from '@/mock/mockData';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  staffSubType: StaffSubType | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  verifyOtp: (credentials: VerifyOtpRequest) => Promise<void>;
  logout: () => Promise<void>;
  quickSwitchRole: (role: UserRole, staffSubType?: StaffSubType) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Rehydrate user session from localStorage
    const savedUser = localStorage.getItem('healthconnect_user') || localStorage.getItem('sanjeevani_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse saved user', e);
      }
    } else {
      // Default to Patient session for immediate smooth testing
      setUser(DEMO_USERS.patient);
      localStorage.setItem('healthconnect_user', JSON.stringify(DEMO_USERS.patient));
      localStorage.setItem('healthconnect_token', 'mock_jwt_patient');
    }
    setIsLoading(false);

    const handleAuthExpired = () => {
      setUser(null);
      localStorage.removeItem('healthconnect_user');
      localStorage.removeItem('healthconnect_token');
      localStorage.removeItem('sanjeevani_user');
      localStorage.removeItem('sanjeevani_token');
    };
    window.addEventListener('auth:expired', handleAuthExpired);
    return () => window.removeEventListener('auth:expired', handleAuthExpired);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(credentials);
      setUser(res.data.user);
      localStorage.setItem('healthconnect_user', JSON.stringify(res.data.user));
      localStorage.setItem('healthconnect_token', res.data.tokens.accessToken);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (credentials: VerifyOtpRequest) => {
    setIsLoading(true);
    try {
      const res = await authApi.verifyPatientOtp(credentials);
      setUser(res.data.user);
      localStorage.setItem('healthconnect_user', JSON.stringify(res.data.user));
      localStorage.setItem('healthconnect_token', res.data.tokens.accessToken);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    setUser(null);
    localStorage.removeItem('healthconnect_user');
    localStorage.removeItem('healthconnect_token');
    localStorage.removeItem('sanjeevani_user');
    localStorage.removeItem('sanjeevani_token');
  };

  const quickSwitchRole = (newRole: UserRole, newStaffSubType?: StaffSubType) => {
    let targetUser = DEMO_USERS.patient;
    if (newRole === 'ASHA') targetUser = DEMO_USERS.asha;
    else if (newRole === 'DOCTOR') targetUser = DEMO_USERS.doctor;
    else if (newRole === 'FACILITY_STAFF') {
      if (newStaffSubType === 'PHARMACIST') targetUser = DEMO_USERS.pharmacist;
      else if (newStaffSubType === 'LAB_TECHNICIAN') targetUser = DEMO_USERS.labTech;
      else if (newStaffSubType === 'FACILITY_OPERATIONS') targetUser = DEMO_USERS.operations;
      else targetUser = DEMO_USERS.registrationClerk;
    } else if (newRole === 'DISTRICT_ADMIN') targetUser = DEMO_USERS.districtAdmin;
    else if (newRole === 'SUPER_ADMIN') targetUser = DEMO_USERS.superAdmin;

    setUser(targetUser);
    localStorage.setItem('healthconnect_user', JSON.stringify(targetUser));
    localStorage.setItem('healthconnect_token', `mock_jwt_${targetUser.role.toLowerCase()}`);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        staffSubType: user?.staffSubType || null,
        isAuthenticated: !!user,
        isLoading,
        login,
        verifyOtp,
        logout,
        quickSwitchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
