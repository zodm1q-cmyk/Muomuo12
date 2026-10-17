import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as BookOpen, n as Smartphone, r as Cat } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-1y7crKnK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var cat_book_default = "/assets/cat-book-D4ZiFOKP.webp";
var cat_phone_default = "/assets/cat-phone-BMo0T5C9.webp";
var room_default = "/assets/room-BqFYSPaP.webp";
var KEY = "miu-desk-v1";
var EMPTY = {
	version: 1,
	runningSince: null,
	sessions: []
};
var useIsoLayout = typeof window === "undefined" ? import_react.useEffect : import_react.useLayoutEffect;
function isSession(value) {
	if (!value || typeof value !== "object") return false;
	const row = value;
	return typeof row.id === "string" && typeof row.startedAt === "number" && typeof row.endedAt === "number" && typeof row.durationMs === "number";
}
function loadSave() {
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) return EMPTY;
		const data = JSON.parse(raw);
		if (data.version !== 1 || !Array.isArray(data.sessions)) return EMPTY;
		return {
			version: 1,
			runningSince: typeof data.runningSince === "number" ? data.runningSince : null,
			sessions: data.sessions.filter(isSession).slice(0, 60)
		};
	} catch {
		return EMPTY;
	}
}
function persist(save) {
	localStorage.setItem(KEY, JSON.stringify(save));
}
function toFa(value) {
	return value.replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)] ?? digit);
}
function formatClock(ms) {
	const total = Math.max(0, Math.floor(ms / 1e3));
	const hours = Math.floor(total / 3600);
	const minutes = Math.floor(total % 3600 / 60);
	const seconds = total % 60;
	const pad = (n) => String(n).padStart(2, "0");
	return toFa(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
}
function formatWhen(start, end) {
	const day = new Intl.DateTimeFormat("fa-IR", {
		weekday: "long",
		day: "numeric",
		month: "long"
	}).format(end);
	const clock = new Intl.DateTimeFormat("fa-IR", {
		hour: "2-digit",
		minute: "2-digit"
	});
	return `${day}، ${clock.format(start)} تا ${clock.format(end)}`;
}
function todayTotal(sessions, runningSince, now) {
	const start = /* @__PURE__ */ new Date();
	start.setHours(0, 0, 0, 0);
	const from = start.getTime();
	let sum = 0;
	for (const session of sessions) if (session.endedAt >= from) sum += session.durationMs;
	if (runningSince && now > 0) sum += Math.max(0, now - Math.max(runningSince, from));
	return sum;
}
function Home() {
	const shellRef = (0, import_react.useRef)(null);
	const saveRef = (0, import_react.useRef)(EMPTY);
	const [save, setSave] = (0, import_react.useState)(EMPTY);
	const [ready, setReady] = (0, import_react.useState)(false);
	const [now, setNow] = (0, import_react.useState)(0);
	const [sheet, setSheet] = (0, import_react.useState)(false);
	const [swapping, setSwapping] = (0, import_react.useState)(false);
	const [toast, setToast] = (0, import_react.useState)(null);
	const [announce, setAnnounce] = (0, import_react.useState)("");
	const [freshId, setFreshId] = (0, import_react.useState)(null);
	const tiltAsked = (0, import_react.useRef)(false);
	useIsoLayout(() => {
		const loaded = loadSave();
		saveRef.current = loaded;
		setSave(loaded);
		setNow(Date.now());
		setReady(true);
	}, []);
	(0, import_react.useEffect)(() => {
		const root = shellRef.current;
		if (!root) return;
		let tx = 0;
		let ty = 0;
		let x = 0;
		let y = 0;
		let acc = 0;
		let last = performance.now();
		let frame = 0;
		const onPointer = (event) => {
			tx = (event.clientX / window.innerWidth - .5) * 2;
			ty = (event.clientY / window.innerHeight - .5) * 2;
		};
		const onTilt = (event) => {
			tx = Math.max(-1, Math.min(1, (event.gamma ?? 0) / 18));
			ty = Math.max(-1, Math.min(1, ((event.beta ?? 35) - 35) / 24));
		};
		const tick = (time) => {
			const delta = Math.min(.05, (time - last) / 1e3);
			last = time;
			x += (tx - x) * Math.min(1, delta * 8);
			y += (ty - y) * Math.min(1, delta * 8);
			root.style.setProperty("--px", x.toFixed(4));
			root.style.setProperty("--py", y.toFixed(4));
			if (saveRef.current.runningSince) {
				acc += delta;
				if (acc > .2) {
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
	(0, import_react.useEffect)(() => {
		if (!toast) return;
		const timer = window.setTimeout(() => setToast(null), 3600);
		return () => window.clearTimeout(timer);
	}, [toast]);
	function askTilt() {
		if (tiltAsked.current) return;
		tiltAsked.current = true;
		const orientation = DeviceOrientationEvent;
		if (typeof orientation.requestPermission === "function") orientation.requestPermission().catch(() => void 0);
	}
	function commit(next) {
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
				commit({
					...prev,
					runningSince: null
				});
				setAnnounce("جلسه خیلی کوتاه بود و ذخیره نشد");
				return;
			}
			const session = {
				id: crypto.randomUUID(),
				startedAt: prev.runningSince,
				endedAt,
				durationMs
			};
			commit({
				version: 1,
				runningSince: null,
				sessions: [session, ...prev.sessions].slice(0, 60)
			});
			setFreshId(session.id);
			setToast("ذخیره شد");
			setAnnounce(`ذخیره شد. ${formatWhen(session.startedAt, session.endedAt)}. مدت ${formatClock(durationMs)}`);
			return;
		}
		const runningSince = Date.now();
		commit({
			...prev,
			runningSince
		});
		setNow(runningSince);
		setFreshId(null);
		setToast(null);
		setAnnounce("مطالعه شروع شد");
	}
	function removeSession(id) {
		commit({
			...saveRef.current,
			sessions: saveRef.current.sessions.filter((session) => session.id !== id)
		});
	}
	const studying = save.runningSince != null;
	const latest = save.sessions[0] ?? null;
	const elapsed = studying && now > 0 ? Math.max(0, now - (save.runningSince ?? now)) : 0;
	const shown = studying ? elapsed : latest?.durationMs ?? 0;
	const today = todayTotal(save.sessions, save.runningSince, now);
	const caption = studying ? "داره کتاب می‌خونه" : latest ? formatWhen(latest.startedAt, latest.endedAt) : "گربه گوشی دستشه";
	const shellClass = [
		"app",
		studying ? "studying" : "",
		swapping ? "swap" : ""
	].filter(Boolean).join(" ");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: shellClass,
		ref: shellRef,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "stage",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "world",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							className: "room",
							src: room_default,
							alt: "",
							draggable: false,
							fetchPriority: "high"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "lamp" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "motes",
							"aria-hidden": "true",
							children: Array.from({ length: 8 }, (_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mote" }, index))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "cat-slot",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "cat-parallax",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "contact" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "cat-hop",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "cat-breathe",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "cat-sway",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "cat-stack",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
														className: "cat-face phone",
														src: cat_phone_default,
														alt: "",
														draggable: false
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
														className: "cat-face book",
														src: cat_book_default,
														alt: "",
														draggable: false
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "screen-glow" }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "page-sheen",
														"aria-hidden": "true",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {})
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "flakes",
														"aria-hidden": "true",
														children: Array.from({ length: 5 }, (_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {}, index))
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "fx",
														"aria-hidden": "true",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "focus-ring" }), Array.from({ length: 6 }, (_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "spark" }, index))]
													})
												]
											})
										})
									})
								})]
							})
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "vignette" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "hud",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "top-row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
							className: "wordmark",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cat, {
								size: 18,
								"aria-hidden": true
							}), "میز میو"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "today",
							children: ["امروز ", formatClock(today)]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "clock",
						children: formatClock(shown)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "caption",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: studying ? "dot on" : "dot" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "caption-text",
							children: caption
						})]
					}),
					toast ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "toast",
						children: toast
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: sheet ? "sheet open" : "sheet",
				"aria-hidden": !sheet,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "sheet-head",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "جلسه‌های ذخیره‌شده" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [toFa(String(save.sessions.length)), " جلسه"] })]
				}), save.sessions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "empty",
					children: "هنوز جلسه‌ای نمانده. مطالعه را شروع کن تا تاریخ و ساعتش همین‌جا بماند."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "rows",
					children: save.sessions.map((session) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: session.id === freshId ? "row fresh" : "row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "when",
							children: formatWhen(session.startedAt, session.endedAt)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "dur",
							children: formatClock(session.durationMs)
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "trash",
							onClick: () => removeSession(session.id),
							children: "حذف"
						})]
					}, session.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "dock",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "ghost",
					onClick: () => setSheet((open) => !open),
					children: sheet ? "بستن جلسه‌ها" : `جلسه‌ها · ${toFa(String(save.sessions.length))}`
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "start-btn",
					onClick: toggle,
					disabled: !ready,
					"aria-pressed": studying,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "labels",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: studying ? "label hide" : "label",
							"aria-hidden": studying,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, {
								size: 18,
								"aria-hidden": true
							}), "شروع به مطالعه"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: studying ? "label" : "label hide",
							"aria-hidden": !studying,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, {
								size: 18,
								"aria-hidden": true
							}), "توقف"]
						})]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "sr",
				"aria-live": "polite",
				children: announce
			})
		]
	});
}
//#endregion
export { Home as component };
