# Testing Guide - Program Management System

This guide provides comprehensive testing strategies for Epic 3: Program Management features.

## Testing Overview

**Test Coverage Areas**:
1. User Onboarding Flow (E3-T2)
2. Guest Access Control (E3-T3)
3. Admin Application Review (E3-T4)
4. Admin Attendance Management (E3-T5)
5. Program Dashboard (E3-T6)

**Testing Approaches**:
- **Manual Testing**: UI workflows and user experience validation
- **API Testing**: Endpoint functionality with various scenarios
- **Database Testing**: Data integrity and constraint validation
- **Integration Testing**: End-to-end user journeys

---

## Manual Testing Guide

### Prerequisites

1. **Admin Account**: Create test admin user in database:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your-test-email@example.com';
```

2. **Test Programs**: Ensure at least one active program exists:
```sql
SELECT id, name, slug, is_active FROM programs WHERE is_active = true;
```

3. **Test Environment**: Use local development (`bun dev`) or staging environment

4. **Browser**: Chrome/Edge recommended (DevTools for network inspection)

---

### Test Suite 1: User Onboarding Flow (E3-T2)

#### Test 1.1: New User Registration

**Steps**:
1. Open browser in incognito mode (fresh session)
2. Navigate to `http://localhost:3000`
3. Click "Connect Wallet" button
4. Choose authentication method (embedded wallet recommended for testing)
5. Complete Privy authentication flow
6. Verify redirect to `/onboarding` page

**Expected Results**:
- ✅ Successful authentication
- ✅ Redirected to onboarding page
- ✅ Account status badge shows "Incomplete"
- ✅ Onboarding form visible

#### Test 1.2: Profile Step Completion

**Steps**:
1. Fill profile form:
   - Username: `testuser123` (unique)
   - Display Name: `Test User`
   - Bio: "Test user for program management system testing. Learning AI and blockchain development."
   - City: `Mexico City`
   - Country: `Mexico`
2. Upload avatar (optional)
3. Click "Next" button

**Expected Results**:
- ✅ Username validation (3-20 chars, lowercase, no special chars except _ and -)
- ✅ Display name required
- ✅ Bio character count (50-500 chars)
- ✅ Progress to program selection step
- ✅ No console errors

**Validation Tests**:
- Try invalid usernames: `AB`, `user@test`, `ThisIsAVeryLongUsernameThatExceedsLimit`
- Try bio < 50 characters: Should show error
- Try bio > 500 characters: Should show error

#### Test 1.3: Program Selection

**Steps**:
1. View list of active programs
2. Click on "AI Track" program card
3. Verify program is selected (visual indication)
4. Click "Next" button

**Expected Results**:
- ✅ Programs load from `/api/programs/active`
- ✅ Each program shows: name, description, dates
- ✅ Selection highlighted visually
- ✅ Progress to goal step
- ✅ Selected program persists if clicking "Back"

#### Test 1.4: Goal Setting

**Steps**:
1. Type goal: "Complete ML fundamentals course, build 3 AI projects (chatbot, image classifier, sentiment analyzer), deploy to Hugging Face, write technical blog documenting learnings"
2. Verify character counter updates in real-time
3. Try submitting with empty goal (should fail)
4. Try submitting with > 280 characters (should fail)
5. Submit valid goal (1-280 chars)
6. Click "Next" button

**Expected Results**:
- ✅ Character counter accurate
- ✅ Validation prevents empty or > 280 characters
- ✅ Error messages clear and helpful
- ✅ Progress to social accounts step

#### Test 1.5: Social Accounts Linking

**Steps**:
1. Enter social accounts (at least one):
   - GitHub: `testuser`
   - X/Twitter: `testuser`
   - LinkedIn: `https://linkedin.com/in/testuser`
   - Telegram: `testuser`
2. Click "Next" button

**Expected Results**:
- ✅ All fields optional but recommended message shown
- ✅ GitHub field emphasized (most important)
- ✅ LinkedIn URL validation (full URL required)
- ✅ Progress to review step

#### Test 1.6: Review and Submit

**Steps**:
1. Review all entered information
2. Verify all sections display correctly:
   - Profile information
   - Selected program
   - Goal
   - Social accounts
3. Click "Back" to edit (test navigation)
4. Return to review step
5. Click "Submit Application" button
6. Verify success message
7. Check account status changes to "Pending"

**Expected Results**:
- ✅ All information displayed correctly
- ✅ Back navigation works without data loss
- ✅ Submit button calls `POST /api/applications`
- ✅ Success toast notification shown
- ✅ Redirect to home or dashboard
- ✅ Account status badge shows "Pending"
- ✅ Navbar shows pending status

#### Test 1.7: Duplicate Username Prevention

**Steps**:
1. Start new user registration (new incognito window)
2. Try to use same username as previous test
3. Submit profile step

**Expected Results**:
- ✅ Error message: "Username already taken"
- ✅ Cannot proceed until unique username entered
- ✅ No database constraint error (handled gracefully)

---

### Test Suite 2: Admin Application Review (E3-T4)

#### Test 2.1: Access Admin Applications Queue

**Steps**:
1. Log in with admin account
2. Navigate to `/admin/applications`
3. Verify page loads

**Expected Results**:
- ✅ Non-admin users redirected or see 403 error
- ✅ Admin sees applications queue page
- ✅ Four statistics cards visible: Total, Pending, Approved, Rejected
- ✅ Applications table loads
- ✅ Statistics match database counts

#### Test 2.2: Filter Applications by Status

**Steps**:
1. Click status filter dropdown
2. Select "Pending"
3. Verify table updates
4. Select "All Applications"
5. Verify all applications shown
6. Select "Approved"
7. Select "Rejected"

**Expected Results**:
- ✅ Filter dropdown shows 4 options
- ✅ Table updates immediately on selection
- ✅ Network request to `/api/admin/applications?status=pending`
- ✅ Correct applications displayed for each filter
- ✅ Empty state shown if no matching applications

#### Test 2.3: View Application Details

**Steps**:
1. Click on pending application row
2. Verify detail drawer opens from right side
3. Review all information sections:
   - Applicant (avatar, name, username, email, account status)
   - Location (city, country)
   - Program (name, description)
   - Goal (1-280 char commitment)
   - Social Accounts (with links)
   - Application metadata (submission timestamp)

**Expected Results**:
- ✅ Drawer slides in smoothly
- ✅ All applicant information displayed
- ✅ Social account links clickable and correct
- ✅ Program information accurate
- ✅ Goal displayed prominently
- ✅ Timestamps formatted as relative time ("2 hours ago")
- ✅ Close button (X) works

#### Test 2.4: Approve Application as Guest

**Steps**:
1. Open pending application detail drawer
2. Optionally add review notes: "Clear goals and complete profile. Approved as guest to build track record."
3. Click "Approve as Guest" button (middle button)
4. Verify confirmation or immediate action
5. Wait for success message

**Expected Results**:
- ✅ Button styling indicates default action
- ✅ Request to `POST /api/admin/applications/:id/approve`
- ✅ Request body: `{ decision: 'approve_guest', reviewNotes: '...' }`
- ✅ Success toast: "Application processed successfully"
- ✅ Drawer closes automatically
- ✅ Applications table refreshes
- ✅ Application moves to "Approved" when filtering
- ✅ Database: `application.status = 'approved'`, `user.accountStatus = 'guest'`
- ✅ Program enrollment created in `program_enrollments` table

#### Test 2.5: Approve Application as Member (Fast-Track)

**Steps**:
1. Open another pending application
2. Add review notes: "Exceptional portfolio and referral from trusted member. Fast-tracked to member status."
3. Click "Approve as Member" button (green button)
4. Verify success

**Expected Results**:
- ✅ Request body: `{ decision: 'approve_member', reviewNotes: '...' }`
- ✅ User account status becomes `active` (not `guest`)
- ✅ Program enrollment created
- ✅ All other expectations same as Test 2.4

#### Test 2.6: Reject Application

**Steps**:
1. Open pending application with weak goal
2. Add review notes: "Goal too vague and no technical background shown. Rejected - can reapply with specific goals."
3. Click "Reject" button (red button)
4. Verify success

**Expected Results**:
- ✅ Request body: `{ decision: 'reject', reviewNotes: '...' }`
- ✅ Application status becomes `rejected`
- ✅ User account status becomes `rejected`
- ✅ **No** program enrollment created
- ✅ User can still log in but has limited access

#### Test 2.7: Application Already Processed

**Steps**:
1. Try to process an already-approved application again
2. Click any decision button

**Expected Results**:
- ✅ Error message: "Application already processed"
- ✅ HTTP 409 Conflict response
- ✅ No database changes made

#### Test 2.8: Statistics Accuracy

**Steps**:
1. Note current statistics (Total, Pending, Approved, Rejected)
2. Process one pending application as guest
3. Verify statistics update:
   - Pending count decreases by 1
   - Approved count increases by 1
   - Total stays same

**Expected Results**:
- ✅ React Query invalidates `['admin', 'applications', 'stats']` cache
- ✅ Statistics refresh automatically
- ✅ Counts accurate with database

---

### Test Suite 3: Admin Attendance Management (E3-T5)

#### Test 3.1: Access Session Attendance Page

**Steps**:
1. Log in as admin
2. Navigate to `/admin/sessions/{session-id}/attendance`
3. Verify page loads

**Expected Results**:
- ✅ Session information displayed (title, date, location/URL)
- ✅ Five statistics cards: Total, Present, Absent, Excused, Unmarked
- ✅ List of enrolled users shown
- ✅ Each user shows current attendance status

#### Test 3.2: Mark Single User as Present

**Steps**:
1. Find user with "Unmarked" status
2. Click checkbox next to their name
3. Verify checkbox selected
4. Click "Mark as Present" button
5. Wait for success message

**Expected Results**:
- ✅ Checkbox visually selected
- ✅ Request to `POST /api/admin/attendance/mark`
- ✅ Request body: `{ sessionId, userIds: ['user-id'], status: 'present' }`
- ✅ Success toast shown
- ✅ User's attendance badge updates to "Present" (green)
- ✅ Statistics update: Unmarked -1, Present +1
- ✅ Checkbox automatically deselected after marking

#### Test 3.3: Bulk Mark Multiple Users

**Steps**:
1. Select 3-5 unmarked users using checkboxes
2. Verify selection count shown
3. Click "Mark as Present" button
4. Wait for success message

**Expected Results**:
- ✅ Multiple checkboxes selected
- ✅ Selection count indicator (e.g., "5 selected")
- ✅ Bulk request with multiple user IDs
- ✅ All selected users updated simultaneously
- ✅ Statistics reflect all changes
- ✅ All checkboxes cleared after marking

#### Test 3.4: Select All Users

**Steps**:
1. Click "Select All" checkbox (if available) or manually select all
2. Verify all users selected
3. Click "Mark as Present"
4. Confirm action

**Expected Results**:
- ✅ All checkboxes selected at once
- ✅ Bulk operation processes all users
- ✅ May take a few seconds for large groups
- ✅ All users updated successfully

#### Test 3.5: Mark as Absent

**Steps**:
1. Select user(s)
2. Click "Mark as Absent" button
3. Verify success

**Expected Results**:
- ✅ Request body: `{ status: 'absent' }`
- ✅ User badge shows "Absent" (gray or red)
- ✅ Statistics update correctly

#### Test 3.6: Mark as Excused

**Steps**:
1. Select user(s)
2. Click "Mark as Excused" button
3. Verify success

**Expected Results**:
- ✅ Request body: `{ status: 'excused' }`
- ✅ User badge shows "Excused" (yellow)
- ✅ Statistics update correctly
- ✅ Excused status does NOT count toward promotion eligibility

#### Test 3.7: Update Existing Attendance

**Steps**:
1. Select user already marked as "Present"
2. Change to "Absent"
3. Verify update success

**Expected Results**:
- ✅ Upsert pattern allows updating existing records
- ✅ `onConflictDoUpdate` on `(userId, sessionId)` constraint
- ✅ Status updated correctly
- ✅ `markedAt` and `markedBy` updated to current admin

#### Test 3.8: No Users Selected

**Steps**:
1. Ensure no checkboxes selected
2. Try clicking any status button

**Expected Results**:
- ✅ Buttons disabled when no selection
- ✅ OR error message: "Please select at least one user"
- ✅ No API request made

---

### Test Suite 4: Program Dashboard (E3-T6)

#### Test 4.1: Guest User Dashboard Access

**Steps**:
1. Log in as guest user (approved application)
2. Navigate to `/programs/{program-id}`
3. Verify dashboard loads

**Expected Results**:
- ✅ Program information displayed
- ✅ Account status badge shows "Guest"
- ✅ User's goal displayed prominently
- ✅ Participation statistics shown
- ✅ Promotion progress card visible (guest-specific)
- ✅ Upcoming sessions list shown

#### Test 4.2: Participation Statistics Display

**Steps**:
1. Review participation stats card
2. Verify three sections:
   - Attendance rate
   - Submission approval rate
   - Quality score (if applicable)

**Expected Results**:
- ✅ Attendance: "X / Y sessions" with percentage
- ✅ Submissions: "X / Y approved" with percentage
- ✅ Quality: "XX%" or "No quality scores yet"
- ✅ Progress bars accurately reflect percentages
- ✅ Icons for each stat type

**Test with Data**:
- Create attendance records: 3 present, 1 absent, 1 excused (60% attendance)
- Create submissions: 2 approved, 1 pending, 1 rejected (50% approval)
- Add quality scores to approved submissions (average 75%)

#### Test 4.3: Promotion Progress Tracking (Guest)

**Steps**:
1. Review promotion progress card
2. Verify three requirement progress bars:
   - Sessions: X / 5
   - Submissions: X / 3
   - Quality: XX% / 70%
3. Check visual indicators (green checkmark or gray X)

**Expected Results**:
- ✅ Each requirement shows current vs. required
- ✅ Progress bars fill based on completion
- ✅ Requirements met show green checkmark
- ✅ Requirements not met show gray X or empty indicator
- ✅ If all three met: Congratulations message displayed
- ✅ Card explains path to membership

#### Test 4.4: Promotion Eligibility (All Requirements Met)

**Steps**:
1. Ensure guest user has:
   - 5+ sessions marked as "Present"
   - 3+ submissions with status "approved"
   - 70%+ average quality score
2. Refresh dashboard
3. Verify promotion card shows eligibility

**Expected Results**:
- ✅ All three requirements show green checkmarks
- ✅ Progress bars all 100% filled
- ✅ Congratulations or "Eligible for promotion" message
- ✅ Instruction to contact admin or wait for review
- ✅ Badge or visual indicator of eligibility

#### Test 4.5: Upcoming Sessions List

**Steps**:
1. Scroll to upcoming sessions section
2. Verify sessions displayed
3. Click on session link (if available)

**Expected Results**:
- ✅ Top 3 upcoming sessions shown
- ✅ Each session shows: title, date/time, location or meeting URL
- ✅ Sessions ordered by date (nearest first)
- ✅ Meeting URLs clickable
- ✅ If no upcoming sessions: "No upcoming sessions" message

#### Test 4.6: Member User Dashboard (No Promotion Card)

**Steps**:
1. Log in as member user (`accountStatus = 'active'`)
2. Navigate to program dashboard
3. Verify promotion progress card NOT shown

**Expected Results**:
- ✅ Account status badge shows "Member"
- ✅ Promotion progress card hidden (members already promoted)
- ✅ All other dashboard sections visible
- ✅ Participation stats still shown

#### Test 4.7: Unauthorized Access

**Steps**:
1. Log in as user NOT enrolled in program
2. Try to access `/programs/{program-id}` directly
3. Verify blocked

**Expected Results**:
- ✅ 403 Forbidden response
- ✅ OR redirect to home with error message
- ✅ Error: "You are not enrolled in this program"

---

## API Testing with cURL

### Test API Endpoints Directly

#### Setup: Get Authentication Token

```bash
# Log in via browser first, then extract token from DevTools:
# Application > Cookies > privy-token or privy-id-token
export TOKEN="your-jwt-token-here"
```

### Admin - Applications

#### List All Applications
```bash
curl -X GET "http://localhost:3000/api/admin/applications" \
  -H "Cookie: privy-token=$TOKEN"
```

#### List Pending Applications
```bash
curl -X GET "http://localhost:3000/api/admin/applications?status=pending" \
  -H "Cookie: privy-token=$TOKEN"
```

#### Get Application Detail
```bash
curl -X GET "http://localhost:3000/api/admin/applications/{application-id}" \
  -H "Cookie: privy-token=$TOKEN"
```

#### Approve Application as Guest
```bash
curl -X POST "http://localhost:3000/api/admin/applications/{application-id}/approve" \
  -H "Cookie: privy-token=$TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "decision": "approve_guest",
    "reviewNotes": "Clear goals and complete profile."
  }'
```

#### Approve Application as Member
```bash
curl -X POST "http://localhost:3000/api/admin/applications/{application-id}/approve" \
  -H "Cookie: privy-token=$TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "decision": "approve_member",
    "reviewNotes": "Exceptional portfolio and referral."
  }'
```

#### Reject Application
```bash
curl -X POST "http://localhost:3000/api/admin/applications/{application-id}/approve" \
  -H "Cookie: privy-token=$TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "decision": "reject",
    "reviewNotes": "Goal too vague, please reapply with specific objectives."
  }'
```

### Admin - Attendance

#### Get Session Attendance
```bash
curl -X GET "http://localhost:3000/api/admin/attendance/session/{session-id}" \
  -H "Cookie: privy-token=$TOKEN"
```

#### Mark Attendance (Single User)
```bash
curl -X POST "http://localhost:3000/api/admin/attendance/mark" \
  -H "Cookie: privy-token=$TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session-uuid",
    "userIds": ["user-uuid"],
    "status": "present"
  }'
```

#### Mark Attendance (Multiple Users)
```bash
curl -X POST "http://localhost:3000/api/admin/attendance/mark" \
  -H "Cookie: privy-token=$TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session-uuid",
    "userIds": ["user-1-uuid", "user-2-uuid", "user-3-uuid"],
    "status": "present"
  }'
```

#### Bulk Mark with Different Statuses
```bash
curl -X POST "http://localhost:3000/api/admin/attendance/bulk" \
  -H "Cookie: privy-token=$TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session-uuid",
    "records": [
      { "userId": "user-1-uuid", "status": "present" },
      { "userId": "user-2-uuid", "status": "absent" },
      { "userId": "user-3-uuid", "status": "excused" }
    ]
  }'
```

### Programs - Dashboard

#### Get Program Dashboard
```bash
curl -X GET "http://localhost:3000/api/programs/{program-id}/dashboard" \
  -H "Cookie: privy-token=$TOKEN"
```

#### Get Program Sessions
```bash
curl -X GET "http://localhost:3000/api/programs/{program-id}/sessions" \
  -H "Cookie: privy-token=$TOKEN"
```

#### Get Upcoming Sessions Only
```bash
curl -X GET "http://localhost:3000/api/programs/{program-id}/sessions?upcoming=true" \
  -H "Cookie: privy-token=$TOKEN"
```

### Admin - User Promotion

#### Check Promotion Eligibility
```bash
curl -X GET "http://localhost:3000/api/admin/users/{user-id}/eligibility?enrollmentId={enrollment-id}" \
  -H "Cookie: privy-token=$TOKEN"
```

#### Promote User to Member
```bash
curl -X POST "http://localhost:3000/api/admin/users/{user-id}/promote" \
  -H "Cookie: privy-token=$TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "enrollmentId": "enrollment-uuid",
    "promotionNotes": "Consistent participation and high-quality submissions."
  }'
```

---

## Database Testing

### Direct SQL Queries for Verification

#### Check Application Status After Processing
```sql
SELECT
  a.id,
  a.status,
  a.reviewed_by_user_id,
  a.reviewed_at,
  u.account_status,
  u.username
FROM applications a
JOIN users u ON a.user_id = u.id
WHERE a.id = 'application-uuid';
```

#### Verify Program Enrollment Created
```sql
SELECT
  pe.id,
  pe.user_id,
  pe.program_id,
  pe.enrolled_at,
  u.username,
  p.name as program_name
FROM program_enrollments pe
JOIN users u ON pe.user_id = u.id
JOIN programs p ON pe.program_id = p.id
WHERE pe.user_id = 'user-uuid';
```

#### Check Attendance Records
```sql
SELECT
  a.user_id,
  a.session_id,
  a.status,
  a.marked_at,
  u.username,
  s.title as session_title
FROM attendance a
JOIN users u ON a.user_id = u.id
JOIN sessions s ON a.session_id = s.id
WHERE a.session_id = 'session-uuid'
ORDER BY a.marked_at DESC;
```

#### Calculate Promotion Eligibility Manually
```sql
-- Attendance count (Present only)
SELECT COUNT(*) as present_count
FROM attendance
WHERE user_id = 'user-uuid' AND status = 'present';

-- Approved submissions count
SELECT COUNT(*) as approved_count
FROM activity_submissions
WHERE user_id = 'user-uuid' AND status = 'approved';

-- Average quality score
SELECT AVG((metadata->>'qualityScore')::numeric) as avg_quality
FROM activity_submissions
WHERE user_id = 'user-uuid'
  AND status = 'approved'
  AND metadata->>'qualityScore' IS NOT NULL;
```

#### Application Statistics
```sql
SELECT
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'pending') as pending,
  COUNT(*) FILTER (WHERE status = 'approved') as approved,
  COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as recent
FROM applications;
```

---

## Common Issues and Troubleshooting

### Issue: Applications Not Appearing in Queue

**Check**:
1. Verify application exists in database:
   ```sql
   SELECT * FROM applications WHERE id = 'application-uuid';
   ```
2. Check status filter (applications might be approved/rejected)
3. Verify admin authentication (check role in database)

**Solution**: Ensure `applications.status = 'pending'` and admin role is set correctly.

---

### Issue: Attendance Not Updating

**Check**:
1. Verify session exists:
   ```sql
   SELECT * FROM sessions WHERE id = 'session-uuid';
   ```
2. Check composite unique constraint:
   ```sql
   SELECT * FROM attendance WHERE user_id = 'user-uuid' AND session_id = 'session-uuid';
   ```
3. Review database logs for constraint violations

**Solution**: If record exists, should use upsert pattern (`onConflictDoUpdate`). Check API implementation.

---

### Issue: Promotion Progress Not Calculating

**Check**:
1. Verify attendance records marked as 'present' (not 'excused')
2. Check submissions have status 'approved'
3. Verify quality scores in metadata JSONB:
   ```sql
   SELECT metadata->'qualityScore' FROM activity_submissions WHERE user_id = 'user-uuid';
   ```

**Solution**: Ensure business logic matches documented requirements (5 sessions, 3 submissions, 70% quality).

---

## Test Data Setup Scripts

### Create Test Admin User
```sql
-- Find your user ID
SELECT id, email, role FROM users WHERE email = 'your-email@example.com';

-- Update to admin
UPDATE users SET role = 'admin' WHERE id = 'your-user-uuid';
```

### Create Test Program
```sql
INSERT INTO programs (name, slug, description, start_date, end_date, is_active)
VALUES (
  'Test AI Program',
  'test-ai-program',
  'Test program for AI learning track',
  NOW(),
  NOW() + INTERVAL '3 months',
  true
) RETURNING id;
```

### Create Test Session
```sql
INSERT INTO sessions (program_id, title, session_date, location, meeting_url)
VALUES (
  'program-uuid',
  'Test Session - Introduction to AI',
  NOW() + INTERVAL '1 week',
  NULL,
  'https://meet.google.com/test-session'
) RETURNING id;
```

### Create Test Attendance (for testing promotion)
```sql
-- Insert 5 present attendance records
INSERT INTO attendance (user_id, session_id, status, marked_by)
SELECT
  'guest-user-uuid',
  s.id,
  'present',
  'admin-user-uuid'
FROM sessions s
WHERE s.program_id = 'program-uuid'
LIMIT 5;
```

---

## Related Documentation

- [Feature Documentation](features/program-management.md) - System architecture and workflows
- [API Reference](api-reference.md) - Complete API endpoint documentation
- [Admin Application Review Guide](guides/admin-application-review.md) - Application review process
- [User Onboarding Guide](guides/user-onboarding.md) - User-facing onboarding instructions
- [Database Setup](database-setup.md) - Database schema and relationships
