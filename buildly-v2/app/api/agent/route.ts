import { NextResponse } from "next/server";
import { runBuildlyAgent } from "../../../lib/agent";

export async function POST(request: Request) {
  const body = await request.json();
  const result = runBuildlyAgent({
    idea: body.idea ?? "",
    icp: body.icp ?? "",
    value: body.value ?? "",
  });

  return NextResponse.json(result);
}
