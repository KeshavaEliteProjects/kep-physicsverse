import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import allConfigs, { getSimMeta } from "../components/sims/registry";
import SimEngine from "../components/sims/SimEngine";
import { Button } from "../components/ui/button";
import { ArrowLeft, Bot } from "lucide-react";

export default function SimulationView() {
  const { simId } = useParams();
  const navigate = useNavigate();
  const config = allConfigs[simId];
  const meta = getSimMeta(simId);

  if (!config) {
    return (
      <div className="p-10 text-center">
        <p className="text-muted-foreground">Simulation not found.</p>
        <Link to="/app/universe" className="text-primary hover:underline mt-2 inline-block">Back to Physics Universe</Link>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      <button data-testid="sim-back-button" onClick={() => navigate("/app/universe")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-slate-900 transition-colors mb-4">
        <ArrowLeft className="w-4 h-4" /> Physics Universe
      </button>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-slate-900">{config.title}</h1>
          {meta && <p className="text-muted-foreground mt-2 max-w-2xl">{meta.summary}</p>}
        </div>
        <Link to="/app/tutor">
          <Button data-testid="ask-tutor-button" variant="outline" className="rounded-full gap-2">
            <Bot className="w-4 h-4" /> Ask the AI Tutor
          </Button>
        </Link>
      </div>

      <SimEngine config={config} />
    </div>
  );
}
