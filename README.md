# Windows Endpoint Management System - Dashboard

![Dashboard Screenshot](https://via.placeholder.com/800x400/3B82F6/FFFFFF?text=Windows+Endpoint+Management+Dashboard)

A modern, responsive React/Next.js dashboard for managing Windows endpoints with comprehensive monitoring, task execution, and security features.

## Features

### 🔐 Authentication & Security
- JWT-based authentication with secure token management
- Role-based access control (Admin, Technician, Auditor)
- Session management with automatic logout
- Password strength validation
- Security event monitoring

### 👥 User Management
- Create, edit, and delete user accounts
- Role assignment and permission management
- Account status control (active/inactive/locked)
- Password policy enforcement
- User activity tracking

### 💻 Client Monitoring
- Real-time client status monitoring (online/offline)
- Hardware information display
- VPN connection status tracking
- Client configuration management
- Heartbeat monitoring with automatic status updates

### ⚡ Task Management
- Create and execute PowerShell/CMD tasks remotely
- Task scheduling and priority management
- Real-time task status monitoring
- Task output and error logging
- Task templates for common operations

### 📊 Dashboard Analytics
- System overview with key metrics
- Interactive charts and graphs
- Real-time statistics
- Client distribution visualization
- Task execution success rates

### 🔍 Audit & Logging
- Comprehensive audit trail of all actions
- Advanced filtering and search capabilities
- CSV export functionality
- Security event monitoring
- Failed login attempt tracking

### 🛡️ Security Center
- Security alert dashboard
- Real-time threat monitoring
- Security recommendations
- Failed login monitoring
- Suspicious activity detection

## Tech Stack

- **Frontend**: React 18, Next.js 14, TypeScript
- **Styling**: Tailwind CSS with custom components
- **Charts**: Recharts for data visualization
- **Forms**: React Hook Form with validation
- **HTTP Client**: Axios with interceptors
- **Icons**: Heroicons
- **Notifications**: React Hot Toast
- **Date Handling**: date-fns

## Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- Backend API running on `localhost:8000`
- Modern web browser

### Installation

```bash
# Clone or create the dashboard directory
mkdir endpoint-dashboard && cd endpoint-dashboard

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env.local

# Edit environment variables
nano .env.local

# Start development server
npm run dev
```

### Environment Configuration

```bash
# Backend Configuration
BACKEND_URL=http://localhost:8000
API_BASE_URL=http://localhost:8000/api

# Application Settings
NEXT_PUBLIC_APP_NAME=Windows Endpoint Management System
NEXT_PUBLIC_APP_VERSION=1.1.0
```

### Default Access

- **URL**: http://localhost:3000
- **Username**: `admin`
- **Password**: `ChangeMe123!`

> **⚠️ Important**: Change the default password immediately after first login!

## Project Structure

```
dashboard/
├── components/           # Reusable UI components
│   ├── Layout.tsx       # Main layout with navigation
│   ├── Loading.tsx      # Loading indicators
│   ├── ConfirmModal.tsx # Confirmation dialogs
│   ├── DataTable.tsx    # Data table component
│   ├── Pagination.tsx   # Pagination component
│   └── StatusBadge.tsx  # Status indicators
├── contexts/            # React contexts
│   └── AuthContext.tsx  # Authentication context
├── lib/                # Utility libraries
│   ├── api.ts          # API client
│   └── utils.ts        # Helper functions
├── pages/              # Next.js pages
│   ├── _app.tsx        # App configuration
│   ├── index.tsx       # Home page (redirects)
│   ├── login.tsx       # Login page
│   └── dashboard/      # Dashboard pages
│       ├── index.tsx   # Dashboard overview
│       ├── users.tsx   # User management
│       ├── clients.tsx # Client monitoring
│       ├── tasks.tsx   # Task management
│       ├── audit.tsx   # Audit logs
│       └── security.tsx# Security center
├── styles/             # CSS styles
│   └── globals.css     # Global styles
└── scripts/            # Build scripts
    └── build.sh        # Build and deploy script
```

## Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks

# Build & Deploy
chmod +x scripts/build.sh
./scripts/build.sh                    # Standard build
./scripts/build.sh static             # Static export
./scripts/build.sh package            # Create deployment package
./scripts/build.sh static deploy      # Build and deploy
```

## Dashboard Features

### Dashboard Overview
![Dashboard Overview](https://via.placeholder.com/600x300/10B981/FFFFFF?text=Dashboard+Overview)

- **System Statistics**: Real-time metrics and KPIs
- **Client Status**: Visual overview of online/offline clients
- **Task Metrics**: Success rates and execution statistics
- **Security Alerts**: Important security notifications
- **Interactive Charts**: Data visualization with Recharts

### User Management
![User Management](https://via.placeholder.com/600x300/3B82F6/FFFFFF?text=User+Management)

- **User CRUD Operations**: Create, read, update, delete users
- **Role Management**: Assign and modify user roles
- **Account Controls**: Enable/disable accounts, reset passwords
- **Permission Matrix**: Role-based access control
- **Activity Monitoring**: Track user login history

### Client Monitoring
![Client Monitoring](https://via.placeholder.com/600x300/8B5CF6/FFFFFF?text=Client+Monitoring)

- **Real-time Status**: Live client online/offline status
- **Hardware Info**: CPU, memory, disk space information
- **VPN Status**: Connection status and IP addresses
- **Configuration**: Remote client settings management
- **Heartbeat Tracking**: Connection health monitoring

### Task Management
![Task Management](https://via.placeholder.com/600x300/F59E0B/FFFFFF?text=Task+Management)

- **Task Creation**: PowerShell/CMD task builder
- **Execution Monitoring**: Real-time task progress
- **Output Viewing**: Command output and error logs
- **Scheduling**: Schedule tasks for later execution
- **Templates**: Reusable task templates

## API Integration

The dashboard integrates with the backend API through a comprehensive API client:

```typescript
// Example API usage
import apiClient from '@/lib/api';

// Get users with pagination
const users = await apiClient.getUsers(1, 50, 'search-term');

// Create a new task
const task = await apiClient.createTask({
  name: 'System Update',
  command: 'Get-WindowsUpdate',
  client_id: 1
});

// Get audit logs with filters
const logs = await apiClient.getAuditLogs(1, 100, {
  action: 'login',
  severity: 'warning'
});
```

## Authentication Flow

1. **Login**: User submits credentials
2. **Token Generation**: Backend returns JWT token
3. **Token Storage**: Stored in secure HTTP-only cookies
4. **Request Middleware**: Automatically attach token to requests
5. **Token Validation**: Verify token on protected routes
6. **Automatic Refresh**: Handle token expiration

## Role-Based Permissions

| Feature | Admin | Technician | Auditor |
|---------|-------|------------|---------|
| User Management | ✅ | ❌ | ❌ |
| Client Monitoring | ✅ | ✅ | ✅ |
| Task Execution | ✅ | ✅ | ❌ |
| Audit Logs | ✅ | ✅ | ✅ |
| Security Center | ✅ | ❌ | ✅ |
| Data Export | ✅ | ❌ | ✅ |

## Responsive Design

The dashboard is fully responsive and works on:

- **Desktop**: Full feature set with multi-column layouts
- **Tablet**: Optimized layouts with collapsible navigation
- **Mobile**: Touch-friendly interface with mobile navigation

## Development

### Adding New Features

1. **Create Component**: Add to `components/` directory
2. **Add Route**: Create page in `pages/dashboard/`
3. **API Integration**: Extend `lib/api.ts`
4. **Add to Navigation**: Update `components/Layout.tsx`
5. **Permissions**: Use `usePermissions()` hook

### Code Style

- **TypeScript**: Strict typing throughout
- **ESLint**: Configured for Next.js and React
- **Prettier**: Code formatting (optional)
- **Component Structure**: Functional components with hooks
- **CSS**: Tailwind utility classes

### Example Component

```typescript
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { withAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/api';

const NewFeature: React.FC = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await apiClient.getData();
      setData(response.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="New Feature">
      <div className="space-y-6">
        {/* Your component content */}
      </div>
    </Layout>
  );
};

export default withAuth(NewFeature);
```

## Production Deployment

### Build for Production

```bash
# Standard server deployment
npm run build
npm start

# Static export (for CDN/static hosting)
npm run build
npm run export
npx serve out/

# Using build script
./scripts/build.sh static package deploy
```

### Environment Variables

```bash
# Production environment
BACKEND_URL=https://api.yourdomain.com
API_BASE_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_APP_NAME=Your Company Endpoint Manager
```

### Deployment Options

1. **Vercel** (Recommended)
   ```bash
   vercel --prod
   ```

2. **Docker**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --production
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

3. **Traditional Server**
   ```bash
   pm2 start npm --name "dashboard" -- start
   ```

## Performance Optimization

- **Code Splitting**: Automatic with Next.js
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: `npm run analyze`
- **Caching**: API response caching
- **Lazy Loading**: Component lazy loading

## Security Considerations

- **XSS Prevention**: Input sanitization
- **CSRF Protection**: Token-based requests
- **Content Security Policy**: Strict CSP headers
- **Secure Headers**: Security-focused HTTP headers
- **Authentication**: Secure JWT implementation

## Troubleshooting

### Common Issues

1. **Connection Errors**
   ```bash
   # Check backend availability
   curl http://localhost:8000/api/health
   ```

2. **Authentication Issues**
   ```bash
   # Clear browser storage
   localStorage.clear();
   ```

3. **Build Errors**
   ```bash
   # Clear cache and rebuild
   rm -rf .next node_modules
   npm install
   npm run build
   ```

### Performance Issues

- Enable production optimizations
- Check network requests in DevTools
- Monitor bundle size
- Use React DevTools Profiler

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is part of the Windows Endpoint Management System. All rights reserved.

## Support

- **Documentation**: See `DASHBOARD_SETUP.md`
- **Issues**: Check troubleshooting section
- **Backend**: Ensure backend is running and accessible
- **Browser**: Use modern browsers (Chrome 90+, Firefox 88+, Safari 14+)

---

**Dashboard v1.1.0** - Modern endpoint management interface built with React and Next.js.
