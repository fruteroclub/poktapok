# $PULPA Workshop & Activities System - Technical Specification

**Generated:** 2025-12-25
**Project:** Poktapok - Frutero Talent Platform
**System Name:** PULPA Educational Activities & Community Engagement
**Token:** $PULPA on Optimism Mainnet
**Contract Address:** `0x029263aA1BE88127f1794780D9eEF453221C2f30`
**Chain ID:** 10 (Optimism)

---

## Executive Summary

This system is **separate from the USDC freelance bounty marketplace** (Epic 3). It focuses on **growth hacking, community building, and educational milestones** through token-incentivized activities.

### Purpose

Distribute $PULPA tokens to users who complete **workshop deliverables, learning milestones, and #buildinpublic activities** such as:

- "Make your first GitHub commit"
- "Share your project on X (Twitter)"
- "Post workshop completion photos"
- "Publish weekly progress updates"

### Key Distinctions from USDC Bounty System

| Aspect           | $PULPA Activities              | USDC Bounties (Future)     |
| ---------------- | ------------------------------ | -------------------------- |
| **Purpose**      | Education, growth, engagement  | Freelance work, revenue    |
| **Task Type**    | Simple social/learning actions | Complex code contributions |
| **Verification** | Manual admin review            | Automated + manual         |
| **Reward Size**  | Small ($1-$50 in PULPA)        | Large ($50-$5000 in USDC)  |
| **Frequency**    | High volume, repeatable        | Low volume, one-time       |
| **Token**        | $PULPA (community token)       | USDC (stablecoin)          |
| **Chain**        | Optimism Mainnet               | Multi-chain (Epic 4)       |
| **Distribution** | Manual initially, claim later  | Smart contract escrow      |

---

## System Architecture

### High-Level Flow

```
Admin Creates Activity
    ↓
User Sees Activity in Dashboard
    ↓
User Completes Activity (GitHub commit, X post, photo)
    ↓
User Submits Proof (URL, screenshot)
    ↓
Admin Reviews Submission
    ↓
Admin Approves → Marks $PULPA amount
    ↓
Admin Distributes $PULPA (manual transfer initially)
    ↓
User Receives Tokens in Wallet
    ↓
Activity Added to User Profile
```

---

## Database Schema

### New Tables Required

#### Table: `activities`

**Purpose:** Admin-created tasks for educational/community activities

```typescript
{
  id: uuid (PK)

  // Content
  title: varchar(200) NOT NULL                  // "Make Your First GitHub Commit"
  description: text NOT NULL                    // Detailed instructions
  instructions: text                            // Step-by-step guide

  // Categorization
  activity_type: activity_type_enum NOT NULL    // github_commit | x_post | photo | video | blog_post | workshop_completion
  category: varchar(100)                        // "Workshops", "Build in Public", "Learning Milestones"
  difficulty: difficulty_enum NOT NULL          // beginner | intermediate | advanced

  // Rewards
  reward_pulpa_amount: decimal(18, 8) NOT NULL  // Amount of $PULPA tokens (supports 8 decimals)

  // Submission Requirements
  evidence_requirements: jsonb NOT NULL         // {"url_required": true, "screenshot_required": false, "text_required": true}
  verification_type: verification_enum NOT NULL // manual | automatic | hybrid

  // Limits & Availability
  max_submissions_per_user: integer             // null = unlimited, 1 = once per user
  total_available_slots: integer                // null = unlimited, 100 = first 100 users
  current_submissions_count: integer DEFAULT 0  // Track slot usage

  status: activity_status_enum NOT NULL DEFAULT 'draft'

  // Timing
  starts_at: timestamptz                        // null = immediately
  expires_at: timestamptz                       // null = no expiry

  // Management
  created_by_user_id: uuid NOT NULL REFERENCES users(id)

  // Timestamps
  created_at: timestamptz NOT NULL DEFAULT NOW()
  updated_at: timestamptz NOT NULL DEFAULT NOW()
  deleted_at: timestamptz                       // Soft delete

  // Metadata
  metadata: jsonb DEFAULT '{}'::jsonb           // Tags, featured flag, difficulty badges
}

// Enums
CREATE TYPE activity_type_enum AS ENUM (
  'github_commit',       // First commit, repo creation, PR
  'x_post',             // Tweet with hashtag/mention
  'photo',              // Workshop photo, demo screenshot
  'video',              // YouTube/Loom demo
  'blog_post',          // Dev.to, Medium article
  'workshop_completion', // Attended workshop proof
  'build_in_public',    // Weekly progress update
  'code_review',        // Review peer's code
  'custom'              // Admin-defined
);

CREATE TYPE difficulty_enum AS ENUM ('beginner', 'intermediate', 'advanced');

CREATE TYPE verification_enum AS ENUM (
  'manual',    // Admin reviews manually
  'automatic', // API verification (future)
  'hybrid'     // Auto-check + manual review
);

CREATE TYPE activity_status_enum AS ENUM (
  'draft',      // Not published
  'active',     // Live and accepting submissions
  'paused',     // Temporarily disabled
  'completed',  // All slots filled or expired
  'cancelled'   // Cancelled by admin
);

// Indexes
CREATE INDEX idx_activities_status ON activities(status);
CREATE INDEX idx_activities_type ON activities(activity_type);
CREATE INDEX idx_activities_category ON activities(category);
CREATE INDEX idx_activities_created_by ON activities(created_by_user_id);
CREATE INDEX idx_activities_expires_at ON activities(expires_at);
CREATE INDEX idx_activities_deleted_at ON activities(deleted_at) WHERE deleted_at IS NULL;

// Full-text search
CREATE INDEX idx_activities_search ON activities USING GIN(
  to_tsvector('english', title || ' ' || description)
);
```

---

#### Table: `activity_submissions`

**Purpose:** User submissions for activity completion proofs

```typescript
{
  id: uuid (PK)

  // Relationships
  activity_id: uuid NOT NULL REFERENCES activities(id) ON DELETE CASCADE
  user_id: uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE

  // Submission Content
  submission_url: varchar(500)                  // X post link, GitHub repo URL, etc.
  evidence_files: jsonb DEFAULT '[]'::jsonb     // Array of uploaded file URLs [{url, type, filename}]
  submission_text: text                         // Optional user notes or description

  // Review Status
  status: submission_status_enum NOT NULL DEFAULT 'pending'

  // Admin Review
  reviewed_by_user_id: uuid REFERENCES users(id) ON DELETE SET NULL
  review_notes: text                            // Admin feedback
  reviewed_at: timestamptz

  // Reward
  reward_pulpa_amount: decimal(18, 8)           // Can differ from activity default (partial credit)

  // Timestamps
  submitted_at: timestamptz NOT NULL DEFAULT NOW()
  created_at: timestamptz NOT NULL DEFAULT NOW()
  updated_at: timestamptz NOT NULL DEFAULT NOW()

  // Metadata
  metadata: jsonb DEFAULT '{}'::jsonb           // IP address (spam prevention), user agent

  // Constraints
  UNIQUE(activity_id, user_id)                  // Prevent duplicate submissions per user per activity
}

// Enums
CREATE TYPE submission_status_enum AS ENUM (
  'pending',           // Awaiting review
  'under_review',      // Admin is reviewing
  'approved',          // Approved, ready for distribution
  'rejected',          // Rejected
  'revision_requested', // Needs changes
  'distributed'        // Tokens distributed
);

// Indexes
CREATE INDEX idx_submissions_activity ON activity_submissions(activity_id);
CREATE INDEX idx_submissions_user ON activity_submissions(user_id);
CREATE INDEX idx_submissions_status ON activity_submissions(status);
CREATE INDEX idx_submissions_reviewed_by ON activity_submissions(reviewed_by_user_id);
CREATE INDEX idx_submissions_submitted_at ON activity_submissions(submitted_at DESC);

// Composite index for admin queue
CREATE INDEX idx_submissions_queue ON activity_submissions(status, submitted_at DESC)
  WHERE status IN ('pending', 'under_review');
```

---

#### Table: `pulpa_distributions`

**Purpose:** Track $PULPA token distribution history (manual transfers initially)

```typescript
{
  id: uuid (PK)

  // Relationships
  submission_id: uuid NOT NULL REFERENCES activity_submissions(id) ON DELETE CASCADE
  user_id: uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE
  activity_id: uuid NOT NULL REFERENCES activities(id) ON DELETE CASCADE

  // Distribution Details
  pulpa_amount: decimal(18, 8) NOT NULL         // Amount distributed
  recipient_wallet: varchar(42) NOT NULL        // User's wallet address

  // Blockchain Info
  chain_id: integer NOT NULL DEFAULT 10         // Optimism Mainnet
  transaction_hash: varchar(66)                 // 0x... (nullable for manual, required for on-chain)

  // Distribution Method
  distribution_method: distribution_method_enum NOT NULL

  // Status
  status: distribution_status_enum NOT NULL DEFAULT 'pending'

  // Management
  distributed_by_user_id: uuid NOT NULL REFERENCES users(id) // Admin who distributed

  // Error Handling
  error_message: text                           // If failed
  retry_count: integer DEFAULT 0

  // Timestamps
  initiated_at: timestamptz NOT NULL DEFAULT NOW()
  distributed_at: timestamptz                   // When tokens sent
  confirmed_at: timestamptz                     // When tx confirmed on-chain

  // Metadata
  metadata: jsonb DEFAULT '{}'::jsonb           // Gas fees, exchange rate at distribution
}

// Enums
CREATE TYPE distribution_method_enum AS ENUM (
  'manual',          // Admin sends via MetaMask/external wallet
  'smart_contract',  // Automated via smart contract (future)
  'claim_portal'     // User-initiated claiming (future)
);

CREATE TYPE distribution_status_enum AS ENUM (
  'pending',     // Queued for distribution
  'processing',  // Transaction in progress
  'completed',   // Successfully distributed
  'failed',      // Distribution failed
  'cancelled'    // Admin cancelled
);

// Indexes
CREATE INDEX idx_distributions_submission ON pulpa_distributions(submission_id);
CREATE INDEX idx_distributions_user ON pulpa_distributions(user_id);
CREATE INDEX idx_distributions_activity ON pulpa_distributions(activity_id);
CREATE INDEX idx_distributions_status ON pulpa_distributions(status);
CREATE INDEX idx_distributions_tx_hash ON pulpa_distributions(transaction_hash);
CREATE INDEX idx_distributions_distributed_by ON pulpa_distributions(distributed_by_user_id);
CREATE INDEX idx_distributions_distributed_at ON pulpa_distributions(distributed_at DESC);

// Unique constraint: One distribution per submission
CREATE UNIQUE INDEX idx_distributions_submission_unique ON pulpa_distributions(submission_id);
```

---

### Updates to Existing Tables

#### `profiles` Table Updates

Add $PULPA earnings tracking:

```sql
ALTER TABLE profiles ADD COLUMN total_pulpa_earned DECIMAL(18, 8) DEFAULT 0 NOT NULL;
ALTER TABLE profiles ADD COLUMN activities_completed INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE profiles ADD CONSTRAINT pulpa_earned_positive CHECK (total_pulpa_earned >= 0);
ALTER TABLE profiles ADD CONSTRAINT activities_positive CHECK (activities_completed >= 0);

CREATE INDEX idx_profiles_pulpa_earned ON profiles(total_pulpa_earned DESC);
CREATE INDEX idx_profiles_activities_completed ON profiles(activities_completed DESC);
```

**Denormalized Stats Rationale:**

- Avoid expensive SUM queries on every profile view
- Enable leaderboards (top earners, most active)
- Update via triggers on `pulpa_distributions` status change

---

## API Endpoints Specification

### Public Endpoints (No Auth Required)

#### `GET /api/activities`

**Description:** List active activities (public view)

**Query Parameters:**

- `type` (optional): Filter by activity_type
- `category` (optional): Filter by category
- `difficulty` (optional): beginner | intermediate | advanced
- `search` (optional): Full-text search in title/description
- `page` (default: 1): Pagination
- `limit` (default: 24): Items per page

**Response:**

```typescript
{
  success: boolean
  data: {
    activities: Activity[]
    total: number
    page: number
    limit: number
    hasMore: boolean
  }
}

interface Activity {
  id: string
  title: string
  description: string
  activity_type: string
  category: string
  difficulty: string
  reward_pulpa_amount: string
  current_submissions_count: number
  total_available_slots: number | null
  expires_at: string | null
  created_at: string
}
```

---

#### `GET /api/activities/[id]`

**Description:** Get activity details

**Response:**

```typescript
{
  success: boolean
  data: {
    id: string
    title: string
    description: string
    instructions: string
    activity_type: string
    category: string
    difficulty: string
    reward_pulpa_amount: string
    evidence_requirements: {
      url_required: boolean
      screenshot_required: boolean
      text_required: boolean
    }
    max_submissions_per_user: number | null
    total_available_slots: number | null
    current_submissions_count: number
    expires_at: string | null
    created_at: string

    // User-specific data (if authenticated)
    user_has_submitted?: boolean
    user_submission_status?: string
  }
}
```

---

### Authenticated User Endpoints

#### `POST /api/activities/[id]/submit`

**Description:** Submit activity completion proof

**Auth:** Required (Privy JWT)

**Request Body:**

```typescript
{
  submission_url?: string        // Required if evidence_requirements.url_required
  submission_text?: string       // Required if evidence_requirements.text_required
  evidence_files?: File[]        // Required if evidence_requirements.screenshot_required
}
```

**Validation:**

- Check user hasn't already submitted (if max_submissions_per_user === 1)
- Verify activity is active and not expired
- Check total slots not exceeded
- Validate required fields based on evidence_requirements
- File size limits (5MB per file, max 3 files)

**Response:**

```typescript
{
  success: boolean
  data: {
    id: string
    activity_id: string
    status: 'pending'
    submitted_at: string
  }
  message: 'Submission received! An admin will review it soon.'
}
```

---

#### `GET /api/user/submissions`

**Description:** Get current user's submission history

**Auth:** Required

**Query Parameters:**

- `status` (optional): pending | approved | rejected | distributed
- `page`, `limit`

**Response:**

```typescript
{
  success: boolean
  data: {
    submissions: {
      id: string
      activity: {
        id: string
        title: string
        reward_pulpa_amount: string
      }
      status: string
      submission_url: string
      submitted_at: string
      reviewed_at: string | null
      review_notes: string | null
      reward_pulpa_amount: string | null
    }
    ;[]
    stats: {
      total_submissions: number
      approved: number
      pending: number
      rejected: number
      total_pulpa_earned: string
    }
  }
}
```

---

#### `GET /api/user/earnings`

**Description:** Get user's $PULPA earnings summary

**Auth:** Required

**Response:**

```typescript
{
  success: boolean
  data: {
    total_pulpa_earned: string
    activities_completed: number
    pending_distributions: {
      count: number
      total_pulpa_amount: string
    }
    recent_distributions: {
      activity_title: string
      pulpa_amount: string
      distributed_at: string
      transaction_hash: string | null
    }
    ;[]
    wallet_address: string // User's wallet for distributions
  }
}
```

---

### Admin Endpoints

#### `POST /api/admin/activities`

**Description:** Create new activity

**Auth:** Required, role === 'admin'

**Request Body:**

```typescript
{
  title: string
  description: string
  instructions: string
  activity_type: activity_type_enum
  category: string
  difficulty: difficulty_enum
  reward_pulpa_amount: string
  evidence_requirements: {
    url_required: boolean
    screenshot_required: boolean
    text_required: boolean
  }
  verification_type: verification_enum
  max_submissions_per_user?: number
  total_available_slots?: number
  starts_at?: string
  expires_at?: string
  status: 'draft' | 'active'
}
```

**Validation:**

- title: 5-200 chars
- description: 20-2000 chars
- reward_pulpa_amount > 0
- Valid enum values

**Response:**

```typescript
{
  success: boolean
  data: Activity
  message: 'Activity created successfully'
}
```

---

#### `GET /api/admin/activities`

**Description:** List all activities (including drafts)

**Auth:** Required, role === 'admin'

**Query Parameters:**

- `status`: draft | active | paused | completed | cancelled
- `type`, `category`, `search`, `page`, `limit`

**Response:**

```typescript
{
  success: boolean
  data: {
    activities: Activity[]
    stats: {
      total: number
      active: number
      draft: number
      completed: number
    }
  }
}
```

---

#### `PATCH /api/admin/activities/[id]`

**Description:** Update activity

**Auth:** Required, role === 'admin'

**Request Body:** Partial Activity fields

**Response:**

```typescript
{
  success: boolean
  data: Activity
  message: 'Activity updated successfully'
}
```

---

#### `PATCH /api/admin/activities/[id]/status`

**Description:** Change activity status (activate, pause, complete, cancel)

**Auth:** Required, role === 'admin'

**Request Body:**

```typescript
{
  status: 'active' | 'paused' | 'completed' | 'cancelled'
  reason?: string  // Optional admin note
}
```

**Response:**

```typescript
{
  success: boolean
  data: { id: string, status: string }
  message: "Activity status updated to: active"
}
```

---

#### `GET /api/admin/submissions`

**Description:** Admin submission review queue

**Auth:** Required, role === 'admin'

**Query Parameters:**

- `status`: pending | under_review | approved | rejected | distributed
- `activity_id` (optional): Filter by activity
- `user_id` (optional): Filter by user
- `sort`: submitted_at_asc | submitted_at_desc | reward_amount_desc
- `page`, `limit`

**Response:**

```typescript
{
  success: boolean
  data: {
    submissions: {
      id: string
      activity: {
        id: string
        title: string
        activity_type: string
      }
      user: {
        id: string
        username: string
        email: string
        wallet_address: string
      }
      submission_url: string | null
      evidence_files: { url: string, filename: string }[]
      submission_text: string | null
      status: string
      submitted_at: string
    }[]
    stats: {
      pending_count: number
      under_review_count: number
      approved_today: number
    }
  }
}
```

---

#### `GET /api/admin/submissions/[id]`

**Description:** Get submission details for review

**Auth:** Required, role === 'admin'

**Response:**

```typescript
{
  success: boolean
  data: {
    id: string
    activity: Activity
    user: {
      id: string
      username: string
      email: string
      wallet_address: string
      activities_completed: number
      total_pulpa_earned: string
    }
    submission_url: string | null
    evidence_files: { url: string, filename: string, size: number }[]
    submission_text: string | null
    status: string
    submitted_at: string
    metadata: {
      ip_address: string
      user_agent: string
    }
  }
}
```

---

#### `PATCH /api/admin/submissions/[id]/approve`

**Description:** Approve submission

**Auth:** Required, role === 'admin'

**Request Body:**

```typescript
{
  reward_pulpa_amount?: string  // Optional: Override default reward (partial credit)
  review_notes?: string         // Optional feedback
}
```

**Side Effects:**

- Update submission status to 'approved'
- Set reviewed_by_user_id and reviewed_at
- Increment activity.current_submissions_count
- Increment user profile.activities_completed

**Response:**

```typescript
{
  success: boolean
  data: {
    id: string
    status: 'approved'
    reward_pulpa_amount: string
  }
  message: 'Submission approved! Ready for token distribution.'
}
```

---

#### `PATCH /api/admin/submissions/[id]/reject`

**Description:** Reject submission

**Auth:** Required, role === 'admin'

**Request Body:**

```typescript
{
  review_notes: string // Required: Reason for rejection
}
```

**Response:**

```typescript
{
  success: boolean
  data: {
    id: string
    status: 'rejected'
  }
  message: 'Submission rejected'
}
```

---

#### `PATCH /api/admin/submissions/[id]/request-revision`

**Description:** Request changes to submission

**Auth:** Required, role === 'admin'

**Request Body:**

```typescript
{
  review_notes: string // Required: What needs to change
}
```

**Response:**

```typescript
{
  success: boolean
  data: {
    id: string
    status: 'revision_requested'
  }
  message: 'Revision requested. User will be notified.'
}
```

---

#### `POST /api/admin/distributions`

**Description:** Distribute $PULPA tokens (manual or batch)

**Auth:** Required, role === 'admin'

**Request Body:**

```typescript
{
  submission_ids: string[]     // Array of approved submission IDs
  distribution_method: 'manual' | 'smart_contract' | 'claim_portal'
  transaction_hashes?: {       // Required if distribution_method === 'manual'
    [submission_id: string]: string  // Map submission ID to tx hash
  }
}
```

**Workflow:**

1. Validate all submissions are 'approved' status
2. Get user wallet addresses
3. Create distribution records
4. If manual: Admin provides tx hashes after sending
5. Update submission status to 'distributed'
6. Update user profile.total_pulpa_earned

**Response:**

```typescript
{
  success: boolean
  data: {
    distributions_created: number
    total_pulpa_distributed: string
    distributions: {
      submission_id: string
      user_id: string
      wallet_address: string
      pulpa_amount: string
      status: string
    }
    ;[]
  }
  message: '3 distributions created. Total: 150 PULPA'
}
```

---

#### `GET /api/admin/distributions`

**Description:** Distribution history

**Auth:** Required, role === 'admin'

**Query Parameters:**

- `status`: pending | processing | completed | failed
- `method`: manual | smart_contract | claim_portal
- `start_date`, `end_date`
- `page`, `limit`

**Response:**

```typescript
{
  success: boolean
  data: {
    distributions: {
      id: string
      user: { id: string, username: string }
      activity: { id: string, title: string }
      pulpa_amount: string
      distribution_method: string
      status: string
      transaction_hash: string | null
      distributed_at: string | null
    }[]
    stats: {
      total_distributed: string
      pending_count: number
      completed_count: number
      failed_count: number
    }
  }
}
```

---

#### `PATCH /api/admin/distributions/[id]`

**Description:** Update distribution (add tx hash, mark as completed/failed)

**Auth:** Required, role === 'admin'

**Request Body:**

```typescript
{
  status?: 'processing' | 'completed' | 'failed'
  transaction_hash?: string
  error_message?: string
}
```

**Response:**

```typescript
{
  success: boolean
  data: {
    id: string
    status: string
    transaction_hash: string | null
  }
  message: 'Distribution updated successfully'
}
```

---

#### `POST /api/admin/distributions/bulk-distribute`

**Description:** Batch distribute approved submissions (convenience endpoint)

**Auth:** Required, role === 'admin'

**Query:** Auto-select all 'approved' submissions without distributions

**Response:**

```typescript
{
  success: boolean
  data: {
    wallet_addresses: {
      user_id: string
      username: string
      wallet_address: string
      submission_count: number
      total_pulpa_amount: string
    }
    ;[]
    total_recipients: number
    total_pulpa_amount: string
    summary: string // "Send 150 PULPA to 3 users"
  }
  message: 'Review wallet addresses and distribute manually, then mark as completed'
}
```

---

## Frontend UI Components

### User-Facing Components

#### 1. Activities Dashboard (`/activities`)

**Layout:**

- Header: "Earn $PULPA by Learning & Building"
- Filters: Type, Category, Difficulty
- Search bar
- Activity cards (grid layout)

**Activity Card:**

```
┌─────────────────────────────────────┐
│ 🎯 Make Your First GitHub Commit    │
│                                     │
│ Learn Git basics by creating your  │
│ first repository and making a...   │
│                                     │
│ 💰 10 PULPA  |  👥 12/50 completed │
│ 📅 Expires in 7 days               │
│                                     │
│ [View Details →]                   │
└─────────────────────────────────────┘
```

**Features:**

- Real-time slot availability
- Badge for "Already Submitted"
- Difficulty indicators (🟢 Beginner, 🟡 Intermediate, 🔴 Advanced)

---

#### 2. Activity Detail Page (`/activities/[id]`)

**Sections:**

1. **Header:** Title, reward amount, difficulty, expiry
2. **Description:** What the activity is about
3. **Instructions:** Step-by-step guide
4. **Requirements:** What to submit (URL, screenshot, text)
5. **Submission Form** (if user authenticated)
6. **Recent Completions** (leaderboard style, "3 users completed this today")

**Submission Form:**

```typescript
interface SubmissionFormProps {
  activityId: string
  evidenceRequirements: {
    url_required: boolean
    screenshot_required: boolean
    text_required: boolean
  }
}
```

**Form Fields:**

- URL input (with validation for X, GitHub, YouTube based on activity type)
- File upload (drag & drop, image preview)
- Text area (notes, description)
- Submit button

**States:**

- Not authenticated → Show "Login to submit"
- Already submitted → Show submission status
- Slots full → Show "Activity completed"
- Expired → Show "Activity expired"

---

#### 3. User Submissions Page (`/dashboard/submissions`)

**Tabs:**

- All (default)
- Pending
- Approved
- Distributed
- Rejected

**Submission Card:**

```
┌─────────────────────────────────────────────────┐
│ Make Your First GitHub Commit                   │
│ Status: ⏳ Pending Review                        │
│ Submitted: 2 hours ago                          │
│ Reward: 10 PULPA                                │
│                                                 │
│ Your submission: github.com/carlos/my-repo     │
│                                                 │
│ [View Activity] [View Submission]              │
└─────────────────────────────────────────────────┘
```

**Approved State:**

```
┌─────────────────────────────────────────────────┐
│ Share Your Project on X                         │
│ Status: ✅ Approved | 🎉 15 PULPA Earned!       │
│ Reviewed: 1 day ago                             │
│                                                 │
│ Admin note: "Great tweet! Thanks for sharing"  │
│                                                 │
│ Distribution: ⏳ Pending                         │
│ [View Details]                                  │
└─────────────────────────────────────────────────┘
```

---

#### 4. Earnings Dashboard (`/dashboard/earnings`)

**Stats Cards:**

```
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ Total PULPA      │ │ Activities       │ │ Pending          │
│ 245.50 PULPA     │ │ 12 Completed     │ │ 30 PULPA         │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

**Distribution History Table:**
| Activity | Amount | Date | Status | Tx Hash |
|----------|--------|------|--------|---------|
| GitHub Commit | 10 PULPA | Dec 20 | ✅ Completed | 0xabc...123 |
| X Post | 15 PULPA | Dec 22 | ⏳ Pending | - |

**Wallet Info:**

- Connected wallet: `0x1234...5678`
- Chain: Optimism Mainnet
- [View on Optimistic Etherscan →]

---

### Admin Components

#### 1. Admin Activities Management (`/admin/activities`)

**Tabs:**

- Active (default)
- Drafts
- Completed
- All

**Table View:**
| Title | Type | Reward | Submissions | Slots | Status | Actions |
|-------|------|--------|-------------|-------|--------|---------|
| First GitHub Commit | github_commit | 10 PULPA | 12 | 50 | 🟢 Active | Edit / Pause / View |
| Share on X | x_post | 15 PULPA | 8 | - | 🟢 Active | Edit / Pause / View |

**Actions:**

- [+ Create Activity] button (top right)
- Bulk actions: Pause selected, Export to CSV
- Filters: Type, Category, Status

---

#### 2. Activity Creation Form (`/admin/activities/new`)

**Multi-step form:**

**Step 1: Basic Info**

- Title
- Description
- Instructions (markdown editor)
- Category (dropdown)
- Difficulty (radio)

**Step 2: Requirements**

- Activity Type (dropdown with icons)
- Evidence Requirements (checkboxes: URL, Screenshot, Text)
- Verification Type (radio: Manual, Automatic, Hybrid)

**Step 3: Rewards & Limits**

- PULPA Reward Amount (number input with token icon)
- Max submissions per user (optional)
- Total available slots (optional)

**Step 4: Schedule**

- Start date (optional)
- Expiry date (optional)
- Status (Draft or Active)

**Preview Mode:**

- Shows how activity will appear to users
- Test submission form

---

#### 3. Submission Review Queue (`/admin/submissions`)

**Filters:**

- Status (Pending, Under Review, All)
- Activity (dropdown)
- Date range

**Queue View (Card Layout):**

```
┌───────────────────────────────────────────────────┐
│ carlos_dev submitted: Make Your First GitHub Commit │
│ ⏰ 2 hours ago                                      │
│                                                     │
│ URL: github.com/carlos/my-first-repo               │
│ Note: "Created my first React app!"                │
│                                                     │
│ User Info: 3 activities completed, 45 PULPA earned │
│                                                     │
│ [❌ Reject] [⚠️ Request Revision] [✅ Approve]     │
└───────────────────────────────────────────────────┘
```

**Approve Modal:**

- Confirm reward amount (editable for partial credit)
- Optional review notes (visible to user)
- [Cancel] [Approve Submission]

**Reject Modal:**

- Required: Rejection reason (textarea)
- [Cancel] [Reject Submission]

---

#### 4. Distribution Dashboard (`/admin/distributions`)

**Tabs:**

- Pending (submissions approved but not distributed)
- Completed
- Failed

**Pending Distributions (Batch View):**

```
┌─────────────────────────────────────────────────┐
│ Ready for Distribution: 5 submissions           │
│ Total PULPA: 75 PULPA                           │
│                                                 │
│ Recipients:                                     │
│ • carlos_dev: 10 PULPA → 0x1234...5678         │
│ • sofia_crypto: 15 PULPA → 0xabcd...ef01       │
│ • miguel_ai: 20 PULPA → 0x9876...4321          │
│ • ana_dev: 10 PULPA → 0xdef0...abc1            │
│ • juan_builder: 20 PULPA → 0x5555...6666       │
│                                                 │
│ [Export CSV] [Copy Addresses] [Distribute]     │
└─────────────────────────────────────────────────┘
```

**Manual Distribution Flow:**

1. Admin clicks "Distribute"
2. Modal shows summary + instructions:

   ```
   Send $PULPA tokens to these addresses:

   1. Send 10 PULPA to 0x1234...5678
   2. Send 15 PULPA to 0xabcd...ef01
   ...

   After sending, paste transaction hashes below:

   [Submission 1 Tx Hash: ________________]
   [Submission 2 Tx Hash: ________________]
   ...

   [Cancel] [Mark as Distributed]
   ```

3. System updates distribution records with tx hashes
4. Updates submission status to 'distributed'

---

#### 5. Analytics Dashboard (`/admin/analytics`)

**Key Metrics:**

- Total PULPA distributed (all-time, this month)
- Active users completing activities
- Most popular activity types
- Average approval time
- Distribution success rate

**Charts:**

- PULPA distribution over time (line chart)
- Activity type breakdown (pie chart)
- User engagement funnel (submissions → approvals → distributions)

---

## File Upload System

### Vercel Blob Storage Integration

**Configuration:**

```typescript
// src/lib/upload/blob-config.ts
import { put } from '@vercel/blob'

export const uploadConfig = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4'],
  maxFiles: 3,
}

export async function uploadEvidenceFile(file: File, submissionId: string) {
  // Validate file
  if (file.size > uploadConfig.maxFileSize) {
    throw new Error('File too large (max 5MB)')
  }

  if (!uploadConfig.allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type')
  }

  // Upload to Vercel Blob
  const blob = await put(`submissions/${submissionId}/${file.name}`, file, {
    access: 'public',
  })

  return {
    url: blob.url,
    filename: file.name,
    size: file.size,
    type: file.type,
  }
}
```

**Upload Flow:**

1. User selects file in submission form
2. Frontend validates file (size, type, count)
3. POST to `/api/submissions/upload-evidence`
4. Server uploads to Vercel Blob
5. Returns file URL
6. Frontend stores URL in `evidence_files` array
7. Submits with full submission data

---

## Smart Contract Integration (Future Phase 2)

### Current Phase (Manual Distribution)

**Process:**

1. Admin approves submissions in dashboard
2. Admin clicks "Distribute" → gets list of wallet addresses + amounts
3. Admin uses MetaMask to send $PULPA tokens manually
4. Admin pastes transaction hashes into distribution form
5. System records tx hashes and marks as distributed

**Pros:**

- No smart contract development needed
- Immediate launch possible
- Full control over distributions

**Cons:**

- Manual process, doesn't scale
- Gas fees paid by admin
- No automated verification

---

### Phase 2: Smart Contract Automation

**Escrow Contract Design:**

```solidity
// PulpaDistributor.sol
contract PulpaDistributor {
    address public admin;
    IERC20 public pulpaToken;

    mapping(bytes32 => bool) public distributedSubmissions;

    event Distributed(
        bytes32 indexed submissionId,
        address indexed recipient,
        uint256 amount
    );

    function distributeRewards(
        bytes32[] calldata submissionIds,
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external onlyAdmin {
        require(submissionIds.length == recipients.length, "Length mismatch");
        require(recipients.length == amounts.length, "Length mismatch");

        for (uint256 i = 0; i < submissionIds.length; i++) {
            require(!distributedSubmissions[submissionIds[i]], "Already distributed");

            pulpaToken.transfer(recipients[i], amounts[i]);
            distributedSubmissions[submissionIds[i]] = true;

            emit Distributed(submissionIds[i], recipients[i], amounts[i]);
        }
    }

    function withdraw(uint256 amount) external onlyAdmin {
        pulpaToken.transfer(admin, amount);
    }
}
```

**Workflow:**

1. Admin deposits $PULPA into contract
2. Admin approves submissions in dashboard
3. System calls `distributeRewards()` with batch data
4. Contract transfers tokens + emits events
5. System listens for events, updates database

---

### Phase 3: User-Claimable Rewards

**Benefits:**

- Users pay their own gas fees
- Admin doesn't need to batch send
- On-demand distribution

**Claim Contract:**

```solidity
contract PulpaClaimPortal {
    struct Claim {
        address recipient;
        uint256 amount;
        bool claimed;
    }

    mapping(bytes32 => Claim) public claims;

    function createClaim(
        bytes32 submissionId,
        address recipient,
        uint256 amount
    ) external onlyAdmin {
        claims[submissionId] = Claim(recipient, amount, false);
    }

    function claimReward(bytes32 submissionId) external {
        Claim storage claim = claims[submissionId];
        require(msg.sender == claim.recipient, "Not authorized");
        require(!claim.claimed, "Already claimed");

        claim.claimed = true;
        pulpaToken.transfer(claim.recipient, claim.amount);
    }
}
```

---

## Implementation Roadmap

### Phase 1: MVP (2-3 weeks)

**Week 1: Database & API**

- ✅ Create database schema (activities, submissions, distributions)
- ✅ Run migrations
- ✅ Build API endpoints (activities CRUD, submissions, admin review)
- ✅ Implement authentication middleware
- ✅ Add Vercel Blob upload integration

**Week 2: Admin Dashboard**

- ✅ Activity creation form
- ✅ Activity management table
- ✅ Submission review queue
- ✅ Approve/reject/revision workflows
- ✅ Manual distribution dashboard

**Week 3: User Interface**

- ✅ Activities browse page
- ✅ Activity detail + submission form
- ✅ User submissions history
- ✅ Earnings dashboard
- ✅ Testing & bug fixes

**Definition of Done (Phase 1):**

- Admin can create activities
- Users can submit proofs
- Admin can review and approve
- Admin can manually distribute $PULPA
- System tracks everything in database
- Basic analytics for admin

---

### Phase 2: Automation (4-6 weeks)

**Features:**

- Smart contract deployment (Optimism Mainnet)
- Automated batch distributions
- X API integration (auto-verify tweets)
- GitHub API integration (auto-verify commits)
- Email notifications (submission approved, tokens distributed)
- Advanced analytics dashboard

**Definition of Done (Phase 2):**

- Smart contract deployed and audited
- One-click batch distributions
- Automatic verification for 50%+ of submissions
- Email notifications working
- Admin analytics showing trends

---

### Phase 3: Scale & Gamification (6-8 weeks)

**Features:**

- User-claimable rewards (claim portal)
- Leaderboards (top earners, most active)
- Achievement badges ("First Committer", "Social Sharer")
- Activity templates (quick-create common tasks)
- Multi-admin workflows (approval chains)
- API webhooks for external integrations

---

## Testing Strategy

### Unit Tests

**Database Queries:**

```typescript
describe('Activity Queries', () => {
  test('creates activity with valid data', async () => {
    const activity = await createActivity({
      title: 'Test Activity',
      activity_type: 'github_commit',
      reward_pulpa_amount: '10.0',
      // ...
    })

    expect(activity.title).toBe('Test Activity')
  })

  test('prevents duplicate submissions', async () => {
    await expect(submitActivity(activityId, userId)).rejects.toThrow('Already submitted')
  })
})
```

**API Endpoints:**

```typescript
describe('POST /api/activities/:id/submit', () => {
  test('creates submission with valid proof', async () => {
    const res = await fetch('/api/activities/abc-123/submit', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({
        submission_url: 'https://github.com/user/repo',
        submission_text: 'My first repo!',
      }),
    })

    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data.data.status).toBe('pending')
  })
})
```

---

### Integration Tests

**End-to-End Workflows:**

```typescript
describe('Activity Completion Flow', () => {
  test('user submits, admin approves, tokens distributed', async () => {
    // 1. Create activity (admin)
    const activity = await adminCreateActivity()

    // 2. Submit proof (user)
    const submission = await userSubmitActivity(activity.id)
    expect(submission.status).toBe('pending')

    // 3. Approve submission (admin)
    const approved = await adminApproveSubmission(submission.id)
    expect(approved.status).toBe('approved')

    // 4. Distribute tokens (admin)
    const distribution = await adminDistributeTokens([submission.id])
    expect(distribution.status).toBe('completed')

    // 5. Verify user profile updated
    const profile = await getUserProfile(userId)
    expect(profile.total_pulpa_earned).toBe('10.0')
    expect(profile.activities_completed).toBe(1)
  })
})
```

---

### Manual Testing Checklist

**Admin Workflows:**

- [ ] Create draft activity → Save → Activate
- [ ] Edit active activity → Save
- [ ] Pause activity → Verify no new submissions accepted
- [ ] View submission queue → Filter by status
- [ ] Approve submission → Verify status change
- [ ] Reject submission → Verify user notified
- [ ] Request revision → User can resubmit
- [ ] Batch distribute → Verify tx hashes recorded
- [ ] View analytics → Charts display correctly

**User Workflows:**

- [ ] Browse activities → Filter by type
- [ ] View activity detail → See requirements
- [ ] Submit proof (URL only) → Success
- [ ] Submit proof (URL + screenshot) → Files upload
- [ ] Attempt duplicate submission → Blocked
- [ ] View submission history → All statuses visible
- [ ] Approved submission → See pending distribution
- [ ] Distributed submission → See tx hash

---

## Security Considerations

### Authentication & Authorization

**API Security:**

- All admin endpoints verify `user.role === 'admin'`
- Privy JWT tokens validated server-side
- No client-side role checks (can be spoofed)

**Middleware:**

```typescript
// src/lib/auth/middleware.ts
export async function requireAdmin(req: Request) {
  const user = await verifyPrivyToken(req)

  if (!user) {
    throw new UnauthorizedError('Authentication required')
  }

  if (user.role !== 'admin') {
    throw new ForbiddenError('Admin access required')
  }

  return user
}
```

---

### Input Validation

**Zod Schemas:**

```typescript
// src/lib/validators/activity.ts
import { z } from 'zod'

export const createActivitySchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(20).max(2000),
  activity_type: z.enum([
    'github_commit',
    'x_post',
    'photo',
    'video',
    'blog_post',
    'workshop_completion',
    'build_in_public',
    'code_review',
    'custom',
  ]),
  reward_pulpa_amount: z
    .string()
    .regex(/^\d+(\.\d{1,8})?$/)
    .refine((val) => parseFloat(val) > 0),
  // ...
})

export const submitActivitySchema = z
  .object({
    submission_url: z.string().url().optional(),
    submission_text: z.string().max(1000).optional(),
    evidence_files: z.array(z.any()).max(3).optional(),
  })
  .refine((data) => {
    // At least one field must be provided
    return (
      data.submission_url ||
      data.submission_text ||
      (data.evidence_files && data.evidence_files.length > 0)
    )
  })
```

---

### Rate Limiting

**Prevent Spam Submissions:**

```typescript
// src/lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 h'), // 5 submissions per hour
})

export async function checkSubmissionRateLimit(userId: string) {
  const { success, remaining } = await ratelimit.limit(`submissions:${userId}`)

  if (!success) {
    throw new Error(`Rate limit exceeded. Try again in 1 hour. (${remaining} remaining)`)
  }
}
```

---

### File Upload Security

**Validation:**

- File type whitelist (images, videos only)
- File size limit (5MB per file)
- Scan for malware (ClamAV integration, future)
- Generate random filenames (prevent path traversal)

**Vercel Blob Security:**

- Files stored with `public` access (for evidence viewing)
- CDN-delivered (fast, secure)
- Automatic HTTPS

---

### SQL Injection Prevention

**Drizzle ORM Parameterization:**

```typescript
// ❌ NEVER do this
const results = await db.execute(sql`SELECT * FROM activities WHERE title = '${userInput}'`)

// ✅ Always use parameterized queries
const results = await db.select().from(activities).where(eq(activities.title, userInput))
```

---

## Monitoring & Analytics

### Application Monitoring

**Error Tracking (Sentry):**

```typescript
// src/lib/monitoring/sentry.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
})

export function captureDistributionError(error: Error, distribution: Distribution) {
  Sentry.captureException(error, {
    tags: {
      distribution_id: distribution.id,
      method: distribution.distribution_method,
    },
    extra: {
      pulpa_amount: distribution.pulpa_amount,
      user_id: distribution.user_id,
    },
  })
}
```

---

### Key Metrics

**Track:**

- Total activities created
- Total submissions received
- Approval rate (approved / total submissions)
- Average approval time
- Total $PULPA distributed
- Active users (submitted in last 7 days)
- Distribution success rate
- Failed distributions (retry count)

**Alerts:**

- Failed distribution (tx failed)
- High rejection rate (> 50%)
- Slow approval time (> 24 hours for pending)
- Low activity completion (< 10% of slots filled)

---

## Deployment Strategy

### Environment Variables

```bash
# .env.local (development)
DATABASE_URL=postgresql://...
DATABASE_URL_UNPOOLED=postgresql://...

NEXT_PUBLIC_PULPA_TOKEN_ADDRESS=0x029263aA1BE88127f1794780D9eEF453221C2f30
NEXT_PUBLIC_PULPA_TOKEN_CHAIN_ID=10

NEXT_PUBLIC_PRIVY_APP_ID=...
PRIVY_APP_SECRET=...

BLOB_READ_WRITE_TOKEN=...  # Vercel Blob

SENTRY_DSN=...              # Error tracking

# Production only
UPSTASH_REDIS_URL=...       # Rate limiting
```

---

### Database Migrations

**Migration File:** `drizzle/migrations/0004_add_pulpa_activities.sql`

```sql
-- Create enums
CREATE TYPE activity_type_enum AS ENUM (...);
CREATE TYPE difficulty_enum AS ENUM (...);
CREATE TYPE activity_status_enum AS ENUM (...);
CREATE TYPE submission_status_enum AS ENUM (...);
CREATE TYPE distribution_method_enum AS ENUM (...);
CREATE TYPE distribution_status_enum AS ENUM (...);

-- Create tables
CREATE TABLE activities (...);
CREATE TABLE activity_submissions (...);
CREATE TABLE pulpa_distributions (...);

-- Add indexes
CREATE INDEX idx_activities_status ON activities(status);
...

-- Update profiles table
ALTER TABLE profiles ADD COLUMN total_pulpa_earned DECIMAL(18, 8) DEFAULT 0 NOT NULL;
ALTER TABLE profiles ADD COLUMN activities_completed INTEGER DEFAULT 0 NOT NULL;
```

**Run Migration:**

```bash
bun run db:generate  # Generate migration from schema
bun run db:migrate   # Apply to database
```

---

### Vercel Deployment

**Configuration:**

- Auto-deploy from `main` branch
- Environment variables synced from Vercel dashboard
- Build command: `bun run build`
- Output directory: `.next`

**Preview Deployments:**

- Every PR gets preview URL
- Test new features before merging

---

## Cost Estimation

### Infrastructure Costs (Monthly)

| Service                           | Usage              | Cost           |
| --------------------------------- | ------------------ | -------------- |
| **Vercel Hosting**                | Pro plan           | $20/month      |
| **Neon DB (PostgreSQL)**          | Scale tier         | $19/month      |
| **Vercel Blob Storage**           | 100GB, 1M requests | $15/month      |
| **Sentry (Error Tracking)**       | Team plan          | $26/month      |
| **Upstash Redis** (Rate Limiting) | Pay-as-you-go      | ~$5/month      |
| **Total**                         |                    | **~$85/month** |

---

### Token Distribution Costs

**Gas Fees (Optimism):**

- ERC-20 transfer: ~0.0001 ETH (~$0.30 at $3000 ETH)
- Batch transfer (10 recipients): ~0.0005 ETH (~$1.50)

**Scenarios:**

- 100 distributions/month (manual): ~$30/month in gas
- 1000 distributions/month (smart contract batching): ~$150/month

**Cost Optimization:**

- Batch distributions weekly (reduce tx count)
- Use smart contract for batches > 10 recipients
- Consider user-claimable rewards (users pay gas)

---

## Open Questions & Decisions

### 1. Activity Approval Workflow

**Question:** Should all activities be auto-published, or require admin review?

**Options:**

- **A)** Admin creates → immediately active (current design)
- **B)** Admin creates → draft → admin or senior admin approves → active

**Recommendation:** Option A for MVP (single admin), Option B for multi-admin setup

---

### 2. Submission Editing

**Question:** Can users edit rejected submissions, or must they create new submissions?

**Options:**

- **A)** Users can edit and resubmit (status: `revision_requested`)
- **B)** Users must submit new entry (old submission stays rejected)

**Recommendation:** Option A (better UX, less spam)

---

### 3. Token Distribution Timing

**Question:** When should tokens be distributed after approval?

**Options:**

- **A)** Immediately after approval (real-time)
- **B)** Daily batch (admin distributes once per day)
- **C)** Weekly batch (admin distributes Fridays)

**Recommendation:** Option B for MVP (manageable), Option A with smart contract in Phase 2

---

### 4. Public Visibility

**Question:** Should activity submissions be public (visible to other users)?

**Options:**

- **A)** Public (shows "12 users completed this")
- **B)** Private (only user and admin see submissions)
- **C)** Configurable per activity

**Recommendation:** Option A (social proof, encourages participation)

---

### 5. Multi-Language Support

**Question:** Should activities support multiple languages (Spanish, English)?

**Options:**

- **A)** English only (MVP)
- **B)** Admin can set language per activity
- **C)** Full i18n with translations

**Recommendation:** Option A for MVP, Option B for Phase 2 (Latin America focus)

---

## Success Metrics (3 Months Post-Launch)

### User Engagement

- **Target:** 60% of registered users complete at least 1 activity
- **Measure:** `COUNT(DISTINCT user_id) FROM activity_submissions / total_users`

### Activity Completion Rate

- **Target:** 70% of active activities have > 10 submissions
- **Measure:** `COUNT(activities WHERE submissions > 10) / total_active_activities`

### Approval Rate

- **Target:** 80% approval rate (indicates clear instructions)
- **Measure:** `approved_submissions / total_submissions`

### Distribution Efficiency

- **Target:** < 48 hours from approval to distribution
- **Measure:** `AVG(distributed_at - reviewed_at)`

### Token Distribution

- **Target:** 10,000 $PULPA distributed in 3 months
- **Measure:** `SUM(pulpa_amount) FROM pulpa_distributions WHERE status = 'completed'`

### User Retention

- **Target:** 40% of users who complete 1 activity complete 3+ activities
- **Measure:** Cohort analysis of activity completion

---

## Appendix

### A. Activity Type Templates

#### GitHub Commit

```yaml
title: 'Make Your First GitHub Commit'
activity_type: github_commit
evidence_requirements:
  url_required: true
  screenshot_required: false
  text_required: true
instructions: |
  1. Create a GitHub account if you don't have one
  2. Create a new repository
  3. Make your first commit (README.md file)
  4. Submit the repository URL below
  5. Include a brief description of your project
reward: 10 PULPA
```

#### X Post

```yaml
title: 'Share Your #BuildInPublic Progress'
activity_type: x_post
evidence_requirements:
  url_required: true
  screenshot_required: true
  text_required: false
instructions: |
  1. Write a tweet about your learning progress
  2. Include the hashtag #BuildInPublic
  3. Mention @fruteroclub
  4. Submit the tweet URL and screenshot
reward: 15 PULPA
```

#### Workshop Completion

```yaml
title: 'Complete the Web3 Basics Workshop'
activity_type: workshop_completion
evidence_requirements:
  url_required: false
  screenshot_required: true
  text_required: true
instructions: |
  1. Attend the full workshop (2 hours)
  2. Take a photo during the workshop
  3. Write a brief summary of what you learned (100-200 words)
  4. Submit photo + summary
reward: 50 PULPA
```

---

### B. Sample API Responses

#### GET /api/activities?type=github_commit

```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "title": "Make Your First GitHub Commit",
        "description": "Learn Git basics by creating your first repository and making a commit.",
        "activity_type": "github_commit",
        "category": "Learning Milestones",
        "difficulty": "beginner",
        "reward_pulpa_amount": "10.0",
        "current_submissions_count": 12,
        "total_available_slots": 50,
        "expires_at": "2025-12-31T23:59:59Z",
        "created_at": "2025-12-20T10:00:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 24,
    "hasMore": false
  }
}
```

---

### C. Database Triggers

#### Update Profile Stats on Distribution

```sql
CREATE OR REPLACE FUNCTION update_profile_pulpa_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    UPDATE profiles
    SET
      total_pulpa_earned = total_pulpa_earned + NEW.pulpa_amount,
      activities_completed = activities_completed + 1
    WHERE user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_profile_pulpa_stats
  AFTER INSERT OR UPDATE ON pulpa_distributions
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_pulpa_stats();
```

---

### D. Admin Dashboard Queries

#### Pending Submissions Queue

```sql
SELECT
  s.id,
  s.submitted_at,
  a.title AS activity_title,
  a.reward_pulpa_amount,
  u.username,
  u.email,
  u.app_wallet AS wallet_address,
  p.activities_completed,
  p.total_pulpa_earned
FROM activity_submissions s
JOIN activities a ON s.activity_id = a.id
JOIN users u ON s.user_id = u.id
JOIN profiles p ON u.id = p.user_id
WHERE s.status = 'pending'
ORDER BY s.submitted_at ASC
LIMIT 50;
```

#### Distribution Summary

```sql
SELECT
  COUNT(*) AS pending_distributions,
  SUM(s.reward_pulpa_amount) AS total_pulpa_pending
FROM activity_submissions s
WHERE s.status = 'approved'
  AND NOT EXISTS (
    SELECT 1 FROM pulpa_distributions d
    WHERE d.submission_id = s.id
  );
```

---

## Final Notes

### Implementation Priority

**Must Have (MVP):**

- Activity CRUD (admin)
- Submission system (user)
- Manual review (admin)
- Manual distribution tracking
- Basic dashboards

**Should Have (Phase 2):**

- Smart contract automation
- Automatic verification (X API, GitHub API)
- Email notifications
- Advanced analytics

**Nice to Have (Phase 3):**

- User-claimable rewards
- Multi-language support
- Leaderboards & badges
- Activity templates library

---

### Development Team Allocation

**Backend Developer (40% time):**

- Database schema & migrations
- API endpoint implementation
- Vercel Blob integration
- Admin endpoints

**Frontend Developer (50% time):**

- User activity pages
- Submission forms
- Admin dashboards
- Distribution interfaces

**Full-Stack Developer (10% time):**

- Authentication middleware
- Testing & QA
- Deployment & DevOps

**Total Estimated Effort:** 3-4 weeks for MVP (1 developer full-time)

---

**Document Status:** ✅ Ready for Development
**Next Steps:**

1. Review with product team (30-min meeting)
2. Create implementation tickets (following PRD format)
3. Set up development environment (database, env vars)
4. Start with database schema migration
5. Build API endpoints (week 1)
6. Build admin dashboard (week 2)
7. Build user interface (week 3)
8. Testing & launch (week 4)

---

**Questions or Feedback?**
Contact: [Your Team Lead]
