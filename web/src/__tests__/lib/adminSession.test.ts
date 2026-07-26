import { SESSION_TTL_SECONDS, createSessionToken, isValidSessionToken } from "@/lib/adminSession";

const NOW_MS = Date.UTC(2026, 6, 26, 12, 0, 0);
const MS_PER_SECOND = 1000;

describe("admin session token", () => {
  beforeEach(() => {
    process.env.ADMIN_PASSWORD = "una-password-larga-de-admin";
  });

  it("accepts a token it just issued", () => {
    expect(isValidSessionToken(createSessionToken(NOW_MS), NOW_MS)).toBe(true);
  });

  it("stops accepting the token once its lifetime is over", () => {
    const token = createSessionToken(NOW_MS);
    const afterExpiry = NOW_MS + (SESSION_TTL_SECONDS + 1) * MS_PER_SECOND;

    expect(isValidSessionToken(token, afterExpiry)).toBe(false);
  });

  it("rejects a token whose expiry was pushed forward without resigning", () => {
    const [, signature] = createSessionToken(NOW_MS).split(".");
    const stretched = `${Math.floor(NOW_MS / MS_PER_SECOND) + SESSION_TTL_SECONDS * 10}.${signature}`;

    expect(isValidSessionToken(stretched, NOW_MS)).toBe(false);
  });

  it("rejects tokens that are not two signed parts", () => {
    for (const token of ["", "sinfirma", "1.2.3", "abc.def"]) {
      expect(isValidSessionToken(token, NOW_MS)).toBe(false);
    }
  });

  it("invalidates every session when the password changes", () => {
    const token = createSessionToken(NOW_MS);
    process.env.ADMIN_PASSWORD = "otra-password-de-admin";

    expect(isValidSessionToken(token, NOW_MS)).toBe(false);
  });

  it("authenticates nobody when there is no password configured", () => {
    const token = createSessionToken(NOW_MS);
    process.env.ADMIN_PASSWORD = "";

    expect(isValidSessionToken(token, NOW_MS)).toBe(false);
  });
});
