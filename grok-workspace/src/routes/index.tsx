import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Cat, Smartphone } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import catBookUrl from "../assets/cat-book.webp";
import catPhoneUrl from "../assets/cat-phone.webp";
import roomUrl from "../assets/room.webp";

export const Route = createFileRoute("/")({ component: Home });

const KEY = "miu-desk-v1";

type Session = {
  id: string;
  startedAt: number;
  endedAt: number;
  durationMs: number;
};

type Save = {
  version: 1;
  runningSince: number | null;
  sessions: Session[];
};

const EMPTY: Save = { version: 1, runningSince: null, sessions: [] };

const useIsoLayout = typeof window === "undefined" ? useEffect : useLayoutEffect;

function isSession(value: unknown): value is Session {
  if (!value || typeof value !== "object") return false;
  const row = value as Session;
  return (
    typeof row.id === "string" &&
    typeof row.startedAt === "number" &&
    typeof row.endedAt === "number" &&
    typeof row.durationMs === "number"
  );
}

function loadSave(): Save {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const data = JSON.parse(raw) as Partial<Save>;
    if (data.version !== 1 || !Array.isArray(data.sessions)) return EMPTY;
    return {
      version: 1,
      runningSince: typeof data.runningSince === "number" ? data.runningSince : null,
      sessions: data.sessions.filter(isSession).slice(0, 60),
    };
  } catch {
    return EMPTY;
  }
}

function persist(save: Save) {
  localStorage.setItem(KEY, JSON.stringify(save));
}

function toFa(value: string) {
  return value.replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)] ?? digit);
}

function formatClock(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return toFa(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
}

function formatWhen(start: number, end: number) {
  const day = new Intl.DateTimeFormat("fa-IR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(end);
  const clock = new Intl.DateTimeFormat("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${day}، ${clock.format(start)} تا ${clock.format(end)}`;
}

function todayTotal(sessions: Session[], runningSince: number | null, now: number) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const from = start.getTime();
  let sum = 0;
  for (const session of sessions) {
    if (session.endedAt >= from) sum += session.durationMs;
  }
  if (runningSince && now > 0) sum += Math.max(0, now - Math.max(runningSince, from));
  return sum;
}

function Home() {
  const shellRef = useRef<HTMLDivElement>(null);
  const saveRef = useRef<Save>(EMPTY);
  const [save, setSave] = useState<Save>(EMPTY);
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState(0);
  const [sheet, setSheet] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [announce, setAnnounce] = useState("");
  const [freshId, setFreshId] = useState<string | null>(null);
  const tiltAsked = useRef(false);

  useIsoLayout(() => {
    const loaded = loadSave();
    saveRef.current = loaded;
    setSave(loaded);
    setNow(Date.now());
    setReady(true);
  }, []);

  useEffect(() => {
    const root = shellRef.current;
    if (!root) return;
    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    let acc = 0;
    let last = performance.now();
    let frame = 0;

    const onPointer = (event: PointerEvent) => {
      tx = (event.clientX / window.innerWidth - 0.5) * 2;
      ty = (event.clientY / window.innerHeight - 0.5) * 2;
    };
    const onTilt = (event: DeviceOrientationEvent) => {
      tx = Math.max(-1, Math.min(1, (event.gamma ?? 0) / 18));
      ty = Math.max(-1, Math.min(1, ((event.beta ?? 35) - 35) / 24));
    };
    const tick = (time: number) => {
      const delta = Math.min(0.05, (time - last) / 1000);
      last = time;
      x += (tx - x) * Math.min(1, delta * 8);
      y += (ty - y) * Math.min(1, delta * 8);
      root.style.setProperty("--px", x.toFixed(4));
      root.style.setProperty("--py", y.toFixed(4));
      if (saveRef.current.runningSince) {
        acc += delta;
        if (acc > 0.2) {
          acc = 0;
          setNow(Date.now());
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("deviceorientation", onTilt);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("deviceorientation", onTilt);
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function askTilt() {
    if (tiltAsked.current) return;
    tiltAsked.current = true;
    const orientation = DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<string>;
    };
    if (typeof orientation.requestPermission === "function") {
      void orientation.requestPermission().catch(() => undefined);
    }
  }

  function commit(next: Save) {
    saveRef.current = next;
    persist(next);
    setSave(next);
  }

  function triggerSwap() {
    setSwapping(true);
    window.setTimeout(() => setSwapping(false), 760);
  }

  function toggle() {
    if (!ready) return;
    askTilt();
    triggerSwap();
    const prev = saveRef.current;
    if (prev.runningSince) {
      const endedAt = Date.now();
      const durationMs = Math.max(0, endedAt - prev.runningSince);
      if (durationMs < 500) {
        commit({ ...prev, runningSince: null });
        setAnnounce("جلسه خیلی کوتاه بود و ذخیره نشد");
        return;
      }
      const session: Session = {
        id: crypto.randomUUID(),
        startedAt: prev.runningSince,
        endedAt,
        durationMs,
      };
      commit({
        version: 1,
        runningSince: null,
        sessions: [session, ...prev.sessions].slice(0, 60),
      });
      setFreshId(session.id);
      setToast("ذخیره شد");
      setAnnounce(`ذخیره شد. ${formatWhen(session.startedAt, session.endedAt)}. مدت ${formatClock(durationMs)}`);
      return;
    }
    const runningSince = Date.now();
    commit({ ...prev, runningSince });
    setNow(runningSince);
    setFreshId(null);
    setToast(null);
    setAnnounce("مطالعه شروع شد");
  }

  function removeSession(id: string) {
    commit({
      ...saveRef.current,
      sessions: saveRef.current.sessions.filter((session) => session.id !== id),
    });
  }

  const studying = save.runningSince != null;
  const latest = save.sessions[0] ?? null;
  const elapsed = studying && now > 0 ? Math.max(0, now - (save.runningSince ?? now)) : 0;
  const shown = studying ? elapsed : (latest?.durationMs ?? 0);
  const today = todayTotal(save.sessions, save.runningSince, now);
  const caption = studying
    ? "داره کتاب می‌خونه"
    : latest
      ? formatWhen(latest.startedAt, latest.endedAt)
      : "گربه گوشی دستشه";

  const shellClass = ["app", studying ? "studying" : "", swapping ? "swap" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <main className={shellClass} ref={shellRef}>
      <div className="stage">
        <div className="world">
          <img className="room" src={roomUrl} alt="" draggable={false} fetchPriority="high" />
          <div className="lamp" />
          <div className="motes" aria-hidden="true">
            {Array.from({ length: 8 }, (_, index) => (
              <span className="mote" key={index} />
            ))}
          </div>
          <div className="cat-slot">
            <div className="cat-parallax">
              <div className="contact" />
              <div className="cat-hop">
                <div className="cat-breathe">
                  <div className="cat-sway">
                    <div className="cat-stack">
                      <img className="cat-face phone" src={catPhoneUrl} alt="" draggable={false} />
                      <img className="cat-face book" src={catBookUrl} alt="" draggable={false} />
                      <div className="screen-glow" />
                      <div className="page-sheen" aria-hidden="true">
                        <span />
                      </div>
                      <div className="flakes" aria-hidden="true">
                        {Array.from({ length: 5 }, (_, index) => (
                          <i key={index} />
                        ))}
                      </div>
                      <div className="fx" aria-hidden="true">
                        <div className="focus-ring" />
                        {Array.from({ length: 6 }, (_, index) => (
                          <span className="spark" key={index} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="vignette" />
      </div>

      <header className="hud">
        <div className="top-row">
          <h1 className="wordmark">
            <Cat size={18} aria-hidden />
            میز میو
          </h1>
          <p className="today">امروز {formatClock(today)}</p>
        </div>
        <p className="clock">{formatClock(shown)}</p>
        <p className="caption">
          <span className={studying ? "dot on" : "dot"} />
          <span className="caption-text">{caption}</span>
        </p>
        {toast ? <span className="toast">{toast}</span> : null}
      </header>

      <section className={sheet ? "sheet open" : "sheet"} aria-hidden={!sheet}>
        <div className="sheet-head">
          <h2>جلسه‌های ذخیره‌شده</h2>
          <p>{toFa(String(save.sessions.length))} جلسه</p>
        </div>
        {save.sessions.length === 0 ? (
          <p className="empty">هنوز جلسه‌ای نمانده. مطالعه را شروع کن تا تاریخ و ساعتش همین‌جا بماند.</p>
        ) : (
          <ul className="rows">
            {save.sessions.map((session) => (
              <li className={session.id === freshId ? "row fresh" : "row"} key={session.id}>
                <div>
                  <p className="when">{formatWhen(session.startedAt, session.endedAt)}</p>
                  <p className="dur">{formatClock(session.durationMs)}</p>
                </div>
                <button type="button" className="trash" onClick={() => removeSession(session.id)}>
                  حذف
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="dock">
        <button type="button" className="ghost" onClick={() => setSheet((open) => !open)}>
          {sheet ? "بستن جلسه‌ها" : `جلسه‌ها · ${toFa(String(save.sessions.length))}`}
        </button>
        <button
          type="button"
          className="start-btn"
          onClick={toggle}
          disabled={!ready}
          aria-pressed={studying}
        >
          <span className="labels">
            <span className={studying ? "label hide" : "label"} aria-hidden={studying}>
              <Smartphone size={18} aria-hidden />
              شروع به مطالعه
            </span>
            <span className={studying ? "label" : "label hide"} aria-hidden={!studying}>
              <BookOpen size={18} aria-hidden />
              توقف
            </span>
          </span>
        </button>
      </div>
      <p className="sr" aria-live="polite">
        {announce}
      </p>
    </main>
  );
}
