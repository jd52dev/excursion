"use client";

import { EventType, getEvent } from "@/features/events/services/firestore";
import { useParams } from "next/navigation";
import {
  createContext,
  Dispatch,
  SetStateAction,
  use,
  useEffect,
  useState,
} from "react";

type EventContext = {
  eventLoading: boolean;
  eventData: EventType | null;
  setEventData: Dispatch<SetStateAction<EventType | null>>;
};

const EventContext = createContext<EventContext | null>(null);

export default function EventContextProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [eventData, setEventData] = useState<EventType | null>(null);
  const [eventLoading, setEventLoading] = useState(true);
  const { eventId }: { eventId: string } = useParams();

  useEffect(() => {
    getEvent(eventId)
      .then((res) => {
        if (!res) throw new Error("Could not get event.");
        setEventData(res);
      })
      .catch((e) => {
        console.log(e);
      })
      .finally(() => setEventLoading(false));
  }, [eventId]);

  return (
    <EventContext.Provider value={{ eventLoading, eventData, setEventData }}>
      {children}
    </EventContext.Provider>
  );
}

export function useEventContext() {
  const context = use(EventContext);
  if (!context) {
    throw new Error("useEventContext must be within a EventContextProvider");
  }

  return context;
}
