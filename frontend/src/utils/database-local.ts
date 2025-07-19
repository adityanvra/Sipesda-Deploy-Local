// Database configuration for LOCAL deployment
// Copy isi file ini ke database.ts untuk setup lokal

import axios from 'axios';

// KONFIGURASI UNTUK DEPLOYMENT LOKAL
const API_BASE_URL = 'http://localhost:5000/api';

// Untuk akses dari komputer lain di jaringan sekolah, ganti dengan IP server:
// const API_BASE_URL = 'http://192.168.1.100:5000/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor untuk logging (development only)
axiosInstance.interceptors.request.use(
  (config) => {
    console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor untuk error handling
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`📥 ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      alert('Tidak dapat terhubung ke server! Pastikan backend berjalan di localhost:5000');
    }
    
    return Promise.reject(error);
  }
);

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

export class DatabaseService {
  // Students CRUD
  async getStudents(): Promise<Student[]> {
    try {
      const response = await axiosInstance.get('/students');
      return response.data;
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  }

  async getStudentByNisn(nisn: string): Promise<Student | null> {
    try {
      const response = await axiosInstance.get(`/students/nisn/${nisn}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching student:', error);
      return null;
    }
  }

  async addStudent(student: Omit<Student, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    try {
      await axiosInstance.post('/students', student);
    } catch (error) {
      console.error('Error adding student:', error);
      throw error;
    }
  }

  async updateStudent(id: string, student: Partial<Student>): Promise<void> {
    try {
      await axiosInstance.put(`/students/${id}`, student);
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  }

  async deleteStudent(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`/students/${id}`);
    } catch (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  }

  // Payments CRUD
  async getPayments(): Promise<Payment[]> {
    try {
      const response = await axiosInstance.get('/payments');
      return response.data;
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  }

  async addPayment(payment: Omit<Payment, 'id' | 'created_at'>): Promise<void> {
    try {
      await axiosInstance.post('/payments', payment);
    } catch (error) {
      console.error('Error adding payment:', error);
      throw error;
    }
  }

  // Payment Types CRUD
  async getPaymentTypes(): Promise<PaymentType[]> {
    try {
      const response = await axiosInstance.get('/payment-types');
      return response.data;
    } catch (error) {
      console.error('Error fetching payment types:', error);
      throw error;
    }
  }
}

const db = new DatabaseService();
export default db; 