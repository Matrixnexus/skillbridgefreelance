# SkillBridge - Premium Freelancing Platform

A professional freelancing marketplace built with React, TypeScript, and Supabase. SkillBridge offers a membership-based model where freelancers access curated, high-quality jobs without the race to the bottom pricing.

## Features

### For Freelancers
- **Curated Job Marketplace** - Access verified, quality jobs across 20+ categories
- **Membership Tiers** - Regular, Pro, and VIP plans with increasing benefits
- **Guaranteed Payments** - Secure payment processing with funds held in escrow
- **Daily Task Limits** - Structured workload management based on membership level
- **Earnings Dashboard** - Track pending, approved, and total earnings
- **Submission Tracking** - Monitor the status of all your work submissions

### For Admins
- **Job Management** - Create, edit, and manage job postings
- **Submission Review** - Approve or reject freelancer submissions with feedback
- **User Management** - View and manage freelancer profiles
- **Analytics** - Track platform metrics and user activity

### Categories
Data Entry, Web Research, Content Writing, Translation, Graphic Design, Video Editing, Social Media Management, SEO Tasks, Email Marketing, Virtual Assistance, Product Listing, Lead Generation, Surveys, AI Data Labeling, Image Annotation, Software Testing, UX Feedback, Customer Support, and more.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui, Radix UI
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account

### Installation

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Database migrations are automatically applied via Supabase

4. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:8080`

### Building for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── dashboard/       # Dashboard-specific components
│   ├── layout/          # Layout components (Navbar, Footer)
│   ├── sections/        # Landing page sections
│   └── ui/              # Reusable UI components (shadcn/ui)
├── hooks/               # Custom React hooks
├── integrations/        # Third-party integrations (Supabase)
├── pages/               # Page components
└── App.tsx              # Main app component
```

## Database Schema

### Tables
- **profiles** - User profiles with membership info and earnings
- **user_roles** - User role assignments (admin/freelancer)
- **job_categories** - Job category definitions
- **jobs** - Job postings with requirements and payments
- **job_submissions** - Freelancer work submissions
- **transactions** - Payment transaction history
- **notifications** - User notifications

## Authentication

Uses Supabase Auth with email/password authentication.

### Creating an Admin User

1. Sign up as a regular user through the UI
2. In Supabase dashboard, go to the `user_roles` table
3. Insert: `user_id` (from auth.users) and `role` = `admin`

For detailed instructions, see [ADMIN_SETUP.md](ADMIN_SETUP.md)

## Payment Integration

The platform uses PayPal for secure payment processing. Users can upgrade to premium memberships (Regular, Pro, or VIP) through the `/pricing` page.

### Setting Up PayPal

1. Create a PayPal Business account
2. Get your PayPal Client ID from the Developer Dashboard
3. Update the Client ID in `src/pages/Checkout.tsx`

For detailed PayPal integration instructions, see [PAYPAL_SETUP.md](PAYPAL_SETUP.md)

### Payment Flow

1. User selects a plan on the `/pricing` page
2. User is redirected to `/checkout?plan={tier}`
3. PayPal payment button is displayed
4. After successful payment:
   - User's membership tier is upgraded
   - Membership expiration date is set (1 month from purchase)
   - Transaction is recorded in the database
   - User is redirected to dashboard

### Admin Panel

Accessible at `/admin` for users with admin role. Features include:
- Create and manage job postings
- Review freelancer submissions
- Approve or reject work with feedback
- View platform analytics

## Membership Tiers

| Tier | Price | Daily Tasks | Review Time | Payout Schedule |
|------|-------|------------|-------------|-----------------|
| Regular | $15/mo | 4 | Standard | Weekly |
| Pro | $25/mo | 6 | Priority (24h) | Bi-weekly |
| VIP | $49/mo | Unlimited | Express (12h) | Weekly Instant |

## Design System

Professional dark theme with emerald green accents:
- **Primary Color**: Emerald Green
- **Background**: Deep Navy
- **Typography**: Inter font family
- **Components**: Glass-morphism cards with animations
