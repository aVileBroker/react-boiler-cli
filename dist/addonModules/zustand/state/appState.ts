import create from "zustand";
import { persist } from "zustand/middleware";

export type AppStateType = {
  loggedIn: boolean;
  logIn: () => void;
};

export const useAppState = create<AppStateType>(
  persist(
    (set, get) => ({
      loggedIn: false,
      logIn: () => set({ loggedIn: true }),
    }),
    {
      name: "quick-link-storage", // unique name for localStorage key
      //   getStorage: () => localStorage, // (optional) by default the 'localStorage' is used
    }
  )
);
