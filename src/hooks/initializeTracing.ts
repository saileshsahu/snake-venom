import {
  BatchSpanProcessor,
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-base";
import {
  setupOnError,
  setupOnUnhandledRejectionError,
} from "../hooks/recordException";

import { CollectorTraceExporter } from "@opentelemetry/exporter-collector";
import { Config } from "../types";
import { DocumentLoadInstrumentation } from "@opentelemetry/instrumentation-document-load";
import { FetchInstrumentation } from "@opentelemetry/instrumentation-fetch";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { UserInteractionInstrumentation } from "@opentelemetry/instrumentation-user-interaction";
import { WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import { WindowAttributesProcessor } from "../processors";
import { XMLHttpRequestInstrumentation } from "@opentelemetry/instrumentation-xml-http-request";
import { ZoneContextManager } from "@opentelemetry/context-zone";
import { registerInstrumentations } from "@opentelemetry/instrumentation";

// check if window is available
const hasWindow = typeof window !== "undefined";

/**
 * @function initializeTracing - start the app wide instrumentation
 * @param config - Instrumentation Config
 */
export const initializeTracing = (config?: Config) => {
  // setup Span Resource
  const resource = new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]:
      config?.service?.name || "my-sample-service",
    [SemanticResourceAttributes.SERVICE_NAMESPACE]:
      config?.service?.namespace || "my sample namespace",
    [SemanticResourceAttributes.SERVICE_INSTANCE_ID]:
      config?.service?.instanceId || "111-111-111",
    [SemanticResourceAttributes.SERVICE_VERSION]:
      config?.service?.version || "1.0.0",
  });

  // Acquire a provider
  const provider = new WebTracerProvider({ resource });

  // Initialize Global tracer instance
  const globalTracer = provider.getTracer(
    config?.service?.name || "my-sample-service",
    config?.service?.version || "1.0.0"
  );

  // Enable exporting of data to your desired backend service [PROD]
  if (config?.exporterUrl) {
    // setup Collector
    // Replace YOUR_OPENTELEMETRY_COLLECTOR_ENDPOINT with the URL that accepts OTLP
    const collectorOptions = {
      url:
        config?.exporterUrl || "https://YOUR_OPENTELEMETRY_COLLECTOR_ENDPOINT",
      headers: {
        "content-type": "application/json",
        ...config?.headers,
      },
    };

    const exporter = new CollectorTraceExporter(collectorOptions);

    // Add Span Processor to provider
    provider.addSpanProcessor(
      new BatchSpanProcessor(exporter, {
        // The maximum queue size. After the size is reached spans are dropped.
        maxQueueSize: config?.maxQueueSize || 2048,
        // The maximum batch size of every export. It must be smaller or equal to maxQueueSize.
        maxExportBatchSize: config?.maxExportBatchSize || 512,
        // The interval between two consecutive exports
        scheduledDelayMillis: config?.scheduledDelayMillis || 5 * 1000,
        // How long the export can run before it is canceled
        exportTimeoutMillis: config?.exportTimeoutMillis || 30 * 1000,
      })
    );
  }

  // For exporting traces to console [DEV]
  provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));

  // Window hooks
  if (hasWindow) {
    setupOnError(globalTracer);
    setupOnUnhandledRejectionError(globalTracer);
    provider.addSpanProcessor(new WindowAttributesProcessor());
  }

  provider.register({
    // Changing default contextManager to use ZoneContextManager - supports asynchronous operations
    contextManager: new ZoneContextManager(),
  });

  // Registering instrumentations
  registerInstrumentations({
    instrumentations: [
      new DocumentLoadInstrumentation(),
      new UserInteractionInstrumentation(),
      new FetchInstrumentation(),
      new XMLHttpRequestInstrumentation(),
    ],
  });
};
