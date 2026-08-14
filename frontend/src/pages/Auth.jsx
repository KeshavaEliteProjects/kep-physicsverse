import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { formatApiError } from "../lib/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Atom, GraduationCap, Presentation } from "lucide-react";
import { toast } from "sonner";

export default function Auth({ mode }) {
  const isLogin = mode === "login";
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await login(form.email, form.password);
        toast.success("Welcome back!");
      } else {
        await register(form);
        toast.success("Account created!");
      }
      navigate("/app");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => setForm({ ...form, email: "student@physicsverse.com", password: "Physics@123" });

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* left visual */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-slate-900 text-white relative overflow-hidden">
        <div className="dot-grid absolute inset-0 opacity-20" />
        <div className="relative flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <Atom className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-lg">KEP PhysicsVerse</span>
        </div>
        <div className="relative">
          <h2 className="font-display font-extrabold text-4xl leading-tight">Don't learn physics.<br />Experience it.</h2>
          <p className="text-slate-300 mt-4 max-w-sm leading-relaxed">
            Real-time simulations, a virtual mechanics lab and an AI tutor that derives every equation with you.
          </p>
        </div>
        <p className="relative text-sm text-slate-400 font-mono-data">The Interactive Physics Operating System</p>
      </div>

      {/* right form */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Atom className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-slate-900">PhysicsVerse</span>
          </div>
          <h1 className="font-display font-bold text-3xl text-slate-900">{isLogin ? "Welcome back" : "Create your account"}</h1>
          <p className="text-muted-foreground mt-2">{isLogin ? "Log in to enter the lab." : "Start experimenting in minutes."}</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            {!isLogin && (
              <>
                <div>
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" data-testid="auth-name-input" required value={form.name}
                    onChange={(e) => set("name", e.target.value)} placeholder="Aarav Sharma" className="mt-1.5" />
                </div>
                <div>
                  <Label>I am a</Label>
                  <div className="grid grid-cols-2 gap-3 mt-1.5">
                    {[
                      { v: "student", label: "Student", icon: GraduationCap },
                      { v: "teacher", label: "Teacher", icon: Presentation },
                    ].map((r) => (
                      <button
                        type="button"
                        key={r.v}
                        data-testid={`role-${r.v}`}
                        onClick={() => set("role", r.v)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                          form.role === r.v ? "border-primary bg-blue-50 text-primary" : "border-border text-muted-foreground"
                        }`}
                      >
                        <r.icon className="w-4 h-4" /> {r.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" data-testid="auth-email-input" type="email" required value={form.email}
                onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" data-testid="auth-password-input" type="password" required value={form.password}
                onChange={(e) => set("password", e.target.value)} placeholder="••••••••" className="mt-1.5" />
            </div>
            <Button data-testid="auth-submit-button" type="submit" disabled={loading} className="w-full rounded-full h-11">
              {loading ? "Please wait…" : isLogin ? "Log in" : "Create account"}
            </Button>
          </form>

          {isLogin && (
            <button data-testid="demo-fill-button" onClick={fillDemo} className="mt-4 text-sm text-primary hover:underline w-full text-center">
              Use demo student account
            </button>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isLogin ? "New here? " : "Already have an account? "}
            <Link to={isLogin ? "/register" : "/login"} className="text-primary font-medium hover:underline">
              {isLogin ? "Create an account" : "Log in"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
