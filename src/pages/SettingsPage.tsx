import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AppLayout from '../components/layouts/AppLayout';

type FormData = {
  currency: string;
  dateFormat: string;
  theme: 'light' | 'dark' | 'system';
};

const SettingsPage = () => {
  const { user, updateUserPreferences, isLoading } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  
  const { control, handleSubmit, formState: { errors, isDirty } } = useForm<FormData>({
    defaultValues: {
      currency: user?.preferences.currency || 'USD',
      dateFormat: user?.preferences.dateFormat || 'MM/DD/YYYY',
      theme: user?.preferences.theme || 'light',
    }
  });

  const onSubmit = async (data: FormData) => {
    setIsSaving(true);
    try {
      await updateUserPreferences(data);
    } catch (error) {
      console.error('Settings update error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout title="Settings">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-32 bg-gray-200 rounded mb-6"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Settings">
      <div className="p-4 sm:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500">
            Manage your application preferences
          </p>
        </div>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Display Preferences
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Customize how the application looks and displays information
            </p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                    Default Currency
                  </label>
                  <div className="mt-1">
                    <Controller
                      name="currency"
                      control={control}
                      rules={{ required: 'Currency is required' }}
                      render={({ field }) => (
                        <select
                          id="currency"
                          {...field}
                          className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        >
                          <option value="USD">US Dollar (USD)</option>
                          <option value="EUR">Euro (EUR)</option>
                          <option value="GBP">British Pound (GBP)</option>
                          <option value="JPY">Japanese Yen (JPY)</option>
                          <option value="CAD">Canadian Dollar (CAD)</option>
                          <option value="AUD">Australian Dollar (AUD)</option>
                          <option value="CNY">Chinese Yuan (CNY)</option>
                          <option value="INR">Indian Rupee (INR)</option>
                        </select>
                      )}
                    />
                  </div>
                  {errors.currency && (
                    <p className="mt-2 text-sm text-red-600">{errors.currency.message}</p>
                  )}
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="dateFormat" className="block text-sm font-medium text-gray-700">
                    Date Format
                  </label>
                  <div className="mt-1">
                    <Controller
                      name="dateFormat"
                      control={control}
                      rules={{ required: 'Date format is required' }}
                      render={({ field }) => (
                        <select
                          id="dateFormat"
                          {...field}
                          className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        >
                          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                          <option value="MMM DD, YYYY">MMM DD, YYYY</option>
                          <option value="DD MMM YYYY">DD MMM YYYY</option>
                        </select>
                      )}
                    />
                  </div>
                  {errors.dateFormat && (
                    <p className="mt-2 text-sm text-red-600">{errors.dateFormat.message}</p>
                  )}
                </div>

                <div className="sm:col-span-6">
                  <label className="block text-sm font-medium text-gray-700">
                    Theme
                  </label>
                  <div className="mt-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                    <div className="flex items-center">
                      <Controller
                        name="theme"
                        control={control}
                        render={({ field }) => (
                          <input
                            id="theme-light"
                            type="radio"
                            value="light"
                            checked={field.value === 'light'}
                            onChange={() => field.onChange('light')}
                            className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300"
                          />
                        )}
                      />
                      <label htmlFor="theme-light" className="ml-3 block text-sm font-medium text-gray-700">
                        Light
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <Controller
                        name="theme"
                        control={control}
                        render={({ field }) => (
                          <input
                            id="theme-dark"
                            type="radio"
                            value="dark"
                            checked={field.value === 'dark'}
                            onChange={() => field.onChange('dark')}
                            className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300"
                          />
                        )}
                      />
                      <label htmlFor="theme-dark" className="ml-3 block text-sm font-medium text-gray-700">
                        Dark
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <Controller
                        name="theme"
                        control={control}
                        render={({ field }) => (
                          <input
                            id="theme-system"
                            type="radio"
                            value="system"
                            checked={field.value === 'system'}
                            onChange={() => field.onChange('system')}
                            className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300"
                          />
                        )}
                      />
                      <label htmlFor="theme-system" className="ml-3 block text-sm font-medium text-gray-700">
                        System
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
              <button
                type="submit"
                disabled={isSaving || !isDirty}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
        
        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Security
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Manage your account security settings
            </p>
          </div>
          
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Two-factor authentication
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex justify-between items-center">
                  <span>Disabled</span>
                  <button 
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Enable
                  </button>
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Password
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex justify-between items-center">
                  <span>Last changed 30 days ago</span>
                  <button 
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Change password
                  </button>
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Sessions
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex justify-between items-center">
                  <span>1 active session</span>
                  <button 
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Manage sessions
                  </button>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;