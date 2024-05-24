import {
  GENERATED_ERROR_SPAN_NAME,
  UNHANDLED_REJECTION_SPAN_NAME,
} from "../utils/constants";
import { SpanAttributes, Tracer } from "@opentelemetry/api";

import { getActiveSpan } from "../utils/helpers";

/**
 * @function reportException - reports an exception as a span event creating a new span if necessary.
 * @param err - error object
 * @param attrs - span attributes
 * @param tracer - trace provider instance
 */
export const reportException = (
  err: Error | string,
  attrs: SpanAttributes,
  tracer: Tracer
) => {
  if (attrs === void 0) {
    attrs = {};
  }
  let startedSpan = false;
  let span = getActiveSpan();
  if (!span) {
    span = tracer.startSpan(GENERATED_ERROR_SPAN_NAME);
    startedSpan = true;
  }
  if (typeof err === "string") {
    attrs["exception.message"] = err;
  } else {
    attrs["exception.type"] = err.name;
    attrs["exception.message"] = err.message;
    attrs["exception.stacktrace"] = err.stack;
  }
  span.addEvent("exception", attrs);
  span.recordException(err);
  if (startedSpan) {
    span.end();
  }
};

/**
 * @function reportError - report promise rejeection events
 * @param event - a promise rejection event
 * @param tracer - trace provider instance
 */
export const reportError = (event: any, tracer: Tracer) => {
  // Handle native or custom Promise rejections
  let reason = event.reason || (event.detail && event.detail.reason);
  if (!reason) {
    return;
  }
  let startedSpan = false;
  let span = getActiveSpan();
  if (!span) {
    span = tracer.startSpan(UNHANDLED_REJECTION_SPAN_NAME);
    startedSpan = true;
  }
  const attrs: SpanAttributes = {
    "window.onunhandledrejection": true,
  };
  attrs["rejection.reason"] = reason;
  span.addEvent("unhandled rejection", attrs);
  span.recordException(event);
  if (startedSpan) {
    span.end();
  }
};

/**
 * @function setupOnError - set up the window.onerror listener
 * @param tracer - trace provider instance
 */
export const setupOnError = (tracer: Tracer): void => {
  const existingHandler = window.onerror;
  window.onerror = function onErrorHandler(
    message: string | Event,
    file?: string,
    line?: number,
    column?: number,
    err?: Error
  ) {
    // re-use existing listener
    if (existingHandler) {
      existingHandler(message, file, line, column, err);
    }

    if (err) {
      reportException(err, { onerror: true }, tracer);
      return;
    }

    if (message === "Script error.") {
      return;
    }

    const attrs: SpanAttributes = {
      "window.onerror": true,
    };
    if (file) {
      attrs["code.filepath"] = file;
    }
    if (line) {
      attrs["code.lineno"] = line;
    }
    if (column) {
      attrs["code.colno"] = column;
    }
    reportException(String(message), attrs, tracer);
  };
};

/**
 * @function setupOnUnhandledRejectionError - set up the window.onunhandledrejection listener
 * @param tracer - trace provider instance
 */
export const setupOnUnhandledRejectionError = (tracer: Tracer) => {
  window.onunhandledrejection = (event) => {
    reportError(event, tracer);
  };
};
