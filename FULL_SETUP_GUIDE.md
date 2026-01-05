# SkillBridge Platform - Complete Setup Guide

This is your complete freelance job platform built with React, TypeScript, Supabase, and Shadcn UI components.

## Quick Start

### 1. Configure Environment Variables

Edit `.env.local` in the project root and add your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_from_supabase
VITE_PAYPAL_CLIENT_ID=your_paypal_id_optional
```

**To find your Supabase credentials:**
1. Go to https://app.supabase.com
2. Select your project
3. Click "Settings" → "API"
4. Copy your **Project URL** and **Anon Key**

### 2. Start Development Server

```bash
npm run dev
```

The app will open at `http://localhost:5173`

## Application Features

### Public Pages
- **Home** (`/`) - Landing page with platform features
- **Pricing** (`/pricing`) - Pricing plans
- **Jobs** (`/jobs`) - Browse available jobs
- **Job Details** (`/jobs/:id`) - View specific job details

### Authentication
- **Sign Up & Login** (`/auth`) - Email-based authentication with verification
- Users must verify their email before accessing the platform
- Passwords must be at least 6 characters

### User Dashboard
- **Dashboard** (`/dashboard`) - User profile and overview
- **Submissions** (`/submissions`) - Track job submissions
- **Earnings** (`/earnings`) - View earnings and payments
- **Settings** (`/settings`) - Manage account preferences

### Admin Panel
- **Admin Dashboard** (`/admin`) - ADMIN ONLY
  - Create and manage jobs
  - Review and approve/reject submissions
  - View job statistics and pending reviews
  - Edit and delete jobs
  - Control job active status

## Setting Up Admin Accounts

### Step 1: Create Admin Users in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Users**
3. Click **"Add user"** for each of your 5 admin accounts
4. Create users with these emails:
   - `skillbridge0001@gmail.com`
   - `skillbridge0002@gmail.com`
   - `skillbridge0003@gmail.com`
   - `skillbridge0004@gmail.com`
   - `skillbridge0005@gmail.com`
5. Set strong passwords for each
6. All users should automatically verify via the trigger

### Step 2: Assign Admin Role to Users

Run the following SQL in your Supabase SQL Editor for each admin email:

```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users
WHERE email = 'skillbridge0001@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM public.user_roles
  WHERE user_id = auth.users.id AND role = 'admin'
);
```

Or use the pre-made migration if you have the user IDs:

```bash
# In Supabase SQL Editor, run:
INSERT INTO public.user_roles (user_id, role) VALUES
  ('user-id-1', 'admin'::app_role),
  ('user-id-2', 'admin'::app_role),
  ('user-id-3', 'admin'::app_role),
  ('user-id-4', 'admin'::app_role),
  ('user-id-5', 'admin'::app_role);
```

### Step 3: Verify Admin Access

1. Log in with an admin email
2. Navigate to `/admin`
3. You should see the Admin Dashboard with:
   - Stats (Total Jobs, Active Jobs, Pending Reviews, Categories)
   - Job management tools
   - Submission review interface

## Database Schema

Your Supabase database includes:

### Core Tables
- **profiles** - User profiles with earnings tracking
- **user_roles** - User role assignments (admin/freelancer)
- **jobs** - Job listings created by admins
- **job_categories** - 22 pre-populated job categories
- **job_submissions** - Freelancer submissions to jobs
- **transactions** - Payment history
- **notifications** - User notifications

### Security
- All tables have Row Level Security (RLS) enabled
- Only admins can create/edit/delete jobs
- Users can only view their own profile and public jobs
- Email verification is enforced before profile creation

## User Types & Permissions

### Freelancers (Default)
- View available jobs
- Submit solutions to jobs
- Track submissions
- View earnings
- Update profile

### Admins (Manual Assignment)
- Create new jobs with:
  - Title, description, detailed instructions
  - Payment amount (in USD)
  - Difficulty level (Easy, Medium, Hard)
  - Required membership tier (Regular, Pro, VIP)
  - Estimated completion time
  - Job category
- Manage all jobs (edit, delete, activate/deactivate)
- Review and approve/reject submissions
- View all statistics and pending work

## Available Routes

| Route | Access | Purpose |
|-------|--------|---------|
| `/` | Public | Landing page |
| `/auth` | Public | Sign up / Login |
| `/pricing` | Public | Pricing information |
| `/jobs` | Authenticated | Browse jobs |
| `/jobs/:id` | Authenticated | Job details |
| `/dashboard` | Authenticated | User dashboard |
| `/submissions` | Authenticated | User submissions |
| `/earnings` | Authenticated | Earnings page |
| `/settings` | Authenticated | Account settings |
| `/checkout` | Authenticated | Payment checkout |
| `/admin` | Admin Only | Admin panel |

## Development

### Build for Production

```bash
npm run build
npm run preview
```

### Code Structure

```
src/
├── pages/          # Route pages
│   ├── Index.tsx          # Home page
│   ├── Auth.tsx           # Login/signup
│   ├── Dashboard.tsx       # User dashboard
│   ├── Admin.tsx          # Admin panel
│   ├── Jobs.tsx           # Job listings
│   ├── JobDetail.tsx      # Individual job
│   └── ...other pages
├── components/
│   ├── ui/                # Shadcn UI components (50+)
│   ├── dashboard/         # Dashboard layouts
│   ├── sections/          # Page sections
│   └── layout/            # Global layouts
├── hooks/
│   ├── useAuth.tsx        # Authentication context
│   └── use-toast.ts       # Toast notifications
├── lib/
│   └── utils.ts           # Helper utilities
└── integrations/
    └── supabase/          # Supabase client
```

### Technologies

- **Framework**: React 18 + TypeScript
- **UI Components**: Shadcn UI (50+ components)
- **Styling**: Tailwind CSS with custom animations
- **Routing**: React Router v6
- **State Management**: React Context + React Query
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Charts**: Recharts
- **Notifications**: Sonner

## Troubleshooting

### Admin Page Shows "Access Denied"
- Verify you're logged in with an admin account
- Check that the user has the 'admin' role in `user_roles` table
- Confirm the role assignment query ran successfully

### Can't Log In
- Verify your Supabase credentials in `.env.local`
- Check that email is verified in Supabase Auth
- Ensure the profile was created (check `profiles` table)

### Environment Variables Not Loading
- Restart the dev server after updating `.env.local`
- Make sure variable names start with `VITE_`
- Clear browser cache/cookies

### Database Connection Errors
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
- Check that Supabase project is active
- Confirm RLS policies aren't blocking queries

## Next Steps

1. ✅ Database schema created and verified
2. ✅ Frontend application built and configured
3. ⚙️ Add Supabase credentials to `.env.local`
4. ⚙️ Create 5 admin accounts in Supabase Auth
5. ⚙️ Assign admin roles to those accounts
6. ✅ Start dev server: `npm run dev`
7. ✅ Access admin panel at `/admin`

## Support

For issues or questions:
- Check the troubleshooting section above
- Review your Supabase project settings
- Verify all environment variables are correct
- Check browser console for errors (F12)
