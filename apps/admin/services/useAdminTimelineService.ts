import { adminApiEndpoints } from '~/services/adminApiEndpoints'
import type {
  GelombangCreatePayload,
  GelombangUpdatePayload,
  TimelineCreatePayload,
  TimelineCreateResponse,
  TimelineDeleteResponse,
  TimelineDetailResponse,
  TimelineListResponse,
  TimelineUpdatePayload
} from '~/types/adminTimeline'

export const useAdminTimelineService = () => {
  const { get, post, patch, delete: deleteRequest } = useApi()

  const listTimelines = () => {
    return get<TimelineListResponse>(adminApiEndpoints.timelinePpdb.list, {
      showErrorToast: false
    })
  }

  const getTimelineById = (gelombangId: string | number) => {
    return get<TimelineDetailResponse>(adminApiEndpoints.timelinePpdb.detail, {
      query: {
        gelombang_id: String(gelombangId)
      },
      showErrorToast: false
    })
  }

  const createTimeline = (payload: TimelineCreatePayload) => {
    return post<TimelineCreateResponse>(adminApiEndpoints.timelinePpdb.create, payload, {
      showErrorToast: false
    })
  }

  const updateTimeline = (id: string | number, payload: TimelineUpdatePayload) => {
    return patch<TimelineCreateResponse>(adminApiEndpoints.timelinePpdb.update(id), payload, {
      showErrorToast: false
    })
  }

  const createGelombang = (payload: GelombangCreatePayload) => {
    return post<TimelineCreateResponse>(adminApiEndpoints.gelombang.create, payload, {
      showErrorToast: false
    })
  }

  const updateGelombang = (id: string | number, payload: GelombangUpdatePayload) => {
    return patch<TimelineCreateResponse>(adminApiEndpoints.gelombang.update(id), payload, {
      showErrorToast: false
    })
  }

  const deleteTimeline = (id: string | number) => {
    return deleteRequest<TimelineDeleteResponse>(adminApiEndpoints.timelinePpdb.delete(id), {
      showErrorToast: false
    })
  }

  return {
    listTimelines,
    getTimelineById,
    createTimeline,
    updateTimeline,
    createGelombang,
    updateGelombang,
    deleteTimeline
  }
}
