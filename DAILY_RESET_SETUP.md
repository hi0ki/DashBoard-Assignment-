# Daily Credit Reset - Deployment Instructions

## 🔄 Automatic Daily Reset System

Your InfiniteByte Dashboard now has a daily credit reset system that gives every user 50 fresh credits each day at midnight.

### ✅ How It Works:

1. **Database Tracking**: Added `lastResetDate` field to track when each user was last reset
2. **Auto-Reset on Access**: When users visit the app, their credits automatically reset if it's a new day
3. **Cron Job Endpoint**: `/api/cron/daily-reset` for scheduled resets

### 🚀 Setup on Vercel:

1. **Add Environment Variable**:
   ```
   CRON_SECRET=your-secret-token-here
   ```

2. **Create Vercel Cron Job**:
   Create `vercel.json` in your project root:
   ```json
   {
     "crons": [
       {
         "path": "/api/cron/daily-reset",
         "schedule": "0 0 * * *"
       }
     ]
   }
   ```

3. **Manual Trigger** (for testing):
   ```bash
   curl -X POST https://your-app.vercel.app/api/cron/daily-reset \
     -H "Authorization: Bearer your-secret-token-here"
   ```

### 🎯 What Users Experience:

- **Day 1**: User gets 50 credits, uses 30 → 20 remaining
- **Day 2**: User opens app → automatically reset to 50 credits
- **Every day**: Fresh 50 credits at midnight or first access

### 📊 Benefits:

- **Automatic**: No manual intervention needed
- **Fair**: Everyone gets same daily limit
- **Engagement**: Users return daily for fresh credits
- **Scalable**: Works for unlimited users

### 🔧 Alternative Setup (GitHub Actions):

If you prefer GitHub Actions instead of Vercel Cron:

```yaml
name: Daily Credit Reset
on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight UTC
jobs:
  reset:
    runs-on: ubuntu-latest
    steps:
      - name: Reset Credits
        run: |
          curl -X POST ${{ secrets.APP_URL }}/api/cron/daily-reset \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

**Your users now get 50 fresh credits every day! 🎉**