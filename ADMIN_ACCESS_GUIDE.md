# Admin Panel Access & Setup

## What's Ready

Your SkillBridge platform is fully built with a complete admin panel at `/admin`. Here's what's included:

### Admin Features

1. **Job Management**
   - Create new jobs with title, description, detailed instructions
   - Set payment amounts in USD
   - Choose difficulty levels (Easy, Medium, Hard)
   - Assign required membership tiers (Regular, Pro, VIP)
   - Specify estimated completion times
   - Categorize jobs from 22 pre-loaded categories
   - Edit and delete existing jobs
   - Toggle job active/inactive status

2. **Submission Review**
   - View all pending job submissions from freelancers
   - Review submission content
   - Approve or reject submissions
   - Add admin feedback to submissions
   - Track payment amounts per submission

3. **Dashboard Statistics**
   - Total jobs created
   - Active jobs count
   - Pending reviews count
   - Total categories available
   - Recent job activity
   - Pending review queue

## Accessing the Admin Panel

### 1. Add Supabase Credentials

Edit `.env.local`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 2. Start the Application

```bash
npm run dev
```

Visit: `http://localhost:5173`

### 3. Create Your First Admin Account

1. Go to your **Supabase Dashboard** → **Authentication** → **Users**
2. Click **"Add user"**
3. Enter one of your admin emails (e.g., `skillbridge0001@gmail.com`)
4. Set a password
5. User is auto-verified by email verification trigger

### 4. Assign Admin Role

In your **Supabase SQL Editor**, run:

```sql
-- Replace the email with your actual admin email
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users
WHERE email = 'skillbridge0001@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM public.user_roles
  WHERE user_id = auth.users.id
);
```

### 5. Log In & Access Admin Panel

1. Go to `/auth`
2. Log in with admin email and password
3. Navigate to `/admin` - Admin Dashboard loads
4. Start creating jobs!

## Creating Your First Job

1. On Admin Dashboard, click **"Create Job"**
2. Fill in:
   - **Title**: What is the job about?
   - **Description**: Brief overview
   - **Instructions**: Detailed steps for completion
   - **Payment Amount**: How much in USD?
   - **Estimated Time**: e.g., "2 hours"
   - **Difficulty**: Easy/Medium/Hard
   - **Required Tier**: Who can take this job?
   - **Category**: What category does it belong to?
3. Click **"Create Job"**
4. Job is now live and freelancers can see it!

## Job Categories (Pre-loaded)

Your system includes 22 default categories:
- Web Development
- Mobile Development
- UI/UX Design
- Content Writing
- Data Analysis
- Video Editing
- Graphic Design
- Social Media Management
- Virtual Assistance
- And 13 more...

## Admin-Only Features

✅ Create jobs
✅ Edit jobs
✅ Delete jobs
✅ Activate/Deactivate jobs
✅ Review submissions
✅ Approve payments
✅ View all statistics
✅ Manage job categories

## User Access Levels

### Freelancers
- Browse available jobs
- Submit solutions
- Track submissions
- View earnings
- Manage profile

### Admins (Manual Assignment Required)
- All freelancer features PLUS
- Create and manage jobs
- Review and approve submissions
- View admin dashboard
- Control job visibility

## Troubleshooting

### "Access Denied. Admin only."
**Problem**: Logged in but not marked as admin
**Solution**:
1. Verify user_id in `user_roles` table
2. Check role is exactly 'admin'
3. Run the admin role assignment query again

### Can't Find Admin Menu
**Problem**: Admin route doesn't appear
**Solution**:
1. Verify you're logged in (check `/dashboard`)
2. Direct URL: `http://localhost:5173/admin`
3. Check browser console for errors (F12)

### Jobs Not Showing
**Problem**: Created jobs but they don't appear
**Solution**:
1. Verify `is_active` is `true` in database
2. Check `jobs` table has data
3. Refresh page with Ctrl+F5

### Can't Create Jobs
**Problem**: Button doesn't work or form won't submit
**Solution**:
1. Verify all form fields are filled
2. Check Supabase RLS policies allow insert
3. Look for error in browser console

## Database Tables Used by Admin

- **jobs** - All created jobs
- **job_categories** - Categories for categorizing jobs
- **job_submissions** - Submissions from freelancers
- **user_roles** - Role assignments (admin/freelancer)
- **profiles** - User profile data

## Security

All admin actions are protected by:
- ✅ User must be logged in
- ✅ User must have 'admin' role
- ✅ Database RLS policies enforce restrictions
- ✅ All queries use authenticated client

Only users with admin role in `user_roles` can:
- Create jobs
- Update jobs
- Delete jobs
- See admin dashboard

## Next Steps

1. ✅ Set `.env.local` with Supabase credentials
2. ✅ Run `npm run dev`
3. ✅ Create admin account via Supabase Auth
4. ✅ Assign admin role via SQL query
5. ✅ Log in and access `/admin`
6. ✅ Create your first job
7. ✅ Share job link with freelancers

Your platform is production-ready! All you need is:
- Valid Supabase project with migrations applied
- Environment variables configured
- Admin accounts created and assigned roles
