"use client";

import TimeDisplay from "../timeDisplay/TimeDisplay";
import LocationDisplay from "../locationDisplay/LocationDisplay";
import ColItemProgress from "../collectiveItemsDisplay/ColItemProgress";
import { useEffect, useState } from "react";
import {
  CollectiveItemsType,
  getColItems,
  getReqItems,
  RequiredItemsType,
} from "@/features/events/services/firestore";
import MemberDisplay from "../memberDisplay/MemberDisplay";

export default function RenderDetails({
  isOwner,
  eventId,
}: {
  isOwner: boolean;
  eventId: string;
}) {
  const [eventReqItems, setEventReqItems] = useState<RequiredItemsType[]>([]);
  const [eventColItems, setEventColItems] = useState<CollectiveItemsType[]>([]);

  useEffect(() => {
    getReqItems(eventId).then((res) => setEventReqItems(res));
    getColItems(eventId).then((res) => setEventColItems(res));
  }, [eventId]);

  return (
    <>
      <hr className="w-full border-b-1 my-1" />
      <MemberDisplay eventId={eventId} isOwner={isOwner} />

      {eventReqItems.length != 0 && (
        <>
          <hr className="w-full border-b-1 my-1" />

          <h2 className="font-bold">Required items to bring</h2>
          <ul className="flex flex-col px-1">
            {eventReqItems.map((reqItemData, i) => (
              <li key={i}>
                <b>{i + 1}.</b> {reqItemData.title}
              </li>
            ))}
          </ul>
        </>
      )}

      <hr className="w-full border-b-1 my-1" />
      <h2 className="font-bold">Time</h2>
      <TimeDisplay eventId={eventId} />

      <hr className="w-full border-b-1 my-1" />
      <h2 className="font-bold">Location</h2>
      <LocationDisplay eventId={eventId} />

      {eventColItems.length != 0 && (
        <>
          <hr className="w-full border-b-1 my-1" />

          <h2 className="font-bold">Items to contribute</h2>
          <ul className="flex flex-col px-1">
            {eventColItems.map((colItemData, i) => (
              <li key={i} className="my-1">
                <ColItemProgress colItemData={colItemData} />
              </li>
            ))}
          </ul>
        </>
      )}

      <hr className="w-full border-b-1 my-1" />
      <h2 className="font-bold">Transport</h2>
    </>
  );
}
