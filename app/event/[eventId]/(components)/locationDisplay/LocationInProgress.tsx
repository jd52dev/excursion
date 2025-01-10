import { LocationType } from "@/features/events/services/firestore";
import Link from "next/link";
import SelectedLocationItems from "./SelectedLocationItems";

export default function LocationInProgress({
  eventId,
  suggestions,
}: {
  eventId: string;
  suggestions: LocationType[] | undefined;
}) {
  return (
    <span className="w-full flex flex-col">
      <span>
        {suggestions ? (
          <ul className="flex flex-col w-full mt-1 border-2 border-black rounded-md px-2 py-1">
            <p>Your suggestions:</p>
            {suggestions.map((el, i) => (
              <SelectedLocationItems key={i} location={el} />
            ))}
          </ul>
        ) : (
          <p>In progress...</p>
        )}
      </span>

      {!suggestions ? (
        <Link
          href={`/event/${eventId}/participate/location`}
          className="mt-1 p-button rounded-md bg-accent w-fit"
        >
          Participate
        </Link>
      ) : (
        <p className="mt-1 p-1 rounded-md bg-gray-100 border-2 border-gray-200 text-center">
          Wait for organizer to move to voting stage.
        </p>
      )}
    </span>
  );
}
