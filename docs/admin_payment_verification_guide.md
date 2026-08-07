# CodeMe Academy Payment Verification Guide

## Manual Verification
For regions without integrated gateways, students upload a reference code or screenshot of their transfer.
The Admin Dashboard includes a `PaymentVerificationQueue` that queries `api/admin/payments/pending`.

## Workflow
1. The Admin reviews the Reference ID and amounts against the bank statement.
2. Clicking "Approve" transitions the payment status and automatically enrolls the student.
3. Clicking "Reject" requires a note/reason, triggering a notification to the student to try again.

