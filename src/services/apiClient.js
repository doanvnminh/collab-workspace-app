const API_URL = "http://localhost:5000/api";

async function request(endpoint, options = {}) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
            ...(token && {
                Authorization: `Bearer ${token}`,
            }),
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
    }

    return data;
}

export function getDocuments(projectId) {
    return request(
        `/documents?projectId=${encodeURIComponent(projectId)}`
    );
}

export function createDocument(projectId, documentData) {
    return request("/documents", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            ...documentData,
            projectId,
        }),
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

export function deleteDocument(documentId) {
    return request(`/documents/${documentId}`, {
        method: "DELETE",
    });
}

export function shareDocument(documentId, shareData) {
    return request(`/documents/${documentId}/share`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(shareData),
    });
}

export function getProjects() {
    return request("/projects");
}

export function createProject(projectData) {
    return request("/projects", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
    });
}

export function getProject(projectId) {
    return request(`/projects/${projectId}`);
}

export function registerUser(userData) {
    return request("/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
    });
}

export function getInvitations() {
    return request("/invitations");
}

export function acceptInvitation(invitationId) {
    return request(`/invitations/${invitationId}/accept`, {
        method: "POST",
    });
}

export function declineInvitation(invitationId) {
    return request(`/invitations/${invitationId}/decline`, {
        method: "POST",
    });
}

export function createInvitation(projectId, invitationData) {
    return request(`/projects/${projectId}/invitations`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(invitationData),
    });
}