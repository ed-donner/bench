import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

// jsdom implements no pointer capture, so Groove's knobs and faders throw on pointerdown without
// this. Capture only decides which element receives the rest of a drag, and these tests dispatch
// straight at the target, so a no-op loses nothing.
Element.prototype.setPointerCapture = vi.fn();

// jsdom's Blob has no text(), which is how Rolodex reads a file the moment you choose one. The
// FileReader it does implement would only be a longer way of doing the same thing.
// The cast is what makes the check legal: the DOM types say the method is always there.
if (!(Blob.prototype.text as unknown))
  Blob.prototype.text = function (this: Blob) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => {
        reject(reader.error ?? new Error("could not read the file"));
      };
      reader.readAsText(this);
    });
  };

beforeEach(() => {
  // Node 22+ jsdom may omit localStorage unless --localstorage-file is set.
  if (typeof localStorage === "undefined") {
    const store = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => {
        store.set(k, v);
      },
      clear: () => {
        store.clear();
      },
      removeItem: (k: string) => {
        store.delete(k);
      },
    });
  }
  // The editor flushes pending block edits with a raw keepalive fetch when it unmounts. Node's
  // fetch rejects relative URLs, so keep every test off the real one; suites that assert on
  // requests stub it again themselves.
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    }),
  );
});

afterEach(() => {
  cleanup();
  if (typeof localStorage !== "undefined") localStorage.clear();
  delete document.documentElement.dataset.theme;
});
