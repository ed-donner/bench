/**
 * A failed request: the status for the page to word, the server's text for the console. Its own
 * module so that suites mocking api.ts still construct real ones.
 */
export class RequestError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}
