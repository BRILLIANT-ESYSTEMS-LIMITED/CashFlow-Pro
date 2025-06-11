import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileSpreadsheet, 
  BarChart3, 
  Settings, 
  User, 
  LogOut, 
  Menu, 
  X,
  ChevronDown,
  Sun,
  Moon,
  Laptop
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Transition } from '@headlessui/react';

type NavItemProps = {
  to: string;
  icon: ReactNode;
  text: string;
  active: boolean;
};

const NavItem = ({ to, icon, text, active }: NavItemProps) => (
  <Link
    to={to}
    className={`flex items-center px-4 py-3 text-sm rounded-lg transition-colors ${
      active
        ? 'bg-primary-50 text-primary-600 font-medium'
        : 'text-gray-700 hover:bg-gray-100'
    }`}
  >
    <span className="mr-3">{icon}</span>
    {text}
  </Link>
);

type AppLayoutProps = {
  children: ReactNode;
  title: string;
};

const AppLayout = ({ children, title }: AppLayoutProps) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', icon: <LayoutDashboard size={20} />, text: 'Dashboard' },
    { to: '/statements', icon: <FileSpreadsheet size={20} />, text: 'Statements' },
    { to: '/reports', icon: <BarChart3 size={20} />, text: 'Reports' },
    { to: '/settings', icon: <Settings size={20} />, text: 'Settings' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 border-r border-gray-200 bg-white">
        <div className="p-4 border-b border-gray-200">
          <Link to="/" className="flex items-center">
            <FileSpreadsheet className="w-8 h-8 text-primary-500 mr-2" />
            <span className="text-lg font-bold text-gray-900">FinanceManager</span>
          </Link>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              text={item.text}
              active={pathname === item.to}
            />
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
                {user?.name.charAt(0)}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-4 w-full flex items-center px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
          >
            <LogOut size={16} className="mr-2" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden rounded-md p-2 text-gray-700 hover:bg-gray-100"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <div className="flex items-center ml-2 md:ml-0">
                <FileSpreadsheet className="w-6 h-6 text-primary-500 md:hidden" />
                <h1 className="ml-2 text-xl font-semibold text-gray-800">{title}</h1>
              </div>
            </div>
            <div className="flex items-center">
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center rounded-full focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
                    {user?.name.charAt(0)}
                  </div>
                  <ChevronDown size={16} className="ml-1 text-gray-500" />
                </button>
                <Transition
                  show={isUserMenuOpen}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User size={16} className="mr-2" />
                      Your Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings size={16} className="mr-2" />
                      Settings
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500">
                      Theme
                    </div>
                    <button
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        // Handle theme change
                        setIsUserMenuOpen(false);
                      }}
                    >
                      <Sun size={16} className="mr-2" />
                      Light
                    </button>
                    <button
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        // Handle theme change
                        setIsUserMenuOpen(false);
                      }}
                    >
                      <Moon size={16} className="mr-2" />
                      Dark
                    </button>
                    <button
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        // Handle theme change
                        setIsUserMenuOpen(false);
                      }}
                    >
                      <Laptop size={16} className="mr-2" />
                      System
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        handleLogout();
                        setIsUserMenuOpen(false);
                      }}
                    >
                      <LogOut size={16} className="mr-2" />
                      Sign Out
                    </button>
                  </div>
                </Transition>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Menu */}
        <Transition
          show={isMobileMenuOpen}
          enter="transition-opacity ease-linear duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          className="md:hidden"
        >
          <div className="fixed inset-0 z-20 bg-black bg-opacity-25" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="fixed inset-y-0 left-0 z-30 w-full max-w-xs bg-white">
            <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
              <div className="flex items-center">
                <FileSpreadsheet className="w-6 h-6 text-primary-500" />
                <span className="ml-2 text-lg font-bold text-gray-900">FinanceManager</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <X size={24} className="text-gray-500" />
              </button>
            </div>
            <nav className="px-4 py-2 space-y-1">
              {navItems.map((item) => (
                <NavItem
                  key={item.to}
                  to={item.to}
                  icon={item.icon}
                  text={item.text}
                  active={pathname === item.to}
                />
              ))}
              <Link
                to="/profile"
                className={`flex items-center px-4 py-3 text-sm rounded-lg transition-colors ${
                  pathname === '/profile'
                    ? 'bg-primary-50 text-primary-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <User size={20} className="mr-3" />
                Profile
              </Link>
            </nav>
          </div>
        </Transition>

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;