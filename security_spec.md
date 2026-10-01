# Security Specification & Threat Model

## Data Invariants & Zero-Trust Architecture
1. **User Isolation Invariant**: Document `/users/{userId}` belongs strictly to `request.auth.uid`. User A can only read, update, or access their own user document. User A cannot read or write User B or User C's data.
2. **Privilege Escalation Prevention**: Non-admin users cannot alter their own `role` field.
3. **Private Messaging Boundary**: User A can only read messages `/messages/{id}` where User A is the authenticated `senderId` or `receiverId`. Messages between User B and User C are inaccessible to User A.
4. **Sender Integrity**: A user cannot forge messages with `senderId` pointing to another user.
5. **Shift Isolation**: Staff member User A can only view shifts assigned to them (`staffId == request.auth.uid`). Staff member User B cannot view User A's shift schedule unless they are an Administrator.
6. **Resident Health Privacy**: Sensitive resident health vitals and medical care notes `/residents/{id}` are only accessible by Administrators, the assigned care staff (`assignedStaffId == request.auth.uid`), or the resident's verified relative.
7. **Consultation & Application Confidentiality**: Intake applications `/applications/{id}` and care assessment bookings `/consultations/{id}` are only viewable by the applicant (`email == request.auth.token.email`) or Administrators.
8. **Default Deny**: All unmapped documents are strictly denied by default (`match /{document=**} { allow read, write: if false; }`).

---

## The "Dirty Dozen" Threat Payloads (Targeting Cross-User Data Leaks)

1. **User B Snoop Attack**: User A attempts to `get` `/users/user_b_id`.
   - Result: `PERMISSION_DENIED`.
2. **User B Overwrite Attack**: User A attempts to `setDoc` or `updateDoc` `/users/user_b_id` with malicious data.
   - Result: `PERMISSION_DENIED`.
3. **Privilege Escalation Attack**: User A attempts to update `/users/user_a_id` setting `role: "Admin"`.
   - Result: `PERMISSION_DENIED`.
4. **Message Interception Attack**: User A attempts to `get` `/messages/msg_between_b_and_c`.
   - Result: `PERMISSION_DENIED`.
5. **Message Spoofing Attack**: User A attempts to create `/messages/new_msg` with `senderId: "user_b_id"`.
   - Result: `PERMISSION_DENIED`.
6. **Cross-User Shift Snooping**: Staff User A attempts to `get` `/shifts/shift_assigned_to_b`.
   - Result: `PERMISSION_DENIED`.
7. **Unauthorized Shift Modification**: Staff User A attempts to edit or delete `/shifts/shift_assigned_to_b`.
   - Result: `PERMISSION_DENIED`.
8. **Resident Medical Record Snooping**: Unassigned User A attempts to read `/residents/resident_123` care details.
   - Result: `PERMISSION_DENIED`.
9. **Private Application Leak**: User A attempts to read User B's submitted job application in `/applications/app_user_b`.
   - Result: `PERMISSION_DENIED`.
10. **Consultation Record Hijacking**: User A attempts to read or update User B's consultation booking in `/consultations/booking_user_b`.
    - Result: `PERMISSION_DENIED`.
11. **Staff Directory Tampering**: User A attempts to edit User B's staff qualification or hourly shift in `/staff/staff_user_b`.
    - Result: `PERMISSION_DENIED`.
12. **Catch-All Arbitrary Document Injection**: User A attempts to write to an unlisted administrative path `/admin_secrets/passwords`.
    - Result: `PERMISSION_DENIED`.
