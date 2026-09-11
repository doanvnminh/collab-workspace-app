const API_BASE_URL = "http://localhost:5000/api";

async function request(endpoint, options = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
    }

    return data;
}

export function getDocuments() {
    return request("/documents");
}

export function createDocument(documentData) {
    return request("/documents", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(documentData),
    });
}

export function getDocument(documentId) {
    return request(`/documents/${documentId}`);
}

export function updateDocument(documentId, documentData) {
    return request(`/documents/${documentId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(documentData),
    });
}

export function loginUser(credentials) {
    return request("/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
    });
}