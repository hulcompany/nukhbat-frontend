import axios from "axios";
import type { NextRequest } from "next/server";
import { config } from "@/lib/config";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authorization = request.headers.get("Authorization");

  try {
    const upstream = await axios.get(`${config.apiUrl}/files/${id}`, {
      responseType: "arraybuffer",
      headers: {
        ...(authorization ? { Authorization: authorization } : {}),
      },
    });

    const contentType =
      String(upstream.headers["content-type"] ?? "application/octet-stream");
    const contentDisposition = upstream.headers["content-disposition"]
      ? String(upstream.headers["content-disposition"])
      : null;

    const headers = new Headers({ "Content-Type": contentType });
    if (contentDisposition) {
      headers.set("Content-Disposition", contentDisposition);
    }

    return new Response(upstream.data as ArrayBuffer, { status: 200, headers });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return new Response(null, { status: error.response.status });
    }
    return new Response(null, { status: 500 });
  }
}
