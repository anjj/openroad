import { Octokit } from "@octokit/rest";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getOctokit() {
  const session = await getServerSession(authOptions) as any;
  if (!session?.accessToken) {
    throw new Error("No access token found");
  }
  return new Octokit({ auth: session.accessToken });
}
