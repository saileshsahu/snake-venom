import { context, trace } from "@opentelemetry/api";

/**
 * @function getActiveContext - get the current active context
 * @returns active context
 * If no context is active, the ROOT_CONTEXT is returned
 */
export const getActiveContext = () => {
  const ctx = context.active();
  return ctx;
};

/**
 * @function getActiveSpan - get the current active span
 * @returns active span
 */
export const getActiveSpan = () => {
  const span = trace.getSpan(getActiveContext());
  return span;
};

/**
 * @function getErrorTracer - get the error tracer
 * @returns error tracer instance
 */
export const getErrorTracer = () => {
  const tracer = trace.getTracer("error-tracer");
  return tracer;
};

/**
 * @function createTracer - create a custom tracer
 * @returns custom tracer instance
 */
export const createTracer = (name: string) => {
  const tracer = trace.getTracer(name);
  return tracer;
};
