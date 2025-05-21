"use client";

import { useState, useEffect } from "react";

// Add a utility to get a default value during SSR
const getDefaultValue = (query: string): boolean => {
  // Return reasonable defaults based on common breakpoints
  if (query.includes("max-width: 640px")) return false; // Assume not mobile by default
  if (query.includes("min-width: 768px")) return true; // Assume tablet+ by default
  if (query.includes("min-width: 1024px")) return true; // Assume desktop by default
  return false; // Default fallback
};

export function useMediaQuery(query: string): boolean {
  // Initialize with a sensible default for SSR
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return getDefaultValue(query);
    return window.matchMedia(query).matches;
  });
  
  useEffect(() => {
    // Skip if running on server
    if (typeof window === "undefined") return;
    
    const media = window.matchMedia(query);
    
    // Initial check
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    
    // Add listener for subsequent changes
    const listener = () => setMatches(media.matches);
    
    // Use the modern API with addEventListener/removeEventListener
    media.addEventListener("change", listener);
    
    return () => media.removeEventListener("change", listener);
  }, [query, matches]);
  
  return matches;
} 