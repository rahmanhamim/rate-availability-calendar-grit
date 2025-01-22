// Import necessary modules and types
import Fetch from "@/utils/Fetch";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Dayjs } from "dayjs";

// Define interfaces for the data structures used in the calendar
export interface IRoomInventory {
  id: string;
  date: Dayjs;
  available: number;
  status: boolean;
  booked: number;
}

export interface IRoomRatePlans {
  id: number;
  name: string;
}

export interface IRateCalendar {
  id: string;
  date: Dayjs;
  rate: number;
  min_length_of_stay: number;
  reservation_deadline: number;
}

export interface IRatePlanCalendar extends IRoomRatePlans {
  calendar: Array<IRateCalendar>;
}

export interface IRoomCategory {
  id: string;
  name: string;
  occupancy: number;
}

export interface IRoomCategoryCalender extends IRoomCategory {
  inventory_calendar: Array<IRoomInventory>;
  rate_plans: Array<IRatePlanCalendar>;
}

// Define the parameters and response interfaces for the hook
interface IParams {
  property_id: number;
  start_date: string;
  end_date: string;
}

interface IResponse {
  room_categories: Array<IRoomCategoryCalender>;
  nextCursor?: number; // available if you pass a cursor as query param
}

// Custom hook to fetch room rate availability calendar data with infinite scrolling
export default function useRoomRateAvailabilityCalendar(params: IParams) {
  return useInfiniteQuery({
    queryKey: ["property_room_calendar", params.property_id],
    queryFn: async ({ pageParam = 0 }: { pageParam: number }) => {
      // Construct the URL with query parameters
      const url = new URL(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/property/${params.property_id}/rate-calendar/assessment`
      );

      url.search = new URLSearchParams({
        start_date: params.start_date,
        end_date: params.end_date,
        cursor: pageParam.toString(), // Pass the cursor parameter
      }).toString();

      // Fetch data from the API
      const result = await Fetch<IResponse>({
        method: "GET",
        url,
      });
      return result.data;
    },
    getNextPageParam: (lastPage: IResponse) => lastPage.nextCursor, // Determine the next cursor for pagination
    initialPageParam: 0, // Add initialPageParam property
  });
}
