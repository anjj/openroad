import { Octokit } from "@octokit/rest";
import { getServerSession } from "next-auth/next";

export async function getOctokit() {
  const session = await getServerSession() as any;
  if (!session?.accessToken) {
    throw new Error("No access token found");
  }
  return new Octokit({ auth: session.accessToken });
}
