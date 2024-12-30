"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { useEventContext } from "../eventProvider";
import {
  InvitationOptType,
  orderedEventSteps,
  updateInvitation,
} from "@/features/events/services/firestore";
import Toggle from "@/shared/components/Toggle";

export default function Invitation() {
  const { eventData, setEventData, setActiveSection } = useEventContext();
  const [invitation, setInvitation] = useState<InvitationOptType>({
    limit: Number.MAX_VALUE,
    needApproval: false,
    secret: "",
  });
  const [limit, setLimit] = useState(10);
  const [changed, setChanged] = useState(false);

  useEffect(() => {
    if (eventData!.inviteOpt) {
      setInvitation(eventData!.inviteOpt);

      if (eventData!.inviteOpt.limit != Number.MAX_VALUE) {
        setLimit(eventData!.inviteOpt.limit);
      }
    }
  }, []);

  useEffect(() => {
    setChanged(
      eventData?.inviteOpt?.needApproval != invitation.needApproval ||
        eventData?.inviteOpt?.secret != invitation.secret ||
        eventData?.inviteOpt?.limit != invitation.limit
    );
  }, [eventData, invitation]);

  function updateInvitationOpt(newInvitationOpt: InvitationOptType) {
    updateInvitation(
      eventData!.eventId,
      newInvitationOpt,
      eventData!.inProgress
    )
      .then(() => {
        setEventData((prev) => {
          if (!prev) throw new Error("No event.");
          const inProgress = { ...eventData!.inProgress, invitation: false };

          return { ...prev, inviteOpt: newInvitationOpt, inProgress };
        });
        setActiveSection(orderedEventSteps[2]);
      })
      .catch((e) => {
        console.log(e);
        if (eventData?.inviteOpt) {
          setInvitation(eventData.inviteOpt);
        }
      });
  }

  function limitNumChange(e: ChangeEvent<HTMLInputElement>) {
    let newLimit = Number(e.target.value);
    if (newLimit >= Number.MAX_VALUE) {
      newLimit = 9999999999;
    } else if (newLimit <= 0) {
      newLimit = 1;
    }

    setLimit(newLimit);
    setInvitation((prev) => ({
      ...prev,
      limit: newLimit,
    }));
  }

  return (
    <section className="w-full min-h-full h-fit flex flex-col justify-center p-1">
      {eventData?.inProgress.invitation && <p>In progress</p>}
      <label htmlFor="unlimitedChk" className="flex flex-row items-center">
        <Toggle
          checked={invitation.limit == Number.MAX_VALUE}
          id="unlimitedChk"
          onChange={(e) => {
            setInvitation((prev) => ({
              ...prev,
              limit: e.target.checked ? Number.MAX_VALUE : limit,
            }));
          }}
        />
        <p className="ml-4">Unlimited number of members.</p>
      </label>

      {invitation.limit != Number.MAX_VALUE && (
        <>
          <label htmlFor="limit">Maximum number of members: </label>
          <input
            type="number"
            id="limit"
            name="limit"
            min={1}
            max={Number.MAX_VALUE - 1}
            value={String(limit)}
            onChange={limitNumChange}
            className="border-2 border-black rounded-md py-1 px-2 outline-accent"
          />
        </>
      )}

      <hr className="w-full border-1 my-2" />

      <label htmlFor="needApproval" className="flex flex-row items-center">
        <Toggle
          checked={invitation.needApproval}
          id="needApproval"
          onChange={() => {
            setInvitation((prev) => ({
              ...prev,
              needApproval: !prev.needApproval,
            }));
          }}
        />
        <p className="ml-4">Need approval from organizer</p>
      </label>

      <hr className="w-full border-1 my-2" />

      <label htmlFor="secret">
        Enter secret phrase to join: (leave empty for no secret phrase)
      </label>
      <input
        type="text"
        className="border-2 border-black rounded-md py-1 px-2 outline-accent"
        value={invitation.secret}
        onChange={(e) =>
          setInvitation((prev) => ({ ...prev, secret: e.target.value }))
        }
        placeholder="secret password"
      />

      <button
        className="p-button rounded-md bg-accent mt-2"
        onClick={() => updateInvitationOpt(invitation)}
      >
        {changed ? "Submit" : "Next"}
      </button>
      {changed && (
        <p className="mt-2 py-1 px-2 bg-gray-100 rounded-md border-2 border-gray-200">
          *Unsubmitted Changes, please submit your changes to save them.
        </p>
      )}
    </section>
  );
}
