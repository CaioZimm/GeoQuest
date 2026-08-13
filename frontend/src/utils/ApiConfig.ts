const getApiUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== "undefined") {
    if (window.location.hostname !== 'localhost') {
      return `http://${window.location.hostname}:8000`;
    }
  }
  return "http://localhost:8000";
};

export const API_URL = getApiUrl();