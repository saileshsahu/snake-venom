/**
 * @interface Service - App or Service to be instrumented config
 * @member name - App or service name [required]
 * @member namespace - service description
 * @member instanceId - The string ID of the service instance.
 * @member version - The version string of the service or implementation.
 */
export interface Service {
  name: string;
  namespace?: string;
  instanceId?: string;
  version?: string;
}

/**
 * @interface Config - Instrumentation Config
 * @member service - App or Service to be instrumented Config
 * @member exporterUrl - url/endpoint to export telemetry data
 * @member headers - custom headers to be sent while exporting data
 * @member maxQueueSize - The maximum queue size. After the size is reached spans are dropped.
 * @member maxExportBatchSize - The maximum batch size of every export. It must be smaller or equal to maxQueueSize.
 * @member scheduledDelayMillis - The interval between two consecutive exports
 * @member exportTimeoutMillis - How long the export can run before it is canceled
 */
export interface Config {
  service: Service;
  exporterUrl?: string;
  headers?: Object;
  maxQueueSize?: number;
  maxExportBatchSize?: number;
  scheduledDelayMillis?: number;
  exportTimeoutMillis?: number;
}
