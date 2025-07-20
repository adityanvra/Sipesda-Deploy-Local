import axios from 'axios';
import { User, Student, Payment, PaymentType, UserPermission, LoginResponse } from '../types';

// Konfigurasi untuk Laragon localhost
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Session management
class SessionManager {
  private static instance: SessionManager;
  private sessionToken: string | null = null;
  private sessionCheckInterval: NodeJS.Timeout | null = null;
  private keepAliveInterval: NodeJS.Timeout | null = null;
  private activityListeners: Array<{ event: string; handler: EventListener }> | null = null;

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  setSessionToken(token: string) {
    this.sessionToken = token;
    localStorage.setItem('sessionToken', token);
    this.startSessionCheck();
  }

  getSessionToken(): string | null {
    if (!this.sessionToken) {
      this.sessionToken = localStorage.getItem('sessionToken');
    }
    return this.sessionToken;
  }

  clearSession() {
    this.sessionToken = null;
    localStorage.removeItem('sessionToken');
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
      this.sessionCheckInterval = null;
    }
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
    this.removeActivityListeners();
  }

  private startSessionCheck() {
    // Check session every 30 seconds
    this.sessionCheckInterval = setInterval(async () => {
      try {
        await this.validateSession();
      } catch (error) {
        console.log('Session expired, logging out...');
        this.clearSession();
        window.location.href = '/';
      }
    }, 30000); // 30 seconds

    // Keep session alive by sending activity every 25 seconds
    this.keepAliveInterval = setInterval(async () => {
      try {
        const token = this.getSessionToken();
        if (token) {
          await axios.post(`${API_BASE_URL}/users/keep-alive`, {}, {
            headers: { 'x-session-token': token }
          });
        }
      } catch (error) {
        // Silent fail for keep-alive
      }
    }, 25000); // 25 seconds

    // Add activity listeners to detect user activity
    this.addActivityListeners();
  }

  private addActivityListeners() {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const activityHandler = () => {
      // Activity detected - session will be kept alive by keep-alive interval
    };

    events.forEach(event => {
      document.addEventListener(event, activityHandler, true);
    });

    // Store listeners for cleanup
    this.activityListeners = events.map(event => ({
      event,
      handler: activityHandler
    }));
  }

  private removeActivityListeners() {
    if (this.activityListeners) {
      this.activityListeners.forEach(({ event, handler }) => {
        document.removeEventListener(event, handler, true);
      });
      this.activityListeners = null;
    }
  }

  private async validateSession() {
    const token = this.getSessionToken();
    if (!token) throw new Error('No session token');

    const response = await axios.get(`${API_BASE_URL}/users/session`, {
      headers: { 'x-session-token': token }
    });
    return response.data;
  }
}

class DatabaseManager {
  private sessionManager = SessionManager.getInstance();

  // SESSION MANAGEMENT
  async authenticateUser(username: string, password: string, rememberMe: boolean = false): Promise<LoginResponse | null> {
    try {
      const response = await axios.post(`${API_BASE_URL}/users/login`, { 
        username, 
        password, 
        rememberMe 
      });
      
      const loginData = response.data;
      this.sessionManager.setSessionToken(loginData.session_token);
      
      return loginData;
    } catch {
      return null;
    }
  }

  async logout(): Promise<boolean> {
    try {
      const token = this.sessionManager.getSessionToken();
      if (token) {
        await axios.post(`${API_BASE_URL}/users/logout`, {}, {
          headers: { 'x-session-token': token }
        });
      }
      this.sessionManager.clearSession();
      return true;
    } catch {
      this.sessionManager.clearSession();
      return true;
    }
  }

  async checkSession(): Promise<User | null> {
    try {
      const token = this.sessionManager.getSessionToken();
      if (!token) return null;

      const response = await axios.get(`${API_BASE_URL}/users/session`, {
        headers: { 'x-session-token': token }
      });
      return response.data.user;
    } catch {
      this.sessionManager.clearSession();
      return null;
    }
  }

  // PERMISSION MANAGEMENT
  async getUserPermissions(userId: number): Promise<UserPermission[]> {
    try {
      const token = this.sessionManager.getSessionToken();
      const response = await axios.get(`${API_BASE_URL}/users/${userId}/permissions`, {
        headers: { 'x-session-token': token }
      });
      return response.data;
    } catch {
      return [];
    }
  }

  async updateUserPermissions(userId: number, permissions: UserPermission[]): Promise<boolean> {
    try {
      const token = this.sessionManager.getSessionToken();
      await axios.put(`${API_BASE_URL}/users/${userId}/permissions`, { permissions }, {
        headers: { 'x-session-token': token }
      });
      return true;
    } catch {
      return false;
    }
  }

  async checkPermission(permission: string, action: 'read' | 'create' | 'update' | 'delete'): Promise<boolean> {
    try {
      const token = this.sessionManager.getSessionToken();
      if (!token) return false;

      const response = await axios.get(`${API_BASE_URL}/users/session`, {
        headers: { 'x-session-token': token }
      });
      
      const userId = response.data.user.id;
      const permissions = await this.getUserPermissions(userId);
      
      const userPermission = permissions.find(p => p.permission === permission);
      if (!userPermission) return false;
      
      return userPermission[`can_${action}`];
    } catch {
      return false;
    }
  }

  // USER MANAGEMENT
  async createUser(username: string, password: string, role: string = 'operator'): Promise<boolean> {
    try {
      const token = this.sessionManager.getSessionToken();
      await axios.post(`${API_BASE_URL}/users`, { username, password, role }, {
        headers: { 'x-session-token': token }
      });
      return true;
    } catch {
      return false;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const token = this.sessionManager.getSessionToken();
      const response = await axios.get(`${API_BASE_URL}/users`, {
        headers: { 'x-session-token': token }
      });
      return response.data;
    } catch {
      return [];
    }
  }

  async getUserById(id: number): Promise<User | null> {
    try {
      const token = this.sessionManager.getSessionToken();
      const response = await axios.get(`${API_BASE_URL}/users/${id}`, {
        headers: { 'x-session-token': token }
      });
      return response.data;
    } catch {
      return null;
    }
  }

  async updateUser(id: number, updates: Partial<User>): Promise<boolean> {
    try {
      const token = this.sessionManager.getSessionToken();
      await axios.put(`${API_BASE_URL}/users/${id}`, updates, {
        headers: { 'x-session-token': token }
      });
      return true;
    } catch {
      return false;
    }
  }

  async updateOwnProfile(updates: { username?: string; password?: string }): Promise<boolean> {
    try {
      const token = this.sessionManager.getSessionToken();
      await axios.put(`${API_BASE_URL}/users/profile/update`, updates, {
        headers: { 'x-session-token': token }
      });
      return true;
    } catch {
      return false;
    }
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      const token = this.sessionManager.getSessionToken();
      await axios.delete(`${API_BASE_URL}/users/${id}`, {
        headers: { 'x-session-token': token }
      });
      return true;
    } catch {
      return false;
    }
  }

  // STUDENT
  async getAllStudents(): Promise<Student[]> {
    const token = this.sessionManager.getSessionToken();
    const response = await axios.get(`${API_BASE_URL}/students`, {
      headers: { 'x-session-token': token }
    });
    return response.data;
  }

  async getStudentByNisn(nisn: string): Promise<Student | null> {
    try {
      const token = this.sessionManager.getSessionToken();
      const response = await axios.get(`${API_BASE_URL}/students/${nisn}`, {
        headers: { 'x-session-token': token }
      });
      return response.data;
    } catch {
      return null;
    }
  }

  async getStudentById(id: number): Promise<Student | null> {
    try {
      const token = this.sessionManager.getSessionToken();
      const response = await axios.get(`${API_BASE_URL}/students/${id}`, {
        headers: { 'x-session-token': token }
      });
      return response.data;
    } catch {
      return null;
    }
  }

  async createStudent(student: Omit<Student, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    try {
      const token = this.sessionManager.getSessionToken();
      await axios.post(`${API_BASE_URL}/students`, student, {
        headers: { 'x-session-token': token }
      });
      return true;
    } catch {
      return false;
    }
  }

  async updateStudent(id: number, student: Partial<Student>): Promise<boolean> {
    try {
      const token = this.sessionManager.getSessionToken();
      await axios.put(`${API_BASE_URL}/students/${id}`, student, {
        headers: { 'x-session-token': token }
      });
      return true;
    } catch {
      return false;
    }
  }

  async deleteStudent(id: number): Promise<boolean> {
    try {
      const token = this.sessionManager.getSessionToken();
      await axios.delete(`${API_BASE_URL}/students/${id}`, {
        headers: { 'x-session-token': token }
      });
      return true;
    } catch {
      return false;
    }
  }

  // PAYMENT
  async getPaymentsByStudentId(studentId: number): Promise<Payment[]> {
    const token = this.sessionManager.getSessionToken();
    const response = await axios.get(`${API_BASE_URL}/payments?student_id=${studentId}`, {
      headers: { 'x-session-token': token }
    });
    return response.data;
  }

  async getPaymentsByStudentNisn(nisn: string): Promise<Payment[]> {
    const token = this.sessionManager.getSessionToken();
    const response = await axios.get(`${API_BASE_URL}/payments?student_nisn=${nisn}`, {
      headers: { 'x-session-token': token }
    });
    return response.data;
  }

  async createPayment(payment: Omit<Payment, 'id' | 'created_at'>): Promise<boolean> {
    try {
      const token = this.sessionManager.getSessionToken();
      await axios.post(`${API_BASE_URL}/payments`, payment, {
        headers: { 'x-session-token': token }
      });
      return true;
    } catch {
      return false;
    }
  }

  async updatePayment(id: number, updates: Partial<Payment>): Promise<boolean> {
    try {
      const token = this.sessionManager.getSessionToken();
      await axios.put(`${API_BASE_URL}/payments/${id}`, updates, {
        headers: { 'x-session-token': token }
      });
      return true;
    } catch {
      return false;
    }
  }

  async deletePayment(id: number): Promise<boolean> {
    try {
      const token = this.sessionManager.getSessionToken();
      await axios.delete(`${API_BASE_URL}/payments/${id}`, {
        headers: { 'x-session-token': token }
      });
      return true;
    } catch {
      return false;
    }
  }

  // PAYMENT TYPE
  async getPaymentTypes(): Promise<PaymentType[]> {
    const token = this.sessionManager.getSessionToken();
    const response = await axios.get(`${API_BASE_URL}/payment-types`, {
      headers: { 'x-session-token': token }
    });
    return response.data;
  }

  async addPaymentType(type: Omit<PaymentType, 'id'>): Promise<boolean> {
    try {
      const token = this.sessionManager.getSessionToken();
      await axios.post(`${API_BASE_URL}/payment-types`, type, {
        headers: { 'x-session-token': token }
      });
      return true;
    } catch {
      return false;
    }
  }

  async getPaymentsByMonth(studentId: number, month: string, year: string): Promise<Payment[]> {
    try {
      const token = this.sessionManager.getSessionToken();
      const response = await axios.get(`${API_BASE_URL}/payments/by-month`, {
        params: { studentId, month, year },
        headers: { 'x-session-token': token }
      });
      return response.data;
    } catch (error) {
      console.error('Gagal mengambil data pembayaran per bulan:', error);
      return [];
    }
  }

  async getPaymentsByMonthNisn(studentNisn: string, month: string, year: string): Promise<Payment[]> {
    try {
      const token = this.sessionManager.getSessionToken();
      const response = await axios.get(`${API_BASE_URL}/payments/by-month`, {
        params: { studentNisn, month, year },
        headers: { 'x-session-token': token }
      });
      return response.data;
    } catch (error) {
      console.error('Gagal mengambil data pembayaran per bulan:', error);
      return [];
    }
  }
}

export default DatabaseManager;
