import { apiService } from './api';
import {
  Event,
  EventBooking,
  EventModerationLog,
  EventModerationStatus,
  CreateEventData,
  ApiResponse,
} from '../types/common';

class EventService {
  // Public endpoints
  async getEvents(params?: {
    page?: number;
    limit?: number;
    eventType?: string;
    city?: string;
    startDate?: string;
  }): Promise<ApiResponse<Event[]>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.eventType) queryParams.append('eventType', params.eventType);
    if (params?.city) queryParams.append('city', params.city);
    if (params?.startDate) queryParams.append('startDate', params.startDate);

    return apiService.get<ApiResponse<Event[]>>(`/events?${queryParams.toString()}`);
  }

  async getEventBySlug(slug: string): Promise<ApiResponse<Event>> {
    return apiService.get<ApiResponse<Event>>(`/events/${slug}`);
  }

  // Organization owner endpoints
  async createEvent(data: CreateEventData, files?: File[]): Promise<ApiResponse<Event>> {
    const formData = new FormData();

    // Add event data as JSON string for nested objects
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.organizationId) formData.append('organizationId', data.organizationId.toString());
    if (data.eventType) formData.append('eventType', data.eventType);
    if (data.startDate) formData.append('startDate', data.startDate);
    if (data.endDate) formData.append('endDate', data.endDate);
    if (data.featuredImageUrl) formData.append('featuredImageUrl', data.featuredImageUrl);
    if (data.videoUrl) formData.append('videoUrl', data.videoUrl);

    // Add venue
    if (data.venue) {
      formData.append('venue', JSON.stringify(data.venue));
    }

    // Add address
    if (data.address) {
      formData.append('address', JSON.stringify(data.address));
    }

    // Add tickets
    if (data.tickets && data.tickets.length > 0) {
      formData.append('tickets', JSON.stringify(data.tickets));
    }

    // Add media URLs
    if (data.mediaUrls && data.mediaUrls.length > 0) {
      formData.append('mediaUrls', JSON.stringify(data.mediaUrls));
    }

    // Add files
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('media', file);
      });
    }

    return apiService.post<ApiResponse<Event>>('/events', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async updateEvent(
    id: number,
    data: Partial<CreateEventData>,
    files?: File[]
  ): Promise<ApiResponse<Event>> {
    const formData = new FormData();

    if (data.title) formData.append('title', data.title);
    if (data.description !== undefined) formData.append('description', data.description);
    if (data.eventType) formData.append('eventType', data.eventType);
    if (data.startDate) formData.append('startDate', data.startDate);
    if (data.endDate) formData.append('endDate', data.endDate);
    if (data.featuredImageUrl !== undefined)
      formData.append('featuredImageUrl', data.featuredImageUrl);
    if (data.videoUrl !== undefined) formData.append('videoUrl', data.videoUrl);

    if (data.venue) {
      formData.append('venue', JSON.stringify(data.venue));
    }

    if (data.address) {
      formData.append('address', JSON.stringify(data.address));
    }

    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('media', file);
      });
    }

    return apiService.post<ApiResponse<Event>>(`/events/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async getOrganizationEvents(
    orgId: number,
    params?: { page?: number; limit?: number }
  ): Promise<ApiResponse<Event[]>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    return apiService.get<ApiResponse<Event[]>>(
      `/events/organization/${orgId}?${queryParams.toString()}`
    );
  }

  async getMyEvents(params?: { page?: number; limit?: number }): Promise<ApiResponse<Event[]>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    return apiService.get<ApiResponse<Event[]>>(`/events/my/events?${queryParams.toString()}`);
  }

  async deleteEvent(id: number): Promise<ApiResponse> {
    return apiService.delete<ApiResponse>(`/events/${id}`);
  }

  // Admin moderation endpoints
  async getEventsForModeration(params?: {
    page?: number;
    limit?: number;
    status?: EventModerationStatus;
  }): Promise<ApiResponse<Event[]>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);

    return apiService.get<ApiResponse<Event[]>>(
      `/events/admin/moderation?${queryParams.toString()}`
    );
  }

  async moderateEvent(
    id: number,
    action: EventModerationStatus,
    comment?: string
  ): Promise<ApiResponse> {
    return apiService.post<ApiResponse>(`/events/admin/moderation/${id}`, {
      action,
      comment,
    });
  }

  async getModerationHistory(id: number): Promise<ApiResponse<EventModerationLog[]>> {
    return apiService.get<ApiResponse<EventModerationLog[]>>(
      `/events/admin/moderation/${id}/history`
    );
  }

  // Ticketing endpoints
  async addTicketToCart(
    ticketId: number,
    quantity: number,
    deliveryMethod?: string
  ): Promise<ApiResponse> {
    return apiService.post<ApiResponse>(`/events/tickets/${ticketId}/cart`, {
      quantity,
      deliveryMethod,
    });
  }

  async getMyBookings(): Promise<ApiResponse<EventBooking[]>> {
    return apiService.get<ApiResponse<EventBooking[]>>('/events/bookings/my');
  }
}

export const eventService = new EventService();
