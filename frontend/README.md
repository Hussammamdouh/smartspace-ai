# AI Interior Design Frontend

A modern React-based frontend for the AI Interior Design application with comprehensive user interface and seamless backend integration.

## 🚀 Features

- **Modern React 18** with Vite for fast development
- **Tailwind CSS** for responsive and beautiful UI
- **JWT Authentication** with automatic token refresh
- **Real-time Chat** with AI services integration
- **Design Generation** powered by OpenAI
- **Inventory Management** with admin panel
- **Order Processing** with payment integration
- **Responsive Design** for all devices
- **Dark/Light Theme** support
- **Internationalization** ready

## 🛠️ Tech Stack

- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **HTTP Client**: Axios with interceptors
- **Routing**: React Router DOM
- **Notifications**: React Hot Toast
- **Icons**: React Icons
- **Form Validation**: Built-in validation
- **Authentication**: JWT with refresh tokens

## 📋 Prerequisites

- Node.js (v16 or higher)
- Backend server running (see backend README)
- Environment variables configured

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the frontend directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 🌐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL (includes /api) | `http://localhost:5000/api` |

## 📁 Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── admin/             # Admin panel components
│   │   ├── components/    # Admin-specific components
│   │   └── pages/         # Admin pages
│   ├── components/        # Shared components
│   │   ├── landing/       # Landing page components
│   │   └── ...            # Other shared components
│   ├── contexts/          # React contexts
│   │   ├── AuthContext.jsx # Authentication state
│   │   ├── CartContext.jsx # Shopping cart state
│   │   └── ThemeContext.jsx # Theme management
│   ├── pages/             # Main application pages
│   ├── services/          # API services
│   ├── styles/            # Global styles
│   ├── utils/             # Utility functions
│   ├── App.jsx            # Main application component
│   └── main.jsx           # Application entry point
├── .env.example           # Environment variables template
├── package.json           # Dependencies and scripts
├── tailwind.config.js     # Tailwind configuration
└── vite.config.js         # Vite configuration
```

## 🔐 Authentication Flow

The frontend implements a complete authentication system:

1. **Registration**: User creates account with validation
2. **Login**: User authenticates with email/password
3. **Token Management**: Automatic token refresh
4. **Protected Routes**: Role-based access control
5. **Logout**: Secure token cleanup

## 🎨 UI Components

### Core Components
- **Navbar**: Navigation with user menu
- **Footer**: Site footer with links
- **Loader**: Loading spinners and skeletons
- **Modal**: Reusable modal dialogs
- **Toast**: Notification system

### Form Components
- **Input**: Styled input fields
- **PasswordInput**: Password fields with visibility toggle
- **Button**: Consistent button styling
- **Form**: Form validation and submission

### Layout Components
- **ProtectedRoute**: Route protection
- **AdminRoute**: Admin-only routes
- **Layout**: Page layout wrapper

## 📱 Pages

### Public Pages
- **Home**: Landing page with features
- **Login**: User authentication
- **Register**: User registration
- **Products**: Product catalog
- **Product**: Individual product view

### Protected Pages
- **Dashboard**: User dashboard
- **Profile**: User profile management
- **Cart**: Shopping cart
- **Checkout**: Order processing
- **Orders**: Order history
- **Chat**: AI chat interface
- **Design**: Design generation

### Admin Pages
- **Admin Dashboard**: Admin overview
- **Users Management**: User administration
- **Products Management**: Inventory management
- **Orders Management**: Order processing

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Code Style
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting (if configured)
- **PropTypes**: Component prop validation

### State Management
- **AuthContext**: User authentication state
- **CartContext**: Shopping cart state
- **ThemeContext**: Theme preferences

## 🌐 API Integration

The frontend integrates with the backend API through:

1. **Axios Instance**: Configured with interceptors
2. **Token Management**: Automatic refresh handling
3. **Error Handling**: Centralized error management
4. **Loading States**: User feedback during requests

### API Endpoints Used
- Authentication: `/api/auth/*`
- Users: `/api/users/*`
- Inventory: `/api/inventory/*`
- Orders: `/api/orders/*`
- Designs: `/api/design/*`
- Chat: `/api/chat/*`
- AI Services: `/api/chatbot/*` (OpenAI only)

## 🎯 Key Features

### User Experience
- **Responsive Design**: Works on all devices
- **Loading States**: Visual feedback during operations
- **Error Handling**: User-friendly error messages
- **Form Validation**: Real-time validation feedback
- **Smooth Navigation**: Seamless page transitions

### Security
- **JWT Authentication**: Secure token-based auth
- **Protected Routes**: Role-based access control
- **Input Validation**: Client and server-side validation
- **XSS Protection**: Safe data handling

### Performance
- **Code Splitting**: Lazy-loaded components
- **Optimized Images**: WebP format support
- **Caching**: Browser caching strategies
- **Bundle Optimization**: Tree shaking and minification

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy Options
1. **Vercel**: Zero-config deployment
2. **Netlify**: Static site hosting
3. **AWS S3**: Static website hosting
4. **Nginx**: Traditional web server

### Environment Configuration
Set production environment variables:
```env
VITE_API_URL=https://api.aiinteriordesign.com/api
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the API documentation
- Review the backend logs
- Check browser console for errors
- Verify environment variables
