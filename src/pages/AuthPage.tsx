import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { gameCopy, Language, t } from "@/lib/gameCopy";

interface AuthPageProps {
  language: Language;
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string) => Promise<void>;
}

export default function AuthPage({ language, onSignIn, onSignUp }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isLogin) {
        await onSignIn(email, password);
      } else {
        await onSignUp(email, password);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex min-h-[70vh] items-center justify-center px-4"
    >
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 shadow-lg">
        <h1 className="mb-2 text-center text-3xl font-extrabold tracking-tight text-foreground">
          {t(language, gameCopy.appTitle)}
        </h1>
        <h2 className="mb-6 text-center text-lg font-semibold text-muted-foreground">
          {isLogin ? t(language, gameCopy.auth.login) : t(language, gameCopy.auth.signup)}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder={t(language, gameCopy.auth.email)}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12"
            required
          />
          <Input
            type="password"
            placeholder={t(language, gameCopy.auth.password)}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12"
            required
            minLength={6}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={loading} className="h-12 w-full text-base" size="lg">
            {loading ? "..." : isLogin ? t(language, gameCopy.auth.login) : t(language, gameCopy.auth.signup)}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          {isLogin ? t(language, gameCopy.auth.noAccount) : t(language, gameCopy.auth.hasAccount)}{" "}
          <button type="button" onClick={() => { setIsLogin(!isLogin); setError(""); }} className="font-semibold text-primary hover:underline">
            {isLogin ? t(language, gameCopy.auth.signup) : t(language, gameCopy.auth.login)}
          </button>
        </p>
      </div>
    </motion.div>
  );
}
