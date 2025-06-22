# SmartSpace Mobile App

A modern, AI-powered interior design mobile application built with React Native and Expo.

## 🚀 Features

### 🛍️ E-Commerce
- **Product Browsing**: Browse furniture and home decor items
- **Search & Filter**: Find products by category, price, and style
- **Shopping Cart**: Add, remove, and manage cart items
- **Wishlist**: Save favorite products for later
- **Order Management**: Track orders and view order history

### 🤖 AI-Powered Design
- **AI Design Generator**: Create custom interior designs using AI
- **Room Types**: Living room, bedroom, kitchen, bathroom, and more
- **Design Styles**: Modern, minimalist, Scandinavian, industrial, and more
- **Design History**: View and manage your generated designs
- **Design Editing**: Modify and refine your AI-generated designs

### 💬 AI Chat Assistant
- **Real-time Chat**: Interactive AI assistant for design advice
- **Chat History**: Persistent conversation history
- **Design Tips**: Get personalized interior design recommendations
- **Product Suggestions**: AI-powered product recommendations

### 👤 User Management
- **Authentication**: Secure login and registration
- **Profile Management**: Update personal information and preferences
- **Settings**: Customize app preferences and notifications
- **Account Security**: Secure token-based authentication

## 🛠️ Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **State Management**: React Context API
- **Language**: TypeScript
- **UI Components**: Custom components with React Native
- **Icons**: Expo Vector Icons
- **Storage**: AsyncStorage
- **Styling**: StyleSheet with custom design system

## 📱 Screenshots

### Authentication
- Login screen with modern UI
- Registration with validation
- Secure authentication flow

### Main App
- Tab-based navigation
- Product browsing with search
- AI design generation
- Chat interface
- User profile and settings

## 🎨 Design System

### Colors
- **Primary**: #A58077 (Warm Brown)
- **Secondary**: #E5CBBE (Light Beige)
- **Background**: #181818 (Dark Gray)
- **Surface**: #2C2C2C (Medium Gray)
- **Text**: #FCF3E8 (Light Cream)

### Typography
- **Font**: SpaceMono (for special elements)
- **System Fonts**: Platform-specific fonts for readability

### Components
- **Cards**: Rounded corners with shadows
- **Buttons**: Consistent styling with hover states
- **Inputs**: Modern form inputs with validation
- **Modals**: Slide-up modals for better UX

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smartspace
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/simulator**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   
   # Web
   npm run web
   ```

## 📁 Project Structure

```
smartspace/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation screens
│   ├── auth/              # Authentication screens
│   └── _layout.tsx        # Root layout
├── components/            # Reusable components
│   ├── ProductCard.tsx    # Product display component
│   ├── AIDesignCard.tsx   # AI design display component
│   ├── ProfileEditModal.tsx # Profile editing modal
│   ├── SettingsScreen.tsx # Settings screen
│   ├── ErrorBoundary.tsx  # Error handling component
│   └── SplashScreen.tsx   # App splash screen
├── contexts/              # React Context providers
│   ├── AuthContext.tsx    # Authentication state
│   └── CartContext.tsx    # Shopping cart state
├── services/              # API and external services
│   └── api.ts            # Backend API integration
├── utils/                 # Utility functions
│   ├── constants.ts      # App constants
│   ├── validation.ts     # Form validation
│   └── helpers.ts        # Helper functions
├── constants/             # App constants
│   └── Colors.ts         # Color definitions
├── hooks/                 # Custom React hooks
├── assets/                # Static assets
└── types/                 # TypeScript type definitions
```

## 🔧 Configuration

### API Configuration
Update the API base URL in `services/api.ts`:
```typescript
const API_BASE_URL = 'http://your-backend-url/api';
```

### Environment Variables
Create a `.env` file for environment-specific configuration:
```env
API_BASE_URL=http://localhost:5000/api
APP_ENV=development
```

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Run Linting
```bash
npm run lint
```

## 📦 Building for Production

### iOS
```bash
expo build:ios
```

### Android
```bash
expo build:android
```

## 🔒 Security Features

- **Token-based Authentication**: Secure JWT token management
- **Input Validation**: Comprehensive form validation
- **Error Handling**: Graceful error handling with user feedback
- **Data Encryption**: Secure storage of sensitive data

## 🚀 Performance Optimizations

- **Lazy Loading**: Components loaded on demand
- **Image Optimization**: Efficient image loading and caching
- **Memory Management**: Proper cleanup and memory optimization
- **Bundle Optimization**: Minimized bundle size

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Changelog

### Version 1.0.0
- Initial release
- Core e-commerce functionality
- AI design generation
- Chat assistant
- User authentication
- Profile management

## 🎯 Roadmap

### Upcoming Features
- [ ] Push notifications
- [ ] Offline mode
- [ ] Social sharing
- [ ] Advanced AI features
- [ ] Payment integration
- [ ] AR preview
- [ ] Voice commands
- [ ] Multi-language support

### Performance Improvements
- [ ] Image lazy loading
- [ ] Caching optimization
- [ ] Bundle size reduction
- [ ] Memory optimization

---

Built with ❤️ using React Native and Expo
