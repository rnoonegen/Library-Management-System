const API_BASE = process.env.REACT_APP_API_URL || "/api";

let authToken = null;

export function setAuthToken(token) {
  authToken = token;
}

async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

export const api = {
  login: (username, password) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  getMe: () => request("/auth/me"),
  changePassword: (payload) =>
    request("/auth/change-password", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getHealth: () => request("/health"),
  getStats: () => request("/dashboard/stats"),

  getNextUserCode: (role) => request(`/admin/users/next/${role}`),
  getUsers: (role) => {
    const query = role ? `?role=${role}` : "";
    return request(`/admin/users${query}`);
  },
  updateUser: (id, user) =>
    request(`/admin/users/${id}`, { method: "PUT", body: JSON.stringify(user) }),
  deleteUser: (id) => request(`/admin/users/${id}`, { method: "DELETE" }),
  getUserBorrows: (id) => request(`/admin/users/${id}/borrows`),
  createUser: (user) =>
    request("/admin/users", { method: "POST", body: JSON.stringify(user) }),

  getBooks: (params) => {
    const query = params ? `?${new URLSearchParams(params)}` : "";
    return request(`/books${query}`);
  },
  createBook: (book) =>
    request("/books", { method: "POST", body: JSON.stringify(book) }),
  updateBook: (id, book) =>
    request(`/books/${id}`, { method: "PUT", body: JSON.stringify(book) }),
  deleteBook: (id) => request(`/books/${id}`, { method: "DELETE" }),

  getTransactions: () => request("/transactions"),
  borrowBook: (data) =>
    request("/transactions/borrow", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  returnBook: (id) => request(`/transactions/${id}/return`, { method: "POST" }),
  recordPayment: (id) => request(`/transactions/${id}/pay`, { method: "POST" }),
  updateTransaction: (id, data) =>
    request(`/transactions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteTransaction: (id) =>
    request(`/transactions/${id}`, { method: "DELETE" }),

  submitBorrowRequest: (bookId) =>
    request("/borrow-requests", {
      method: "POST",
      body: JSON.stringify({ book_id: bookId }),
    }),
  getMyBorrowRequests: () => request("/borrow-requests/mine"),
  getBorrowRequests: (status) => {
    const query = status ? `?status=${status}` : "";
    return request(`/admin/borrow-requests${query}`);
  },
  reviewBorrowRequest: (id, payload) =>
    request(`/admin/borrow-requests/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  submitExtensionRequest: (payload) =>
    request("/extension-requests", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getMyExtensionRequests: () => request("/extension-requests/mine"),
  getExtensionRequests: (status) => {
    const query = status ? `?status=${status}` : "";
    return request(`/admin/extension-requests${query}`);
  },
  reviewExtensionRequest: (id, payload) =>
    request(`/admin/extension-requests/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  getMyBorrows: () => request("/borrows/mine"),
  updateProfile: (payload) =>
    request("/profile", { method: "PUT", body: JSON.stringify(payload) }),

  getNotifications: () => request("/notifications"),
  getUnreadNotificationCount: () => request("/notifications/unread-count"),
  markNotificationRead: (id) =>
    request(`/notifications/${id}/read`, { method: "PATCH" }),
  markAllNotificationsRead: () =>
    request("/notifications/read-all", { method: "PATCH" }),

  cancelBorrowRequest: (id) =>
    request(`/borrow-requests/${id}`, { method: "DELETE" }),
  getHoldQueueSummary: () => request("/admin/borrow-requests/summary"),
};

