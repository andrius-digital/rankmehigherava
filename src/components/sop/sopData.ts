import { SOPDocument, SOPTab } from './types';

export const SOP_TABS: SOPTab[] = [
  {
    id: 'technical',
    label: 'Technical SOP',
    icon: 'Wrench',
    description: 'Complete website & funnel creation workflow',
  },
  {
    id: 'design',
    label: 'Design SOP',
    icon: 'Palette',
    description: 'Design guidelines and brand standards',
  },
  {
    id: 'quickref',
    label: 'Quick Reference',
    icon: 'Zap',
    description: 'Key commands and shortcuts',
  },
  {
    id: 'troubleshooting',
    label: 'Troubleshooting',
    icon: 'Bug',
    description: 'Common issues and solutions',
  },
];

export const TECHNICAL_SOP: SOPDocument = {
  id: 'technical-sop',
  tabId: 'technical',
  title: 'Website & Funnel Creation SOP',
  description: 'Complete standard operating procedure for website and funnel creation',
  lastUpdated: '2026-01-25',
  version: '1.0',
  sections: [
    {
      id: 'tech-stack',
      title: 'Tech Stack Overview',
      level: 1,
      content: [
        {
          type: 'paragraph',
          content: 'This section outlines all the tools and technologies used in our website and funnel creation process.',
        },
        {
          type: 'heading',
          content: 'Design & Development',
        },
        {
          type: 'list',
          items: [
            '**Replit or Lovable** - Initial design and rapid prototyping',
            '**Cursor** - Main development environment (via GitHub Desktop)',
          ],
        },
        {
          type: 'heading',
          content: 'Version Control & Deployment',
        },
        {
          type: 'list',
          items: [
            '**GitHub** - Code repository with 3-branch system',
            '**GitHub Desktop** - For cloning and managing local repositories',
            '**Vercel** - Hosting and deployment (2 environments: staging + production)',
          ],
        },
        {
          type: 'heading',
          content: 'Automation & Communications',
        },
        {
          type: 'list',
          items: [
            '**GoHighLevel (GHL)** - CRM and automation workflows',
            '**Telegram** - Lead notifications and team communications',
            '**n8n** - Not used for webhooks (GHL webhooks placed directly in code)',
          ],
        },
      ],
    },
    {
      id: 'phase-1',
      title: 'Phase 1: Initial Design',
      level: 1,
      content: [
        {
          type: 'heading',
          content: 'Step 1: Choose Your Technology Stack',
        },
        {
          type: 'alert',
          alertType: 'critical',
          content: 'Before writing any code, check the client dashboard to determine which framework is being used. This prevents writing unnecessary or incompatible code.',
        },
        {
          type: 'paragraph',
          content: '**Common Tech Stacks:**',
        },
        {
          type: 'list',
          items: [
            'HTML + Bootstrap + CSS',
            'Node.js + React',
            'Other (verify in client dashboard)',
          ],
        },
        {
          type: 'heading',
          content: 'Step 2: Create Design SOP Document',
        },
        {
          type: 'paragraph',
          content: 'Create a design-specific SOP that includes:',
        },
        {
          type: 'list',
          items: [
            'Project name and client name',
            'Technology stack being used (HTML/CSS, React, etc.)',
            'Design requirements and specifications',
            'Asset locations (images, logos, fonts)',
            'Color scheme and branding guidelines',
            'Page structure and navigation',
          ],
        },
        {
          type: 'alert',
          alertType: 'info',
          content: 'Keep this information at the top of your design SOP for quick reference.',
        },
        {
          type: 'heading',
          content: 'Step 3: Build Initial Design',
        },
        {
          type: 'list',
          items: [
            'Use **Replit** or **Lovable** for initial design',
            'Follow the design SOP specifications',
            'Test all functionality before moving to GitHub',
            'Ensure all forms capture required fields',
          ],
        },
      ],
    },
    {
      id: 'phase-2',
      title: 'Phase 2: GitHub Repository Setup',
      level: 1,
      content: [
        {
          type: 'heading',
          content: 'Step 1: Create Repository with Proper Naming Convention',
        },
        {
          type: 'paragraph',
          content: '**Naming Format:** `clientname-projecttype`',
        },
        {
          type: 'paragraph',
          content: '**Examples:**',
        },
        {
          type: 'list',
          items: [
            '`driveforxxii-funnel`',
            '`cdlagency-website`',
            '`tomaprohousecleaning-website`',
          ],
        },
        {
          type: 'paragraph',
          content: '**Project Type Options:**',
        },
        {
          type: 'list',
          items: [
            '`-website` (for full websites)',
            '`-funnel` (for sales funnels/landing pages)',
          ],
        },
        {
          type: 'heading',
          content: 'Step 2: Push Initial Design to GitHub',
        },
        {
          type: 'paragraph',
          content: 'Push your completed design from Replit/Lovable to the newly created GitHub repository.',
        },
        {
          type: 'heading',
          content: 'Step 3: Create Three Branches',
        },
        {
          type: 'paragraph',
          content: 'Create the following branches in this exact order:',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            '**`dev`** - Development branch (where all work happens)',
            '**`staging`** - Staging branch (for client/team approval)',
            '**`main`** - Production branch (live site)',
          ],
        },
        {
          type: 'paragraph',
          content: '**Branch Workflow:**',
        },
        {
          type: 'code',
          language: 'text',
          content: 'dev (work here) → staging (review here) → main (live site)',
        },
        {
          type: 'alert',
          alertType: 'warning',
          content: 'Always work in the `dev` branch. Push from `dev` to `staging` for review. Manually merge `staging` to `main` in GitHub (NOT in Cursor/Replit). This prevents overwriting files and keeps `main` stable.',
        },
      ],
    },
    {
      id: 'phase-3',
      title: 'Phase 3: Vercel Deployment Configuration',
      level: 1,
      content: [
        {
          type: 'heading',
          content: 'Step 1: Connect GitHub Repository to Vercel',
        },
        {
          type: 'paragraph',
          content: 'Link your GitHub repository to Vercel for automatic deployments.',
        },
        {
          type: 'heading',
          content: 'Step 2: Map Branches to Environments',
        },
        {
          type: 'paragraph',
          content: 'Connect each branch to its corresponding Vercel environment:',
        },
        {
          type: 'table',
          headers: ['Branch', 'Environment', 'Purpose', 'Domain'],
          rows: [
            ['`dev`', 'Development', 'Testing', 'Auto-generated Vercel URL'],
            ['`staging`', 'Staging', 'Client approval', 'staging.clientdomain.com'],
            ['`main`', 'Production', 'Live site', 'clientdomain.com'],
          ],
        },
        {
          type: 'heading',
          content: 'Step 3: Configure Staging Domain',
        },
        {
          type: 'paragraph',
          content: '**For the staging environment:**',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            'Set up subdomain: `staging.clientdomain.com`',
            "Go to client's DNS provider",
            'Add required DNS record from Vercel (usually a CNAME or A record)',
          ],
        },
        {
          type: 'alert',
          alertType: 'info',
          content: 'This is simple: Just copy the record details from Vercel and paste into DNS settings.',
        },
        {
          type: 'paragraph',
          content: '**Example DNS Record:**',
        },
        {
          type: 'code',
          language: 'text',
          content: `Type: CNAME
Name: staging
Value: cname.vercel-dns.com`,
        },
        {
          type: 'heading',
          content: 'Step 4: Set Environment Variables in Vercel',
        },
        {
          type: 'paragraph',
          content: 'Add the following environment variables for each environment:',
        },
        {
          type: 'paragraph',
          content: '**Required Variables:**',
        },
        {
          type: 'list',
          items: [
            'Telegram Bot Token',
            'Telegram Chat IDs',
            'GoHighLevel Webhook URLs',
            'Any API keys needed',
          ],
        },
        {
          type: 'alert',
          alertType: 'success',
          content: 'Add these to both staging and production environments.',
        },
      ],
    },
    {
      id: 'phase-4',
      title: 'Phase 4: Communication Channels Setup',
      level: 1,
      content: [
        {
          type: 'heading',
          content: 'Step 1: Create Telegram Chat',
        },
        {
          type: 'paragraph',
          content: '**Naming Format:** `clientname-projecttype`',
        },
        {
          type: 'paragraph',
          content: '**Example:** `driveforxxii-website`',
        },
        {
          type: 'paragraph',
          content: '**Purpose:** Main team communication for this project',
        },
        {
          type: 'heading',
          content: 'Step 2: Create Telegram Leads Channel',
        },
        {
          type: 'paragraph',
          content: '**Naming Format:** `clientname-projecttype Leads`',
        },
        {
          type: 'paragraph',
          content: '**Example:** `driveforxxii-website Leads`',
        },
        {
          type: 'paragraph',
          content: '**Purpose:** Receive lead notifications from forms',
        },
        {
          type: 'alert',
          alertType: 'info',
          content: 'Channel name stays the same regardless of number of forms. Multiple form types can feed into one leads channel unless the client has separate teams handling different lead types.',
        },
        {
          type: 'heading',
          content: 'Step 3: Document Chat IDs',
        },
        {
          type: 'paragraph',
          content: "Save both Telegram chat IDs - you'll need them for environment variables in Vercel.",
        },
      ],
    },
    {
      id: 'phase-5',
      title: 'Phase 5: Automation Setup (GoHighLevel)',
      level: 1,
      content: [
        {
          type: 'heading',
          content: 'Overview',
        },
        {
          type: 'paragraph',
          content: 'Create **separate GHL workflows** for each form type on the website/funnel.',
        },
        {
          type: 'paragraph',
          content: '**Common Form Types:**',
        },
        {
          type: 'list',
          items: [
            'Leads (main application/contact form)',
            'Newsletter signup',
            'Contact Us form',
            'Quote requests',
          ],
        },
        {
          type: 'alert',
          alertType: 'info',
          content: 'Number of automations = Number of different form types (typically 1-3)',
        },
        {
          type: 'heading',
          content: 'Workflow Structure for Each Form',
        },
        {
          type: 'paragraph',
          content: 'Each GoHighLevel workflow follows this structure:',
        },
        {
          type: 'code',
          language: 'text',
          content: `1. Webhook Trigger
   ↓
2. Create/Update Contact
   ↓
3. Add Note (with all form data)
   ↓
4. Create Opportunity (in correct pipeline)`,
        },
        {
          type: 'heading',
          content: '1. Webhook Trigger Setup',
        },
        {
          type: 'paragraph',
          content: '**Action:** Inbound Webhook',
        },
        {
          type: 'list',
          items: [
            'Create a new workflow in GoHighLevel',
            'Add "Inbound Webhook" as the trigger',
            'Copy the webhook URL',
            '**Paste this webhook URL directly into your website/funnel code** (no n8n needed)',
          ],
        },
        {
          type: 'heading',
          content: '2. Create/Update Contact',
        },
        {
          type: 'paragraph',
          content: '**Action:** Create Contact',
        },
        {
          type: 'paragraph',
          content: '**Map these 4 core fields:**',
        },
        {
          type: 'table',
          headers: ['Field', 'Mapping'],
          rows: [
            ['First Name', '`{{inboundWebhookRequest.firstName}}`'],
            ['Last Name', '`{{inboundWebhookRequest.lastName}}`'],
            ['Phone', '`{{inboundWebhookRequest.phone}}`'],
            ['Email', '`{{inboundWebhookRequest.email}}`'],
          ],
        },
        {
          type: 'paragraph',
          content: '**Settings:**',
        },
        {
          type: 'list',
          items: ['Enable "Update if exists" to prevent duplicate contacts'],
        },
        {
          type: 'heading',
          content: '3. Add Note',
        },
        {
          type: 'paragraph',
          content: '**Action:** Add Note to Contact',
        },
        {
          type: 'paragraph',
          content: 'Create a template using all form fields. This varies by form type - include everything the form collects.',
        },
        {
          type: 'paragraph',
          content: '**Example Template (Trucking Lead):**',
        },
        {
          type: 'code',
          language: 'text',
          content: `--- NEW LEAD APPLICATION ---

CONTACT INFO:
First Name: {{inboundWebhookRequest.firstName}}
Last Name: {{inboundWebhookRequest.lastName}}
Phone: {{inboundWebhookRequest.phone}}
Email: {{inboundWebhookRequest.email}}

TRUCK DETAILS:
Truck Brand: {{inboundWebhookRequest.truckBrand}}
Truck Year: {{inboundWebhookRequest.truckYear}}

EXPERIENCE:
CDL-A Experience: {{inboundWebhookRequest.cdlExperience}}

SOURCE:
Referrer: {{inboundWebhookRequest.referrer}}
Page: {{inboundWebhookRequest.pageUrl}}
Submitted: {{inboundWebhookRequest.submittedAt}}`,
        },
        {
          type: 'alert',
          alertType: 'info',
          content: 'Always include the 4 core fields (first name, last name, phone, email). Add all additional fields specific to that form. Use clear section headers.',
        },
        {
          type: 'heading',
          content: '4. Create Opportunity',
        },
        {
          type: 'paragraph',
          content: '**Action:** Create Opportunity',
        },
        {
          type: 'alert',
          alertType: 'critical',
          content: 'Select the correct pipeline! Match the pipeline to the form type.',
        },
        {
          type: 'paragraph',
          content: '**Pipeline Selection Guide:**',
        },
        {
          type: 'list',
          items: [
            'Check if client has multiple pipelines',
            'Match the pipeline to the form type',
            'Common examples: "Website Leads", "Newsletter Subscribers", "Contact Inquiries"',
          ],
        },
      ],
    },
    {
      id: 'phase-6',
      title: 'Phase 6: Telegram Notifications',
      level: 1,
      content: [
        {
          type: 'heading',
          content: 'Overview',
        },
        {
          type: 'paragraph',
          content: 'Create Telegram notification automations that mirror your GHL workflows. These send real-time alerts to your Telegram channels when new leads come in.',
        },
        {
          type: 'alert',
          alertType: 'info',
          content: 'You need Telegram automations equal to the number of GHL workflows (typically 1-3).',
        },
        {
          type: 'heading',
          content: 'Step 1: Add Environment Variables to Vercel',
        },
        {
          type: 'paragraph',
          content: 'Add these variables in Vercel (for staging and production):',
        },
        {
          type: 'code',
          language: 'bash',
          content: `TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_LEADS_CHAT_ID=your_leads_channel_id
TELEGRAM_SUPPORT_CHAT_ID=your_support_chat_id (if applicable)`,
        },
        {
          type: 'heading',
          content: 'Step 2: Configure Code Integration',
        },
        {
          type: 'paragraph',
          content: '**Ask your IDE (Cursor/Replit) to:**',
        },
        {
          type: 'list',
          items: [
            'Read Telegram bot token from environment variables',
            'Read chat ID from environment variables',
            'Send formatted message when form is submitted',
            'Include error handling',
          ],
        },
        {
          type: 'paragraph',
          content: 'The message should match the GHL note format for consistency.',
        },
        {
          type: 'heading',
          content: 'Example Telegram Message Format',
        },
        {
          type: 'code',
          language: 'text',
          content: `🆕 NEW LEAD APPLICATION

👤 Name: Sam Abro
📞 Phone: 2484316786
📧 Email: samabro45@gmail.com
🚛 Truck: Freightliner / 2021-2023
📅 Experience: 1-2 years
🔗 Referrer: 6037ownerops
📄 Page: https://driveforxxii.com/?utm_source=...
⏰ Submitted: 2026-01-25T16:55:39.336Z`,
        },
        {
          type: 'heading',
          content: 'Step 3: Channel Routing',
        },
        {
          type: 'paragraph',
          content: '**Typical Setup:**',
        },
        {
          type: 'list',
          items: [
            '**Leads Channel:** All lead form submissions',
            '**Support Chat:** Contact form inquiries, questions',
            '**Same Channel for Multiple Forms:** If one business, leads can go to one channel',
          ],
        },
        {
          type: 'code',
          language: 'text',
          content: `Contact Form → Telegram Support Chat
Lead Application → Telegram Leads Channel
Newsletter → Telegram Leads Channel (or separate if needed)`,
        },
      ],
    },
    {
      id: 'phase-7',
      title: 'Phase 7: Making Updates (Cursor Workflow)',
      level: 1,
      content: [
        {
          type: 'heading',
          content: 'When to Use Cursor vs Replit',
        },
        {
          type: 'paragraph',
          content: '**Use Cursor for:**',
        },
        {
          type: 'list',
          items: [
            'Regular updates and adjustments',
            'Most development work',
            'Cost-effective changes',
          ],
        },
        {
          type: 'paragraph',
          content: '**Use Replit for:**',
        },
        {
          type: 'list',
          items: [
            'Emergency quick fixes only',
            'Replit is expensive - avoid when possible',
            'Cursor workflow produces identical results',
          ],
        },
        {
          type: 'heading',
          content: 'Step 1: Clone Repository (First Time or After Long Break)',
        },
        {
          type: 'alert',
          alertType: 'warning',
          content: 'Always clone a fresh copy to get the most recent code.',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            'Open **GitHub Desktop**',
            'Click "Clone Repository"',
            'Find repository: `clientname-projecttype`',
            'Choose local folder location',
            'Click "Clone"',
          ],
        },
        {
          type: 'alert',
          alertType: 'info',
          content: "If you've worked on this project before: Delete the old local copy first, clone fresh from GitHub. This ensures you have the latest code.",
        },
        {
          type: 'heading',
          content: 'Step 2: Open in Cursor',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            'In GitHub Desktop, right-click the repository',
            'Select "Open in Cursor" (or your preferred IDE)',
            'Project opens with all files ready to edit',
          ],
        },
        {
          type: 'heading',
          content: 'Step 3: Switch to Dev Branch',
        },
        {
          type: 'alert',
          alertType: 'critical',
          content: 'Always work on the `dev` branch!',
        },
        {
          type: 'paragraph',
          content: '**In Cursor:**',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            'Look at bottom-left corner of Cursor',
            'Click on current branch name',
            'Select `dev` branch',
            'Verify you\'re on `dev` before making any changes',
          ],
        },
        {
          type: 'alert',
          alertType: 'info',
          content: 'Tell Cursor/IDE: "I\'m working on the dev branch" to ensure it knows the context.',
        },
        {
          type: 'heading',
          content: 'Step 4: Make Your Changes',
        },
        {
          type: 'list',
          items: [
            'Edit files as needed',
            'Test locally if possible',
            'Save all changes',
          ],
        },
        {
          type: 'alert',
          alertType: 'warning',
          content: 'Check which tech stack is being used (HTML/CSS vs React) before writing code!',
        },
        {
          type: 'heading',
          content: 'Step 5: Commit and Push to GitHub',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            "In GitHub Desktop, you'll see all changed files",
            'Write a clear commit message (e.g., "Updated contact form validation")',
            'Click "Commit to dev"',
            'Click "Push origin"',
          ],
        },
        {
          type: 'alert',
          alertType: 'success',
          content: "Your changes are now in GitHub's `dev` branch.",
        },
        {
          type: 'heading',
          content: 'Step 6: Deploy to Staging',
        },
        {
          type: 'alert',
          alertType: 'critical',
          content: 'Merge dev to staging in Vercel, NOT in Cursor/Replit!',
        },
        {
          type: 'paragraph',
          content: '**In Vercel:**',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            'Go to your project',
            'Click on "Deployments"',
            'Find the latest `dev` deployment',
            'Click "Promote to Staging" or manually merge `dev` → `staging` in GitHub',
          ],
        },
        {
          type: 'heading',
          content: 'Step 7: Review on Staging',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            'Go to `staging.clientdomain.com`',
            'Test all changes thoroughly',
            'Show to client/team for approval',
            'Make additional changes if needed (repeat steps 3-6)',
          ],
        },
        {
          type: 'heading',
          content: 'Step 8: Deploy to Production',
        },
        {
          type: 'alert',
          alertType: 'warning',
          content: 'ONLY AFTER FULL APPROVAL!',
        },
        {
          type: 'paragraph',
          content: '**In GitHub (not Cursor):**',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            'Go to your repository on github.com',
            'Navigate to "Pull Requests"',
            'Create new pull request: `staging` → `main`',
            'Review changes',
            'Click "Merge Pull Request"',
            'Confirm merge',
          ],
        },
        {
          type: 'alert',
          alertType: 'success',
          content: 'Vercel automatically deploys `main` branch to production. Your changes are now live at `clientdomain.com`.',
        },
        {
          type: 'heading',
          content: 'Important Workflow Reminders',
        },
        {
          type: 'checklist',
          checklistItems: [
            { id: 'p7-check-1', text: 'Always work on `dev` branch' },
            { id: 'p7-check-2', text: "Clone fresh repo if you haven't worked on project recently" },
            { id: 'p7-check-3', text: 'Push to staging for review (via Vercel, not Cursor)' },
            { id: 'p7-check-4', text: 'Manually merge staging to main in GitHub after approval' },
            { id: 'p7-check-5', text: 'Never merge directly to main from your IDE' },
          ],
        },
        {
          type: 'alert',
          alertType: 'critical',
          content: "Don't work directly on staging or main. Don't merge branches in Cursor/Replit. Don't skip the staging review step.",
        },
      ],
    },
  ],
};

export const QUICKREF_SOP: SOPDocument = {
  id: 'quickref-sop',
  tabId: 'quickref',
  title: 'Quick Reference Guide',
  description: 'Essential commands and shortcuts at a glance',
  lastUpdated: '2026-01-25',
  version: '1.0',
  sections: [
    {
      id: 'naming-conventions',
      title: 'Project Naming',
      level: 1,
      content: [
        {
          type: 'code',
          language: 'text',
          content: `Repository: clientname-website OR clientname-funnel
Telegram Chat: clientname-website
Telegram Channel: clientname-website Leads`,
        },
      ],
    },
    {
      id: 'branch-strategy',
      title: 'Branch Strategy',
      level: 1,
      content: [
        {
          type: 'code',
          language: 'text',
          content: 'dev (work) → staging (review) → main (live)',
        },
      ],
    },
    {
      id: 'domain-structure',
      title: 'Domain Structure',
      level: 1,
      content: [
        {
          type: 'code',
          language: 'text',
          content: `Production: clientdomain.com
Staging: staging.clientdomain.com`,
        },
      ],
    },
    {
      id: 'form-automations',
      title: 'Form Types → Automations',
      level: 1,
      content: [
        {
          type: 'code',
          language: 'text',
          content: `1 Contact Form = 1 GHL Workflow + 1 Telegram Notification
2 Contact Forms = 2 GHL Workflows + 2 Telegram Notifications
3 Contact Forms = 3 GHL Workflows + 3 Telegram Notifications`,
        },
      ],
    },
    {
      id: 'ghl-workflow',
      title: 'GHL Workflow Steps',
      level: 1,
      content: [
        {
          type: 'code',
          language: 'text',
          content: `1. Webhook Trigger
2. Create Contact (4 core fields)
3. Add Note (all form fields)
4. Create Opportunity (correct pipeline!)`,
        },
      ],
    },
    {
      id: 'env-variables',
      title: 'Environment Variables Needed',
      level: 1,
      content: [
        {
          type: 'code',
          language: 'bash',
          content: `TELEGRAM_BOT_TOKEN
TELEGRAM_LEADS_CHAT_ID
TELEGRAM_SUPPORT_CHAT_ID
GHL_WEBHOOK_URL (per form)`,
        },
      ],
    },
    {
      id: 'before-starting',
      title: 'Before Starting Any Work',
      level: 1,
      content: [
        {
          type: 'checklist',
          checklistItems: [
            { id: 'qr-check-1', text: 'Check client dashboard for tech stack' },
            { id: 'qr-check-2', text: 'Clone fresh repository' },
            { id: 'qr-check-3', text: 'Switch to dev branch' },
            { id: 'qr-check-4', text: 'Verify you\'re on dev before coding' },
          ],
        },
      ],
    },
    {
      id: 'deployment-checklist',
      title: 'Deployment Checklist',
      level: 1,
      content: [
        {
          type: 'checklist',
          checklistItems: [
            { id: 'deploy-1', text: 'Changes made on dev branch' },
            { id: 'deploy-2', text: 'Committed with clear message' },
            { id: 'deploy-3', text: 'Pushed to GitHub' },
            { id: 'deploy-4', text: 'Merged to staging (in Vercel/GitHub)' },
            { id: 'deploy-5', text: 'Tested on staging.clientdomain.com' },
            { id: 'deploy-6', text: 'Client/team approval received' },
            { id: 'deploy-7', text: 'Merged staging → main (in GitHub only)' },
            { id: 'deploy-8', text: 'Verified on clientdomain.com' },
          ],
        },
      ],
    },
  ],
};

export const TROUBLESHOOTING_SOP: SOPDocument = {
  id: 'troubleshooting-sop',
  tabId: 'troubleshooting',
  title: 'Troubleshooting Common Issues',
  description: 'Solutions to frequently encountered problems',
  lastUpdated: '2026-01-25',
  version: '1.0',
  sections: [
    {
      id: 'staging-not-showing',
      title: 'Changes not showing on staging',
      level: 1,
      content: [
        {
          type: 'alert',
          alertType: 'warning',
          content: 'Issue: You pushed changes but staging still shows old content.',
        },
        {
          type: 'paragraph',
          content: '**Solution:**',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            'Check that you pushed to GitHub (verify in GitHub Desktop)',
            'Verify Vercel deployed the staging branch (check Vercel dashboard)',
            'Clear browser cache and hard refresh (Cmd+Shift+R)',
            'Check if the correct branch is mapped to staging in Vercel',
          ],
        },
      ],
    },
    {
      id: 'wrong-branch',
      title: 'Wrong branch being deployed',
      level: 1,
      content: [
        {
          type: 'alert',
          alertType: 'warning',
          content: 'Issue: Vercel is deploying the wrong branch to an environment.',
        },
        {
          type: 'paragraph',
          content: '**Solution:**',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            'Go to Vercel project settings',
            'Navigate to Git settings',
            'Verify branch mappings are correct:',
          ],
        },
        {
          type: 'code',
          language: 'text',
          content: `dev → Development
staging → Preview/Staging
main → Production`,
        },
        {
          type: 'list',
          items: ['Ensure you\'re pushing to the correct branch locally'],
        },
      ],
    },
    {
      id: 'form-not-reaching-ghl',
      title: 'Form submissions not reaching GHL',
      level: 1,
      content: [
        {
          type: 'alert',
          alertType: 'warning',
          content: 'Issue: Form submissions are not appearing in GoHighLevel.',
        },
        {
          type: 'paragraph',
          content: '**Solution:**',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            'Verify webhook URL is correct in your code',
            'Check environment variables in Vercel are set correctly',
            'Test the webhook in GHL workflow test mode',
            'Check browser console for any JavaScript errors',
            'Verify the form is sending data in the correct format',
          ],
        },
        {
          type: 'alert',
          alertType: 'info',
          content: 'Use browser dev tools (Network tab) to inspect the webhook request and response.',
        },
      ],
    },
    {
      id: 'telegram-not-sending',
      title: 'Telegram notifications not sending',
      level: 1,
      content: [
        {
          type: 'alert',
          alertType: 'warning',
          content: 'Issue: Form submissions don\'t trigger Telegram notifications.',
        },
        {
          type: 'paragraph',
          content: '**Solution:**',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            'Verify bot token is correct in Vercel environment variables',
            'Verify chat ID is correct (use @userinfobot to confirm)',
            'Check that the bot is added as admin in the channel',
            'Review server logs for API errors',
            'Test the bot manually using curl:',
          ],
        },
        {
          type: 'code',
          language: 'bash',
          content: `curl -X POST "https://api.telegram.org/bot<TOKEN>/sendMessage" \\
  -d "chat_id=<CHAT_ID>" \\
  -d "text=Test message"`,
        },
      ],
    },
    {
      id: 'old-code-after-clone',
      title: 'Old code appearing after clone',
      level: 1,
      content: [
        {
          type: 'alert',
          alertType: 'warning',
          content: 'Issue: After cloning, you\'re seeing outdated code.',
        },
        {
          type: 'paragraph',
          content: '**Solution:**',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            'Delete the local repository folder completely',
            'Clone fresh from GitHub Desktop',
            'Verify you\'re on the correct branch after cloning',
            'Run `git pull` to ensure you have latest changes',
            'Check GitHub web interface to confirm the code is actually updated there',
          ],
        },
        {
          type: 'alert',
          alertType: 'info',
          content: 'If GitHub also shows old code, someone may not have pushed their changes. Check with the team.',
        },
      ],
    },
    {
      id: 'merge-conflicts',
      title: 'Merge conflicts',
      level: 1,
      content: [
        {
          type: 'alert',
          alertType: 'warning',
          content: 'Issue: Git shows merge conflicts when trying to merge branches.',
        },
        {
          type: 'paragraph',
          content: '**Solution:**',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            'Don\'t panic - conflicts are normal',
            'Open the conflicted file(s)',
            'Look for conflict markers: `<<<<<<<`, `=======`, `>>>>>>>`',
            'Decide which version to keep (or combine both)',
            'Remove the conflict markers',
            'Save, commit, and push',
          ],
        },
        {
          type: 'alert',
          alertType: 'info',
          content: 'Prevention: Always pull latest changes before starting work. Communicate with team about who is working on what.',
        },
      ],
    },
    {
      id: 'vercel-build-failed',
      title: 'Vercel build failed',
      level: 1,
      content: [
        {
          type: 'alert',
          alertType: 'warning',
          content: 'Issue: Vercel deployment shows build errors.',
        },
        {
          type: 'paragraph',
          content: '**Solution:**',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            'Click on the failed deployment in Vercel',
            'Read the build logs carefully',
            'Common issues:',
          ],
        },
        {
          type: 'list',
          items: [
            'Missing dependencies: Run `npm install` and push',
            'TypeScript errors: Fix type errors locally first',
            'Environment variables: Ensure all required vars are set',
            'Import errors: Check file paths are correct',
          ],
        },
        {
          type: 'code',
          language: 'bash',
          content: `# Test build locally first
npm run build`,
        },
      ],
    },
  ],
};

export const DESIGN_SOP: SOPDocument = {
  id: 'design-sop',
  tabId: 'design',
  title: 'Design SOP',
  description: 'Design guidelines and brand standards (Coming Soon)',
  lastUpdated: '2026-01-25',
  version: '1.0',
  sections: [
    {
      id: 'coming-soon',
      title: 'Coming Soon',
      level: 1,
      content: [
        {
          type: 'alert',
          alertType: 'info',
          content: 'The Design SOP is currently being developed. Check back soon for comprehensive design guidelines, brand standards, and asset specifications.',
        },
        {
          type: 'paragraph',
          content: '**Planned Content:**',
        },
        {
          type: 'list',
          items: [
            'Brand guidelines and color schemes',
            'Typography standards',
            'Component design patterns',
            'Asset management and specifications',
            'Responsive design requirements',
            'Accessibility standards',
            'Design review checklist',
          ],
        },
      ],
    },
  ],
};

export const ALL_SOP_DOCUMENTS: SOPDocument[] = [
  TECHNICAL_SOP,
  DESIGN_SOP,
  QUICKREF_SOP,
  TROUBLESHOOTING_SOP,
];

export const getSopByTabId = (tabId: string): SOPDocument | undefined => {
  return ALL_SOP_DOCUMENTS.find((doc) => doc.tabId === tabId);
};
