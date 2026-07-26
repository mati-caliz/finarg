import { reportError } from "@/lib/errorReporter";

interface RequestContext {
  path?: string;
}

export async function onRequestError(error: unknown, request: RequestContext): Promise<void> {
  await reportError("web-server", error, request.path);
}
