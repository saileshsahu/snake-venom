import { getErrorTracer } from "../utils/helpers";
import { reportError } from "./recordException";

const tracer = getErrorTracer();

/**
 * @function useErrorTraceWrapper hook for error tracing of functions
 * @param fn : Function to be wrapped
 * @returns Wrapped Function with Error Trace Provider
 */
export const useErrorTraceWrapper = function(fn: Function) {
    return function(){
      try {
        // @ts-ignore
        return fn.apply(this, arguments);
      } catch(err){
        reportError(err, tracer);
      }
    };
  };
