import { describe, it, expect } from "vitest";

describe("Hello World", () => {
  it("says hello", () => {
    const greeting = "Hello, World!";
    expect(greeting).toBe("Hello, World!");
  });

  it("adds two numbers", () => {
    expect(1 + 1).toBe(2);
  });

  it("checks array contents", () => {
    const fruits = ["apple", "banana", "cherry"];
    expect(fruits).toContain("banana");
    expect(fruits).toHaveLength(3);
  });

  it("checks object shape", () => {
    const user = { name: "Alice", role: "admin" };
    expect(user).toMatchObject({ name: "Alice" });
    expect(user.role).toBe("admin");
  });

  it("async example", async () => {
    const result = await Promise.resolve("async hello");
    expect(result).toBe("async hello");
  });
});