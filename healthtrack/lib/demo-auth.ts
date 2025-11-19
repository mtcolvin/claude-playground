// Demo authentication using localStorage + database
// For production, this should use NextAuth with database

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

const STORAGE_KEYS = {
  USERS: 'healthtrack_users',
  CURRENT_USER: 'healthtrack_current_user',
};

// Get all users from storage
const getUsers = (): User[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  return data ? JSON.parse(data) : [];
};

// Save users to storage
const saveUsers = (users: User[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

// Register a new user (in both localStorage and database)
export const registerUser = async (data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    const users = getUsers();

    // Check if user already exists in localStorage
    if (users.some(u => u.email === data.email)) {
      return { success: false, error: 'User with this email already exists' };
    }

    // Create user in database via API
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        name: `${data.firstName} ${data.lastName}`,
        role: 'PATIENT',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.error || 'Registration failed' };
    }

    const dbUser = await response.json();

    // Also save to localStorage for demo auth
    const newUser: User = {
      id: dbUser.data.id,
      email: dbUser.data.email,
      name: dbUser.data.name,
      role: dbUser.data.role,
    };

    users.push(newUser);
    saveUsers(users);

    // Auto sign in
    setCurrentUser(newUser);

    return { success: true, user: newUser };
  } catch (error) {
    return { success: false, error: 'Registration failed' };
  }
};

// Sign in a user (validates against database)
export const signInUser = async (data: {
  email: string;
  password: string;
}): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    console.log('signInUser called with:', data.email);

    // Validate credentials against database via API
    console.log('Fetching /api/auth/signin...');
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
      }),
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.log('Error response:', errorData);
      return { success: false, error: errorData.error || 'Invalid email or password' };
    }

    const dbUser = await response.json();
    console.log('Successful sign in:', dbUser);

    // Create user object
    const user: User = {
      id: dbUser.data.id,
      email: dbUser.data.email,
      name: dbUser.data.name,
      role: dbUser.data.role,
    };

    // Save to localStorage for demo auth
    const users = getUsers();
    const existingUserIndex = users.findIndex(u => u.email === user.email);

    if (existingUserIndex >= 0) {
      // Update existing user
      users[existingUserIndex] = user;
    } else {
      // Add new user
      users.push(user);
    }

    saveUsers(users);

    // Set as current user
    setCurrentUser(user);

    return { success: true, user };
  } catch (error) {
    console.error('Sign in error:', error);
    return { success: false, error: 'Sign in failed' };
  }
};

// Sign out the current user
export const signOutUser = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
};

// Get current user
export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return data ? JSON.parse(data) : null;
};

// Set current user
const setCurrentUser = (user: User): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};

// Create demo user if none exists
export const ensureDemoUser = (): User => {
  const users = getUsers();

  if (users.length === 0) {
    const demoUser: User = {
      id: 'demo_user_1',
      email: 'demo@healthtrack.com',
      name: 'Demo User',
      role: 'PATIENT',
    };

    users.push(demoUser);
    saveUsers(users);
    setCurrentUser(demoUser);
    return demoUser;
  }

  const currentUser = getCurrentUser();
  if (!currentUser && users.length > 0) {
    setCurrentUser(users[0]);
    return users[0];
  }

  return currentUser || users[0];
};
