# Admin Setup Guide

This guide explains how to set up admin users for the SkillBridge platform.

## Creating Admin Users

To create admin users, you need to:

1. First, have the users sign up normally through the website at `/auth`
2. After they sign up, get their user ID from the Supabase dashboard
3. Insert their user ID into the `user_roles` table with role = 'admin'

### Method 1: Using Supabase Dashboard

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Run the following query for each admin user:

```sql
INSERT INTO user_roles (user_id, role)
VALUES ('USER_ID_HERE', 'admin');
```

Replace `USER_ID_HERE` with the actual user ID from the `auth.users` table.

### Method 2: Using SQL Query to Add Multiple Admins

```sql
-- First, create the admin accounts by having them sign up
-- Then run this query with their email addresses

INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email IN (
  'admin1@example.com',
  'admin2@example.com',
  'admin3@example.com',
  'admin4@example.com',
  'admin5@example.com'
);
```

## Admin Panel Access

Once a user is assigned the admin role:

1. They can access the admin panel at `/admin`
2. The admin panel link will appear in their dashboard sidebar
3. They will have access to:
   - Create new jobs
   - Edit existing jobs
   - Delete jobs
   - Review submissions
   - Approve or reject work
   - View all users and their activity

## Admin Capabilities

Admins can:
- Manage all job postings
- Review and approve/reject freelancer submissions
- View platform analytics
- Manage job categories
- Control job visibility (active/inactive)
- Provide feedback to freelancers on rejected work

## Security

- Admin access is controlled through Row Level Security (RLS) policies
- Only users with the 'admin' role in the `user_roles` table can access admin functions
- Regular users cannot access admin-only pages or functions
