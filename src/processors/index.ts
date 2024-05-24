import { Span } from "@opentelemetry/api";
import { SpanProcessor } from "@opentelemetry/sdk-trace-base";

/**
 * @class WindowAttributesProcessor - add meta information from window
 */
export class WindowAttributesProcessor implements SpanProcessor {
  forceFlush(): Promise<void> {
    return Promise.resolve();
  }

  onStart(span: Span): void {
    if (window.navigator && window.navigator.userAgent) {
      span.setAttribute("http.user_agent", window.navigator.userAgent);
    }
    if (window.location && window.location.href) {
      span.setAttribute("location.href", location.href);
    }
  }

  onEnd(): void {}

  shutdown(): Promise<void> {
    return Promise.resolve();
  }
}
