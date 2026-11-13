import { connection } from "next/server";
import { handleGet, handlePost } from "./memeArt";

// Image generation can take minutes; 300s is the Vercel Hobby ceiling with fluid compute.
export const maxDuration = 300;

export async function GET(): Promise<Response> {
  await connection();
  return handleGet();
}

export async function POST(request: Request): Promise<Response> {
  return handlePost(request);
}
