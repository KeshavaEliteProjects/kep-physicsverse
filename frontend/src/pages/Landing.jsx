import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Atom, Orbit, FlaskConical, Bot, LineChart, GraduationCap, ArrowRight, Play } from "lucide-react";

const FEATURES = [
  { icon: Orbit, title: "Interactive Simulations", desc: "Drag sliders and watch projectiles, pendulums and orbits respond in real time." },
  { icon: FlaskConical, title: "Virtual Laboratory", desc: "Perform real experiments: collect data, plot graphs, face an AI viva, get a lab report." },
  { icon: Bot, title: "AI Physics Tutor", desc: "Ask anything. Get step-by-step derivations rendered in beautiful equations." },
  { icon: LineChart, title: "Graph Studio", desc: "Live position, velocity and acceleration plots you can export for reports." },
  { icon: GraduationCap, title: "JEE / NEET Practice", desc: "Adaptive MCQ and numerical problems with worked solutions." },
  { icon: Atom, title: "Real Physics Engine", desc: "Every simulation is powered by genuine equations of motion, not animations." },
];

export default function Landing() {
  const { user } = useAuth();
  const cta = user ? "/app" : "/register";

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Atom className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-slate-900">KEP PhysicsVerse</span>
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <Link to="/app"><Button data-testid="landing-dashboard-btn" className="rounded-full">Dashboard</Button></Link>
            ) : (
              <>
                <Link to="/login"><Button data-testid="landing-login-btn" variant="ghost" className="rounded-full">Log in</Button></Link>
                <Link to="/register"><Button data-testid="landing-register-btn" className="rounded-full">Get started</Button></Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 py-20 lg:py-28 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-mono-data font-medium text-primary bg-blue-50 border border-blue-100 rounded-full px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> The Interactive Physics Operating System
            </span>
            <h1 className="font-display font-extrabold tracking-tight text-4xl sm:text-5xl lg:text-6xl mt-6 text-slate-900 leading-[1.05]">
              Don't Learn Physics.<br />
              <span className="text-primary">Experience It.</span>
            </h1>
            <p className="text-lg text-muted-foreground mt-6 leading-relaxed max-w-lg">
              Manipulate variables, run experiments and see real-time physical behaviour. A living Mechanics lab with an AI tutor, virtual instruments and adaptive practice.
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-8">
              <Link to={cta}>
                <Button data-testid="hero-cta-btn" size="lg" className="rounded-full gap-2 h-12 px-7 text-base hover:-translate-y-[1px] transition-transform">
                  Start experimenting <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="rounded-full gap-2 h-12 px-6 text-base">
                  <Play className="w-4 h-4" /> I have an account
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-6 mt-10 text-sm text-muted-foreground">
              <div><span className="font-display font-bold text-2xl text-slate-900">6+</span><br />Live simulations</div>
              <div><span className="font-display font-bold text-2xl text-slate-900">JEE</span><br />+ NEET practice</div>
              <div><span className="font-display font-bold text-2xl text-slate-900">AI</span><br />Tutor & viva</div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 bg-gradient-to-tr from-blue-100 via-transparent to-emerald-100 rounded-[2rem] blur-2xl" />
            <img
              src="https://images.unsplash.com/photo-1622737133809-d95047b9e673?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200"
              alt="Physics simulation"
              className="relative rounded-3xl border border-border shadow-2xl w-full object-cover aspect-square animate-float"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <h2 className="font-display font-bold text-3xl text-slate-900 mb-3">One platform. The whole lab.</h2>
        <p className="text-muted-foreground mb-10 max-w-xl">Everything a Class 8–12, JEE and NEET student needs to see, touch, build and measure physics.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-card p-6 hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg text-slate-900 mb-1.5">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        KEP PhysicsVerse™ · Built for curious minds
      </footer>
    </div>
  );
}
