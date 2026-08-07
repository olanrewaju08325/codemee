# CodeMe Academy Monitoring Guide

## Overview
Monitoring is centralized in the Admin Portal under the "System Health" tab.

## Telemetry
- The dashboard automatically pings `/api/admin/monitoring/health` every 30 seconds.
- Subsystem health evaluates the reachability of the Database, Storage buckets, Authentication providers, and third-party AI APIs.

