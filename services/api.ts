// docmanageapp/services/api.ts

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

// --- Вспомогательная функция для заголовков ---
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
};

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

export async function getDepartments() {
  const res = await fetch(`${API_BASE}/api/departments`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Ошибка при получении департаментов");
  return res.json();
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
  source: string,
  kartoteka: string // Добавляем новый параметр
) {
  const res = await fetch(`${API_BASE}/api/correspondences/incoming`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ title, content, source, kartoteka }), // Добавляем kartoteka в отправляемые данные
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

// --- Функции для Жизненного Цикла Документа ---
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

export async function rejectReview(documentId: number, comment: string) {
    const res = await fetch(`${API_BASE}/api/correspondences/${documentId}/reject-review`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ comment }),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Не удалось отклонить документ");
    }
    return res.json();
}

export async function signDocument(documentId: number) {
    const res = await fetch(`${API_BASE}/api/correspondences/${documentId}/sign`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Не удалось подписать документ");
    }
    return res.json();
}

export async function dispatchDocument(documentId: number) {
    const res = await fetch(`${API_BASE}/api/correspondences/${documentId}/dispatch`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Не удалось отправить/завершить документ");
    }
    return res.json();
}

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

// --- START: НОВЫЕ ФУНКЦИИ ДЛЯ РАБОТЫ С ДОКУМЕНТАМИ ---

// Функция для постановки документа на паузу
export async function holdCorrespondence(documentId: number) {
    // Используем существующий универсальный эндпоинт для смены этапа
    return advanceStage(documentId, 'ON_HOLD');
}

// Функция для отмены документа
export async function cancelCorrespondence(documentId: number) {
    // Используем существующий универсальный эндпоинт для смены этапа
    return advanceStage(documentId, 'CANCELLED');
}

// Функция для обновления дедлайна
export async function updateDeadline(documentId: number, deadlines: { deadline?: string, stageDeadline?: string }) {
    const res = await fetch(`${API_BASE}/api/correspondences/${documentId}/deadline`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(deadlines),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Не удалось обновить дедлайн");
    }
    return res.json();
}

// Функция для обновления всех исполнителей
interface ExecutorsPayload {
    mainExecutorId?: number;
    coExecutorIds?: number[];
    contributorIds?: number[];
}
export async function updateExecutors(documentId: number, payload: ExecutorsPayload) {
    const res = await fetch(`${API_BASE}/api/correspondences/${documentId}/executors`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Не удалось обновить исполнителей");
    }
    return res.json();
}

// --- END: НОВЫЕ ФУНКЦИИ ---