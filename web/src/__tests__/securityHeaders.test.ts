/**
 * @jest-environment node
 */
import nextConfig from "../../next.config.js";

interface HeaderRule {
  source: string;
  headers: { key: string; value: string }[];
}

const EMBED_RULE = "/embed/:path*";
const REST_RULE = "/:path((?!embed/).*)";

const REQUIRED_KEYS = [
  "Content-Security-Policy",
  "Strict-Transport-Security",
  "X-Content-Type-Options",
  "Referrer-Policy",
  "Permissions-Policy",
];

const FRAME_ANCESTORS = /frame-ancestors [^;]*/;

function rulesFor(rules: HeaderRule[], pathname: string): HeaderRule[] {
  const embedded = pathname.startsWith("/embed/");
  return rules.filter(
    (rule) => (rule.source === EMBED_RULE && embedded) || (rule.source === REST_RULE && !embedded),
  );
}

function frameAncestorsFor(rules: HeaderRule[], pathname: string): string | undefined {
  const matched = rulesFor(rules, pathname)[0];
  const csp = matched?.headers.find((header) => header.key === "Content-Security-Policy");
  return csp?.value.match(FRAME_ANCESTORS)?.[0];
}

describe("the security headers of every route", () => {
  let rules: HeaderRule[];

  beforeAll(async () => {
    const headers = nextConfig.headers;
    if (headers === undefined) {
      throw new Error(
        "next.config.js dejó de declarar headers(): las cabeceras son parte del contrato",
      );
    }
    rules = (await headers()) as HeaderRule[];
  });

  it("lets the embeddable charts be framed by anyone", () => {
    expect(frameAncestorsFor(rules, "/embed/indicador/dollar_blue")).toBe("frame-ancestors *");
  });

  it("keeps every other route framed only by us", () => {
    for (const pathname of ["/", "/brechas", "/comparar", "/indicador/dollar_blue"]) {
      const frameAncestors = frameAncestorsFor(rules, pathname);

      expect(frameAncestors).toContain("'self'");
      expect(frameAncestors).not.toContain("*");
    }
  });

  it("never trades away the other security headers to allow framing", () => {
    for (const pathname of ["/", "/embed/indicador/dollar_blue"]) {
      const keys = rulesFor(rules, pathname)[0]?.headers.map((header) => header.key) ?? [];

      for (const required of REQUIRED_KEYS) {
        expect(keys).toContain(required);
      }
    }
  });

  it("matches exactly one rule per route, so none can silently override another", () => {
    for (const pathname of ["/", "/brechas", "/embed/indicador/dollar_blue"]) {
      expect(rulesFor(rules, pathname)).toHaveLength(1);
    }
  });
});
