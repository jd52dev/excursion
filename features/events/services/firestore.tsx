import { getUser } from "@/features/users/services/firestore";
import { db } from "@/shared/services/firestore";
import {
  addDoc,
  collection,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  QueryDocumentSnapshot,
  serverTimestamp,
  setDoc,
  startAfter,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

export type VisibilityType = "public" | "private";

export type EventStepsType =
  | "description"
  | "invitation"
  | "time"
  | "location"
  | "contributions";

export type InProgressType = {
  description: boolean;
  invitation: boolean;
  times: boolean;
  location: boolean;
  contributions: boolean;
};

export type EventType = {
  ownerId: string;
  eventId: string;
  title: string;
  description: string;
  inProgress: InProgressType;
  created_at: Timestamp;
  visibility: VisibilityType;
  inviteOpt?: InvitationOptType;
  locationOpt?: LocationOptType;
  contributionsOpt?: ContributionsOptType;
  times: Map<string, boolean[]>;
  locations: LocationType[] | null;
  reqItems: RequiredItemsType[] | null;
  colItems: CollectiveItemsType[] | null;
};

export type InvitationOptType = {
  limit: number;
  needApproval: boolean;
  secret: string;
};

export type LocationOptType = {
  num_suggestions: number;
};

export type LocationType = {
  title: string;
  isOnline: boolean;
  link: string;
};

export type ContributionsOptType = {
  requireTransport: boolean;
};

export type RequiredItemsType = {
  title: string;
};

export type CollectiveItemsType = {
  title: string;
  amount: number;
  unit: string;
  current: number;
};

export type ColItemProgress = {
  userId: string;
  contribution: number;
};

export type SelectedTime = {
  startTime: Date;
  comment: string;
};

export type SelectedTimeMap = Map<string, SelectedTime[]>;

export type MemberType = {
  uid: string;
  displayName: string;
  active: boolean;
};

export const orderedEventSteps: EventStepsType[] = [
  "description",
  "invitation",
  "time",
  "location",
  "contributions",
];

const EXCURSION_STEPS = {
  invitation: true,
  times: true,
  location: true,
  contributions: true,
};

export async function createExcursion(uid: string, title: string) {
  if (!title) throw new Error("Title is required.");

  if (
    !(
      await getDocs(
        query(
          collection(db, "events"),
          where("ownerId", "==", uid),
          where("title", "==", title)
        )
      )
    ).empty
  ) {
    throw new Error("Title must be unique.");
  }
  const owner = await getUser(uid);

  if (!owner) throw new Error("organizer does not exist.");

  const eventRef = await addDoc(collection(db, "events"), {
    ownerId: uid,
    title,
    description: "",
    visibility: "private",
    created_at: serverTimestamp(),
    inProgress: EXCURSION_STEPS,
  });

  const batch = writeBatch(db);

  batch.update(eventRef, { eventId: eventRef.id });

  const ownerMemberData: MemberType = {
    active: true,
    displayName: owner.username,
    uid: uid,
  };

  batch.set(doc(db, `events/${eventRef.id}/members/${uid}`), ownerMemberData);

  batch.set(doc(db, `events/${eventRef.id}/members/properties`), {
    members: [owner.username],
  });

  await batch.commit();

  return eventRef;
}

export async function getEvents(
  uid: string,
  lastDoc: QueryDocumentSnapshot<DocumentData, DocumentData> | null,
  count: number,
  visibility: VisibilityType
) {
  const eventCollection = collection(db, "events");

  try {
    return !lastDoc
      ? await getDocs(
          query(
            eventCollection,
            where("ownerId", "==", uid),
            where("visibility", "==", visibility),
            orderBy("created_at", "desc"),
            limit(count)
          )
        )
      : await getDocs(
          query(
            eventCollection,
            where("ownerId", "==", uid),
            where("visibility", "==", visibility),
            orderBy("created_at", "desc"),
            startAfter(lastDoc),
            limit(count)
          )
        );
  } catch (error) {
    console.log(error);
  }
}

export async function getEvent(eventId: string) {
  return (await getDoc(doc(db, `events/${eventId}`))).data() as
    | EventType
    | undefined;
}

// Edit description

export async function updateDescription(eventId: string, description: string) {
  description = description.trim();
  await updateDoc(doc(db, `events/${eventId}`), { description });
}

// Edit invitation

export async function updateInvitation(
  eventId: string,
  newInvitationOpt: InvitationOptType,
  inProgress: InProgressType
) {
  inProgress.invitation = false;
  await updateDoc(doc(db, `events/${eventId}`), {
    inviteOpt: newInvitationOpt,
    inProgress,
  });
}

// Edit times

export async function setDateTimes(
  eventId: string,
  dateMaps: Map<string, boolean[]>,
  inProgress: InProgressType
) {
  inProgress.times = false;
  const data = Object.fromEntries(dateMaps);

  await setDoc(doc(db, `events/${eventId}/lists/times`), data);
  await updateDoc(doc(db, `events/${eventId}`), {
    inProgress,
  });
}

export async function getDateTimes(eventId: string) {
  const dateTime = (
    await getDoc(doc(db, `events/${eventId}/lists/times`))
  ).data();
  if (!dateTime) return undefined;

  return new Map(Object.entries(dateTime));
}

// Edit locations

export async function uploadLocationOpt(
  eventId: string,
  newLocationOpt: LocationOptType,
  inProgress: InProgressType
) {
  inProgress.location = false;
  await updateDoc(doc(db, `events/${eventId}`), {
    locationOpt: newLocationOpt,
    inProgress,
  });
}

export async function setLocations(eventId: string, locations: LocationType[]) {
  return await setDoc(doc(db, `events/${eventId}/lists/locations`), {
    locations,
  });
}

export async function getLocations(eventId: string) {
  const res = (
    await getDoc(doc(db, `events/${eventId}/lists/locations`))
  ).data();

  if (!res) return [];

  return res.locations as LocationType[];
}

export async function uploadContributionOpt(
  eventId: string,
  newContributionOpt: ContributionsOptType,
  inProgress: InProgressType
) {
  inProgress.contributions = false;
  await updateDoc(doc(db, `events/${eventId}`), {
    contributionsOpt: newContributionOpt,
    inProgress,
  });
}

export async function setReqItems(
  eventId: string,
  reqItems: RequiredItemsType[]
) {
  return await setDoc(doc(db, `events/${eventId}/lists/reqItems`), {
    reqItems,
  });
}

export async function setColItems(
  eventId: string,
  colItems: CollectiveItemsType[]
) {
  return await setDoc(doc(db, `events/${eventId}/lists/colItems`), {
    colItems,
  });
}

export async function getReqItems(eventId: string) {
  const res = (
    await getDoc(doc(db, `events/${eventId}/lists/reqItems`))
  ).data();

  if (!res) return [];

  return res.reqItems as RequiredItemsType[];
}

export async function getColItems(eventId: string) {
  const res = (
    await getDoc(doc(db, `events/${eventId}/lists/colItems`))
  ).data();

  if (!res) return [];

  return res.colItems as CollectiveItemsType[];
}

export async function getSetectedTimes(eventId: string) {
  const res = (
    await getDoc(doc(db, `events/${eventId}/lists/selectTimes`))
  ).data();

  if (!res) return undefined;

  return new Map(Object.entries(res)) as SelectedTimeMap;
}

export async function getSetectedLocations(eventId: string) {
  const res = (
    await getDoc(doc(db, `events/${eventId}/lists/selectLocations`))
  ).data();

  if (!res) return undefined;

  return res as LocationType[];
}

export async function getMember(eventId: string, uid: string) {
  return (await getDoc(doc(db, `events/${eventId}/members/${uid}`))).data() as
    | MemberType
    | undefined;
}

export async function getMembers(eventId: string) {
  const res = (
    await getDoc(doc(db, `events/${eventId}/members/properties`))
  ).data();
  if (!res) throw new Error("Failed to retrieve members properties");
  return res.members as string[];
}
