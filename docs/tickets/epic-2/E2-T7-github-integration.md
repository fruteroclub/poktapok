# E2-T7: GitHub Repository Integration

**Epic:** Epic 2 - Portfolio Showcase
**Story Points:** 3
**Status:** ⏭️ Deferred to Post-MVP
**Deferred:** Dec 27, 2024
**Assignee:** TBD (Post-MVP)
**Dependencies:** E2-T2 (Project Form exists)
**Priority:** Medium (Nice-to-have, deferred)

---

## Objective

Auto-fetch project data from GitHub repositories to streamline project creation.

---

## Acceptance Criteria

### GitHub URL Detection

- [ ] Detect GitHub URL in repository field
- [ ] "Fetch from GitHub" button appears
- [ ] Loading state during fetch
- [ ] Fallback to manual if fetch fails

### Data Fetching

- [ ] Fetch repository data via GitHub API
- [ ] Extract: name, description, topics, README
- [ ] Parse README.md (first 280 chars as description)
- [ ] Map repo topics → suggest skills
- [ ] Display preview before applying

### API Integration

- [ ] Use GitHub token from `.env` (`GITHUB_TOKEN`)
- [ ] Handle API rate limits gracefully
- [ ] Error handling for private repos, 404s, etc.
- [ ] One-time fetch (not periodic updates)

### User Experience

- [ ] "Auto-fill from GitHub" button
- [ ] Preview modal showing fetched data
- [ ] User can accept or manually edit
- [ ] Works with GitHub, GitLab URLs

---

## GitHub API Usage

```typescript
// Fetch repository data
async function fetchGitHubRepo(url: string) {
  // Parse owner/repo from URL
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/)
  if (!match) throw new Error('Invalid GitHub URL')

  const [, owner, repo] = match

  // Fetch repo data
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: {
      Authorization: `token ${process.env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
    },
  })

  if (!response.ok) throw new Error('Failed to fetch repo')

  const data = await response.json()

  return {
    title: data.name,
    description: data.description || '',
    topics: data.topics || [], // Map to skills
    stars: data.stargazers_count,
    language: data.language,
  }
}

// Fetch README
async function fetchReadme(owner: string, repo: string) {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
    headers: {
      Authorization: `token ${process.env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3.raw',
    },
  })

  if (!response.ok) return null

  const readme = await response.text()
  return readme.slice(0, 280) // First 280 chars
}
```

---

## Skill Mapping

```typescript
// Map GitHub topics to Poktapok skills
const topicToSkillMap = {
  react: 'React',
  nextjs: 'Next.js',
  typescript: 'TypeScript',
  nodejs: 'Node.js',
  solidity: 'Solidity',
  ethereum: 'Ethereum',
  web3: 'Web3',
  // ... more mappings
}

function mapTopicsToSkills(topics: string[]) {
  return topics.map((topic) => topicToSkillMap[topic.toLowerCase()]).filter(Boolean)
}
```

---

## UI Component

```typescript
<GitHubFetch
  repositoryUrl={form.watch('repositoryUrl')}
  onFetch={(data) => {
    form.setValue('title', data.title)
    form.setValue('description', data.description)
    form.setValue('skillIds', data.suggestedSkills)
  }}
  onError={(error) => {
    toast.error(error.message)
  }}
/>
```

---

## Testing Checklist

- [ ] Fetch public GitHub repo successfully
- [ ] Handle private repos (403 error)
- [ ] Handle non-existent repos (404 error)
- [ ] Parse README correctly
- [ ] Map topics to skills
- [ ] Rate limit handling (429 error)
- [ ] Fallback to manual entry if fetch fails

---

## Success Criteria

- ✅ GitHub repos can be auto-fetched
- ✅ Title, description, skills suggested
- ✅ README parsed for description
- ✅ Error handling for edge cases
- ✅ User can override fetched data

---

## Notes

- GitHub API rate limit: 5000 req/hr (authenticated)
- One-time fetch, not periodic updates
- Can defer to post-MVP if time-constrained

---

## Deferral Decision Summary

**Date:** December 27, 2024
**Decision:** Defer to post-MVP
**Reason:** Technical limitation with Privy authentication

### Analysis Findings

**Privy Limitation Discovered:**

- Privy provides only basic GitHub profile data (email, username, avatar)
- **Privy does NOT expose OAuth access tokens** for third-party services
- Cannot access user's GitHub repositories via Privy authentication alone

### Implementation Options Analyzed

**Option 1: Server-Side Token (Evaluated)**

- Use platform's GitHub Personal Access Token
- Access public repositories only
- No user-specific permissions
- **Limitation:** Cannot access user's private repos, uses shared rate limit

**Option 2: Separate GitHub OAuth (Recommended for Post-MVP)**

- Implement GitHub App or OAuth App
- Store user's GitHub access token (encrypted)
- Full user-specific repository access
- Private repo access with user consent
- Per-user rate limits
- **Complexity:** Requires additional OAuth flow, token management, security considerations

**Option 3: Hybrid Approach (Future Enhancement)**

- Server token for public repos (no auth)
- Optional GitHub OAuth connection for private repos
- Progressive enhancement based on user needs

### MVP Justification for Deferral

**Current Manual Flow is Sufficient:**

1. User pastes GitHub URL in repository field
2. User copies description from README manually
3. User selects skills from dropdown (based on tech used)
4. Full user control over project presentation

**Benefits of Manual Entry:**

- Complete control over project description
- No dependency on external APIs
- No rate limit concerns
- Simpler, more reliable UX

**Post-MVP Enhancement Value:**

- Auto-fill saves user time (convenience, not critical)
- Skill suggestions from topics (nice-to-have)
- Better UX for users adding many projects
- Requires user demand to justify complexity

### Future Implementation Recommendation

When implementing post-MVP:

1. Create GitHub OAuth App in organization settings
2. Implement `/api/auth/github/connect` OAuth flow
3. Store encrypted access tokens in database (`github_tokens` table)
4. Create `/api/github/fetch-repo` endpoint with user token
5. Add "Connect GitHub" option in settings
6. Show "Import from GitHub" in project form when connected

**Estimated Effort (Post-MVP):** 3-4 days (OAuth + token management + security)

---

**Estimated Time:** 1-2 days (original), 3-4 days (with GitHub OAuth)
**Complexity:** Medium → High (requires separate OAuth implementation)
**Priority:** Medium (Nice-to-have, deferred to post-MVP)
