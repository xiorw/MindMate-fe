import { createStore } from "solid-js/store";

interface User {
  name: string;
  email: string;
  avatar: string | null;
  password: string;
}

// Initialize user with default avatar set to null
const initialUser: User = {
  name: "John Doe",
  email: "johndoe@email.com",
  avatar: null,
  password: "123",
};

// Load user from localStorage without resetting avatar
const storedUser = JSON.parse(localStorage.getItem("user") || "null");
const [userStore, setUserStore] = createStore<{ user: User }>({
  user: storedUser || initialUser,
});

// Function to update user data
const updateUser = (updates: Partial<User>) => {
  setUserStore("user", (prev) => {
    const updatedUser = { ...prev, ...updates };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    return updatedUser;
  });
};

// Function to reset avatar to default (initials-based SVG)
const resetAvatar = () => {
  setUserStore("user", (prev) => {
    const words = prev.name.trim().split(/\s+/);
    const initial = words.length === 0 || !prev.name.trim()
      ? "U"
      : words.length === 1
        ? words[0].charAt(0).toUpperCase()
        : words.slice(0, 2).map(word => word.charAt(0).toUpperCase()).join("");
    const defaultAvatar = `data:image/svg+xml;base64,${btoa(`
      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#be123c;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#9f1239;stop-opacity:1" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="50" fill="url(#grad)"/>
        <text x="50" y="65" font-family="Arial" font-size="40" fill="white" text-anchor="middle">${initial}</text>
      </svg>
    `)}`;
    const updatedUser = { ...prev, avatar: defaultAvatar };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    return updatedUser;
  });
};

// Save initial user state to localStorage
localStorage.setItem("user", JSON.stringify(userStore.user));

export { userStore, setUserStore, updateUser, resetAvatar };