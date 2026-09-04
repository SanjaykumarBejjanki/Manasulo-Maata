🖤 Manasulo Maata

“Manasulo unna maatalaki oka roopam.”

Manasulo Maata is a dark, minimal, emotion-focused platform where people can share their real-life situations, feelings, and unspoken thoughts.

Instead of providing generic motivational quotes, the platform transforms real user-submitted feelings into meaningful written expressions.

🌐 Project Overview

The project is divided into two separate interfaces:

👤 Public User Website

Users can:

Read about Manasulo Maata
Share their personal situation
Select/write their feeling
Submit their unspoken message
Optionally provide their name
Optionally provide their Instagram ID
Give permission for their submission to be used

User submissions are securely stored in Supabase.

🔐 Admin Dashboard

Only authorized admins can access the dashboard.

Admins can:

Login securely
View user submissions
Filter submissions by status
Review situations and feelings
Select submissions
Reject submissions
Start the writing process
Create/edit the original Manasulo Maata quote
Save written quotes
Mark quotes as Instagram Post Ready
Mark posts as Posted
Monitor submission statistics
✨ Features
👤 User Features
🖤 Dark cinematic interface
📝 User submission form
💭 Situation and feeling collection
📩 Unspoken message submission
👤 Optional name
📱 Optional Instagram ID
✅ Permission-based submission
💾 Supabase database integration
📱 Responsive design
✓ Form validation
✓ Submission success feedback
🔐 Admin Features
🔑 Admin email/password login
🛡️ Admin authorization verification
📊 Submission statistics
🆕 New submissions
🟡 Selected submissions
✍️ Writing queue
✓ Written quotes
📸 Instagram Post Ready queue
🟢 Posted submissions
✕ Rejected submissions
🔎 Status filtering
📖 Detailed submission modal
✍️ Original quote editor
💾 Save quote functionality
🔄 Refresh submissions
🚪 Logout functionality
🔄 Submission Workflow

The current admin workflow is:

🆕 New
   ↓
🟡 Selected
   ↓
✍️ Writing
   ↓
✓ Written
   ↓
📸 Instagram Post Ready
   ↓
🟢 Posted

There is also a separate rejection path:

🆕 New
   ↓
✕ Rejected
Writer Workflow

When a submission is selected:

Selected
   ↓
Start Writing
   ↓
Writing
   ↓
Write Original Quote
   ↓
Save Quote
   ↓
Written

After the quote is written:

Written
   ↓
Mark Post Ready
   ↓
Instagram Post Ready
   ↓
Post on Instagram
   ↓
Mark Posted

Note: The project currently manages the Instagram workflow manually. It does not automatically publish posts through the Instagram API.

🗂️ Project Structure
Manasulo-Maata/
│
├── index.html
├── style.css
├── script.js
│
├── admin.html
├── admin.css
├── admin.js
│
└── README.md
Public Website
index.html
style.css
script.js

These files handle the public-facing Manasulo Maata website and user submission system.

Admin Dashboard
admin.html
admin.css
admin.js

These files handle the protected admin dashboard, submission management, writer workflow, and status management.

🗄️ Database

The project uses Supabase for storing submissions.

submissions

The submission data includes fields such as:

id
situation
feeling
message
name
instagram
permission
status
original_quote
created_at
Status Values
new
selected
writing
written
instagram_ready
rejected
posted
🔐 Security

The project uses Supabase authentication and Row Level Security.

Public Access

The public website is allowed to:

INSERT submissions

The submission requires:

permission = true
Admin Access

Authenticated admin users can:

SELECT submissions
UPDATE submissions

Admin authorization is verified through the admins table.

The project also uses a security-definer function:

private.is_admin()

to verify whether the authenticated user is an authorized administrator.

API Key

The frontend uses the Supabase publishable key.

Sensitive Supabase secret/service-role keys should never be placed inside frontend JavaScript.

🛠️ Technologies Used
Frontend
HTML5
CSS3
JavaScript
Responsive Web Design
Backend / Database
Supabase
PostgreSQL
Supabase Authentication
Row Level Security
Supabase REST API
Deployment
GitHub
Vercel
🚀 Local Setup

Clone the repository:

git clone https://github.com/SanjaykumarBejjanki/Manasulo-Maata.git

Open the project:

cd Manasulo-Maata

The public website can be opened through a local development server.

For example, using VS Code Live Server:

index.html

The admin dashboard is available through:

admin.html
⚙️ Supabase Configuration

The frontend connects to the Supabase project using:

const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_KEY = "YOUR_PUBLISHABLE_KEY";

The project requires the appropriate Supabase database tables, authentication configuration, permissions, and RLS policies.

🌐 Deployment

The project is deployed using Vercel and connected to the GitHub repository.

Public Website

Live Website:

Manasulo Maata

Source Code

GitHub Repository

Admin Dashboard

The admin interface is maintained separately from the public user interface:

/admin.html

Access should be limited to authorized admin accounts through the authentication and database authorization system.

🎨 Design Philosophy

Manasulo Maata follows a minimal, dark and emotional visual style.

The design focuses on:

Black / dark backgrounds
Clean typography
White readable text
Subtle accent colors
Emotional presentation
Minimal distractions
Mobile responsiveness

The goal is to make the content feel personal rather than like generic motivational content.

💭 Core Concept

The platform is built around a simple idea:

Real Situation
      ↓
Real Feeling
      ↓
Unspoken Thought
      ↓
Writer's Interpretation
      ↓
Original Quote
      ↓
Instagram Post

The user's original submission is used as inspiration rather than simply copied as a public quote.

📊 Admin Dashboard Pipeline

The dashboard provides a complete view of the content pipeline:

                   ┌──────────────┐
                   │  New         │
                   └──────┬───────┘
                          ↓
                   ┌──────────────┐
                   │  Selected    │
                   └──────┬───────┘
                          ↓
                   ┌──────────────┐
                   │  Writing     │
                   └──────┬───────┘
                          ↓
                   ┌──────────────┐
                   │  Written     │
                   └──────┬───────┘
                          ↓
                ┌────────────────────┐
                │ Instagram Ready    │
                └─────────┬──────────┘
                          ↓
                   ┌──────────────┐
                   │   Posted     │
                   └──────────────┘

Rejected submissions are tracked separately.

🔮 Future Improvements

Possible future enhancements include:

Instagram API integration
Automated post scheduling
Admin role management
Better session refresh handling
Search functionality
Advanced analytics
Quote categories
Submission pagination
Image/post creation workflow
Caption and hashtag management
Post history
Admin activity logs

These are future possibilities, not currently implemented features.

👨‍💻 Author

Sanjay Kumar Bejjanki

AI & Machine Learning Enthusiast

GitHub:

SanjaykumarBejjanki
