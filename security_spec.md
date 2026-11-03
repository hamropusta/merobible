# Security Specification (`security_spec.md`)

## 1. Data Invariants
1. **Global Default Deny**: Any path not explicitly matched is denied for all `read` and `write` operations.
2. **PII Isolation (`/users/{userId}`)**: User profiles contain `email` and `displayName` and can ONLY be read (`get`) by `isOwner(userId)` or `isAdmin()`. Blanket `list` is restricted strictly to `isAdmin()`. During `create`, users cannot self-assign `role: 'admin'`; `role` must be `'user'`. During `update`, `uid`, `email`, `role`, and `createdAt` are immutable for non-admins.
3. **Prayer Wall Integrity (`/prayers/{prayerId}`)**:
   - `get` and `list` are only permitted if `resource.data.visibility == 'public'` or `(isSignedIn() && resource.data.userId == request.auth.uid)`.
   - `create` requires a verified signed-in user (`isVerifiedUser()`) where `incoming().userId == request.auth.uid` and all fields adhere to strict key and size bounds (`title <= 200`, `prayerText <= 2000`, `author <= 100`, `location <= 120`).
   - `update` begins with `isValidPrayer(incoming())` and allows either the owner/admin to update content fields while keeping `userId` and `createdAt` immutable, OR a signed-in user to increment `prayerCount` by 1 (`incoming().diff(existing()).affectedKeys().hasOnly(['prayerCount']) && incoming().prayerCount == existing().prayerCount + 1`).
4. **Private Study Notes (`/notes/{noteId}`)**:
   - Strictly isolated to the owner (`resource.data.userId == request.auth.uid`) for `get`, `list`, `update`, and `delete`.
   - `create` and `update` enforce `isValidNote(incoming())` and immutable `userId` and `createdAt`.
5. **Wallpapers (`/wallpapers/{wallpaperId}`)**:
   - Publicly readable (`get`, `list`).
   - `create` requires `isVerifiedUser()` and `isValidWallpaper(incoming())` with `incoming().userId == request.auth.uid`.
   - `update` and `delete` restricted to owner or `isAdmin()`.
6. **Admins & Audit Logs (`/admins/{adminId}`, `/auditLogs/{logId}`)**:
   - `/admins/{adminId}` is readable/writable only by `isAdmin()`.
   - `/auditLogs/{logId}` is readable only by `isAdmin()`, creatable by `isVerifiedUser()` with `incoming().actorUid == request.auth.uid` and `isValidAuditLog(incoming())`, and immutable (`allow update, delete: if false;`).

## 2. The "Dirty Dozen" Payloads (Attack Vectors)
1. **Self-Privilege Escalation on User Create**:
   `POST /users/user123` -> `{ "uid": "user123", "email": "attacker@test.com", "displayName": "Attacker", "role": "admin", "createdAt": "2026-11-02" }` -> **DENIED**
2. **Role Mutation on User Update**:
   `PATCH /users/user123` -> `{ "role": "admin" }` -> **DENIED**
3. **Shadow Field Injection on Prayer Create**:
   `POST /prayers/p1` -> `{ "title": "Heal", "author": "Ram", "location": "KTM", "prayerText": "Pray", "category": "healing", "date": "2083", "prayerCount": 1, "visibility": "public", "userId": "user123", "createdAt": "2026-11-02", "isVerifiedAdmin": true }` -> **DENIED**
4. **Identity Spoofing on Prayer Create**:
   `POST /prayers/p1` (as `user123`) -> `{ ..., "userId": "victim999" }` -> **DENIED**
5. **Oversized Payload (Denial of Wallet) on Note Create**:
   `POST /notes/n1` -> `{ "title": "A".repeat(500), "content": "ok", ... }` -> **DENIED**
6. **Cross-Tenant Note Read (PII / Private Data Leak)**:
   `GET /notes/n1` (where `resource.data.userId == "victim999"`, requested by `user123`) -> **DENIED**
7. **Unverified Email Admin Spoof**:
   `GET /users/victim999` (as `dipimafauja@gmail.com` with `email_verified: false`) -> **DENIED**
8. **Arbitrary Prayer Count Manipulation**:
   `PATCH /prayers/p1` (by non-owner) -> `{ "prayerCount": 999999 }` -> **DENIED**
9. **Value Poisoning on Prayer Update**:
   `PATCH /prayers/p1` -> `{ "prayerCount": "not-a-number" }` -> **DENIED**
10. **Immutable Field Tampering on Note Update**:
    `PATCH /notes/n1` -> `{ "createdAt": "1999-01-01" }` -> **DENIED**
11. **ID Poisoning Attack**:
    `POST /notes/invalid$id!with*spaces` -> **DENIED**
12. **Audit Log Tampering / Deletion**:
    `DELETE /auditLogs/log1` -> **DENIED**

## 3. Test Runner Specification (`firestore.rules.test.ts`)
```typescript
// Verifies that all 12 Dirty Dozen payloads return PERMISSION_DENIED
// against the hardened ruleset in firestore.rules.
```
