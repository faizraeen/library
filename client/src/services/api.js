const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    const token = localStorage.getItem('librachain_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error on ${endpoint}:`, error.message);
      throw error;
    }
  }

  // Auth Endpoints
  login(email, password) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  register(userData) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  getProfile() {
    return this.request('/api/auth/profile');
  }

  updateProfile(updates) {
    return this.request('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Books Endpoints
  getBooks(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request(`/api/books${queryString}`);
  }

  getBookById(id) {
    return this.request(`/api/books/${id}`);
  }

  createBook(bookData) {
    return this.request('/api/books', {
      method: 'POST',
      body: JSON.stringify(bookData),
    });
  }

  updateBook(id, bookData) {
    return this.request(`/api/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bookData),
    });
  }

  deleteBook(id) {
    return this.request(`/api/books/${id}`, {
      method: 'DELETE',
    });
  }

  // Borrowing Endpoints
  borrowBook(bookId, transactionHash, walletAddress) {
    return this.request('/api/borrow', {
      method: 'POST',
      body: JSON.stringify({ bookId, transactionHash, walletAddress }),
    });
  }

  returnBook(borrowId, bookId, transactionHash, walletAddress) {
    return this.request('/api/borrow/return', {
      method: 'POST',
      body: JSON.stringify({ borrowId, bookId, transactionHash, walletAddress }),
    });
  }

  getMyBorrowedBooks() {
    return this.request('/api/borrow/my-books');
  }

  getMyBorrowHistory() {
    return this.request('/api/borrow/history');
  }

  getAllBorrowRecords(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/borrow/all${query ? `?${query}` : ''}`);
  }

  // Dashboard Endpoints
  getAdminDashboard() {
    return this.request('/api/dashboard/admin');
  }

  getStudentDashboard() {
    return this.request('/api/dashboard/student');
  }

  getRegisteredStudents() {
    return this.request('/api/dashboard/students');
  }
}

export const api = new ApiService();
export default api;
