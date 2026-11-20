# Firestore Security Specification (Phase 0 TDD)

## 1. Data Invariants

1. **Authenticated & Verified Authorship**: An email trigger document in `/mail`, `/contact_emails`, or `/email_queue` MUST only be created by a signed-in user with `request.auth.token.email_verified == true` whose `senderUid == request.auth.uid`.
2. **Strict Schema & Zero Shadow Fields**: Incoming documents MUST contain exact required keys and ONLY allowlisted keys (`keys().hasAll(...) && keys().hasOnly(...)`) including nested `message` and `delivery` maps.
3. **Collection Binding**: Every created document's `collectionName` field MUST match the collection path (`mail`, `contact_emails`, or `email_queue`) to prevent cross-collection spoofing.
4. **Volumetric Bounds**: Strings and arrays are strictly size-bounded (`to`: 1..5 items of `<=160` chars; `message.subject`: 1..200 chars; `message.text`: 1..10000 chars; `message.html`: `<=20000` chars; `attachmentNames`: `<=4` items).
5. **Initial State Lock**: On creation, `delivery.state` MUST equal `'PENDING'` and `delivery.attempts` MUST equal `0`.
6. **Temporal Integrity**: `createdAt` on create and `updatedAt` on create/update MUST equal `request.time`.
7. **Immutable Identity & Terminal Outcome Lock**: `senderUid`, `createdAt`, `to`, `ticketId`, and `collectionName` are immutable on update. Once `existing().delivery.state == 'SUCCESS'`, non-admins cannot mutate the document.
8. **PII Isolation & Query Enforcement**: Only the document owner (`senderUid == request.auth.uid`) or verified admin (`mohdzul@gmail.com` / `/admins/{uid}`) may `get` or `list` email trigger documents. Unauthenticated reads and blanket `isSignedIn()` reads are prohibited.

## 2. The "Dirty Dozen" Attack Payloads

1. **Identity Spoofing**: Create doc with `senderUid: "victim_uid_999"` while signed in as `"attacker_uid"`. -> `PERMISSION_DENIED`
2. **Unverified Email Bypass**: Create doc with `request.auth.token.email_verified == false`. -> `PERMISSION_DENIED`
3. **Email Spoofing (Admin Claim Without Verification)**: Read another user's `/mail/{docId}` with `token.email == "mohdzul@gmail.com"` and `email_verified == false`. -> `PERMISSION_DENIED`
4. **Shadow Field Injection**: Create doc with extra field `isAdminApproved: true` or `delivery.bypassAuth: true`. -> `PERMISSION_DENIED`
5. **Value Poisoning (Oversized Body)**: Create doc with `message.text` length > 10,000 chars or `message.subject` > 200 chars. -> `PERMISSION_DENIED`
6. **Unbounded Array Attack**: Create doc with `to` containing 6 recipient emails or `attachmentNames` containing 5 items. -> `PERMISSION_DENIED`
7. **ID Poisoning**: Create doc at `/mail/bad$id/..` or ID > 128 chars. -> `PERMISSION_DENIED`
8. **Initial State Bypass**: Create doc directly with `delivery.state: "SUCCESS"` to fake email delivery. -> `PERMISSION_DENIED`
9. **Terminal State Tampering**: Update an already `SUCCESS` document's `delivery.state` back to `'PENDING'`. -> `PERMISSION_DENIED`
10. **Cross-User PII Read (`get`)**: User B attempts `get(/mail/docA)` where `docA.senderUid == "userA"`. -> `PERMISSION_DENIED`
11. **Query Scraping (`list`)**: Attacker executes unfiltered `collection('mail')` query without `where('senderUid', '==', uid)`. -> `PERMISSION_DENIED`
12. **Client-Forged Timestamp / Immutable Field Mutation**: Create with `createdAt` != `request.time`, or update changing `senderUid` or `to`. -> `PERMISSION_DENIED`
