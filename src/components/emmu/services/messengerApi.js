import apiClient from '../../../api/client';

let inFlightBadgePromise = null;
let lastBadgeFetchTime = 0;
let cachedBadgeData = null;
const BADGE_CACHE_TTL = 3000; // 3-second deduplication window

export const invalidateBadgeCache = () => {
  cachedBadgeData = null;
  lastBadgeFetchTime = 0;
};

export const messengerApi = {
  // Directory & Users
  searchUsers: async (query = '') => {
    const res = await apiClient.get('/messenger/users', { params: { query } });
    return res.data?.data || res.data || [];
  },

  // Conversations
  listConversations: async () => {
    const res = await apiClient.get('/messenger/conversations');
    return res.data?.data || res.data || [];
  },

  getOrCreateDirectConversation: async (peerUserId) => {
    const res = await apiClient.post('/messenger/conversations/direct', { peerUserId });
    return res.data?.data || res.data;
  },

  // Messages
  getConversationMessages: async (conversationId, page = 0, size = 50) => {
    const res = await apiClient.get(`/messenger/conversations/${conversationId}/messages`, {
      params: { page, size },
    });
    return res.data?.data || res.data || [];
  },

  sendMessage: async (conversationId, { content, iv, isEncrypted }) => {
    const res = await apiClient.post(`/messenger/conversations/${conversationId}/messages`, {
      content,
      iv,
      isEncrypted,
    });
    invalidateBadgeCache();
    return res.data?.data || res.data;
  },

  markConversationAsRead: async (conversationId) => {
    const res = await apiClient.put(`/messenger/conversations/${conversationId}/read`);
    invalidateBadgeCache();
    return res.data;
  },

  // Suggestions
  createSuggestion: async (payload) => {
    const res = await apiClient.post('/suggestions', payload);
    invalidateBadgeCache();
    return res.data?.data || res.data;
  },

  getReceivedSuggestions: async (page = 0, size = 20) => {
    const res = await apiClient.get('/suggestions/received', { params: { page, size } });
    return res.data?.data || res.data || { content: [] };
  },

  getSentSuggestions: async (page = 0, size = 20) => {
    const res = await apiClient.get('/suggestions/sent', { params: { page, size } });
    return res.data?.data || res.data || { content: [] };
  },

  markSuggestionAsRead: async (id) => {
    const res = await apiClient.put(`/suggestions/${id}/read`);
    invalidateBadgeCache();
    return res.data;
  },

  // Notifications
  getNotifications: async (page = 0, size = 20) => {
    const res = await apiClient.get('/notifications', { params: { page, size } });
    return res.data?.data || res.data || { content: [] };
  },

  markNotificationAsRead: async (id) => {
    const res = await apiClient.put(`/notifications/${id}/read`);
    invalidateBadgeCache();
    return res.data;
  },

  markAllNotificationsAsRead: async () => {
    const res = await apiClient.put('/notifications/read-all');
    invalidateBadgeCache();
    return res.data;
  },

  // Badges (Deduplicated & Cached to eliminate simultaneous duplicate hits)
  getBadgeCounts: async (forceRefresh = false) => {
    const now = Date.now();
    if (!forceRefresh && cachedBadgeData && (now - lastBadgeFetchTime < BADGE_CACHE_TTL)) {
      return cachedBadgeData;
    }
    if (!forceRefresh && inFlightBadgePromise) {
      return inFlightBadgePromise;
    }
    inFlightBadgePromise = (async () => {
      try {
        const res = await apiClient.get('/messenger/badges');
        const data = res.data?.data || res.data || { unreadChats: 0, unreadSuggestions: 0, unreadNotifications: 0, totalUnread: 0 };
        cachedBadgeData = data;
        lastBadgeFetchTime = Date.now();
        return data;
      } finally {
        inFlightBadgePromise = null;
      }
    })();
    return inFlightBadgePromise;
  },
};

export default messengerApi;
