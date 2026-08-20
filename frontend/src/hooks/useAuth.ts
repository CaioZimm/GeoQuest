import { API_URL } from "@/utils/ApiConfig";
import { signIn } from "next-auth/react";
import { useState } from "react";

export function useAuth(onClose: () => void) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isEmailView, setIsEmailView] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLoginMode) {
        const res = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });
        if (res?.error) {
          setError("Credenciais inválidas");
        } else {
          onClose();
          window.location.reload();
        }
      } else {
        const res = await fetch(`${API_URL}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data.detail || "Erro ao registrar");
          setLoading(false);
          return;
        }

        const signRes = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });
        if (!signRes?.error) {
          onClose();
          window.location.reload();
        }
      }
    } catch (err) {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  return {
    isLoginMode,
    setIsLoginMode,
    isEmailView,
    setIsEmailView,
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    name,
    setName,
    error,
    loading,
    handleEmailAuth,
  };
}