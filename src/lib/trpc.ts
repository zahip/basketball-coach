import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/app/api/[[...route]]/route";

export const trpc = createTRPCReact<AppRouter>();
