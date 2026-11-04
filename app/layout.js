import './globals.css';
import { ToastProvider } from '@/context/ToastContext';
import { AuthProvider } from '@/context/AuthContext';

export const metadata = {
  title: 'SRBS Admixture and Paint Company — Sales Reporting System',
  description: 'SRBS Admixture and Paint Company Sales & Field Activity Management',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-800 antialiased min-h-screen overflow-x-hidden selection:bg-blue-600 selection:text-white">
        <ToastProvider>
          <AuthProvider>{children}</AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
