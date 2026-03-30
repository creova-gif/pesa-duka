import { useState, useCallback } from "react";

export interface BusinessProfile {
  businessName: string;
  ownerName: string;
  phone: string;
  email: string;
  tin: string;
  address: string;
  city: string;
  region: string;
  receiptFooter: string;
  currency: string;
  tier: "free" | "growth" | "business";
  lang: "en" | "sw";
  printer: "none" | "bluetooth" | "wifi";
  toggles: {
    smsReceipts: boolean;
    whatsappReceipts: boolean;
    lowStockAlerts: boolean;
    paymentReminders: boolean;
  };
  logo: string | null;
  onboarded: boolean;
}

const STORAGE_KEY = "creova_business_profile";

const DEFAULT_PROFILE: BusinessProfile = {
  businessName: "",
  ownerName: "",
  phone: "",
  email: "",
  tin: "",
  address: "",
  city: "Dar es Salaam",
  region: "Dar es Salaam",
  receiptFooter: "Asante kwa ununuzi wako! / Thank you for your purchase!",
  currency: "TZS",
  tier: "free",
  lang: "en",
  printer: "none",
  toggles: {
    smsReceipts: true,
    whatsappReceipts: false,
    lowStockAlerts: true,
    paymentReminders: true,
  },
  logo: null,
  onboarded: false,
};

function loadProfile(): BusinessProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile: BusinessProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
  }
}

export function getProfile(): BusinessProfile {
  return loadProfile();
}

export function useBusinessProfile() {
  const [profile, setProfileState] = useState<BusinessProfile>(loadProfile);

  const updateProfile = useCallback((updates: Partial<BusinessProfile>) => {
    setProfileState(prev => {
      const next = { ...prev, ...updates };
      saveProfile(next);
      return next;
    });
  }, []);

  const saveAll = useCallback((full: BusinessProfile) => {
    saveProfile(full);
    setProfileState(full);
  }, []);

  return { profile, updateProfile, saveAll };
}
