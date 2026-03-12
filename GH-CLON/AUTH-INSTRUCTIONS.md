# GitHub CLI Authentication Instructions

## GitHub CLI (gh) Auth Instructions

### Current Issue
The current token doesn't have the required scopes for GitHub Codespaces API or `gh auth login`.

### Solution: Sultan, you need to create a new token with correct scopes.

---

## Required Scopes for Codespaces

For GitHub CLI to access Codespaces, you need a personal access token with these scopes:

### Minimum Required:
- `repo` (Full control of private repositories)
- `codespace` (Full control of codespaces)
- `workflow` (Update GitHub Action workflows)

### Recommended Full Access:
- `repo` - Full control of repositories
- `codespace` - Full control of codespaces
- `user` - Update user profile data
- `workflow` - Update GitHub Actions
- `delete_repo` - Delete repositories
- `admin:org` - Administer org (if part of one)

---

## How to Create New Token

### Step 1: Go to GitHub Settings
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"

### Step 2: Configure Token
- **Note:** `Ultimate AI Assistant - Codespaces`
- **Expiration:** 90 days (recommended) or No expiration
- **Select scopes:**
  - ✅ `repo` (Full control of private repositories)
  - ✅ `codespace` (Full control of codespaces)
  - ✅ `workflow` (Update GitHub Action workflows)
  - ✅ `admin:org` (if in an organization)
  - ✅ `user` (Update user profile data)

### Step 3: Generate and Copy
1. Click "Generate token"
2. **COPY THE TOKEN NOW** (You won't see it again!)
3. Provide it to me

---

## After New Token

Once you provide a new token with correct scopes, I can:

### Create Codespace
```bash
gh auth login --with-token <<< YOUR_NEW_TOKEN
gh codespace create --repo SultanAiMaster/ultimate-ai-assistant
```

### List Codespaces
```bash
gh codespace list
```

### Connect to Codespace
```bash
gh codespace ssh
```

---

## Alternative: Manual Web UI (No Token Needed)

Since GitHub CLI auth is tricky, you can create Codespace manually:

### Manual Steps:
1. Go to: https://github.com/SultanAiMaster/ultimate-ai-assistant
2. Click green "Code" button (top right)
3. Select "Codespaces" tab
4. Click "New codespace"
5. Configure:
   - **Machine:** Standard (4 cores, 16 GB RAM) - RECOMMENDED
   - **Location:** West US 2 (or nearest)
   - **Timeout:** Keep active (for development)
6. Click "Create codespace"

### Benefits:
- ✅ No token required
- ✅ Full VS Code in browser
- ✅ Pre-configured environment
- ✅ Easy to use

---

## Your Choice, Sultan

**Option A:** Create new token with correct scopes (I'll then use GitHub CLI)
**Option B:** Create Codespace manually via web (easier, no token needed)
**Option C:** Build directly in current server (simpler, no Codespace needed)

---

## Recommendation: Option B or C

**I recommend Option C (Build in current server)** because:
- ✅ Environment already ready
- ✅ No authentication issues
- ✅ Direct control
- ✅ MongoDB/Redis available
- ✅ Faster development

**But if you prefer Codespace, use Option B (Manual Web)**

---

**Sultan, batao - kaunsa option lena hai?** 🤔
