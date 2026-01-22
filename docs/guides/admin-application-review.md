# Admin Guide: Application Review

## Overview

This guide explains how to review and process user applications for program enrollment. As an admin, you'll decide whether to approve applicants as guests (limited access) or members (full access), or reject applications that don't meet criteria.

## Accessing the Applications Queue

1. Navigate to **`/admin/applications`**
2. You'll see a dashboard with 4 statistics cards:
   - **Total Applications**: All-time count
   - **Pending**: Awaiting review
   - **Approved**: Accepted applications
   - **Rejected**: Declined applications

## Understanding the Queue

### Filter Options

Use the status dropdown to filter applications:
- **All Applications**: Show everything
- **Pending**: Only unreviewed (default view)
- **Approved**: Completed approvals
- **Rejected**: Declined applications

### Table Columns

| Column | Description |
|--------|-------------|
| Applicant | Name, email, avatar |
| Program | Which program they applied to |
| Status | Pending/Approved/Rejected badge |
| Applied | Time since application |
| Account Status | Current user status |

## Reviewing an Application

### Opening the Detail Drawer

Click any row in the table to open the application detail drawer on the right side.

### Information Displayed

**Applicant Section:**
- Avatar and display name
- Username (if set)
- Email address
- Current account status badge

**Location** (if provided):
- City and country

**Program:**
- Program name
- Program description

**Goal:**
- User's 1-month goal (1-280 characters)
- This is the most important review criterion

**Social Accounts:**
- GitHub username (link to profile)
- X/Twitter handle (link to profile)
- LinkedIn URL (link to profile)
- Telegram username

**Application Metadata:**
- Submission timestamp
- Review timestamp (if already reviewed)
- Reviewer information (if reviewed)

## Making a Decision

### What to Look For

**Strong Applications:**
- ✅ Clear, specific, measurable goals
- ✅ Realistic timeline (1 month)
- ✅ GitHub account connected (shows technical background)
- ✅ Complete profile information
- ✅ Goal aligns with program objectives

**Example of a good goal:**
> "Complete portfolio with 3 React projects (todo app, weather app, e-commerce), deploy on Vercel, and land first freelance client in next month"

**Weak Applications:**
- ❌ Vague goals ("learn programming", "get better")
- ❌ Unrealistic goals ("become senior developer in 1 month")
- ❌ No social accounts connected
- ❌ Incomplete profile
- ❌ Goal doesn't match program focus

**Example of a weak goal:**
> "I want to learn coding and make money"

### Decision Types

#### 1. Approve as Guest (Recommended Default)

**When to use:**
- First-time applicants with decent goals
- Users without proven track record
- Standard approval path

**What happens:**
- User gets `guest` account status
- Limited platform access (can browse, submit, participate)
- Must earn full membership through participation
- Needs: 5 sessions attended + 3 approved submissions + 70% quality score

**Benefits:**
- Filters out uncommitted users
- Builds community with engaged members
- Users prove dedication before full access

#### 2. Approve as Member (Fast-Track)

**When to use:**
- Returning users with history
- Exceptional applications with strong portfolio
- Referrals from trusted members
- Clear demonstration of commitment

**What happens:**
- User gets `active` account status immediately
- Full platform access (voting, referrals, priority)
- Skips guest tier entirely

**Caution:** Use sparingly - guests who earn membership are more engaged.

#### 3. Reject

**When to use:**
- Spam applications
- Completely off-topic goals
- Inappropriate content
- Duplicate/bot applications
- Clear lack of seriousness

**What happens:**
- User gets `rejected` account status
- No platform access
- Can reapply (not blocked from platform)

**Important:** Always add review notes explaining rejection reason.

### Adding Review Notes

The review notes field is **optional** but **highly recommended**, especially for:
- Rejections (explain why)
- Fast-track approvals (explain reasoning)
- Borderline cases (document decision factors)

**Good review notes examples:**
- "Strong application with clear technical goals and active GitHub. Approved as guest to build track record."
- "Exceptional portfolio and referral from @seniordev. Fast-tracking to member."
- "Goal too vague and no technical background shown. Rejected - can reapply with specific goals."

### Processing the Application

1. **Add review notes** in the textarea (optional)
2. **Click one of three buttons:**
   - **Approve as Member** (green) - Full access
   - **Approve as Guest** (outline) - Limited access
   - **Reject** (red) - No access
3. **Confirm** - The action processes immediately
4. **System actions:**
   - Updates application status
   - Changes user account status
   - Creates program enrollment (if approved)
   - Records your admin ID and timestamp
   - Invalidates relevant caches

## Post-Approval Actions

### What Happens Automatically

**For Approved Applications (Guest or Member):**
- ✅ Application status → `approved`
- ✅ User account status → `guest` or `active`
- ✅ Program enrollment created
- ✅ User can access their program dashboard
- ✅ Review metadata stored (who, when, notes)

**For Rejected Applications:**
- ✅ Application status → `rejected`
- ✅ User account status → `rejected`
- ✅ No enrollment created
- ✅ User sees rejection (can reapply)

### Guest User Next Steps

Guests can now:
1. View their program dashboard at `/programs/{programId}`
2. See their goal and participation stats
3. Track promotion progress
4. Participate in activities
5. Submit work
6. Attend sessions (admin marks attendance)

## Promoting Guests to Members

### When Guests Become Eligible

A guest becomes eligible for promotion after meeting all three criteria:
- ✅ 5+ sessions attended (marked as 'present')
- ✅ 3+ submissions approved
- ✅ 70%+ average quality score

### Checking Eligibility

1. Navigate to user profile or enrollment details
2. Look for "Promotion Eligibility" card
3. Review progress indicators:
   - Green checkmarks = requirement met
   - Gray X = requirement not met
4. View detailed breakdown:
   - Attendance: X / 5 sessions
   - Submissions: X / 3 approved
   - Quality: X% / 70%

### Promotion Process

1. **Verify eligibility** - All 3 requirements must be met
2. **Review participation quality** - Not just numbers, but engagement
3. **Click "Promote to Member"** button
4. **Add promotion notes** (optional but recommended)
5. **Confirm promotion**

**What happens:**
- User account status changes from `guest` to `active`
- Enrollment metadata updated with promotion timestamp
- User gains full platform access
- No loss of progress or history

### Promotion Best Practices

**When to promote:**
- All criteria met AND consistent participation
- Quality submissions demonstrate learning
- Active in community discussions
- No behavioral issues

**When to delay:**
- Criteria met but recent inactivity
- Quality concerns despite numbers
- Community guidelines violations
- Suspicious activity patterns

## Batch Operations

### Current Capabilities

The queue shows all pending applications in one view, making it easy to:
- Review multiple applications sequentially
- Apply consistent standards
- Track daily review counts
- Monitor program enrollment rates

### Tips for Efficiency

1. **Set a schedule**: Review applications daily at same time
2. **Use filters**: Focus on pending first, review rejected weekly
3. **Keyboard shortcuts**: Click → Review → Decide → Close (mouse only for now)
4. **Document patterns**: Note common rejection/approval reasons
5. **Batch similar cases**: Review all applications for same program together

## Common Scenarios

### Scenario 1: Great Goal, No GitHub

**Situation**: Clear specific goal but no GitHub connected

**Decision**: Approve as Guest
**Reasoning**: Goal shows seriousness, GitHub can be added later
**Review Note**: "Clear goals. Please connect GitHub to enhance profile."

### Scenario 2: Vague Goal, Active GitHub

**Situation**: Generic goal but impressive GitHub profile

**Decision**: Approve as Guest (or reject if too vague)
**Reasoning**: Technical skills shown, but needs clearer direction
**Review Note**: "Impressive GitHub activity. Work on setting specific milestones."

### Scenario 3: Perfect Application

**Situation**: Specific goal, complete profile, GitHub, clear plan

**Decision**: Approve as Guest (unless exceptional case for Member)
**Reasoning**: Let them prove consistency through participation
**Review Note**: "Excellent application. Looking forward to your progress!"

### Scenario 4: Spam/Bot

**Situation**: Obviously automated or spam

**Decision**: Reject
**Reasoning**: Not a legitimate applicant
**Review Note**: "Automated application. Reapply with authentic information."

### Scenario 5: Referred by Trusted Member

**Situation**: Strong recommendation from active member

**Decision**: Consider Approve as Member
**Reasoning**: Social proof + vouched for commitment
**Review Note**: "Referral from @trustedmember. Fast-tracked based on recommendation."

## Quality Standards

### Application Review Checklist

Before making a decision, verify:
- [ ] Goal is 1-280 characters (system-enforced)
- [ ] Goal is specific and measurable
- [ ] Timeline is realistic (1 month)
- [ ] Profile is complete (at minimum username + display name)
- [ ] At least one social account connected (ideally GitHub)
- [ ] No red flags (spam, inappropriate content)
- [ ] Goal aligns with program focus

### Consistency Guidelines

Aim for consistency across reviews:
- **Guest approval**: Standard path for most applicants
- **Member approval**: < 10% of approvals (exceptional cases only)
- **Rejection rate**: ~5-15% (depends on application quality)
- **Review notes**: 80%+ of decisions should have notes

## Monitoring & Analytics

### Queue Statistics

Track these metrics:
- **Pending backlog**: Keep under 20 applications
- **Average review time**: Aim for < 24 hours
- **Approval rate**: Should be 85-95%
- **Guest-to-member ratio**: Guests should be promoted within 2-3 months

### Red Flags

Watch for:
- ⚠️ Pending backlog > 50 applications
- ⚠️ Rejection rate > 20% (too strict?)
- ⚠️ Rejection rate < 5% (too lenient?)
- ⚠️ Fast-track rate > 15% (undermines guest system)
- ⚠️ Average review time > 48 hours

## Troubleshooting

### Issue: Can't see applications

**Check:**
- Admin role is set correctly in database
- Privy authentication is working
- `/api/admin/applications` endpoint returns data

### Issue: Application won't process

**Check:**
- User hasn't been approved already
- Program exists and is active
- Review notes aren't too long (if any limit)
- Network connection is stable

### Issue: User reports not receiving approval

**Check:**
- Application status in database (`approved`/`rejected`)
- User `accountStatus` updated correctly
- Program enrollment was created
- Cache was invalidated (refresh page)

## Best Practices Summary

1. **Be consistent** - Apply same standards to all applicants
2. **Be timely** - Review within 24 hours when possible
3. **Be thorough** - Read full application before deciding
4. **Be fair** - Give benefit of doubt to borderline cases (as guest)
5. **Document decisions** - Add notes for rejections and fast-tracks
6. **Default to guest** - Let users prove themselves through participation
7. **Communicate** - Clear review notes help users improve
8. **Monitor metrics** - Track approval rates and processing times
9. **Stay updated** - Check queue daily, keep backlog manageable
10. **Be welcoming** - Remember every member started as an applicant

## Related Documentation

- [Feature Documentation](../features/program-management.md)
- [API Reference](../api-reference.md)
- [User Onboarding Guide](./user-onboarding.md)
