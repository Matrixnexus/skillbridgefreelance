/*
  # Add Sample Jobs for Preview
  
  1. Sample Jobs
    - Creates 15 diverse sample jobs across different categories
    - Mix of difficulty levels (easy, medium, hard)
    - Mix of membership tiers (regular, pro, vip)
    - Realistic payment amounts and descriptions
    
  2. Data
    - Jobs cover various categories like Data Entry, Content Writing, Research, etc.
    - Each job has detailed descriptions and instructions
    - Estimated times and deadlines included
*/

-- Insert sample jobs
INSERT INTO public.jobs (title, description, instructions, category_id, difficulty, payment_amount, required_tier, estimated_time, is_active) VALUES
  (
    'Transcribe 30-Minute Audio Interview',
    'We need accurate transcription of a 30-minute podcast interview. The audio is clear with minimal background noise. Speaker identification required.',
    'Listen to the audio file carefully and transcribe word-for-word. Include timestamps every 5 minutes. Mark unclear sections with [inaudible]. Format: Speaker Name: Dialogue. Submit as .txt or .docx file.',
    (SELECT id FROM public.job_categories WHERE name = 'Transcription'),
    'easy',
    25.00,
    'regular',
    '2 hours',
    true
  ),
  (
    'Write 5 Product Descriptions for E-commerce Store',
    'Create compelling product descriptions for 5 kitchen appliances. Each description should be 150-200 words, SEO-optimized, and highlight key features and benefits.',
    'Research each product thoroughly. Include key features, benefits, specifications, and use cases. Use persuasive language. Format as bullet points for features. Include a call-to-action. Submit in Google Docs format.',
    (SELECT id FROM public.job_categories WHERE name = 'Content Writing'),
    'medium',
    45.00,
    'regular',
    '3 hours',
    true
  ),
  (
    'Data Entry: Input 500 Business Contacts into Spreadsheet',
    'Enter 500 business contacts from business cards/images into a structured spreadsheet. Fields include company name, contact name, email, phone, address.',
    'Download the template spreadsheet. Enter data accurately from provided images. Double-check for typos, especially emails and phone numbers. Format phone numbers consistently. Submit completed .xlsx file.',
    (SELECT id FROM public.job_categories WHERE name = 'Data Entry'),
    'easy',
    30.00,
    'regular',
    '4 hours',
    true
  ),
  (
    'Research and Compile List of 50 SaaS Companies',
    'Research and create a comprehensive list of 50 B2B SaaS companies in the marketing automation space. Include company name, website, founder, year founded, and brief description.',
    'Use Google, LinkedIn, Crunchbase, and company websites. Verify all information is current. Include only active companies. Format as spreadsheet with columns: Company Name, Website, Founder(s), Year Founded, Description (50 words), Revenue Range. Submit as Google Sheets.',
    (SELECT id FROM public.job_categories WHERE name = 'Web Research'),
    'medium',
    55.00,
    'pro',
    '5 hours',
    true
  ),
  (
    'Create 3 Social Media Graphics for Instagram',
    'Design 3 professional Instagram carousel graphics for a fitness brand. Should include motivational quotes, brand colors, and modern aesthetic.',
    'Use brand colors: Navy Blue (#1A237E), Coral (#FF6B6B), White. Dimensions: 1080x1080px. Include brand logo. Use Canva or Adobe Illustrator. Provide source files + PNG exports. Submit as .zip file.',
    (SELECT id FROM public.job_categories WHERE name = 'Graphic Design'),
    'medium',
    65.00,
    'pro',
    '4 hours',
    true
  ),
  (
    'Translate 1000-Word Article from English to Spanish',
    'Translate a marketing article about sustainable fashion from English to Spanish. Target audience: Latin American millennials. Must sound natural and culturally appropriate.',
    'Maintain tone and style of original. Localize idioms and cultural references. Keep formatting (headers, bullets). Proofread for grammar and spelling. Submit in same format as original (Google Docs).',
    (SELECT id FROM public.job_categories WHERE name = 'Translation'),
    'hard',
    80.00,
    'pro',
    '3 hours',
    true
  ),
  (
    'Edit 10-Minute YouTube Video',
    'Edit raw footage into a polished 10-minute tutorial video. Add intro/outro, background music, text overlays for key points, and color correction.',
    'Use provided brand assets (intro/outro templates, music). Cut out mistakes and long pauses. Add chapter markers. Include captions/subtitles. Export in 1080p MP4 format. Submit via Google Drive link.',
    (SELECT id FROM public.job_categories WHERE name = 'Video Editing'),
    'hard',
    120.00,
    'vip',
    '6 hours',
    true
  ),
  (
    'Create Email Marketing Campaign Copy',
    'Write compelling copy for a 5-email welcome series for a meal kit subscription service. Each email should be 200-300 words with clear CTAs.',
    'Email 1: Welcome & Benefits. Email 2: How It Works. Email 3: Recipe Highlights. Email 4: Customer Testimonials. Email 5: Limited Offer. Use friendly, conversational tone. Include subject lines. Submit in Google Docs.',
    (SELECT id FROM public.job_categories WHERE name = 'Email Marketing'),
    'medium',
    90.00,
    'pro',
    '5 hours',
    true
  ),
  (
    'Virtual Assistant: Email Management for 1 Week',
    'Manage inbox for a busy executive. Filter spam, respond to routine inquiries, flag urgent items, and maintain organized folder structure.',
    'Check inbox 2x daily (morning/afternoon). Use provided email templates for common responses. Flag emails needing executive attention. Unsubscribe from irrelevant newsletters. Provide daily summary report.',
    (SELECT id FROM public.job_categories WHERE name = 'Virtual Assistance'),
    'easy',
    150.00,
    'vip',
    '10 hours spread over 1 week',
    true
  ),
  (
    'Proofread 50-Page Technical Document',
    'Proofread and edit a technical white paper on blockchain technology. Check for grammar, spelling, punctuation, clarity, and consistency.',
    'Use Track Changes in Microsoft Word. Check for: grammar/spelling errors, punctuation, sentence structure, clarity, consistency in terminology. Suggest improvements for readability. Submit edited document + change summary.',
    (SELECT id FROM public.job_categories WHERE name = 'Proofreading'),
    'hard',
    100.00,
    'vip',
    '8 hours',
    true
  ),
  (
    'SEO Optimization: Keyword Research for 10 Blog Posts',
    'Conduct keyword research for 10 blog posts about personal finance. Find primary and secondary keywords with search volume and difficulty ratings.',
    'Use tools like Ubersuggest, AnswerThePublic, or Google Keyword Planner. Provide: 1 primary keyword (search volume 1000+), 3-5 secondary keywords per topic. Include search volume, difficulty, and competition. Format as spreadsheet.',
    (SELECT id FROM public.job_categories WHERE name = 'SEO Tasks'),
    'medium',
    70.00,
    'pro',
    '4 hours',
    true
  ),
  (
    'Label 1000 Images for AI Training',
    'Accurately label 1000 images of street scenes for autonomous vehicle training. Identify: cars, pedestrians, traffic signs, traffic lights, road markings.',
    'Use provided labeling tool. Draw bounding boxes around objects. Select correct category for each object. Be precise with boundaries. Mark occluded objects. Complete provided training module first.',
    (SELECT id FROM public.job_categories WHERE name = 'AI Data Labeling'),
    'medium',
    85.00,
    'pro',
    '10 hours',
    true
  ),
  (
    'Test Mobile App: Find and Report Bugs',
    'Thoroughly test a new iOS fitness tracking app. Find and document bugs, usability issues, and provide improvement suggestions.',
    'Test on iOS device (iPhone 11 or newer). Test all features: signup, profile, workout tracking, stats, settings. Document bugs with: steps to reproduce, expected vs actual behavior, screenshots. Submit via provided bug tracking form.',
    (SELECT id FROM public.job_categories WHERE name = 'Software Testing'),
    'medium',
    60.00,
    'regular',
    '5 hours',
    true
  ),
  (
    'Create Product Listings for 20 Items on Amazon',
    'Create optimized product listings for 20 home decor items. Write compelling titles, bullet points, and descriptions that convert.',
    'Research competitors. Include: SEO-optimized title (max 200 chars), 5 bullet points highlighting features/benefits, detailed description (250 words), relevant search terms. Follow Amazon guidelines. Submit as spreadsheet.',
    (SELECT id FROM public.job_categories WHERE name = 'Product Listing'),
    'medium',
    75.00,
    'regular',
    '6 hours',
    true
  ),
  (
    'Generate 100 Qualified Leads for B2B SaaS',
    'Find and compile contact information for 100 decision-makers at mid-size tech companies interested in project management software.',
    'Target: CTOs, VPs Engineering at companies with 50-500 employees. Include: Full Name, Job Title, Company, Email, LinkedIn URL, Company Size. Verify email validity. Use LinkedIn, company websites. Submit as .csv file.',
    (SELECT id FROM public.job_categories WHERE name = 'Lead Generation'),
    'hard',
    110.00,
    'vip',
    '8 hours',
    true
  );
