import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "../utils/firebaseConfig";
import { authAPI } from "../services/api";

// ─── Create Context ────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

// ─── Retry Helper ─────────────────────────────────────────────────────────────
// Render free tier cold start fix — retries getMe() with exponential backoff
// Attempt 1: immediate, Attempt 2: after 2s, Attempt 3: after 4s, Attempt 4: after 8s
const fetchDbUserWithRetry = async (retries = 4, delay = 2000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await authAPI.getMe();
      return res.data.user; // success — return the user object
    } catch (err) {
      const isLastAttempt = i === retries - 1;

      if (isLastAttempt) {
        console.error("getMe failed after all retries:", err.message);
        return null;
      }

      console.warn(
        `getMe attempt ${i + 1}/${retries} failed. Retrying in ${delay / 1000}s...`,
        err.message
      );

      // Wait before next retry (exponential backoff: 2s → 4s → 8s)
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
  return null;
};

// ─── Provider ─────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);  // Firebase user object
  const [dbUser, setDbUser]   = useState(null);  // PostgreSQL user object (has role)
  const [loading, setLoading] = useState(true);

  // ─── Listen to Firebase Auth State ──────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        // ✅ Role PostgreSQL se lo — with retry for Render cold start
        const dbUserData = await fetchDbUserWithRetry();
        setDbUser(dbUserData);

        if (!dbUserData) {
          // Still null after all retries — could be:
          // 1. Render backend still starting (very slow cold start)
          // 2. User in Firebase but not yet in DB (new register flow)
          console.warn("dbUser is null after all retries. Backend may be cold-starting.");
        }
      } else {
        setUser(null);
        setDbUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ─── Login ────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result;
  };

  // ─── Register ─────────────────────────────────────────────────────────────
  const register = async (email, password, fullName, extraData = {}) => {
    // Step 1 — Firebase signup
    const result = await createUserWithEmailAndPassword(auth, email, password);

    // Step 2 — Display name set karo Firebase mein
    if (fullName) {
      await updateProfile(result.user, { displayName: fullName });
    }

    // Step 3 — PostgreSQL mein save karo
    const userData = {
      firebase_uid: result.user.uid,
      email:        result.user.email,
      full_name:    fullName,
      ...extraData, // designation, department, phone, etc.
    };

    const dbRes = await authAPI.register(userData);
    setDbUser(dbRes.data.user);

    return result;
  };

  // ─── Logout ───────────────────────────────────────────────────────────────
  const logout = async () => {
    await signOut(auth);
    setDbUser(null);
  };

  // ─── Get Fresh Token ──────────────────────────────────────────────────────
  const getToken = async () => {
    if (!user) return null;
    return await user.getIdToken();
  };

  // ─── Refresh DB User ──────────────────────────────────────────────────────
  // ✅ Profile save hone ke baad call karo — dbUser context update ho jayega
  const refreshUser = async () => {
    try {
      const res = await authAPI.getMe();
      setDbUser(res.data.user);
    } catch (err) {
      console.error("Failed to refresh user:", err.message);
    }
  };

  // ─── Context Value ────────────────────────────────────────────────────────
  const value = {
    user,                              // Firebase user
    dbUser,                            // PostgreSQL user { role, full_name, ... }
    loading,
    isAdmin: dbUser?.role === "admin", // ✅ PostgreSQL role se check
    login,
    register,
    logout,
    getToken,
    refreshUser,                       // ✅ Profile update ke baad call karo
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
};

export default AuthContext;