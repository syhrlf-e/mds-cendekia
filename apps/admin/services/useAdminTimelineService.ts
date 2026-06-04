import { adminApiEndpoints } from '~/services/adminApiEndpoints'
import type {
  TimelineCreatePayload,
  TimelineCreateResponse,
  TimelineDeleteResponse,
  TimelineDetailResponse,
  TimelineListResponse
} from '~/types/adminTimeline'

export const useAdminTimelineService = () => {
  const { get, post, delete: deleteRequest } = useApi()

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

  const deleteTimeline = (id: string | number) => {
    return deleteRequest<TimelineDeleteResponse>(adminApiEndpoints.timelinePpdb.delete(id), {
      showErrorToast: false
    })
  }

  return {
    listTimelines,
    getTimelineById,
    createTimeline,
    deleteTimeline
  }
}
