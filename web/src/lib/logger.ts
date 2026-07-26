import { reportError } from "@/lib/errorReporter";

const isDev = process.env.NODE_ENV === "development";

function firstError(args: unknown[]): unknown {
  return args.find((argument) => argument instanceof Error);
}

export const logger = {
  error: (message: string, ...args: unknown[]) => {
    if (isDev) {
      console.error(message, ...args);
      return;
    }
    void reportError("web-browser", firstError(args) ?? new Error(message));
  },
  warn: (message: string, ...args: unknown[]) => {
    if (isDev) {
      console.warn(message, ...args);
    }
  },
};
