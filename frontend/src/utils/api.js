const API_BASE_URL = 'http://localhost:3001/api';

/**
 * Helper to handle fetch responses and errors
 */
async function handleResponse(response) {
  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }
  
  if (response.status === 204) {
    return null;
  }
  
  return await response.json();
}

export const api = {
  // Briefs API
  briefs: {
    list: async (filters = {}) => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          params.append(key, val);
        }
      });
      const url = `${API_BASE_URL}/briefs?${params.toString()}`;
      const res = await fetch(url);
      return handleResponse(res);
    },
    
    get: async (id) => {
      const res = await fetch(`${API_BASE_URL}/briefs/${id}`);
      return handleResponse(res);
    },
    
    getDetail: async (id) => {
      const res = await fetch(`${API_BASE_URL}/briefs/${id}/detail`);
      return handleResponse(res);
    },
    
    create: async (briefData) => {
      const res = await fetch(`${API_BASE_URL}/briefs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(briefData),
      });
      return handleResponse(res);
    },
    
    createWithUploads: async (formData) => {
      const res = await fetch(`${API_BASE_URL}/briefs`, {
        method: 'POST',
        body: formData, // Browser sets Content-Type automatically for FormData
      });
      return handleResponse(res);
    },
    
    update: async (id, briefData) => {
      const res = await fetch(`${API_BASE_URL}/briefs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(briefData),
      });
      return handleResponse(res);
    },
    
    updateWithUploads: async (id, formData) => {
      const res = await fetch(`${API_BASE_URL}/briefs/${id}`, {
        method: 'PUT',
        body: formData,
      });
      return handleResponse(res);
    },
    
    updateStatus: async (id, status) => {
      const res = await fetch(`${API_BASE_URL}/briefs/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      return handleResponse(res);
    },
    
    delete: async (id) => {
      const res = await fetch(`${API_BASE_URL}/briefs/${id}`, {
        method: 'DELETE',
      });
      return handleResponse(res);
    }
  },
  
  // Clients API
  clients: {
    list: async () => {
      const res = await fetch(`${API_BASE_URL}/clients`);
      return handleResponse(res);
    },
    
    get: async (id) => {
      const res = await fetch(`${API_BASE_URL}/clients/${id}`);
      return handleResponse(res);
    },
    
    create: async (clientData) => {
      const res = await fetch(`${API_BASE_URL}/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData),
      });
      return handleResponse(res);
    }
  },
  
  // Dashboard API
  dashboard: {
    getSummary: async () => {
      const res = await fetch(`${API_BASE_URL}/dashboard/summary`);
      return handleResponse(res);
    },
    
    getAlerts: async () => {
      const res = await fetch(`${API_BASE_URL}/dashboard/alerts`);
      return handleResponse(res);
    },
    
    markAlertRead: async (id) => {
      const res = await fetch(`${API_BASE_URL}/dashboard/alerts/${id}/read`, {
        method: 'PATCH',
      });
      return handleResponse(res);
    }
  },
  
  // Reports API
  reports: {
    getSummary: async () => {
      const res = await fetch(`${API_BASE_URL}/reports/summary`);
      return handleResponse(res);
    },
    
    getByType: async () => {
      const res = await fetch(`${API_BASE_URL}/reports/by-type`);
      return handleResponse(res);
    },
    
    getByClient: async () => {
      const res = await fetch(`${API_BASE_URL}/reports/by-client`);
      return handleResponse(res);
    },
    
    getCompleteness: async () => {
      const res = await fetch(`${API_BASE_URL}/reports/completeness`);
      return handleResponse(res);
    },
    
    getExportUrl: () => {
      return `${API_BASE_URL}/reports/export`;
    }
  }
};
