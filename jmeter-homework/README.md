# Homework 22.1 — Apache JMeter

## Test Environment

- Tool: Apache JMeter 5.6.3
- Application: Local REST API
- Base URL: http://localhost:3001
- HTTP Methods: GET, POST, PUT, DELETE

## Load Test Results

| Users | Ramp-up | Loops | Requests | Successful | Failed | Error Rate |
|---|---|---|---|---|---|---|
| 100 | 1 sec | 1 | 500 | 500 | 0 | 0% |
| 1000 | 1 sec | 2 | 10000 | 5215 | 4785 | 47.85% |
| 5000 | 1 sec | 4 | 100000 | 25744 | 74256 | 74.26% |

## Issues Found

1. Connection reset by peer.
2. Broken pipe.
3. HTTP 404 Not Found.

## Conclusion

The REST API successfully handled the load of 100 concurrent users without errors.

At 1000 concurrent users, the error rate increased to 47.85%.

At 5000 concurrent users, the error rate reached 74.26%.

The results indicate that the API becomes unstable under high concurrent load. Further investigation of server connection handling, resource limits, and request processing is recommended.

## Files

- JMeter test plan: (Stas Dem) Homework 22.1 JMeter.jmx
- Raw results: test-100.jtl, test-1000.jtl, test-5000.jtl
- HTML dashboards: reports/test-100, reports/test-1000, reports/test-5000

## Docker Resource Monitoring

Application: QA Pro REST App
Monitoring tool: Docker Stats
Container: qa-pro-rest-app

### Resource Usage

| Metric | Result |
|---|---|
| Measurements | 246 |
| Average CPU | 1.56% |
| Maximum CPU | 116.81% |
| Average RAM | 35.74 MiB |
| Maximum RAM | 74.36 MiB |

### Docker Load Test — 100 Users

- Users: 100
- Ramp-up: 1 second
- Loop Count: 1
- Total HTTP requests: 500
- Successful requests: 500
- Failed requests: 0
- Average response time: 1 ms
- Throughput: 493.6 requests/sec

### Monitoring Notes

Resource measurements were collected using Docker Stats.

The monitoring period includes idle time before and after the load test.
Therefore, average CPU and RAM values do not represent only the active
load-testing period.

The container successfully processed all 500 requests without errors.

## Performance Issues and Recommendations

### 1. Connection Errors

During high-load testing, JMeter detected connection errors,
including "Connection reset by peer" and "Broken pipe".

Recommendations:
- Investigate server logs during peak load.
- Review connection limits and timeout settings.
- Check Node.js event loop performance.
- Increase the ramp-up period to avoid sudden traffic spikes.
- Repeat tests to determine the maximum stable load.

### 2. HTTP 404 Errors

Some GET, PUT and DELETE requests returned HTTP 404.

Recommendations:
- Verify that POST requests successfully create characters.
- Validate the extracted characterId before using it.
- Check that test users do not interfere with each other's data.
- Investigate failed requests using JMeter logs.

### 3. Resource Optimization

Recommendations:
- Monitor CPU and RAM during each load test.
- Investigate CPU spikes and memory consumption.
- Compare performance under different concurrency levels.
- Consider horizontal scaling if a single server cannot handle
  the required load.

## Final Conclusion

The REST API successfully handled 100 concurrent users without errors.

At higher concurrency levels, the error rate increased significantly,
indicating stability problems under heavy load.

Docker Stats monitoring was configured to measure CPU and RAM usage.

Further investigation and optimization are recommended before
using the application under high production load.
