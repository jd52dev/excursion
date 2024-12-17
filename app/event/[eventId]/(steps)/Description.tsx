"use client";

import {
  EventType,
  updateDescription,
} from "@/features/events/services/firestore";
import { useState } from "react";

export default function Description({ eventData }: { eventData: EventType }) {
  const { eventId } = eventData;
  const [description, setDescription] = useState(eventData.description || "");

  function update(newDescription: string) {
    updateDescription(eventId, newDescription)
      .then(() => (eventData.description = newDescription))
      .catch((error) => console.log(error));
  }

  return (
    <div className="w-full flex flex-col px-4">
      <label htmlFor="description">Description: (Optional)</label>
      <textarea
        id="description"
        name="description"
        value={description}
        rows={10}
        onChange={(e) => setDescription(e.currentTarget.value)}
        className="border-2 border-black rounded-md py-1 px-2 outline-accent"
        placeholder="What is this excursion about."
      />
      <button
        onClick={() => update(description)}
        className="p-button rounded-md bg-accent mt-2"
      >
        Next
      </button>
    </div>
  );
}
