import { isEmbeddedPath } from "@/components/layout/SiteChrome";

describe("isEmbeddedPath", () => {
  it("recognises the embed routes that must render without site chrome", () => {
    expect(isEmbeddedPath("/embed")).toBe(true);
    expect(isEmbeddedPath("/embed/indicador/dollar_blue")).toBe(true);
  });

  it("leaves every normal route with its chrome", () => {
    expect(isEmbeddedPath("/")).toBe(false);
    expect(isEmbeddedPath("/brechas")).toBe(false);
    expect(isEmbeddedPath("/indicador/dollar_blue")).toBe(false);
  });

  it("does not match a route that merely starts with the same letters", () => {
    expect(isEmbeddedPath("/embedded")).toBe(false);
    expect(isEmbeddedPath("/embeds/x")).toBe(false);
  });
});
