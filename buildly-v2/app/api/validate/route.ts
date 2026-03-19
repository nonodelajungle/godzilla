import { NextResponse } from "next/server";
import { validateIdea } from "@/lib/buildly";

export async function POST(request: Request) {
  const body = await request.json();
  const result = validateIdea({
    idea: body.idea ?? "",
    icp: body.icp ?? "",
    value: body.value ?? "",
  });

  return NextResponse.json(result);
}
