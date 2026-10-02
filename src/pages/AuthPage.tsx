import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthModal from "@/components/auth/AuthModal";
import { useAuth } from "@/contexts/AuthContext";

interface AuthPageProps {
  mode: "login" | "signup";
}

export default function AuthPage({ mode }: AuthPageProps) {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(true);
  const isLogin = mode === "login";

  useEffect(() => {
    if (!loading && user) navigate("/dashboard", { replace: true });
  }, [loading, navigate, user]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) navigate("/", { replace: true });
  };

  return (
    <main className="relova-auth-page">
      <a className="relova-auth-brand" href="/" aria-label="Relova home">
        <img src="/assets/relova-mark.png" alt="" />
        <span>RELOVA</span>
      </a>
      <div className="relova-auth-orbit relova-auth-orbit-one" aria-hidden="true" />
      <div className="relova-auth-orbit relova-auth-orbit-two" aria-hidden="true" />
      <section className="relova-auth-story" aria-hidden="true">
        <span>Your next chapter</span>
        <h1>{isLogin ? "Welcome back." : "Move with clarity."}</h1>
        <p>Your country, documents and next steps — organized in one private relocation workspace.</p>
      </section>
      <AuthModal
        open={open}
        onOpenChange={handleOpenChange}
        initialMode={isLogin ? "email-login" : "email-signup"}
        title={isLogin ? "Welcome back to Relova" : "Create your Relova account"}
        subtitle={isLogin ? "Log in to continue your relocation plan" : "Save your plan and receive personalized next steps"}
      />
    </main>
  );
}
