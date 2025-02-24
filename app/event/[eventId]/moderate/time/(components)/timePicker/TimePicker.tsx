import { fullDay, TimeStateType } from "@/shared/services/utils";
import { Dispatch, SetStateAction } from "react";
import Time from "./Time";
import { SelectedTimeMap } from "@/features/events/services/firestore";

export default function TimePicker({
  membersTimes,
  times,
  selectedTimesUseState,
  setChanged,
  showGuide = true,
}: {
  membersTimes: Map<string, TimeStateType[]>[];
  times: Map<string, TimeStateType[]>;
  selectedTimesUseState: [
    SelectedTimeMap | undefined,
    Dispatch<SetStateAction<SelectedTimeMap | undefined>>
  ];
  setChanged: Dispatch<SetStateAction<boolean>>;
  showGuide?: boolean;
}) {
  return (
    <div className="rounded-md border-2 border-black flex flex-col max-h-[75vh] max-w-screen-sm w-full">
      {showGuide && (
        <div className="w-full p-1 flex flex-col">
          <p>
            Only select the start time (if end time is required either add it in
            the comment for the selected time or create another selected time.)
          </p>
          <p>
            <b>Click:</b> toggle time cell.
          </p>
          <p>
            <b>Click + Drag:</b> toggle time cells on hover.
          </p>
        </div>
      )}

      <div
        className={`rounded-md ${
          showGuide && "border-t-2"
        } border-black flex flex-row overflow-auto`}
      >
        <div className="h-full sticky left-0 bg-background z-50 w-14">
          <div
            className=" border-b-2 border-r-2 border-black sticky top-0 bg-background"
            style={{ height: "7rem" }}
          >
            {/* spacer */}
          </div>
          <span className="flex flex-col border-r-2 border-r-black">
            {fullDay.map((_, i) => {
              return (
                <div
                  key={i}
                  className="h-8 px-1 border-b-2 border-black w-full flex justify-end items-center"
                >
                  {i}:00
                </div>
              );
            })}
          </span>
        </div>
        <Time
          times={times}
          membersTimes={membersTimes}
          selectedTimesUseState={selectedTimesUseState}
          setChanged={setChanged}
        />
      </div>
    </div>
  );
}
