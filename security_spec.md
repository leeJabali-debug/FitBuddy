# FitBuddy Security Specification

## 1. Data Invariants
1. **Owner Isolation**: Users can only read and write their own documents under `/users/{userId}` and its subcollections (`activities`, `goals`, `waterLogs`, `buddyConnections`).
2. **Path Hardening**: All `{userId}`, `{activityId}`, `{goalId}`, `{waterLogId}`, and `{buddyId}` variables must conform to standard alpha-numeric format (`isValidId`).
3. **Payload Sanitization**: Field lengths are bounded (e.g. title <= 100 chars, string size checks, number checks).
4. **No Identity Spoofing**: `userId` inside documents must match `request.auth.uid`.
5. **No Cross-User Leakage**: Blanket queries across all users are disallowed.

## 2. The "Dirty Dozen" Payloads
1. **Unauthenticated Read on User Profile**: `GET /users/user_abc` without auth -> PERMISSION_DENIED.
2. **Cross-User Profile Write**: Authenticated user `user_123` attempts `SET /users/user_456` -> PERMISSION_DENIED.
3. **Ghost Field Injection on User**: `SET /users/user_123` with `{ role: 'admin' }` or extraneous shadow fields -> PERMISSION_DENIED.
4. **Cross-User Activity Creation**: `user_123` attempts `POST /users/user_456/activities` with `userId: user_456` -> PERMISSION_DENIED.
5. **Spoofed Activity Author**: `user_123` writes to `/users/user_123/activities/act_1` with `userId: 'attacker'` -> PERMISSION_DENIED.
6. **Oversized String Attack**: `user_123` writes to `/users/user_123/activities/act_1` with `title` > 100 characters -> PERMISSION_DENIED.
7. **Negative Duration Attack**: `user_123` writes to `/users/user_123/activities/act_1` with `durationMinutes: -10` -> PERMISSION_DENIED.
8. **Cross-User Goals Read**: `user_123` queries `/users/user_456/goals` -> PERMISSION_DENIED.
9. **Invalid Goal Target Value**: `user_123` writes goal with non-numeric target -> PERMISSION_DENIED.
10. **Water Log Spoofing**: `user_123` writes to `/users/user_456/waterLogs/w_1` -> PERMISSION_DENIED.
11. **Malicious ID Poisoning**: Attempting to write document with path `/users/user_123/activities/../../root` -> PERMISSION_DENIED.
12. **Blanket Collection Scrape**: Attempting `LIST /users` or collection group without owner constraint -> PERMISSION_DENIED.
