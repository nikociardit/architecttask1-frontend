# Windows Endpoint Management System - Dashboard Setup

## 🎯 Overview

This is a modern React/Next.js dashboard for the Windows Endpoint Management System. It provides a comprehensive admin interface for managing users, clients, tasks, and monitoring system security.

## ✨ Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: Create, edit, and manage user accounts with different roles
- **Client Monitoring**: Real-time monitoring of connected Windows endpoints
- **Task Management**: Create and execute PowerShell/CMD tasks on remote clients
- **Audit Logs**: Complete audit trail with search and export functionality
- **Security Center**: Monitor security alerts and failed login attempts
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Real-time Updates**: Auto-refreshing data with WebSocket-like updates

## 🚀 Quick Start

### 1. Prerequisites

```bash
# Ensure you have Node.js 18+ installed
node --version
npm --version

# Make sure your backend is running on localhost:8000
# See backend setup guide for details
```

### 2. Create Dashboard Directory

```bash
# Create the dashboard directory
mkdir frontend
cd frontend

# Initialize Next.js project
npx create-next-app@latest . --typescript --tailwind --eslint --app=false
```

### 3. Install Dependencies

```bash
# Install all required dependencies
npm install next@^14.0.0 react@^18.2.0 react-dom@^18.2.0 typescript@^5.2.0
npm install @types/react@^18.2.0 @types/react-dom@^18.2.0 @types/node@^20.0.0
npm install tailwindcss@^3.3.0 autoprefixer@^10.4.0 postcss@^8.4.0
npm install axios@^1.6.0 react-hook-form@^7.47.0 
npm install @heroicons/react@^2.0.0 recharts@^2.8.0 date-fns@^2.30.0
npm install clsx@^2.0.0 react-hot-toast@^2.4.0 js-cookie@^3.0.0
npm install @types/js-cookie@^3.0.0
npm install @tailwindcss/forms@^0.5.0 @headlessui/react@^1.7.0

# Development dependencies
npm install --save-dev eslint@^8.0.0 eslint-config-next@^14.0.0
```

### 4. Setup Project Structure

```bash
# Create the required directory structure
mkdir -p pages/dashboard
mkdir -p components
mkdir -p contexts
mkdir -p lib
mkdir -p styles
mkdir -p public
```

### 5. Copy Files

Copy all the provided files to their respective locations:

```
frontend/
├── package.json
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
├── pages/
│   ├── _app.tsx
│   ├── index.tsx
│   ├── login.tsx
│   └── dashboard/
│       ├── index.tsx
│       ├── users.tsx
│       ├── clients.tsx
│       ├── tasks.tsx
│       ├── audit.tsx
│       └── security.tsx
├── components/
│   └── Layout.tsx
├── contexts/
│   └── AuthContext.tsx
├── lib/
│   └── api.ts
└── styles/
    └── globals.css
```

### 6. Configure Environment

Create a `.env.local` file:

```bash
# Create environment file
cat > .env.local << 'EOF'
# Backend API Configuration
BACKEND_URL=http://localhost:8000
API_BASE_URL=http://localhost:8000/api

# Next.js Configuration
NEXT_PUBLIC_APP_NAME=Windows Endpoint Management System
NEXT_PUBLIC_APP_VERSION=1.1.0
EOF
```

### 7. Start Development Server

```bash
# Start the development server
npm run dev

# The dashboard will be available at:
# http://localhost:3000
```

## 🔑 Default Login

When you first access the dashboard, use these credentials:

- **URL**: http://localhost:3000
- **Username**: `admin`
- **Password**: `ChangeMe123!`

> **Important**: Change the default password immediately after first login!

## 📱 Dashboard Features

### Dashboard Overview
- System statistics and health monitoring
- Real-time client status
- Task execution metrics
- Security alerts summary
- Interactive charts and graphs

### User Management
- Create, edit, and delete users
- Role assignment (Admin, Technician, Auditor)
- Account status management
- Password policies

### Client Monitoring
- Real-time client status (online/offline)
- Client hardware information
- VPN connection status
- Remote management capabilities

### Task Management
- Create PowerShell/CMD tasks
- Schedule task execution
- Monitor task progress and results
- View task output and errors

### Audit Logs
- Complete system activity log
- Advanced filtering options
- CSV export functionality
- Security event monitoring

### Security Center
- Security alert dashboard
- Failed login monitoring
- Security recommendations
- Real-time threat detection

## 🎨 Customization

### Branding
Edit `tailwind.config.js` to customize colors:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        50: '#eff6ff',
        500: '#3b82f6',  // Change this to your brand color
        600: '#2563eb',
        700: '#1d4ed8',
        900: '#1e3a8a',
      }
    }
  }
}
```

### API Configuration
Edit `lib/api.ts` to change backend URL:

```typescript
baseURL: process.env.API_BASE_URL || 'http://your-backend-url/api'
```

## 🔧 Development

### Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Linting
npm run lint

# Type checking
npm run type-check
```

### Adding New Features

1. **New Page**: Create component in `pages/dashboard/`
2. **New Component**: Add to `components/`
3. **API Integration**: Extend `lib/api.ts`
4. **Authentication**: Use `useAuth()` hook
5. **Permissions**: Use `usePermissions()` hook

### Code Structure

```typescript
// Example new page
import React from 'react';
import Layout from '../../components/Layout';
import { withAuth } from '../../contexts/AuthContext';

const NewPage: React.FC = () => {
  return (
    <Layout title="New Page">
      <div className="space-y-6">
        {/* Your content here */}
      </div>
    </Layout>
  );
};

export default withAuth(NewPage);
```

## 🚀 Production Deployment

### Build for Production

```bash
# Create optimized production build
npm run build

# Test production build locally
npm start
```

### Environment Variables

Set these in production:

```bash
BACKEND_URL=https://your-backend-domain.com
API_BASE_URL=https://your-backend-domain.com/api
```

### Deployment Options

1. **Vercel** (Recommended)
   ```bash
   npm install -g vercel
   vercel --prod
   ```

2. **Docker**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

3. **Traditional Server**
   ```bash
   npm run build
   npm start
   ```

## 🔍 Troubleshooting

### Common Issues

1. **Backend Connection Errors**
   ```bash
   # Check if backend is running
   curl http://localhost:8000/api/health
   
   # Verify CORS settings in backend
   ```

2. **Authentication Issues**
   ```bash
   # Clear browser cookies and localStorage
   # Check JWT token expiration
   ```

3. **Build Errors**
   ```bash
   # Clear cache and reinstall
   rm -rf .next node_modules package-lock.json
   npm install
   npm run build
   ```

### Performance Optimization

1. **Enable compression**
2. **Optimize images**
3. **Use Next.js Image component**
4. **Implement proper caching**

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Hook Form](https://react-hook-form.com/)
- [Heroicons](https://heroicons.com/)
- [Recharts](https://recharts.org/)

## 🤝 Support

For issues and questions:

1. Check the troubleshooting section
2. Review backend logs
3. Check browser console for errors
4. Verify API endpoints are working

## 📄 License

This project is part of the Windows Endpoint Management System and follows the same licensing terms.

---

**Happy coding!** 🎉 The dashboard provides a powerful, modern interface for managing your Windows endpoints effectively.
