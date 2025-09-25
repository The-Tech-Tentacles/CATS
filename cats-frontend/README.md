# CATS Frontend - Complaint & Application Tracking System

A modern Next.js TypeScript frontend for the CATS (Complaint & Application Tracking System) built for cyber crime branch operations.

## 🚀 Technology Stack

- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 3.3
- **State Management:** React Query (TanStack Query)
- **Forms:** React Hook Form with Zod validation
- **HTTP Client:** Axios
- **UI Components:** Headless UI & Radix UI
- **Icons:** Lucide React
- **Authentication:** JWT with secure token management
- **Development:** ESLint, Prettier, TypeScript

## 📋 Features

### 🔐 Authentication & Authorization

- Secure JWT-based authentication
- Role-based access control (Admin, Officer, Citizen)
- Protected routes and components
- Session management

### 📝 Complaint Management

- Submit new complaints with evidence upload
- Track complaint status and timeline
- Real-time status updates
- Priority-based categorization
- Evidence management (images, documents)

### 📄 Application Processing

- Submit various applications
- Document upload and management
- Status tracking and notifications
- Officer assignment and processing

### 👥 User Management

- User profiles and role management
- Officer assignments
- Department-wise organization
- Audit trail tracking

### 📊 Dashboard & Analytics

- Role-specific dashboards
- Real-time statistics
- Visual charts and graphs
- Performance metrics

### 🔔 Notifications

- Real-time notifications
- Email notifications
- Status change alerts
- Assignment notifications

## 🛠️ Installation & Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- CATS Backend API running

### 1. Install Dependencies

```bash
npm install
# or
yarn install
```

### 2. Environment Configuration

Create `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=CATS - Complaint & Application Tracking System
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-nextauth-secret-key-here
```

### 3. Development Server

```bash
npm run dev
# or
yarn dev
```

Visit [http://localhost:3001](http://localhost:3001) to view the application.

### 4. Build for Production

```bash
npm run build
npm start
# or
yarn build
yarn start
```

## 📁 Project Structure

```
cats-frontend/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── auth/           # Authentication pages
│   │   ├── dashboard/      # Dashboard pages
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Home page
│   │   └── globals.css     # Global styles
│   ├── components/         # Reusable UI components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility libraries
│   ├── services/          # API service classes
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Helper functions
├── public/                # Static assets
├── .env.local            # Environment variables
├── next.config.js        # Next.js configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies and scripts
```

## 🎨 UI Components & Styling

### Tailwind CSS Classes

The project includes custom component classes:

- `.btn-*` - Button variants (primary, secondary, success, warning, error)
- `.form-*` - Form input and label styles
- `.card-*` - Card component styles
- `.badge-*` - Status badge styles
- `.nav-link-*` - Navigation link styles
- `.table-*` - Table component styles
- `.alert-*` - Alert message styles

### Component Architecture

- **Atomic Design:** Components organized by complexity
- **TypeScript:** Fully typed components and props
- **Responsive:** Mobile-first responsive design
- **Accessible:** WCAG compliant components

## 🔧 API Integration

### Services Architecture

- **AuthService:** Authentication and user management
- **ComplaintService:** Complaint CRUD operations
- **ApplicationService:** Application processing
- **ApiClient:** Centralized HTTP client with interceptors

### Features

- Automatic token management
- Request/response interceptors
- Error handling and retry logic
- File upload support
- Pagination support

## 🔒 Security Features

- JWT token secure storage
- Protected routes with role checking
- XSS protection with Content Security Policy
- CSRF protection
- Input validation and sanitization
- Secure file uploads

## 📱 Responsive Design

- Mobile-first approach
- Tablet and desktop optimized
- Touch-friendly interfaces
- Progressive Web App ready

## 🧪 Development Guidelines

### Code Quality

- TypeScript strict mode enabled
- ESLint with custom rules
- Prettier code formatting
- Pre-commit hooks

### Best Practices

- Component composition over inheritance
- Custom hooks for logic reuse
- Proper error boundaries
- Performance optimization with React.memo
- Lazy loading for code splitting

## 🚀 Deployment

### Production Build

```bash
npm run build
npm start
```

### Docker Deployment

```bash
docker build -t cats-frontend .
docker run -p 3001:3001 cats-frontend
```

### Environment Variables

Set production environment variables:

- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXTAUTH_SECRET` - Authentication secret
- `NEXTAUTH_URL` - Application URL

## 📞 Support

For technical support or questions:

- Check the backend API documentation
- Review component documentation
- Contact development team

## 🔄 Version History

- **v1.0.0** - Initial release with core features
- Modern Next.js 14 with App Router
- TypeScript integration
- Tailwind CSS styling
- Complete authentication system
- Complaint and application management

---

**Built with ❤️ for Cyber Crime Branch Operations**
