# 🖤 Manasulo Maata

### Manasulo unna maatalaki oka roopam.

[![Live Website](https://img.shields.io/badge/Live%20Website-Vercel-black?style=for-the-badge\&logo=vercel)](https://manasulo-maata.vercel.app/)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge\&logo=github)](https://github.com/SanjaykumarBejjanki/Manasulo-Maata)

---

## 🌐 About the Project

**Manasulo Maata** is a dark, minimal, emotion-focused platform where people can share their real-life situations, feelings, and unspoken thoughts.

Instead of creating generic motivational quotes, the platform focuses on transforming **real human experiences and emotions into meaningful written expressions**.

The core idea is simple:

> **Real Situation → Real Feeling → Unspoken Thought → Writer's Interpretation → Original Quote → Instagram Post**

The user's story is used as inspiration rather than simply being copied.

---

## ✨ What Makes Manasulo Maata Different?

Manasulo Maata is not designed as another generic motivational quote platform.

The concept is based on something people often experience:

> **They have something in their heart, but they don't know how to put it into words.**

A follower can share their situation and feelings.

The writer then identifies the core emotion and transforms it into an original Manasulo Maata expression.

### ✍️ Writing Formula

Every written expression follows:

```text
Observation
     ↓
Feeling
     ↓
Realization
```

---

## 👤 Public User Website

The public website allows visitors to interact with the Manasulo Maata concept and submit their own experiences.

Users can:

* 🖤 Learn about Manasulo Maata
* 📝 Share their personal situation
* 💭 Select or describe their feeling
* 📩 Submit their unspoken message
* 👤 Optionally provide their name
* 📱 Optionally provide their Instagram ID
* ✅ Give permission for their submission to be used
* 💾 Submit their response securely to the database

### 🌐 Live Website

**[Visit Manasulo Maata](https://manasulo-maata.vercel.app/)**

---

## 🔐 Admin Dashboard

Manasulo Maata includes a separate admin dashboard for managing user submissions.

Only authorized administrators can access submission data and manage the writing workflow.

### Admin Capabilities

* 🔑 Secure email/password login
* 🛡️ Admin authorization verification
* 📊 Submission statistics
* 🔎 Filter submissions by status
* 📖 View complete submission details
* 🟡 Select submissions
* ✕ Reject submissions
* ✍️ Start the writing process
* 📝 Create and edit original quotes
* 💾 Save written quotes
* 📸 Mark quotes as Instagram Post Ready
* 🟢 Mark posts as Posted
* 🔄 Refresh submissions
* 🚪 Logout

---

## 🔄 Submission Workflow

The complete content pipeline is:

```text
🆕 New
   ↓
🟡 Selected
   ↓
✍️ Writing
   ↓
✓ Written
   ↓
📸 Instagram Ready
   ↓
🟢 Posted
```

### Rejection Path

Submissions that are not suitable can follow a separate path:

```text
🆕 New
   ↓
✕ Rejected
```

---

## ✍️ Writer Workflow

When a submission is selected, the admin can begin the writing process.

```text
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
```

After the quote is completed:

```text
Written
   ↓
Mark Post Ready
   ↓
Instagram Ready
   ↓
Post on Instagram
   ↓
Mark Posted
```

> **Note:** Instagram publishing is currently handled manually. The project does not automatically publish posts through the Instagram API.

---

## 💾 Database

The project uses **Supabase** for database storage, authentication, and security.

### `submissions`

The submission table contains information such as:

| Field            | Purpose                             |
| ---------------- | ----------------------------------- |
| `id`             | Unique submission ID                |
| `situation`      | User's situation                    |
| `feeling`        | User's feeling                      |
| `message`        | User's unspoken message             |
| `name`           | Optional user name                  |
| `instagram`      | Optional Instagram ID               |
| `permission`     | Permission to use the submission    |
| `status`         | Current workflow status             |
| `original_quote` | Writer-created Manasulo Maata quote |
| `created_at`     | Submission timestamp                |

### Status Values

```text
new
selected
writing
written
instagram_ready
rejected
posted
```

---

## 🔐 Security

Security is an important part of the project.

The application uses:

* Supabase Authentication
* PostgreSQL
* Row Level Security (RLS)
* Admin authorization
* Security-definer function for admin verification
* Supabase Publishable Key for frontend access

### Public Access

The public website is allowed to:

```text
INSERT submissions
```

The submission requires:

```text
permission = true
```

### Admin Access

Authenticated and authorized administrators can:

```text
SELECT submissions
UPDATE submissions
```

Admin authorization is verified using the:

```text
admins
```

table and:

```text
private.is_admin()
```

security-definer function.

### API Key Security

The frontend uses the Supabase publishable key.

Sensitive Supabase secret/service-role keys must **never** be placed inside frontend JavaScript or exposed publicly.

---

## 🛠️ Technologies Used

### Frontend

* HTML5
* CSS3
* JavaScript
* Responsive Web Design

### Backend / Database

* Supabase
* PostgreSQL
* Supabase Authentication
* Row Level Security (RLS)
* Supabase REST API

### Deployment

* GitHub
* Vercel

---

## 📁 Project Structure

```text
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
```

---

## 👤 Public Website Files

### `index.html`

### `style.css`

### `script.js`

These files handle:

* Public website interface
* Responsive design
* Submission form
* Form validation
* Supabase submission
* Success feedback

---

## 🔐 Admin Dashboard Files

### `admin.html`

### `admin.css`

### `admin.js`

These files handle:

* Admin login
* Admin authorization
* Submission management
* Status filtering
* Writer workflow
* Original quote editing
* Post-ready workflow
* Posted status
* Dashboard statistics

---

## 🚀 Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/SanjaykumarBejjanki/Manasulo-Maata.git
```

### 2. Open the Project

```bash
cd Manasulo-Maata
```

### 3. Run the Website

The project is a frontend application and can be opened using a local development server.

For example, using the VS Code Live Server extension:

```text
index.html
```

The admin dashboard is available at:

```text
admin.html
```

---

## ⚙️ Supabase Configuration

The frontend connects to Supabase using the project URL and publishable key.

Example:

```javascript
const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_KEY = "YOUR_PUBLISHABLE_KEY";
```

For a complete setup, the Supabase project requires:

* `submissions` table
* `admins` table
* Supabase Authentication
* Row Level Security policies
* Appropriate database permissions
* Admin authorization function

> **Never commit Supabase secret/service-role keys to GitHub.**

---

## 🌐 Deployment

The project is deployed using **Vercel** and connected to the GitHub repository.

### Public Website

**Live Website:**
https://manasulo-maata.vercel.app/

### Source Code

**GitHub Repository:**
https://github.com/SanjaykumarBejjanki/Manasulo-Maata

### Admin Dashboard

The admin interface is maintained separately from the public website:

```text
/admin.html
```

Access to submission data is protected through Supabase Authentication and database authorization.

---

## 🎨 Design Philosophy

Manasulo Maata follows a:

* 🖤 Minimal
* 🌑 Dark
* ✨ Emotional
* 📖 Personal
* 📱 Mobile-friendly

visual style.

The design focuses on:

* Dark backgrounds
* Clean typography
* Readable white text
* Subtle accent colors
* Emotional presentation
* Minimal distractions
* Responsive layouts

The goal is to make the platform feel personal and human rather than like a generic motivational quote page.

---

## 💭 Core Concept

The platform is built around one simple idea:

```text
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
```

The user's original submission is used as inspiration, while the final written expression is created in the Manasulo Maata writing style.

---

## 📊 Admin Dashboard Pipeline

The dashboard provides a complete view of the content pipeline:

```text
              ┌──────────────┐
              │     New      │
              └──────┬───────┘
                     ↓
              ┌──────────────┐
              │   Selected   │
              └──────┬───────┘
                     ↓
              ┌──────────────┐
              │   Writing    │
              └──────┬───────┘
                     ↓
              ┌──────────────┐
              │   Written    │
              └──────┬───────┘
                     ↓
          ┌──────────────────────┐
          │  Instagram Ready     │
          └──────────┬───────────┘
                     ↓
              ┌──────────────┐
              │    Posted    │
              └──────────────┘
```

Rejected submissions are tracked separately.

---

## 🔮 Future Improvements

Possible future enhancements include:

* 📸 Instagram API integration
* ⏰ Automated post scheduling
* 👥 Admin role management
* 🔄 Improved session refresh handling
* 🔎 Advanced search
* 📊 Advanced analytics
* 🏷️ Quote categories
* 📄 Submission pagination
* 🎨 Image/post creation workflow
* ✍️ Caption and hashtag management
* 📚 Post history
* 📝 Admin activity logs

These are future possibilities and are not currently implemented.

---

## 🎯 Project Goals

Manasulo Maata aims to build more than a quote page.

The long-term goal is to create a small community where people can:

```text
Feel something
      ↓
Share it
      ↓
See it understood
      ↓
Give it words
```

A person's real experience can become a piece of writing that another person may relate to.

---

## 👨‍💻 Author

### Sanjay Kumar Bejjanki

**AI & Machine Learning Enthusiast**

Interested in:

* Artificial Intelligence
* Machine Learning
* Data Analytics
* Web Development
* Creative Technology

### GitHub

**[SanjaykumarBejjanki](https://github.com/SanjaykumarBejjanki)**

---

> 🖤 **“Manasulo unna maatalaki oka roopam.”**

---

### ⭐ If you like the idea

Feel free to explore the project, visit the website, and follow the development of **Manasulo Maata**.
