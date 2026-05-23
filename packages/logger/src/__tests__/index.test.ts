import { jest, describe, it, expect, beforeEach, afterAll } from "@jest/globals";
import { Logger } from "../index";

let debugSpy: jest.SpiedFunction<typeof console.debug>;
let infoSpy: jest.SpiedFunction<typeof console.info>;
let warnSpy: jest.SpiedFunction<typeof console.warn>;
let errorSpy: jest.SpiedFunction<typeof console.error>;

beforeEach(() => {
  debugSpy = jest.spyOn(console, "debug").mockImplementation(() => {});
  infoSpy = jest.spyOn(console, "info").mockImplementation(() => {});
  warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
  errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
});

describe("Logger", () => {
  describe("level filtering", () => {
    it("logs messages at or above the configured level", () => {
      const log = new Logger({ level: "warn" });

      log.debug("nope");
      log.info("nope");
      log.warn("yes warn");
      log.error("yes error");

      expect(debugSpy).not.toHaveBeenCalled();
      expect(infoSpy).not.toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
    });

    it("logs everything at debug level", () => {
      const log = new Logger({ level: "debug" });

      log.debug("d");
      log.info("i");
      log.warn("w");
      log.error("e");

      expect(debugSpy).toHaveBeenCalledTimes(1);
      expect(infoSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
    });

    it("logs nothing at silent level", () => {
      const log = new Logger({ level: "silent" });

      log.debug("d");
      log.info("i");
      log.warn("w");
      log.error("e");

      expect(debugSpy).not.toHaveBeenCalled();
      expect(infoSpy).not.toHaveBeenCalled();
      expect(warnSpy).not.toHaveBeenCalled();
      expect(errorSpy).not.toHaveBeenCalled();
    });
  });

  describe("log methods route to correct console methods", () => {
    it("debug() calls console.debug", () => {
      const log = new Logger({ level: "debug" });
      log.debug("msg");
      expect(debugSpy).toHaveBeenCalledTimes(1);
      expect(debugSpy.mock.calls[0]![0]).toContain("msg");
    });

    it("info() calls console.info", () => {
      const log = new Logger({ level: "debug" });
      log.info("msg");
      expect(infoSpy).toHaveBeenCalledTimes(1);
      expect(infoSpy.mock.calls[0]![0]).toContain("msg");
    });

    it("warn() calls console.warn", () => {
      const log = new Logger({ level: "debug" });
      log.warn("msg");
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy.mock.calls[0]![0]).toContain("msg");
    });

    it("error() calls console.error", () => {
      const log = new Logger({ level: "debug" });
      log.error("msg");
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy.mock.calls[0]![0]).toContain("msg");
    });
  });

  describe("output formatting", () => {
    it("includes the logger name in output", () => {
      const log = new Logger({ level: "debug", name: "TestService" });
      log.info("hello");
      expect(infoSpy.mock.calls[0]![0]).toContain("TestService");
    });

    it("includes context key=value pairs in output", () => {
      const log = new Logger({ level: "debug", context: { requestId: "abc" } });
      log.info("hello");
      expect(infoSpy.mock.calls[0]![0]).toContain('requestId="abc"');
    });

    it("includes per-call context in output", () => {
      const log = new Logger({ level: "debug" });
      log.info("hello", { userId: 42 });
      expect(infoSpy.mock.calls[0]![0]).toContain("userId=42");
    });

    it("includes an ISO timestamp in output", () => {
      const log = new Logger({ level: "debug" });
      log.info("hello");
      const output = infoSpy.mock.calls[0]![0] as string;
      expect(output).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it("includes level tags in output", () => {
      const log = new Logger({ level: "debug" });

      log.debug("d");
      log.info("i");
      log.warn("w");
      log.error("e");

      expect(debugSpy.mock.calls[0]![0]).toContain("DEBUG");
      expect(infoSpy.mock.calls[0]![0]).toContain("INFO");
      expect(warnSpy.mock.calls[0]![0]).toContain("WARN");
      expect(errorSpy.mock.calls[0]![0]).toContain("ERROR");
    });
  });

  describe("child logger", () => {
    it("inherits the parent level", () => {
      const parent = new Logger({ level: "error" });
      const child = parent.child({ name: "child" });

      child.info("should be filtered");
      child.error("should appear");

      expect(infoSpy).not.toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalledTimes(1);
    });

    it("inherits and merges parent context", () => {
      const parent = new Logger({ level: "debug", context: { service: "api" } });
      const child = parent.child({ context: { requestId: "xyz" } });

      child.info("hello");
      const output = infoSpy.mock.calls[0]![0] as string;

      expect(output).toContain('service="api"');
      expect(output).toContain('requestId="xyz"');
    });

    it("can override the parent name", () => {
      const parent = new Logger({ level: "debug", name: "Parent" });
      const child = parent.child({ name: "Child" });

      child.info("hello");
      const output = infoSpy.mock.calls[0]![0] as string;

      expect(output).toContain("Child");
      expect(output).not.toContain("Parent");
    });

    it("keeps parent name when child name is not provided", () => {
      const parent = new Logger({ level: "debug", name: "Parent" });
      const child = parent.child({ context: { extra: true } });

      child.info("hello");
      expect(infoSpy.mock.calls[0]![0]).toContain("Parent");
    });
  });

  describe("environment-based level detection", () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv };
    });

    afterAll(() => {
      process.env = originalEnv;
    });

    it("uses LOG_LEVEL env var when set", () => {
      process.env.LOG_LEVEL = "error";
      const log = new Logger();

      log.warn("filtered");
      log.error("shown");

      expect(warnSpy).not.toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalledTimes(1);
    });

    it("defaults to info in production", () => {
      delete process.env.LOG_LEVEL;
      process.env.NODE_ENV = "production";
      const log = new Logger();

      log.debug("filtered");
      log.info("shown");

      expect(debugSpy).not.toHaveBeenCalled();
      expect(infoSpy).toHaveBeenCalledTimes(1);
    });

    it("defaults to debug in non-production", () => {
      delete process.env.LOG_LEVEL;
      process.env.NODE_ENV = "development";
      const log = new Logger();

      log.debug("shown");
      expect(debugSpy).toHaveBeenCalledTimes(1);
    });
  });
});
