"use client";

import { useEffect, useState } from "react";
import SelectedSuggestions from "./(components)/SelectedSuggestions";
import SuggestedLocations from "./(components)/SuggestedLocations";
import SuggestionWaitlist from "./(components)/SuggestionWaitlist";
import {
  getLocations,
  LocationType,
  membersSnapShot,
  MemberType,
  setLocations,
  updateLocationOptStatus,
  VoteLocationType,
} from "@/features/events/services/firestore";
import { redirect } from "next/navigation";

export default function Location({ eventId }: { eventId: string }) {
  const [members, setMembers] = useState<MemberType[]>([]);
  const [toVote, setToVote] = useState<VoteLocationType[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const sub = membersSnapShot(eventId, true, (members) =>
      setMembers(members.filter((el) => el.active))
    );

    return () => {
      sub.then(() => {
        console.log("unsub member snapshot");
      });
    };
  }, [eventId]);

  useEffect(() => {
    getLocations(eventId).then((res) => setToVote(res));
  }, [eventId]);

  function onRemove(title: string) {
    setToVote((prev) => prev.filter((l) => l.location.title !== title));
  }

  function onAdd(locData: LocationType) {
    setToVote((prev) => [...prev, { location: locData, vote: 0 }]);
  }

  function save(toVote: VoteLocationType[]) {
    setLocations(eventId, toVote)
      .then(() => setSuccess(true))
      .catch((e) => setError(e.message));
  }

  function submit(toVote: VoteLocationType[]) {
    setLocations(eventId, toVote)
      .then(() => {
        updateLocationOptStatus(eventId, "vote")
          .then(() => setSuccess(true))
          .catch((e) => setError(e.message));
      })
      .catch((e) => setError(e.message));
  }

  if (success) redirect(`/event/${eventId}`);

  return (
    <section className="w-full min-h-screen flex flex-col items-center p-2 md:px-[10%] lg:px-[20%]">
      <h1 className="text-3xl p-4">Moderate Locations</h1>

      <SuggestedLocations
        onAdd={onAdd}
        members={members}
        selectedLocations={toVote}
      />

      <hr className="w-full border-b-2 my-1" />

      <SelectedSuggestions selectedLocations={toVote} onRemove={onRemove} />

      <hr className="w-full border-b-2 my-1" />

      <SuggestionWaitlist members={members} />

      <span className="w-full flex items-center justify-end mt-2">
        <button
          className="p-button rounded-md bg-gray-100"
          onClick={() => save(toVote)}
        >
          Save
        </button>
        <hr className="w-2" />
        <button
          className="p-button rounded-md bg-accent"
          onClick={() => submit(toVote)}
        >
          Submit
        </button>
      </span>

      {error && (
        <p className="p-1 bg-gray-100 border-2 border-gray-200 rounded-md">
          {error}
        </p>
      )}
    </section>
  );
}
