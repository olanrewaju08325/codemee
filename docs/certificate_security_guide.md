# CodeMe Academy Certificate Security Guide

Certificates are issued upon successful completion of core requirements. They must be verifiable and tamper-proof.

## Security Measures
- **UUID Generation:** Certificates are identified by a cryptographically secure UUID (`id`), rather than sequential integers, preventing enumeration attacks (e.g., guessing `id=5` to steal a certificate).
- **Public Verification Page:** Anyone with the unique certificate link can view it, but the data is strictly read-only and rendered dynamically from the database, preventing forged PDFs from passing validation.
- **Deduplication:** The generation logic checks if a certificate for a specific `(student_id, course_id)` already exists before issuing a new one, preventing duplicate generation exploits.

