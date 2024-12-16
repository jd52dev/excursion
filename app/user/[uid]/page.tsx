import EventList from "@/app/user/EventList";
import UserHeader from "@/app/user/UserHeader";

export default async function Account({
  params,
}: {
  params: Promise<{ uid: string }>;
}) {
  const { uid } = await params;

  return (
    <section className="w-full min-h-screen flex flex-col items-center md:px-[10%] lg:px-[20%]">
      <UserHeader uid={uid} />
      <EventList uid={uid} />
    </section>
  );
}
