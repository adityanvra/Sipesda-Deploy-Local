import axios from 'axios';

// API Base URL
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://sipesda-deploy-backend.vercel.app/api'
  : 'http://localhost:5000/api';

// Types
export interface Student {
  id: number;
  nisn: string;
  nama: string;
  kelas: string;
  nama_wali: string;
  angkatan: string;
  alamat: string;
  no_hp: string;
  jenis_kelamin: 'L' | 'P';
  created_at?: string;
  updated_at?: string;
}

export interface Payment {
  id: number;
  student_nisn: string;
  jenis_pembayaran: string;
  nominal: number;
  tanggal_pembayaran: string;
  status: 'lunas' | 'belum_lunas';
  keterangan: string;
  catatan: string;
  petugas: string;
  created_at: string;
}

export interface PaymentType {
  id: number;
  nama: string;
  nominal: number;
  periode: string;
  aktif: boolean;
}

// API functions with authentication
export class API {
  private static getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Students API
  static async getStudents(): Promise<Student[]> {
    const response = await axios.get(`${API_BASE_URL}/students`, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  static async getStudentByNisn(nisn: string): Promise<Student | null> {
    try {
      const response = await axios.get(`${API_BASE_URL}/students/nisn/${nisn}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  static async addStudent(student: Omit<Student, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    await axios.post(`${API_BASE_URL}/students`, student, {
      headers: this.getAuthHeaders()
    });
  }

  static async updateStudent(id: string, student: Partial<Student>): Promise<void> {
    await axios.put(`${API_BASE_URL}/students/${id}`, student, {
      headers: this.getAuthHeaders()
    });
  }

  static async deleteStudent(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/students/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Payments API
  static async getPayments(): Promise<Payment[]> {
    const response = await axios.get(`${API_BASE_URL}/payments`, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  static async getPaymentsByStudent(studentNisn: string): Promise<Payment[]> {
    const response = await axios.get(`${API_BASE_URL}/payments?student_nisn=${studentNisn}`, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  static async getPaymentsByMonth(studentNisn: string, month: number, year: number): Promise<Payment[]> {
    const response = await axios.get(`${API_BASE_URL}/payments/by-month`, {
      params: { studentNisn, month, year },
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  static async addPayment(payment: Omit<Payment, 'id' | 'created_at'>): Promise<void> {
    await axios.post(`${API_BASE_URL}/payments`, payment, {
      headers: this.getAuthHeaders()
    });
  }

  static async updatePayment(id: number, payment: Partial<Payment>): Promise<void> {
    await axios.put(`${API_BASE_URL}/payments/${id}`, payment, {
      headers: this.getAuthHeaders()
    });
  }

  static async deletePayment(id: number): Promise<void> {
    await axios.delete(`${API_BASE_URL}/payments/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Payment Types API
  static async getPaymentTypes(): Promise<PaymentType[]> {
    const response = await axios.get(`${API_BASE_URL}/payment-types`, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  static async addPaymentType(paymentType: Omit<PaymentType, 'id'>): Promise<void> {
    await axios.post(`${API_BASE_URL}/payment-types`, paymentType, {
      headers: this.getAuthHeaders()
    });
  }

  static async updatePaymentType(id: number, paymentType: Partial<PaymentType>): Promise<void> {
    await axios.put(`${API_BASE_URL}/payment-types/${id}`, paymentType, {
      headers: this.getAuthHeaders()
    });
  }

  static async deletePaymentType(id: number): Promise<void> {
    await axios.delete(`${API_BASE_URL}/payment-types/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Excel Export/Import utilities
  static async exportToExcel(data: any[], filename: string): Promise<void> {
    const XLSX = await import('xlsx');
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, filename);
  }

  static async importFromExcel(file: File): Promise<any[]> {
    const XLSX = await import('xlsx');
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  }
}

// Legacy compatibility - wrapper class for components that still use the old DatabaseContext
export class DatabaseService {
  async getStudents(): Promise<Student[]> {
    return API.getStudents();
  }

  async getStudentByNisn(nisn: string): Promise<Student | null> {
    return API.getStudentByNisn(nisn);
  }

  async addStudent(student: Omit<Student, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    return API.addStudent(student);
  }

  async updateStudent(id: string, student: Partial<Student>): Promise<void> {
    return API.updateStudent(id, student);
  }

  async deleteStudent(id: string): Promise<void> {
    return API.deleteStudent(id);
  }

  async getPayments(): Promise<Payment[]> {
    return API.getPayments();
  }

  async addPayment(payment: Omit<Payment, 'id' | 'created_at'>): Promise<void> {
    return API.addPayment(payment);
  }

  async getPaymentTypes(): Promise<PaymentType[]> {
    return API.getPaymentTypes();
  }

  // For components that expect authenticateUser method (legacy)
  async authenticateUser(username: string, password: string): Promise<any> {
    throw new Error('Use AuthContext for authentication instead');
  }
}

const db = new DatabaseService();
export default db; 