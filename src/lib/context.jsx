import React, { createContext, useState, useEffect, useRef, useCallback } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, doc, onSnapshot, writeBatch, serverTimestamp } from 'firebase/firestore';

export const AppContext = createContext();

export function AppContextProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const listenersRef = useRef([]);

  const clearListeners = useCallback(() => {
    listenersRef.current.forEach(unsub => unsub());
    listenersRef.current = [];
  }, []);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Lazy event status update — run once after events load
  const updateStaleEventStatuses = useCallback(async (loadedEvents) => {
    if (!loadedEvents.length) return;
    const now = new Date();
    const batch = writeBatch(db);
    let hasChanges = false;

    loadedEvents.forEach(event => {
      if (!event.date || !event.time) return;
      try {
        const eventStart = new Date(`${event.date} ${event.time}`);
        const eventEnd = new Date(eventStart.getTime() + 24 * 60 * 60 * 1000);
        let newStatus = event.status;

        if (now >= eventStart && now < eventEnd && event.status === 'upcoming') newStatus = 'ongoing';
        if (now >= eventEnd && event.status !== 'past') newStatus = 'past';

        if (newStatus !== event.status) {
          batch.update(doc(db, 'events', event.id), {
            status: newStatus,
            updatedAt: serverTimestamp(),
          });
          hasChanges = true;
        }
      } catch {
        // skip events with unparseable dates
      }
    });

    if (hasChanges) {
      try { await batch.commit(); } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      clearListeners();

      if (!user) {
        setFirebaseUser(null);
        setUserProfile(null);
        setUsers([]);
        setEvents([]);
        setAuthLoading(false);
        setProfileLoading(false);
        return;
      }

      setFirebaseUser(user);
      setProfileLoading(true);

      // Listen to own user profile
      const profileUnsub = onSnapshot(doc(db, 'users', user.uid), (snap) => {
        if (snap.exists()) {
          setUserProfile({ id: snap.id, ...snap.data() });
        } else {
          setUserProfile(null);
        }
        setProfileLoading(false);
        setAuthLoading(false);
      }, () => {
        setProfileLoading(false);
        setAuthLoading(false);
      });

      // Listen to all users (for directory, leaderboard, team management)
      const usersUnsub = onSnapshot(collection(db, 'users'), (snap) => {
        setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });

      // Listen to all events (for home tab, events tab)
      const eventsUnsub = onSnapshot(collection(db, 'events'), (snap) => {
        const loadedEvents = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setEvents(loadedEvents);
        updateStaleEventStatuses(loadedEvents);
      });

      listenersRef.current = [profileUnsub, usersUnsub, eventsUnsub];
    });

    return () => {
      unsubAuth();
      clearListeners();
    };
  }, [clearListeners, updateStaleEventStatuses]);

  const signOutUser = useCallback(async () => {
    clearListeners();
    await signOut(auth);
  }, [clearListeners]);

  const value = {
    firebaseUser,
    userProfile,
    users,
    events,
    authLoading,
    profileLoading,
    currentUserRole: userProfile?.role ?? null,
    isOnboarded: userProfile?.onboardingComplete === true,
    signOutUser,
    showToast,
    toast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
