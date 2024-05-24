# Overview

<img src="https://pasteimg.com/images/2022/05/13/snake.th.png" alt="snake-venom" border="0" />

`snake-venom` is a web tracing library based on opentelemetry.

## Available Features

- DocumentLoadInstrumentation
- UserInteractionInstrumentation
- FetchInstrumentation
- XMLHttpRequestInstrumentation
- Error Logging
- ErrorTraceWrapper for functions
- Report Custom Exceptions

## Installation

```bash
  npm install snake-venom
```

## Usage/Examples

### Instantiate Automatic App wide Instrumentation

```javascript
import { initializeTracing } from "snake-venom";

// see project docs for more on Config
const config: Config = {
  service: {
    name: "my-sample-service",
  },
  // snake-venom will logs/traces to this url
  // if configured, else nothing will be sent
  exporterUrl: "https://your-exporter-url",
};

// this can be called without a config as well
// if you aren't ready yet using just
// initializeTracing()
initializeTracing(config);
```

### Error Tracing Hook

```javascript
import { useErrorTraceWrapper } from "snake-venom";

const myFunc = () => {
  alert("hi");
};

// wraps the function in a try catch with
// tracing and error reporting
useErrorTraceWrapper(myFunc);
```

### Error Logging

```javascript
import { reportError } from "snake-venom";

try {
  doWork();
} catch (ex) {
  reportError(ex);
}
```

### Custom Instrument a function

Imagine you have an automated kitchen, and you want to time how long the robot chef takes to bake a cake. The naive way to do this would be to just start a span, call your method, then end the span:

```javascript
import { createTracer } from "snake-venom";

// Acquire a tracer
const tracer = createTracer("my-custom-tracer");

// start a span using the acquried tracer
const cakeSpan = tracer.startSpan("bake-cake-span");
// +
// everything that happens from span start ... [1]
// +
chef.bakeCake();
// +
// [1] ... to span end, gets instrumented
// +
// end the span
cakeSpan.end();
```

### Custom Instrument an async function

```javascript
import { SpanStatusCode } from "@opentelemetry/api";
import { getErrorTracer } from "snake-venom";

// Acquire a tracer
const tracer = getErrorTracer();

export const wrapper = () => {
  // start a new span, provide your own custom span name
  tracer.startActiveSpan("custom-span-name", async (span) => {
    try {
      // doAnyWork()
      await fetch("http://example.com/movies.json");
      span.setStatus({ code: SpanStatusCode.OK });
    } catch (err) {
      span.recordException(err);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: err.message,
      });
      throw err;
    } finally {
      span.end();
    }
  });
};
```

### Custom Events

```javascript
span.addEvent("Doing something");

const result = doWork();

span.addEvent("Did something");
```

### Breadcrumb Events

```javascript
try {
  doWork1();
  span.addEvent("checkpoint 1", {
    "some key": "some info",
  });
  doWork2();
  span.addEvent("checkpoint 2", {
    "some key": "some info",
  });
  doWork3();
  span.addEvent("checkpoint 3", {
    "some key": "some info",
  });
} catch (ex) {
  span.recordException(ex);
  span.setStatus({ code: otel.SpanStatusCode.ERROR });
}
```

### Custom Logs

```javascript
span.addEvent("log", {
  "log.severity": "error",
  "log.message": "User not found",
  "enduser.id": "123",
});
```

## Demo

![alt text](https://github.com/open-telemetry/opentelemetry-js/raw/main/examples/tracer-web/images/xml-http-request.png)

## Run Locally

Install dependencies

```bash
  npm install
```

Dev build

```bash
  npm run dev
```

Prod build

```bash
  npm run build
```

## References

- Usage Docs 1: https://opentelemetry.uptrace.dev/guide/js-tracing.html#opentelemetry-js
- Usage Docs 2: https://opentelemetry.lightstep.com/js/
- Opentelemetry Api Docs: https://opentelemetry.io/docs/instrumentation/js/
- SDK: https://github.com/open-telemetry/opentelemetry-js
- Examples: https://github.com/open-telemetry/opentelemetry-js/tree/main/examples/tracer-web/examples
- Exception/Error Handling Docs: https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/trace/semantic_conventions/exceptions.md
