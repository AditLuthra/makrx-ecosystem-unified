import { describe, it, expect } from "vitest";
import { KeycloakProvider, useKeycloak } from "../src/react-hooks";

describe("@makrx/auth public API", () => {
  it("exports KeycloakProvider and useKeycloak", () => {
    expect(typeof KeycloakProvider).toBe("function");
    expect(typeof useKeycloak).toBe("function");
  });
});
