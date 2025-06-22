import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      // Navigation
      home: 'Home',
      products: 'Products',
      cart: 'Cart',
      orders: 'Orders',
      profile: 'Profile',
      admin: 'Admin',
      logout: 'Logout',
      login: 'Login',
      register: 'Register',

      // Auth
      email: 'Email',
      password: 'Password',
      name: 'Name',
      confirmPassword: 'Confirm Password',
      forgotPassword: 'Forgot Password?',
      noAccount: "Don't have an account?",
      haveAccount: 'Already have an account?',
      signUp: 'Sign Up',
      signIn: 'Sign In',

      // Products
      addToCart: 'Add to Cart',
      outOfStock: 'Out of Stock',
      inStock: 'In Stock',
      price: 'Price',
      category: 'Category',
      style: 'Style',
      color: 'Color',
      description: 'Description',
      relatedProducts: 'You May Also Like',
      backToProducts: 'Back to Products',

      // Cart
      yourCart: 'Your Cart',
      emptyCart: 'Your cart is empty',
      total: 'Total',
      checkout: 'Checkout',
      remove: 'Remove',
      quantity: 'Quantity',

      // Orders
      orderHistory: 'Order History',
      orderNumber: 'Order #',
      orderDate: 'Order Date',
      orderStatus: 'Status',
      orderTotal: 'Total',
      status: {
        pending: 'Pending',
        processing: 'Processing',
        shipped: 'Shipped',
        delivered: 'Delivered',
        cancelled: 'Cancelled'
      },

      // Admin
      dashboard: 'Dashboard',
      manageProducts: 'Manage Products',
      manageOrders: 'Manage Orders',
      manageUsers: 'Manage Users',
      statistics: 'Statistics',
      totalProducts: 'Total Products',
      totalOrders: 'Total Orders',
      totalUsers: 'Total Users',
      totalRevenue: 'Total Revenue',
      recentOrders: 'Recent Orders',
      lowStockProducts: 'Low Stock Products',

      // Theme
      darkMode: 'Dark Mode',
      lightMode: 'Light Mode',

      // Language
      language: 'Language',
      english: 'English',
      arabic: 'Arabic',
    }
  },
  ar: {
    translation: {
      // Navigation
      home: 'الرئيسية',
      products: 'المنتجات',
      cart: 'السلة',
      orders: 'الطلبات',
      profile: 'الملف الشخصي',
      admin: 'الإدارة',
      logout: 'تسجيل الخروج',
      login: 'تسجيل الدخول',
      register: 'إنشاء حساب',

      // Auth
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      name: 'الاسم',
      confirmPassword: 'تأكيد كلمة المرور',
      forgotPassword: 'نسيت كلمة المرور؟',
      noAccount: 'ليس لديك حساب؟',
      haveAccount: 'لديك حساب بالفعل؟',
      signUp: 'إنشاء حساب',
      signIn: 'تسجيل الدخول',

      // Products
      addToCart: 'أضف إلى السلة',
      outOfStock: 'غير متوفر',
      inStock: 'متوفر',
      price: 'السعر',
      category: 'الفئة',
      style: 'النمط',
      color: 'اللون',
      description: 'الوصف',
      relatedProducts: 'قد يعجبك أيضاً',
      backToProducts: 'العودة إلى المنتجات',

      // Cart
      yourCart: 'سلة المشتريات',
      emptyCart: 'سلة المشتريات فارغة',
      total: 'المجموع',
      checkout: 'إتمام الشراء',
      remove: 'حذف',
      quantity: 'الكمية',

      // Orders
      orderHistory: 'سجل الطلبات',
      orderNumber: 'طلب #',
      orderDate: 'تاريخ الطلب',
      orderStatus: 'الحالة',
      orderTotal: 'المجموع',
      status: {
        pending: 'قيد الانتظار',
        processing: 'قيد المعالجة',
        shipped: 'تم الشحن',
        delivered: 'تم التوصيل',
        cancelled: 'ملغي'
      },

      // Admin
      dashboard: 'لوحة التحكم',
      manageProducts: 'إدارة المنتجات',
      manageOrders: 'إدارة الطلبات',
      manageUsers: 'إدارة المستخدمين',
      statistics: 'الإحصائيات',
      totalProducts: 'إجمالي المنتجات',
      totalOrders: 'إجمالي الطلبات',
      totalUsers: 'إجمالي المستخدمين',
      totalRevenue: 'إجمالي الإيرادات',
      recentOrders: 'الطلبات الأخيرة',
      lowStockProducts: 'المنتجات منخفضة المخزون',

      // Theme
      darkMode: 'الوضع الداكن',
      lightMode: 'الوضع الفاتح',

      // Language
      language: 'اللغة',
      english: 'الإنجليزية',
      arabic: 'العربية',
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n; 