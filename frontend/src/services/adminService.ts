import { API_URL } from "../utils/ApiConfig";

export const fetchAdminCountries = async (token: string) => {
    const res = await fetch(`${API_URL}/api/admin/countries`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Acesso Negado");
    }
    return res.json();
};

export const fetchAdminUsers = async (token: string) => {
    const res = await fetch(`${API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Acesso Negado");
    }
    return res.json();
};

export const fetchAdminDashboard = async (token: string) => {
    const res = await fetch(`${API_URL}/api/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Acesso Negado");
    }
    return res.json();
};

export const saveAdminCountry = async (token: string, data: any, id?: number) => {
    const url = id ? `${API_URL}/api/admin/countries/${id}` : `${API_URL}/api/admin/countries`;
    const method = id ? "PUT" : "POST";
    const res = await fetch(url, {
        method,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Erro ao salvar");
    }
    return res.json();
};

export const deleteAdminCountry = async (token: string, id: number) => {
    const res = await fetch(`${API_URL}/api/admin/countries/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Erro ao remover");
    return res.json();
};