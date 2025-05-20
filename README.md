# 📅 Schedro

Schedro is a minimalistic scheduling web application designed for seamless collaboration. It solves the problem of scheduling coordination across teams and individuals by providing an intuitive, shareable calendar system.

## ✨ Core Features

- 🗓️ **Personal Calendar Management**: Create, view, edit, and delete appointments on your personal calendar
- 🔗 **Shareable Calendar Links**: Generate unique links to share with others for viewing or editing your calendar
- 👥 **Group-Based Scheduling**: Associate appointments with specific groups, displaying overlapping events side by side
- ➕ **Appointment Creation Interface**: Easily create and edit appointments with a user-friendly modal interface

## 🛠️ Tech Stack

- 🖥️ **Frontend**: Next.js 15 with App Router
- 🎨 **Styling**: TailwindCSS, Shadcn/UI
- 🔧 **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- 📊 **State Management**: React Context / Zustand

## 🚀 Getting Started

### 📋 Prerequisites

- Node.js (latest LTS version recommended)
- npm
- Supabase account

### ⚙️ Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/schedro.git
cd schedro
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   - Create a `.env.local` file in the root directory
   - Add your Supabase credentials

4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 👥 Use Cases

Schedro is ideal for:

- 👨‍⚕️ **Healthcare Providers**: Coordinate appointment slots and share schedules with patients
- 🎓 **Educational Institutions**: Manage classroom schedules and faculty availability
- 👨‍💼 **Team Managers**: Visualize team member schedules and resource allocation
- 👤 **Individuals**: Manage personal schedules and selectively share availability

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for more information.

## 📄 License

[MIT](LICENSE)
