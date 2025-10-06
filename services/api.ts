// docmanageapp/services/api.ts

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

// --- Авторизация ---
export async function login(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Login failed");
  }
  const data = await res.json();
  if (data.token) localStorage.setItem("token", data.token);
  return data.user;
}

export async function register(email: string, name: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, name, password }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Register failed");
  }
  const data = await res.json();
  if (data.token) localStorage.setItem("token", data.token);
  return data.user;
}

// --- Вспомогательная функция для заголовков ---
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
};

// --- Управление пользователями ---
export async function getUsers() {
  const res = await fetch(`${API_BASE}/api/users`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Ошибка при получении пользователей");
  return res.json();
}

export async function addUser(userData: any) {
  const res = await fetch(`${API_BASE}/api/users`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(userData),
  });
  if (!res.ok) throw new Error("Не удалось добавить пользователя");
  return res.json();
}

export async function updateUser(userId: number, userData: any) {
  const res = await fetch(`${API_BASE}/api/users/${userId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(userData),
  });
  if (!res.ok) throw new Error("Не удалось обновить пользователя");
  return res.json();
}

export async function deleteUser(userId: number) {
  const res = await fetch(`${API_BASE}/api/users/${userId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Не удалось удалить пользователя");
  return true;
}

// --- Управление Ролями и Департаментами ---
export async function getRoles() {
  const res = await fetch(`${API_BASE}/api/roles`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Ошибка при получении ролей");
  return res.json();
}

export async function getDepartments() {
  const res = await fetch(`${API_BASE}/api/departments`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Ошибка при получении департаментов");
  return res.json();
}

export async function addRole(roleData: { name: string; description: string }) {
  const res = await fetch(`${API_BASE}/api/roles`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(roleData),
  });
  if (!res.ok) throw new Error("Не удалось добавить роль");
  return res.json();
}

export async function updateRole(
  roleId: number,
  roleData: { description: string }
) {
  const res = await fetch(`${API_BASE}/api/roles/${roleId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(roleData),
  });
  if (!res.ok) throw new Error("Не удалось обновить роль");
  return res.json();
}

export async function deleteRole(roleId: number) {
  const res = await fetch(`${API_BASE}/api/roles/${roleId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Не удалось удалить роль");
  }
  return true;
}

// --- Управление Документами ---
export async function getCorrespondences() {
  const res = await fetch(`${API_BASE}/api/correspondences`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Ошибка при получении документов");
  return res.json();
}

export async function getCorrespondenceById(id: number) {
  const res = await fetch(`${API_BASE}/api/correspondences/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Ошибка при получении документа");
  return res.json();
}

export async function createIncomingTask(
  title: string,
  content: string,
  source: string
) {
  const res = await fetch(`${API_BASE}/api/correspondences/incoming`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ title, content, source }),
  });
  if (!res.ok) throw new Error("Не удалось создать задачу");
  return res.json();
}

export async function createOutgoingCorrespondence(data: { title: string; content: string; kartoteka: string; }) {
    const res = await fetch(`${API_BASE}/api/correspondences/outgoing`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Не удалось создать исходящий документ");
    }
    return res.json();
}

export async function advanceStage(documentId: number, nextStage: string) {
    const res = await fetch(`${API_BASE}/api/correspondences/${documentId}/stage`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ stage: nextStage }),
    });
    if (!res.ok) throw new Error("Не удалось изменить этап документа");
    return res.json();
}

export async function assignExecutor(documentId: number, mainExecutorId: number) {
    const res = await fetch(`${API_BASE}/api/correspondences/${documentId}/assign`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ mainExecutorId }),
    });
    if (!res.ok) throw new Error("Не удалось назначить исполнителя");
    return res.json();
}

export async function assignInternalEmployee(documentId: number, employeeId: number) {
    const res = await fetch(`${API_BASE}/api/correspondences/${documentId}/delegate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ internalAssigneeId: employeeId }),
    });
    if (!res.ok) throw new Error("Не удалось назначить внутреннего исполнителя");
    return res.json();
}

// --- START: НОВЫЕ ФУНКЦИИ ДЛЯ СОГЛАСОВАНИЯ ---
export async function submitForReview(documentId: number) {
    const res = await fetch(`${API_BASE}/api/correspondences/${documentId}/submit-review`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Не удалось отправить на согласование");
    }
    return res.json();
}

export async function approveReview(documentId: number) {
    const res = await fetch(`${API_BASE}/api/correspondences/${documentId}/approve-review`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Не удалось согласовать документ");
    }
    return res.json();
}
// --- END: НОВЫЕ ФУНКЦИИ ДЛЯ СОГЛАСОВАНИЯ ---

// --- Управление Нарушениями (Violations) ---
interface ViolationData {
    userId: number;
    reason: string;
    type: string;
    date: string; // ISO string date
    correspondenceId?: number | null;
}

export async function getAllViolations() {
    const res = await fetch(`${API_BASE}/api/violations`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Ошибка при получении списка нарушений");
    return res.json();
}

export async function createViolation(violationData: ViolationData) {
    const res = await fetch(`${API_BASE}/api/violations`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(violationData),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Не удалось создать нарушение");
    }
    return res.json();
}