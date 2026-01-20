# AICTE Connect - Next-Generation Video Conferencing

AICTE Connect is a high-performance video conferencing application built to provide seamless, real-time communication. Inspired by Zoom, this platform enables users to host, schedule, and record meetings with ease, all within a secure and responsive interface.

## 🚀 Key Features

- **Secure Authentication**: Multi-factor authentication via Clerk (Social & Email).
- **Instant Meetings**: Start a meeting instantly with optimized camera/mic settings.
- **Advanced Controls**: Recording, screen sharing, participant management (pin/mute/block), and real-time chat.
- **Scheduled Meetings**: Plan ahead and share meeting links for future sessions.
- **Meeting History**: Access logs of past meetings and their recordings.
- **Personal Meeting Room**: A persistent link for your own private meeting space.
- **Responsive Design**: Flawless experience across mobile, tablet, and desktop.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Authentication**: [Clerk](https://clerk.com/)
- **Video/Audio SDK**: [GetStream](https://getstream.io/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/)
- **File Uploads**: [UploadThing](https://uploadthing.com/)
- **Real-time**: [Socket.io](https://socket.io/)

## 📦 Getting Started

### Prerequisites

Ensure you have the following installed:
- [Node.js 18+](https://nodejs.org/)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone [your-repo-url]
   cd aicte-connect
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory and add:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
   CLERK_SECRET_KEY=
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_STREAM_API_KEY=
   STREAM_SECRET_KEY=
   NEXT_PUBLIC_NEXT_URL=http://localhost:3000
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📂 Project Structure

- `/app`: Next.js 14 App Router (Routes & Layouts)
- `/components`: Reusable UI components (Shadcn + Custom)
- `/hooks`: Custom React hooks for local state and Stream integration
- `/lib`: Utility functions and third-party client initializations
- `/providers`: Context providers for Stream, Clerk, and Theme

## 🎓 Acknowledgments

This project was built as a learning journey, following the excellent tutorial by [JavaScript Mastery](https://youtu.be/R8CIO1DZ2b8?si=AjPKWHnBwRjXCbou) on YouTube. It served as a deep dive into Next.js 14, Stream SDK, and advanced full-stack development.

---
Built with ❤️ by [Navaneetha Krishnan S P]
