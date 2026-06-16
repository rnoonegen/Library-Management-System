const API_BASE = process.env.REACT_APP_API_URL || "/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

export const api = {
  getHealth: () => request("/health"),
  getStats: () => request("/dashboard/stats"),

  getBooks: (params) => {
    const query = params ? `?${new URLSearchParams(params)}` : "";
    return request(`/books${query}`);
  },
  createBook: (book) =>
    request("/books", { method: "POST", body: JSON.stringify(book) }),
  updateBook: (id, book) =>
    request(`/books/${id}`, { method: "PUT", body: JSON.stringify(book) }),
  deleteBook: (id) => request(`/books/${id}`, { method: "DELETE" }),

  getMembers: () => request("/members"),
  createMember: (member) =>
    request("/members", { method: "POST", body: JSON.stringify(member) }),
  updateMember: (id, member) =>
    request(`/members/${id}`, { method: "PUT", body: JSON.stringify(member) }),
  deleteMember: (id) => request(`/members/${id}`, { method: "DELETE" }),

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
};
