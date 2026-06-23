import { describe, it, expect } from "@jest/globals";
import { parseClientFromUrl } from "../types";

describe("parseClientFromUrl", () => {
  describe("postgres", () => {
    it("detects postgresql:// protocol", () => {
      expect(parseClientFromUrl("postgresql://user:pass@localhost:5432/db")).toBe("postgres");
    });

    it("detects postgres:// protocol", () => {
      expect(parseClientFromUrl("postgres://user:pass@localhost:5432/db")).toBe("postgres");
    });

    it("handles query parameters", () => {
      expect(parseClientFromUrl("postgresql://localhost/db?schema=public")).toBe("postgres");
    });
  });

  describe("mysql", () => {
    it("detects mysql:// protocol", () => {
      expect(parseClientFromUrl("mysql://root:root@localhost:3306/db")).toBe("mysql");
    });
  });

  describe("sqlite", () => {
    it("detects sqlite: protocol", () => {
      expect(parseClientFromUrl("sqlite:./data/app.db")).toBe("sqlite");
    });

    it("detects file: protocol", () => {
      expect(parseClientFromUrl("file:./data/app.db")).toBe("sqlite");
    });

    it("detects :memory:", () => {
      expect(parseClientFromUrl(":memory:")).toBe("sqlite");
    });

    it("detects .sqlite extension", () => {
      expect(parseClientFromUrl("./data/test.sqlite")).toBe("sqlite");
    });

    it("detects .db extension", () => {
      expect(parseClientFromUrl("/tmp/test.db")).toBe("sqlite");
    });
  });

  describe("libsql", () => {
    it("detects libsql:// protocol", () => {
      expect(parseClientFromUrl("libsql://my-db.turso.io")).toBe("libsql");
    });

    it("handles authToken query parameter", () => {
      expect(parseClientFromUrl("libsql://my-db.turso.io?authToken=abc123")).toBe("libsql");
    });
  });

  describe("error handling", () => {
    it("throws on unknown protocol", () => {
      expect(() => parseClientFromUrl("ftp://somewhere")).toThrow(
        "Cannot infer database client from URL",
      );
    });

    it("throws on random string", () => {
      expect(() => parseClientFromUrl("not-a-url")).toThrow(
        "Cannot infer database client from URL",
      );
    });
  });
});
