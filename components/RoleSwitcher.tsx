import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { USERS } from '../constants';

const RoleSwitcher: React.FC = () => {
  const context = useContext(AppContext);

  if (!context) return null;

  const { currentUser, setCurrentUser, logout } = context;

  const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUser = USERS.find(u => u.id === event.target.value);
    if (selectedUser) {
      setCurrentUser(selectedUser);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <label htmlFor="role-select" className="text-base font-medium text-gray-700 dark:text-gray-300">Viewing as:</label>
        <select
          id="role-select"
          value={currentUser.id}
          onChange={handleRoleChange}
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
        >
          {USERS.map(user => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={logout}
        className="px-4 py-2 border border-transparent text-base font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        Logout
      </button>
    </div>
  );
};

export default RoleSwitcher;
