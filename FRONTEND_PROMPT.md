# FRONTEND_PROMPT.md — Frontend Development Guide & UI Prompt

This document serves as the guide and prompt for generating the user interface and structural components of the WISSK School website frontend (React + Vite + TypeScript + Tailwind CSS).

---

## 1. Visual Identity & Design System

*   **Design Style:** Official, elegant, and institutional.
*   **Primary Color:** `#FF33FF` (Vibrant Magenta/Purple)
*   **Secondary Colors:** `#ffffff` (White) & `#996600` (Gold/Bronze)
*   **Typography:** Google Fonts `Sarabun` (weights 400, 500, 700)
*   **Locale:** Thai (th-TH) as the primary language.
*   **Date Display:** Buddhist Calendar (พ.ศ.) formatted using a custom formatter `toThaiDate()` (e.g., `29 ก.ค. 2569`).
*   **Icons:** `lucide-react`

---

## 2. Directory Structure (React + Vite)

```text
frontend/src/
├── assets/             # Logos, static banners, public icons
├── components/
│   ├── common/         # Reusable components (Navbar, Footer, Button, Card, InputField)
│   ├── dashboard/      # Sidebar, headers, layout elements for admin/teacher/parent
│   └── home/           # Homepage components (HeroBanner, QuickLinks, NewsSection, ActivityGallery)
├── context/            # AuthContext (JWT session management)
├── hooks/              # Custom hooks (e.g. useAuth, useFetch)
├── layouts/            # Page layouts (PublicLayout, DashboardLayout)
├── pages/
│   ├── public/         # Guest/Public pages (Home, About, NewsList, NewsDetail, Login)
│   └── protected/      # Dashboards (AdminDashboard, TeacherDashboard, ParentDashboard)
├── services/           # Axios endpoints (auth.ts, activities.ts, announcements.ts, documents.ts, users.ts)
├── utils/              # Thai date formatters and helper functions
├── App.tsx             # Main router configuration
├── index.css           # Tailwind CSS styles and custom color definitions
└── main.tsx            # Application entry point
```

---

## 3. Router Configuration (React Router DOM)

*   **Public Routes:**
    *   `/` -> `Home.tsx`: Hero Banner slideshow, Activity Gallery, News section, Quick Links, and Footer.
    *   `/about` -> `About.tsx`: School history, vision/mission statements, executive committee list, and address.
    *   `/news` -> `NewsList.tsx`: Directory of all public news and announcements.
    *   `/news/:id` -> `NewsDetail.tsx`: Single news post detailed page.
    *   `/login` -> `Login.tsx`: Login page with Credentials (Username / Password). *Google OAuth is excluded in this stage.*
*   **Protected Dashboard Routes (Role-based access):**
    *   **ADMIN (`/dashboard/admin`):**
        *   Overview: System status and user counts.
        *   `/announcements`: Full CRUD for school news/notices.
        *   `/activities`: Full CRUD for activities and photos, with option to set `visibility` (PUBLIC, PARENT_ONLY) and `genderAccess` (ALL, MALE_ONLY, FEMALE_ONLY) for each photo.
        *   `/accounts`: CRUD operations for Teachers and Parents (including parent-student associations).
    *   **TEACHER (`/dashboard/teacher`):**
        *   Overview: Read school announcements.
        *   `/documents`: View and download official documents (e.g., student rosters, academic forms) uploaded by the Admin. *Upload option for teachers is disabled.*
    *   **PARENT (`/dashboard/parent`):**
        *   Overview: View list of linked children (basic info: full name, student code, classroom, gender).
        *   `/news`: Parent-exclusive announcements and updates.
        *   `/photos`: Safe photo gallery containing school photos. *Photos are server-side filtered automatically to match parent gender (Male parents see MALE_ONLY + ALL photos; Female parents see FEMALE_ONLY + ALL photos).*

---

## 4. UI Layout Details (Top-to-Bottom)

### 4.1 Navigation Bar (Navbar)
*   **Appearance:** Sticky header, primary background (`#FF33FF`), white typography (`#ffffff`), gold/bronze accents (`#996600`) on hover.
*   **Elements:** Logo on the left, navigation links on the right (Home, About, News, Login). After logging in, showing a link to the user's dashboard and a Logout button.

### 4.2 Hero Banner Slideshow
*   **Appearance:** Full-width carousel, sliding every 3.5 seconds. Semi-transparent dark overlay for high contrast. White and gold text.
*   **Slides (Default Content):**
    1.  **Slide 1:** Holiday Announcement — Title: "วันหยุดประจําภาคเรียน", Subtitle: "ประกาศวันหยุดและกำหนดการปิดภาคเรียน", CTA: "อ่านรายละเอียด"
    2.  **Slide 2:** Student Admission — Title: "เปิดรับสมัครนักเรียนใหม่", Subtitle: "รับสมัครผู้เรียนเข้าศึกษาต่อในระดับชั้นต่าง ๆ", CTA: "ดูขั้นตอนการสมัคร"
    3.  **Slide 3:** School Public Relations — Title: "กิจกรรมและข่าวสารโรงเรียน", Subtitle: "ติดตามข่าวประชาสัมพันธ์และภาพความสำเร็จ", CTA: "ดูแกลเลอรี"

### 4.3 Quick Links Section
*   **Appearance:** 5-column icon grid, styled with a professional gold/bronze (`#996600`) border and clean backgrounds.
*   **Actions:**
    1.  **Student Information:** Redirects to Parent Dashboard Login.
    2.  **Teacher Information:** Redirects to Teacher Dashboard Login.
    3.  **Academic Calendar:** Downloads academic calendar PDF.
    4.  **Official Forms:** Downloads general official forms PDF.
    5.  **Contact School:** Smooth scrolls to the Footer contact details.

### 4.4 About Page (`/about`)
*   **Appearance:** Official white background (`#ffffff`) with elegant `#FF33FF` headers and `#996600` borders.
*   **Sections:**
    -   **School History:** Background narrative of WISSK's establishment.
    -   **Vision & Mission:** Bulleted declarations of institutional values.
    -   **Executive Committee:** Grid showing profile pictures, names, and titles of school administrators.

### 4.5 Footer Section
*   **Appearance:** Multi-column layout with a gold top border (`#996600`) and dark or neutral white/primary backdrop.
*   **Columns:**
    1.  **Address & Location:** School address block.
    2.  **Contact Details:** Phone number, email, and operating hours.
    3.  **Social Links:** Icons linked to Facebook, YouTube, and LINE.
