"use client";

import { useEffect, useMemo, useState } from "react";
import { games } from "@/lib/catalog";
import { loadProgress, subscribeToProgress, saveProgress, emptyProgress } from "@/lib/progress";
import { achievements } from "@/lib/universe/discovery";
import type { ProgressData } from "@/lib/game-logic";

export function ScienceClinic() {
  const [p, setP] = useState(emptyProgress());
  const [c, setC] = useState<string[]>([]);
  const [d, setD] = useState(0);
  useEffect(() => { const r = loadProgress(); if (r.ok) { setP(r.data); setC(r.data.completedGames); } setD(Math.floor(Date.now() / 86400000) % games.length); }, []);
  useEffect(() => { return subscribeToProgress(() => { const r = loadProgress(); if (r.ok) { setP(r.data); setC(r.data.completedGames); } }); }, []);
  const cc = useMemo(() => [
    { id: "c1", name: "Patient Maya", age: "28", symptoms: "fatigue,fever,swollen nodes", history: "park trip", clues: "immune response", systems: ["immune","circulatory"], concepts: "WBC response", explanations: [{ text: "viral infection", correct: true, concept: "viral" }, { text: "bacterial infection", correct: false, concept: "bacterial" }] },
    { id: "c2", name: "Patient Carlos", age: "45", symptoms: "headaches,neck stiffness", history: "lab work", clues: "neck stiffness", systems: ["nervous","circulatory"], concepts: "meningitis", explanations: [{ text: "tension headache", correct: false, concept: "stress" }, { text: "meningitis", correct: true, concept: "meningitis" }] }
  ], []);
  const cc2 = completed.filter((id) => cc.some((c) => c.id === id)).length;
  const ca = achievements(completed, cc);
  const xe = ca.xp;
  const cl = ca.level;
  const ds = completed.length >= cc.length ? null : cc[d];
  const hcc = (id: string, sc: number) => { saveP({...p, completedGames: [...p.completedGames, id], bestScores: {...p.bestScores, [id]: Math.max(p.bestScores[id] ?? 0, sc]) }); setC([...p.completedGames, id]); };
  return (<div className="ud"><div className="ch"><div className="cb"><span className="cm">🔬</span><h1>Science Clinic</h1></div><div className="cs"><div className="s"><span className="sn">{p.completedGames.length}</span><span className="sl">Cases Solved</span></div><div className="s"><span className="sn">{xe}</span><span className="sl">XP</span></div><div className="s"><span className="sn">{cl}</span><span className="sl">Level</span></div></div></div><div className="cd"><div className="cw"><p className="eyebrow">Junior Science Doctor</p><h2>Welcome to the Science Clinic</h2><p>Investigate fictional cases using biology principles.</p><p><em>All patient data is fictional for educational purposes only.</em></p></div><div className="csg"><div className="sc"><span className="si">📊</span><h3>Available Cases</h3><p>{cc.length - cc2} remaining</p></div><div className="sc"><span className="si">🏆</span><h3>Achievements</h3><p>{ca.badges.join("·") || "Earn badges"}</p></div><div className="sc"><span className="si">📅</span><h3>Daily Challenge</h3>{ds ? (<div><p>{ds.name}</p><p>{ds.symptoms[0]}...</p><a href={`/arcade/${ds.id}/`}>Analyze →</a></div>) : (<p>All completed! Replay above.</p>)}</div></div></div><div className="pr"><h2>Patient Reception</h2>{ds ? (<div className="pc"><h3>{ds.name}</h3><p><strong>Age:</strong> {ds.age}</p><p><strong>Symptoms:</strong> {ds.symptoms.join(", ")}</p><p><strong>History:</strong> {ds.history}</p><button className="button button--quiet">Examine →</button></div>) : (<p>Complete cases to unlock patients.</p>)}</div><div className="er"><h2>Exam Room</h2>{c.length > 0 ? (<p>Select a case from dashboard to examine.</p>) : (<p>Start with daily challenge above.</p>)}</div><footer className="cf"><p>{p.completedGames.length} of {cc.length} cases completed</p><p>{p.xp} XP · Level {cl}</p><p><em>Progress stays in browser. Not collected externally.</em></p></footer></div>));
}