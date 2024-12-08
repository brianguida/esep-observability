const { Resource } = require("@opentelemetry/resources");
const { SemanticResourceAttributes } = require("@opentelemetry/semantic-conventions");
const { NodeTracerProvider } = require("@opentelemetry/sdk-trace-node");
const { SimpleSpanProcessor } = require("@opentelemetry/sdk-trace-base");
const { trace } = require("@opentelemetry/api");
const { registerInstrumentations } = require("@opentelemetry/instrumentation");

// Import Jaeger Exporter
const { JaegerExporter } = require("@opentelemetry/exporter-jaeger");

// Instrumentations
const { ExpressInstrumentation } = require("opentelemetry-instrumentation-express");
const { MongoDBInstrumentation } = require("@opentelemetry/instrumentation-mongodb");
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");

module.exports = (serviceName) => {
  // Set up the Jaeger Exporter
  const exporter = new JaegerExporter({
    endpoint: "http://localhost:14268/api/traces", // Jaeger's trace endpoint
    serviceName: serviceName,
  });

  // Set up the Tracer Provider
  const provider = new NodeTracerProvider({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    }),
  });

  // Add the Jaeger Exporter to the Span Processor
  provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
  provider.register();

  // Register instrumentations for Express, MongoDB, and HTTP
  registerInstrumentations({
    instrumentations: [
      new HttpInstrumentation(),
      new ExpressInstrumentation(),
      new MongoDBInstrumentation(),
    ],
    tracerProvider: provider,
  });

  return trace.getTracer(serviceName);
};
