"use client";
import { trpc } from "@/lib/trpc";
import { TRPCProvider } from "@/lib/trpc-provider";

// טיפוס לקבוצה לפי Prisma schema
interface Coach {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}
interface Group {
  id: string;
  name: string;
  coach: Coach;
  coachId: string;
  createdAt: string;
}

function GroupsList() {
  const groupsQuery = trpc.hello.useQuery();
  if (groupsQuery.isLoading) return <div>Loading...</div>;
  if (groupsQuery.error) return <div>Error: {groupsQuery.error.message}</div>;
  return (
    <ul>
      <li>{groupsQuery.data?.message}</li>
    </ul>
  );
}

export default function Home() {
  return (
    <TRPCProvider>
      <main className="p-8">
        <h1 className="text-2xl font-bold mb-4">Groups</h1>
        <GroupsList />
      </main>
    </TRPCProvider>
  );
}
