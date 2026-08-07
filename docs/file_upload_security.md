# CodeMe Academy File Upload Security

File uploads represent a significant vector for malicious activity. CodeMe Academy implements a multi-layered defense to neutralize these threats.

## 1. Allowed MIME Types & Extensions
The application strictly whitelists extensions before processing the upload stream:
- `image/jpeg` (`.jpg`, `.jpeg`)
- `image/png` (`.png`)
- `application/pdf` (`.pdf`)

## 2. Path Traversal Prevention
The API blocks any file paths containing `..` or starting with a forward slash `/` to prevent attackers from escaping the intended storage directory.

## 3. Storage Isolation
Uploaded files (e.g., payment receipts) are stored in dedicated Supabase Storage buckets with strict RLS policies. The public cannot list or access files without an authenticated session that owns the resource or holds an `admin` role.

