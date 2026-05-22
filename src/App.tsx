import { useState, useEffect, useCallback } from "react";

const MUSCLE_GROUPS = ["胸", "背中", "肩", "腕", "脚", "腹筋", "全身"] as const;
type MuscleGroup = typeof MUSCLE_GROUPS[number];

const DEFAULT_EXERCISES: Record<MuscleGroup, string[]> = {
  胸: ["ベンチプレス", "ダンベルフライ", "プッシュアップ", "ケーブルクロスオーバー", "インクラインプレス"],
  背中: ["デッドリフト", "懸垂", "ラットプルダウン", "ベントオーバーロウ", "シーテッドロウ"],
  肩: ["ショルダープレス", "サイドレイズ", "フロントレイズ", "フェイスプル", "アーノルドプレス"],
  腕: ["バーベルカール", "ハンマーカール", "トライセプスプッシュダウン", "スカルクラッシャー", "ディップス"],
  脚: ["スクワット", "レッグプレス", "ランジ", "レッグカール", "カーフレイズ"],
  腹筋: ["クランチ", "プランク", "レッグレイズ", "ロシアンツイスト", "ケーブルクランチ"],
  全身: ["バーピー", "クリーン＆プレス", "スナッチ", "ケトルベルスイング", "マウンテンクライマー"],
};

type SexKey = "male" | "female" | "other";

const STORAGE_KEY = "workout-tracker-data";
const EXERCISES_KEY = "workout-tracker-exercises";
const PROFILE_KEY = "workout-tracker-profile";

interface SetEntry {
  id: number;
  muscle: MuscleGroup;
  exercise: string;
  weight: string;
  reps: string;
  sets: string;
}
interface WorkoutEntry { id: number; date: string; sets: SetEntry[]; }
interface Profile {
  age: string; sex: SexKey; height: string; weight: string; bodyFat: string;
}

const DEFAULT_PROFILE: Profile = { age: "", sex: "male", height: "", weight: "", bodyFat: "" };

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("ja-JP", {
    year: "numeric", month: "short", day: "numeric", weekday: "short",
  });
}
function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function getTodayFileStr() {
  return getTodayStr().replace(/-/g, "");
}

// 人型シルエットSVG（黒）
const PersonIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="5.5" r="3.2" fill="black"/>
    <path d="M6 22 L6 14 Q6 9.5 12 9.5 Q18 9.5 18 14 L18 22 L14.5 22 L14.5 16.5 L9.5 16.5 L9.5 22 Z" fill="black"/>
  </svg>
);

export default function App() {
  const [tab, setTab] = useState<"record" | "history" | "exercises">("record");
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);
  const [exercises, setExercises] = useState<Record<MuscleGroup, string[]>>(DEFAULT_EXERCISES);
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [todaySets, setTodaySets] = useState<SetEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [form, setForm] = useState<{ muscle: MuscleGroup; exercise: string; weight: string; reps: string; sets: string }>({
    muscle: "胸", exercise: "ベンチプレス", weight: "", reps: "", sets: "",
  });
  const [toast, setToast] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [newExName, setNewExName] = useState("");
  const [newExMuscle, setNewExMuscle] = useState<MuscleGroup>("胸");
  const [exFilter, setExFilter] = useState<MuscleGroup | "all">("all");
  const [profileDraft, setProfileDraft] = useState<Profile>(DEFAULT_PROFILE);

  useEffect(() => {
    try {
      const r = localStorage.getItem(STORAGE_KEY);
      if (r) setWorkouts(JSON.parse(r));
      const e = localStorage.getItem(EXERCISES_KEY);
      if (e) setExercises(JSON.parse(e));
      const p = localStorage.getItem(PROFILE_KEY);
      if (p) setProfile(JSON.parse(p));
    } catch { /* ignore */ }
  }, []);

  const save = useCallback((data: WorkoutEntry[]) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* ignore */ }
  }, []);
  const saveExercises = useCallback((data: Record<MuscleGroup, string[]>) => {
    try { localStorage.setItem(EXERCISES_KEY, JSON.stringify(data)); } catch { /* ignore */ }
  }, []);
  const saveProfile = useCallback((data: Profile) => {
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(data)); } catch { /* ignore */ }
  }, []);

  const showToast = (msg: string) => {
    setToast(msg); setTimeout(() => setToast(""), 2500);
  };

  const handleMuscleChange = (m: MuscleGroup) => {
    setForm(f => ({ ...f, muscle: m, exercise: exercises[m][0] }));
  };
  const handleAddSet = () => {
    if (!form.weight || !form.reps || !form.sets) return showToast("重量・回数・セット数を入力してください");
    setTodaySets(prev => [...prev, { ...form, id: Date.now() }]);
    setForm(f => ({ ...f, weight: "", reps: "", sets: "" }));
    showToast("セット追加！");
  };
  const handleSaveWorkout = () => {
    if (todaySets.length === 0) return showToast("セットを追加してください");
    const existingIdx = workouts.findIndex(w => w.date === selectedDate);
    let updated: WorkoutEntry[];
    if (existingIdx >= 0) {
      updated = workouts.map((w, i) =>
        i === existingIdx ? { ...w, sets: [...w.sets, ...todaySets] } : w
      );
    } else {
      updated = [{ date: selectedDate, sets: todaySets, id: Date.now() }, ...workouts]
        .sort((a, b) => b.date.localeCompare(a.date));
    }
    setWorkouts(updated); save(updated); setTodaySets([]);
    showToast("ワークアウトを保存しました！");
  };
  const handleDeleteWorkout = (id: number) => {
    const updated = workouts.filter(w => w.id !== id);
    setWorkouts(updated); save(updated); showToast("削除しました");
  };
  const handleAddExercise = () => {
    const name = newExName.trim();
    if (!name) return showToast("種目名を入力してください");
    if (exercises[newExMuscle].includes(name)) return showToast("すでに存在する種目です");
    const updated = { ...exercises, [newExMuscle]: [...exercises[newExMuscle], name] };
    setExercises(updated); saveExercises(updated);
    setForm(f => ({ ...f, muscle: newExMuscle, exercise: name }));
    setNewExName(""); setShowAddModal(false);
    showToast(`「${name}」を追加しました！`);
  };
  const handleDeleteExercise = (muscle: MuscleGroup, name: string) => {
    const updated = { ...exercises, [muscle]: exercises[muscle].filter(e => e !== name) };
    setExercises(updated); saveExercises(updated);
    showToast(`「${name}」を削除しました`);
  };
  const handleSaveProfile = () => {
    setProfile(profileDraft); saveProfile(profileDraft);
    setShowProfileModal(false); showToast("プロフィールを保存しました");
  };

  // 履歴テキスト出力
  const handleExportText = () => {
    if (workouts.length === 0) return showToast("記録がありません");
    const lines = [...workouts]
      .sort((a, b) => a.date.localeCompare(b.date))
      .flatMap(w => w.sets.map(s =>
        `${w.date} ${s.exercise} ${s.weight}kg ${s.reps}回 ${s.sets}set`
      ));
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `froge_${getTodayFileStr()}.txt`;
    a.click(); URL.revokeObjectURL(url);
    showToast("テキストをダウンロードしました");
  };

  // PR集計
  const stats: Record<string, { weight: number; reps: string; date: string }> = {};
  workouts.forEach(w => {
    w.sets.forEach(s => {
      const val = parseFloat(s.weight);
      if (!stats[s.exercise] || val > stats[s.exercise].weight)
        stats[s.exercise] = { weight: val, reps: s.reps, date: w.date };
    });
  });

  const isToday = selectedDate === getTodayStr();

  return (
    <div style={styles.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Noto+Sans+JP:wght@400;700;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #ff4d4d55; border-radius: 2px; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        input[type=date]::-webkit-calendar-picker-indicator { filter: invert(0.6) sepia(1) saturate(5) hue-rotate(300deg); cursor: pointer; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .set-card { animation: fadeIn 0.25s ease; }
        .tab-btn { transition: color 0.2s; }
        .btn-glow:hover { box-shadow: 0 0 20px #ff4d4d88 !important; }
        .btn-green:hover { box-shadow: 0 0 20px #00ff8888 !important; }
        .chip-btn { transition: all 0.15s; }
        .close-btn:hover { color: #fff !important; border-color: #666 !important; }
        .profile-btn:hover { opacity: 0.8; }
      `}</style>

      {/* Header */}
      <div style={styles.header}>
        <div style={{ flex: 1, display: "flex", alignItems: "baseline", gap: 10 }}>
          <span style={styles.logo}>FRO<span style={{ color: "#ff4d4d" }}>GE</span></span>
          <span style={styles.subtitle}>筋トレ管理</span>
        </div>
        <button className="profile-btn" onClick={() => { setProfileDraft(profile); setShowProfileModal(true); }}
          style={styles.profileBtn} title="プロフィール">
          <PersonIcon />
        </button>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {([["record","記録"], ["history","履歴"], ["exercises","種目"]] as const).map(([key, label]) => (
          <button key={key} className="tab-btn" onClick={() => setTab(key)}
            style={{ ...styles.tab, ...(tab === key ? styles.tabActive : {}) }}>
            {label}
          </button>
        ))}
      </div>

      <div style={styles.content}>

        {/* ─── 記録タブ ─── */}
        {tab === "record" && (
          <div>
            <div style={styles.card}>
              <div style={styles.datePickerRow}>
                <div>
                  <div style={styles.cardTitle}>トレーニング記録</div>
                  <div style={styles.dateDisplay}>
                    {isToday ? "📅 今日" : "📅 過去の記録"} — {formatDate(selectedDate)}
                  </div>
                </div>
                <input type="date" value={selectedDate} max={getTodayStr()}
                  onChange={e => e.target.value && setSelectedDate(e.target.value)}
                  style={styles.dateInput} />
              </div>
              {!isToday && <div style={styles.pastBadge}>⏪ 過去の日付に記録中</div>}

              <div style={styles.label}>部位</div>
              <div style={styles.chips}>
                {MUSCLE_GROUPS.map(m => (
                  <button key={m} className="chip-btn" onClick={() => handleMuscleChange(m)}
                    style={{ ...styles.chip, ...(form.muscle === m ? styles.chipActive : {}) }}>{m}</button>
                ))}
              </div>

              <div style={styles.label}>種目</div>
              <div style={styles.chips}>
                {exercises[form.muscle].map(e => (
                  <button key={e} className="chip-btn" onClick={() => setForm(f => ({ ...f, exercise: e }))}
                    style={{ ...styles.chip, ...(form.exercise === e ? styles.chipActiveGreen : {}) }}>{e}</button>
                ))}
              </div>

              <div style={styles.inputRow}>
                {([["weight","重量(kg)"], ["reps","回数"], ["sets","セット数"]] as const).map(([key, label]) => (
                  <div key={key} style={styles.inputGroup}>
                    <div style={styles.inputLabel}>{label}</div>
                    <input type="number" value={form[key]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      style={styles.input} placeholder="0" />
                  </div>
                ))}
              </div>
              <button className="btn-glow" onClick={handleAddSet} style={styles.btnRed}>＋ セット追加</button>
            </div>

            {todaySets.length > 0 && (
              <div style={styles.card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={styles.cardTitle}>追加予定セット</div>
                  <div style={{ color: "#555", fontSize: 11 }}>{formatDate(selectedDate)}</div>
                </div>
                {todaySets.map((s, i) => (
                  <div key={s.id} className="set-card" style={styles.setRow}>
                    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 4 }}>
                      <span style={styles.setIndex}>{i + 1}</span>
                      <span style={styles.setMuscle}>{s.muscle}</span>
                      <span style={styles.setExercise}>{s.exercise}</span>
                    </div>
                    <div style={styles.setStats}>
                      <span style={styles.statBadge}>{s.weight}kg</span>
                      <span style={styles.statBadge}>{s.reps}回</span>
                      <span style={styles.statBadge}>{s.sets}set</span>
                      <button onClick={() => setTodaySets(prev => prev.filter(x => x.id !== s.id))}
                        style={styles.deleteSmall}>✕</button>
                    </div>
                  </div>
                ))}
                <button className="btn-green" onClick={handleSaveWorkout} style={styles.btnGreen}>💾 保存する</button>
              </div>
            )}
          </div>
        )}

        {/* ─── 履歴タブ ─── */}
        {tab === "history" && (
          <div>
            {workouts.length > 0 && (
              <button className="btn-green" onClick={handleExportText}
                style={{ ...styles.btnGreen, marginTop: 0, marginBottom: 14, fontSize: 13, padding: "10px 14px" }}>
                📥 テキストで出力（AI分析用）
              </button>
            )}
            {Object.keys(stats).length > 0 && (
              <div style={styles.card}>
                <div style={styles.cardTitle}>🏆 自己ベスト</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
                  {Object.entries(stats).map(([ex, v]) => (
                    <div key={ex} style={styles.prCard}>
                      <div style={styles.prExercise}>{ex}</div>
                      <div style={styles.prWeight}>{v.weight}<span style={{ fontSize: 12 }}>kg</span></div>
                      <div style={styles.prDate}>{formatDate(v.date)} × {v.reps}回</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {workouts.length === 0 ? (
              <div style={styles.empty}>まだ記録がありません。<br />最初のワークアウトを記録しよう！</div>
            ) : workouts.map(w => (
              <div key={w.id} style={styles.card} className="set-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={styles.cardTitle}>{formatDate(w.date)}</div>
                  <button onClick={() => handleDeleteWorkout(w.id)} style={styles.deleteBtn}>削除</button>
                </div>
                {w.sets.map((s, i) => (
                  <div key={i} style={styles.setRow}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={styles.setMuscle}>{s.muscle}</span>
                      <span style={styles.setExercise}>{s.exercise}</span>
                    </div>
                    <div style={styles.setStats}>
                      <span style={styles.statBadge}>{s.weight}kg</span>
                      <span style={styles.statBadge}>{s.reps}回</span>
                      <span style={styles.statBadge}>{s.sets}set</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* ─── 種目タブ ─── */}
        {tab === "exercises" && (
          <div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
              <button className="chip-btn" onClick={() => setExFilter("all")}
                style={{ ...styles.chip, ...(exFilter === "all" ? styles.chipActive : {}) }}>すべて</button>
              {MUSCLE_GROUPS.map(m => (
                <button key={m} className="chip-btn" onClick={() => setExFilter(m)}
                  style={{ ...styles.chip, ...(exFilter === m ? styles.chipActive : {}) }}>{m}</button>
              ))}
            </div>

            {MUSCLE_GROUPS.filter(m => exFilter === "all" || exFilter === m).map(muscle => {
              const list = exercises[muscle];
              if (list.length === 0) return null;
              return (
                <div key={muscle} style={styles.card}>
                  <div style={{ ...styles.label, marginTop: 0, marginBottom: 10 }}>{muscle}</div>
                  {list.map((name, i) => {
                    const pr = stats[name];
                    const isCustom = !DEFAULT_EXERCISES[muscle].includes(name);
                    return (
                      <div key={name} style={{
                        ...styles.setRow,
                        borderBottom: i < list.length - 1 ? "1px solid #1a1a28" : "none",
                      }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: pr ? 4 : 0 }}>
                            <span style={styles.setExercise}>{name}</span>
                            {isCustom && (
                              <span style={{ fontSize: 10, background: "#ff4d4d22", color: "#ff4d4d", border: "1px solid #ff4d4d44", borderRadius: 4, padding: "1px 5px" }}>
                                カスタム
                              </span>
                            )}
                          </div>
                          {pr ? (
                            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: "#ff4d4d", letterSpacing: 1, lineHeight: 1 }}>
                                {pr.weight}<span style={{ fontSize: 11 }}>kg</span>
                              </span>
                              <span style={{ fontSize: 11, color: "#555" }}>× {pr.reps}回</span>
                              <span style={{ fontSize: 10, color: "#444" }}>{formatDate(pr.date)}</span>
                            </div>
                          ) : (
                            <span style={{ fontSize: 11, color: "#333" }}>記録なし</span>
                          )}
                        </div>
                        {isCustom && (
                          <button onClick={() => handleDeleteExercise(muscle, name)} style={{ ...styles.deleteBtn, marginLeft: 8, flexShrink: 0 }}>
                            削除
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}

            <button className="btn-glow" onClick={() => {
              setShowAddModal(true); setNewExName("");
              setNewExMuscle(exFilter !== "all" ? exFilter : "胸");
            }} style={styles.btnRed}>
              ＋ 種目を追加
            </button>
          </div>
        )}

      </div>

      {/* ─── 種目追加モーダル ─── */}
      {showAddModal && (
        <div style={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <span style={styles.modalTitle}>種目を追加</span>
              <button className="close-btn" onClick={() => setShowAddModal(false)} style={styles.modalClose}>✕</button>
            </div>
            <div style={styles.label}>追加先の部位</div>
            <div style={styles.chips}>
              {MUSCLE_GROUPS.map(m => (
                <button key={m} className="chip-btn" onClick={() => setNewExMuscle(m)}
                  style={{ ...styles.chip, ...(newExMuscle === m ? styles.chipActive : {}) }}>{m}</button>
              ))}
            </div>
            <div style={styles.label}>種目名</div>
            <input type="text" value={newExName}
              onChange={e => setNewExName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAddExercise()}
              placeholder="例：インクラインダンベルカール"
              style={{ ...styles.input, textAlign: "left", padding: "12px 14px", fontSize: 14, marginBottom: 16 }}
              autoFocus />
            <div style={{ marginBottom: 20 }}>
              <div style={{ color: "#444", fontSize: 11, marginBottom: 8 }}>現在の {newExMuscle} の種目</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {exercises[newExMuscle].map(e => (
                  <span key={e} style={{ ...styles.chip, cursor: "default", fontSize: 11, color: "#555" }}>{e}</span>
                ))}
              </div>
            </div>
            <button className="btn-glow" onClick={handleAddExercise} style={styles.btnRed}>＋ 追加する</button>
          </div>
        </div>
      )}

      {/* ─── プロフィールモーダル ─── */}
      {showProfileModal && (
        <div style={styles.modalOverlay} onClick={() => setShowProfileModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <span style={styles.modalTitle}>PROFILE</span>
              <button className="close-btn" onClick={() => setShowProfileModal(false)} style={styles.modalClose}>✕</button>
            </div>
            <div style={{ color: "#555", fontSize: 12, marginBottom: 16, lineHeight: 1.6 }}>
              身長・体重などのプロフィールを登録できます。
            </div>

            <div style={styles.label}>性別</div>
            <div style={styles.chips}>
              {([["male","男性"], ["female","女性"], ["other","その他"]] as const).map(([v, label]) => (
                <button key={v} className="chip-btn" onClick={() => setProfileDraft(d => ({ ...d, sex: v }))}
                  style={{ ...styles.chip, ...(profileDraft.sex === v ? styles.chipActive : {}) }}>{label}</button>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
              {([
                ["age", "年齢", "歳", "28"],
                ["height", "身長", "cm", "170"],
                ["weight", "体重", "kg", "70"],
                ["bodyFat", "体脂肪率（任意）", "%", "15"],
              ] as const).map(([key, label, unit, ph]) => (
                <div key={key}>
                  <div style={styles.inputLabel}>{label}</div>
                  <div style={{ position: "relative" }}>
                    <input type="number"
                      value={profileDraft[key]}
                      onChange={e => setProfileDraft(d => ({ ...d, [key]: e.target.value }))}
                      placeholder={ph}
                      style={{ ...styles.input, fontSize: 16, paddingRight: 28 }} />
                    <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", color: "#555", fontSize: 11, pointerEvents: "none" }}>{unit}</span>
                  </div>
                </div>
              ))}
            </div>

            <button className="btn-green" onClick={handleSaveProfile}
              style={{ ...styles.btnGreen, marginTop: 20 }}>
              💾 保存する
            </button>
          </div>
        </div>
      )}

      {toast && <div style={styles.toast}>{toast}</div>}
    </div>
  );
}

const styles = {
  app: {
    background: "#0a0a0f",
    minHeight: "100vh",
    fontFamily: "'Noto Sans JP', sans-serif",
    color: "#fff",
    maxWidth: 480,
    margin: "0 auto",
    position: "relative" as const,
    paddingTop: "env(safe-area-inset-top, 0px)",
  },
  header: {
    padding: "16px 20px 12px",
    borderBottom: "1px solid #1a1a2a",
    display: "flex",
    alignItems: "center",
  },
  logo: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, letterSpacing: 2, lineHeight: 1 },
  subtitle: { color: "#555", fontSize: 13 },
  profileBtn: {
    width: 38, height: 38,
    background: "#fff",
    border: "1px solid #ff4d4d",
    borderRadius: "50%",
    color: "#ff4d4d",
    cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
    transition: "opacity 0.2s",
  },
  tabs: { display: "flex", background: "#0f0f1a", borderBottom: "1px solid #1a1a2a" },
  tab: {
    flex: 1, padding: "14px 0",
    background: "none", border: "none",
    color: "#555", fontSize: 14,
    fontFamily: "'Noto Sans JP', sans-serif",
    cursor: "pointer", fontWeight: 700,
  },
  tabActive: { color: "#ff4d4d", borderBottom: "2px solid #ff4d4d" },
  content: { padding: "16px 16px 80px" },
  card: { background: "#111119", border: "1px solid #1f1f30", borderRadius: 12, padding: "18px 16px", marginBottom: 14 },
  cardTitle: { fontSize: 15, fontWeight: 900, letterSpacing: 0.5 },
  datePickerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 6 },
  dateDisplay: { color: "#666", fontSize: 12, marginTop: 4 },
  dateInput: {
    background: "#1a1a28", border: "1px solid #ff4d4d44", borderRadius: 8,
    padding: "8px 10px", color: "#ff4d4d", fontSize: 13,
    fontFamily: "'Noto Sans JP', sans-serif", cursor: "pointer", outline: "none", flexShrink: 0,
  },
  pastBadge: {
    display: "inline-block", background: "#ff4d4d18", border: "1px solid #ff4d4d44",
    color: "#ff7777", borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700, marginBottom: 4,
  },
  label: {
    color: "#ff4d4d", fontSize: 11, fontWeight: 700, letterSpacing: 1,
    marginBottom: 8, marginTop: 14, textTransform: "uppercase" as const,
  },
  chips: { display: "flex", flexWrap: "wrap" as const, gap: 6, marginBottom: 4 },
  chip: {
    padding: "6px 12px", background: "#1a1a28", border: "1px solid #2a2a3a",
    borderRadius: 20, color: "#777", fontSize: 12, cursor: "pointer",
    fontFamily: "'Noto Sans JP', sans-serif",
  },
  chipActive: { background: "#ff4d4d22", border: "1px solid #ff4d4d", color: "#ff4d4d" },
  chipActiveGreen: { background: "#00ff8822", border: "1px solid #00ff88", color: "#00ff88" },
  inputRow: { display: "flex", gap: 10, marginTop: 16, marginBottom: 16 },
  inputGroup: { flex: 1 },
  inputLabel: { color: "#555", fontSize: 11, marginBottom: 4 },
  input: {
    width: "100%", background: "#0a0a14", border: "1px solid #2a2a3a",
    borderRadius: 8, padding: "10px", color: "#fff", fontSize: 18, fontWeight: 700,
    textAlign: "center" as const, outline: "none", fontFamily: "'Noto Sans JP', sans-serif",
  },
  btnRed: {
    width: "100%", padding: "14px",
    background: "linear-gradient(135deg, #ff4d4d, #cc0000)",
    border: "none", borderRadius: 10, color: "#fff", fontSize: 15, fontWeight: 900,
    cursor: "pointer", letterSpacing: 1, transition: "box-shadow 0.2s",
    fontFamily: "'Noto Sans JP', sans-serif",
  },
  btnGreen: {
    width: "100%", marginTop: 14, padding: "14px",
    background: "linear-gradient(135deg, #00ff88, #00aa55)",
    border: "none", borderRadius: 10, color: "#000", fontSize: 15, fontWeight: 900,
    cursor: "pointer", letterSpacing: 1, transition: "box-shadow 0.2s",
    fontFamily: "'Noto Sans JP', sans-serif",
  },
  setRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "10px 0", borderBottom: "1px solid #1a1a28",
    flexWrap: "wrap" as const, gap: 6,
  },
  setIndex: { color: "#444", fontSize: 12, marginRight: 4 },
  setExercise: { fontSize: 14, fontWeight: 700 },
  setMuscle: { fontSize: 10, background: "#ff4d4d22", color: "#ff4d4d", padding: "2px 7px", borderRadius: 10, fontWeight: 700 },
  setStats: { display: "flex", gap: 6, alignItems: "center" },
  statBadge: { background: "#1a1a28", border: "1px solid #2a2a3a", borderRadius: 6, padding: "3px 8px", fontSize: 12, color: "#ccc" },
  deleteSmall: { background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 14, padding: "2px 4px" },
  deleteBtn: {
    background: "none", border: "1px solid #2a2a3a", color: "#555",
    cursor: "pointer", fontSize: 11, padding: "4px 10px", borderRadius: 6,
    fontFamily: "'Noto Sans JP', sans-serif",
  },
  prCard: { background: "#0a0a14", border: "1px solid #1f1f30", borderRadius: 8, padding: "10px 12px" },
  prExercise: { fontSize: 11, color: "#666", marginBottom: 4 },
  prWeight: { fontSize: 28, fontFamily: "'Bebas Neue', sans-serif", color: "#ff4d4d", letterSpacing: 1 },
  prDate: { fontSize: 11, color: "#444", marginTop: 2 },
  empty: { textAlign: "center" as const, color: "#333", padding: "60px 20px", fontSize: 14, lineHeight: 2.2 },
  modalOverlay: {
    position: "fixed" as const, inset: 0,
    background: "rgba(0,0,0,0.8)", zIndex: 100,
    display: "flex", alignItems: "flex-end", justifyContent: "center",
  },
  modal: {
    background: "#13131f", border: "1px solid #2a2a3a",
    borderRadius: "18px 18px 0 0", padding: "24px 20px 44px",
    width: "100%", maxWidth: 480, maxHeight: "88vh", overflowY: "auto" as const,
  },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  modalTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, letterSpacing: 2, color: "#fff" },
  modalClose: {
    background: "none", border: "1px solid #2a2a3a", color: "#555",
    width: 32, height: 32, borderRadius: "50%", cursor: "pointer", fontSize: 13,
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "color 0.2s, border-color 0.2s",
  },
  toast: {
    position: "fixed" as const, bottom: 30, left: "50%", transform: "translateX(-50%)",
    background: "#ff4d4d", color: "#fff", padding: "10px 24px", borderRadius: 20,
    fontSize: 13, fontWeight: 700, zIndex: 999,
    animation: "fadeIn 0.2s ease", whiteSpace: "nowrap" as const,
    boxShadow: "0 4px 20px #ff4d4d44", fontFamily: "'Noto Sans JP', sans-serif",
  },
} as const;
