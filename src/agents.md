1. Repository Overview
UWash is split across three repositories so the hardware engineer, bot developer, and dashboard developer can work in parallel without blocking each other. The bot is forked from the existing CAPT laundry bot and extended — all changes are additive.

Repo	Name	Stack	Primary Owner
Repo 1	uwash-hardware	C++ · Arduino IDE · ESP32	Hardware teammate (CE student)
Repo 2	uwash-bot	Python · python-telegram-bot · FastAPI · SQLite	Bot/backend developer (remote)
Repo 3	uwash-dashboard	React · Tailwind CSS · Recharts · Vite	Dashboard developer (remote)

UTown Scope — Participating Residences
UWash is designed for all residences eligible for the Acacia Hackathon. The architecture scales to any RC by editing one configuration file.

Residence	Houses / Sectors / Blocks	Machine Config
CAPT	ROC, Dragon, Garuda, Phoenix, Tulpar	2W + 2D per house
Tembusu College	Shan, Ora, Gaja, Tembra	TBC per house
RC4	Tectona, Cengal, Saga, Angsana	TBC per house
RVRC	Sectors A–D	TBC per sector
NUS College	Houses 1–4	TBC per house
Acacia College	TBC	TBC
UTown Residence	Blocks/Floors	TBC per block

Note: "TBC" entries are populated by each RC's student committee before onboarding. The HOUSE_MACHINES constant in constants.py is the only file that changes per deployment.

Data Contract Between Repos
The hardware repo sends one HTTP POST to the bot backend. Both teams must agree on and freeze this schema before writing any code — it is the only integration point between Repo 1 and Repo 2.

POST http://<bot-server-ip>:8080/api/sensor/event
{ "house": "Garuda", "machine_id": "Washer One", "event": "vibration_start" | "vibration_end" }

The dashboard (Repo 3) polls the bot backend every 30 seconds via GET /api/status and GET /api/queue. No direct communication exists between Repo 1 and Repo 3.

 
2. Milestones (All Three Repos)
All three repos share the same milestone names and target dates. Create these milestones in GitHub Settings before opening any issues.

Milestone	Due	Goal
M1 · Foundation	4 Mar 2026	Repos created. READMEs written. Dev bot token obtained. HOUSE_MACHINES refactor done. Data contract agreed and frozen. Dev environments confirmed working. Simulated sensor data flowing end-to-end.
M2 · Core MVP	12 Mar 2026	Hardware detects vibration and POSTs to bot. Bot shows unregistered sessions in /status. Virtual queue functional. Smart Nudge 15-min timer fires to house chat. Dashboard shows live machine status with countdowns.
M3 · Features	17 Mar 2026	Buddy Wash feature complete in bot and dashboard. Dashboard shows queue, savings counter, and usage analytics. Real API integrated into dashboard (mock data removed). Full integration test across all three repos.
M4 · Submission	19 Mar 2026	All READMEs finalised with screenshots and setup instructions. Demo video recorded. DevPost write-up complete. All three repos made public. Submitted before 20 Mar 2026, 12:00 SGT.

 
3. Repo 1 — uwash-hardware
Owner: Hardware teammate (Computer Engineering student)     Stack: C++ · Arduino IDE · ESP32
Each ESP32 unit is independently configured with its own house and machine_id before deployment. Adding a new RC requires flashing new units with the correct config — no firmware logic changes needed.

Labels to Create
hardware	Physical sensor wiring, mounting, calibration
firmware	ESP32 C++ code, Arduino libraries, WiFi logic
integration	HTTP POST to bot backend, data contract
documentation	README, wiring diagrams, parts list, setup guide
MVP	Required for Round 1 submission

Issues
#	Issue / Description	Labels	Assignee	Milestone
H-01	Dev environment setup
Install Arduino IDE. Add ESP32 board support via Boards Manager URL. Install libraries: WiFi.h, HTTPClient.h, ArduinoJson. Flash Blink example to confirm board + USB connection works.	[hardware] [documentation] [MVP]	@hw-teammate	M1 · Foundation
H-02	Piezo sensor wiring & signal reading
Wire piezo sensor to ESP32 analog pin A0. Print raw voltage readings via Serial Monitor while tapping sensor and while idle. Document wiring diagram with labelled pin numbers.	[hardware] [firmware] [MVP]	@hw-teammate	M1 · Foundation
H-03	Vibration threshold calibration
Run a real machine (or simulate by tapping firmly). Determine ADC threshold value that reliably distinguishes machine vibration from ambient noise. Implement 10-second moving average to debounce false triggers.	[firmware] [MVP]	@hw-teammate	M2 · Core MVP
H-04	WiFi connection & HTTP POST to bot
Connect ESP32 to WiFi. On vibration_start and vibration_end, send POST /api/sensor/event with JSON payload { house, machine_id, event }. Handle WiFi disconnection and implement retry logic with exponential backoff.	[firmware] [integration] [MVP]	@hw-teammate	M2 · Core MVP
H-05	Multi-machine support (4 sensors per house)
Scale single-sensor code to read 4 piezo sensors simultaneously (Washer One, Washer Two, Dryer One, Dryer Two). Each fires its own POST independently using its machine_id. Confirm no signal crosstalk between sensors.	[hardware] [firmware] [MVP]	@hw-teammate	M2 · Core MVP
H-06	vibration_end detection logic
Detect when vibration drops below threshold and stays below for more than 120 consecutive seconds — this is end-of-cycle. Fire vibration_end event. The 120-second buffer prevents false end-of-cycle triggers during machine pause cycles.	[firmware] [MVP]	@hw-teammate	M2 · Core MVP
H-07	Physical enclosure & mounting
Mount ESP32 and piezo sensors safely adjacent to machines. Sensors attach to machine casing externally only — nothing internal. Document recommended mounting position for each sensor type (washer vs dryer vibration profiles differ).	[hardware]	@hw-teammate	M3 · Features
H-08	README: wiring diagram, parts list, setup guide
Write complete README: full parts list with estimated SGD prices and purchase links, wiring diagram (photo or drawn), Arduino IDE setup steps, library install commands, WiFi + API config instructions, calibration walkthrough.	[documentation] [MVP]	@hw-teammate	M4 · Submission

 
4. Repo 2 — uwash-bot
Owner: Bot/backend developer (remote)     Stack: Python · python-telegram-bot · FastAPI · SQLite
Forked from the existing CAPT laundry bot. All changes are additive — existing files are modified minimally. The live production bot remains completely untouched during development.

Labels to Create
backend	FastAPI sensor endpoint, business logic, SQLite
bot	Telegram bot commands and message handlers
integration	Hardware bridge, dashboard API endpoints
documentation	README updates, API reference docs
MVP	Required for Round 1 submission
enhancement	Non-MVP improvements and analytics
stretch	Post-MVP: predictive analytics (requires 2+ weeks of data)

Issues
#	Issue / Description	Labels	Assignee	Milestone
B-01	Fork repo, dev bot, HOUSE_MACHINES refactor
Three sub-tasks: (1) Fork repo, set up virtualenv, confirm /select and /status work locally, add .env.example and .gitignore. (2) Message @BotFather → /newbot → "UWash Dev" → save token to local .env as BOT_TOKEN — never commit this. (3) Replace flat MACHINE_NAMES list in constants.py with HOUSE_MACHINES dict mapping each house to its own machine list (e.g. ROC: [Washer One, Washer Two, Dryer One, Dryer Two]). Update all references in codebase from MACHINE_NAMES to HOUSE_MACHINES.get(house_id). This enables different RCs to have different machine counts.	[backend] [bot] [MVP]	@you	M1 · Foundation
B-02	Add usage_log.db SQLite schema
Create usage_log.db with three tables: sensor_events (id, house, machine_id, event, timestamp, source), queue (id, house, machine_id, username, chat_id, joined_at, status), buddy_wash (id, house, machine_id, initiator, slots_total, slots_taken, created_at, start_at, status).	[backend] [MVP]	@you	M1 · Foundation
B-03	FastAPI sensor endpoint POST /api/sensor/event
Create hardware_api.py with FastAPI app on port 8080. Accept POST /api/sensor/event. Validate house against HOUSES and machine_id against HOUSE_MACHINES.get(house). Log event to sensor_events table. On vibration_start, call storage.set_hardware_timer() if machine is currently free.	[backend] [integration] [MVP]	@you	M1 · Foundation
B-04	storage.py: hardware session support
Add set_hardware_timer() and is_hardware_session() functions. Hardware sessions store currUser: null and hardwareDetected: true flag. Do not modify any existing functions — purely additive. Only overwrite machine state if machine is currently available (never override a user-registered session).	[backend] [MVP]	@you	M2 · Core MVP
B-05	machine.py: status() for hardware sessions
Update status() to display "IN USE (unregistered) — est. Xm Ys remaining" when is_hardware_session() is true. Registered user sessions display exactly as before. No other changes to machine.py.	[backend] [MVP]	@you	M2 · Core MVP
B-06	GET /api/status endpoint for dashboard
Expose GET /api/status returning JSON keyed by house → machine_id → { status, currUser, endTime, hardwareDetected, queueLength }. Dashboard polls this every 30 seconds. Covers all houses across all configured RCs.	[backend] [integration] [MVP]	@you	M2 · Core MVP
B-07	Smart Nudge: idle alert after vibration_end
On vibration_end event, start 15-minute background asyncio timer. When timer fires, send message to house group chat: "Machine X appears to have finished — if your laundry is done, please collect so others can use it!" Use HOUSE_CHAT_IDS in constants.py. No username attached for unregistered sessions.	[backend] [bot] [MVP]	@you	M2 · Core MVP
B-08	Virtual Queue: /queue command
When all machines in a house are full, users can run /queue and select a machine to join the waitlist. Store in SQLite queue table. On vibration_end, DM the first queued user: "Washer One is yours — claim within 5 minutes or it passes to the next person." After 5 minutes with no /claim response, cascade to next user.	[bot] [MVP]	@you	M2 · Core MVP
B-09	GET /api/queue endpoint for dashboard
Expose GET /api/queue returning current queue length and estimated wait time per machine per house. Dashboard uses this to display queue status on each machine card.	[backend] [integration] [MVP]	@you	M2 · Core MVP
B-10	Buddy Wash: /buddywash command
User runs /buddywash, selects machine and available slot count (1–3). Bot posts to house group: "Half-load cold wash starting in 10 min at Washer One — 2 slots free. Reply /join to share." Track open offers in buddy_wash table with 10-minute expiry.	[bot] [backend] [MVP]	@you	M3 · Features
B-11	Buddy Wash: /join command & confirmation
Handle /join responses. When initiator confirms or 10-minute window closes, bot posts participant list and registers the session. Notify all participants via DM when their machine cycle ends. Log completed buddy wash sessions for savings calculation.	[bot] [backend] [MVP]	@you	M3 · Features
B-12	GET /api/buddywash endpoint for dashboard
Expose GET /api/buddywash returning active offers and weekly summary: total shared sessions, estimated litres saved (50L baseline × shared sessions × 0.4 saving factor), estimated kWh saved. Dashboard displays live savings counter.	[backend] [integration] [MVP]	@you	M3 · Features
B-13	Usage logging for analytics
Ensure all session start/end times, sources (user-registered / hardware-detected / buddy-wash), and houses are written to sensor_events table. This historical data is the prerequisite for the stretch predictive analytics feature (B-15).	[backend] [enhancement]	@you	M3 · Features
B-14	README: updated setup & API reference
Update README covering: fork setup steps, new environment variables (.env.example), SQLite schema, how to run FastAPI alongside the Telegram bot, HOUSE_MACHINES config guide for onboarding new RCs, and full API endpoint reference with example request/response.	[documentation] [MVP]	@you	M4 · Submission
B-15	[STRETCH] Predictive traffic analytics
After 2+ weeks of sensor_events data, build a simple time-series model predicting peak usage hours per machine per house. Expose GET /api/predictions. Requires B-13 data to be meaningful. Do not build this before M3 is complete.	[backend] [stretch]	@you	Post-MVP

 
5. Repo 3 — uwash-dashboard
Owner: Dashboard developer (remote)     Stack: React · Tailwind CSS · Recharts · Vite
Standalone React app that polls the bot backend API. Development starts immediately with mock data so no progress is ever blocked by hardware or bot readiness.

Labels to Create
frontend	React components, UI layout, Tailwind styling
integration	API polling, real data swap-in from mock
documentation	README, setup instructions, screenshots
MVP	Required for Round 1 submission
enhancement	Non-MVP improvements
stretch	Predictive analytics chart — depends on B-15













General milestones
Vite + React + Tailwind scaffold
npx create-vite uwash-dashboard --template react. Add Tailwind CSS, Recharts, React Router. Set up folder structure: /components, /hooks, /api, /data/mock. Add VITE_API_BASE_URL to .env.example.
Mock data module for all API endpoints
Create /data/mock.js with static JSON matching the exact shape of GET /api/status, /api/queue, and /api/buddywash. All components consume this initially. This ensures zero dependency on bot or hardware progress. Swap to real calls in D-10.
RC + house selector & global context
Top-level selector for residence (all 7 UTown RCs) and house within that RC. Selected house filters all dashboard data. Store selection in React context. House list populated from the same HOUSES config shape as constants.py.
Machine status cards component
One card per machine. Three visual states: Available (green border), In Use with username and live countdown timer (yellow border), Hardware-detected unregistered session with estimated time remaining and warning icon (red border). Cards adapt to any number of machines via HOUSE_MACHINES config.
Live countdown timer logic
Each in-use machine card counts down in real time using endTime from API response. useInterval hook ticks every second. When timer reaches zero, card transitions to a soft "finishing soon" state before the next 30-second poll updates status from API.
Virtual queue panel
Per-machine queue display: number of people waiting, estimated wait time based on machines ahead in queue, link to Telegram bot to join queue. If current user is in queue, show their position prominently.
Buddy Wash board
Active offers section: machine name, initiator username, slots remaining, countdown to start time. Weekly savings counter: total shared loads, estimated litres saved, estimated kWh saved. Numbers update from /api/buddywash. This is the environmental impact centrepiece of the dashboard.
Usage analytics charts
Bar chart of hourly machine usage over the past 7 days from GET /api/analytics. Highlights peak hours visually. Powered by real logged data from sensor_events — not ML predictions. Built with Recharts BarChart.
Impact metrics panel
Stats strip showing: average idle time post-cycle this week, percentage of sessions that were hardware-detected (unregistered), Buddy Wash participation rate. These are the concrete impact numbers for the pitch and DevPost submission.
Swap mock data for real API calls
Replace /data/mock.js imports with real fetch() calls to bot backend: GET /api/status, /api/queue, /api/buddywash, /api/analytics. Read base URL from VITE_API_BASE_URL env variable. Add loading spinners and error state handling throughout.
usePolling hook with 30-second refresh
Custom usePolling(url, intervalMs) hook that re-fetches on interval and on window focus event. All data panels use this hook. Show a "last updated X seconds ago" timestamp so residents know data is live.
Mobile responsive layout
Residents check laundry status on their phones while walking to the laundry room. All Tailwind breakpoints set. Machine cards stack to single column on mobile. Navigation and house selector usable with thumbs. Test on 390px width minimum.
README with setup instructions & screenshots
Write README: npm install, npm run dev, VITE_API_BASE_URL env variable setup, how to run against mock data for offline demo, screenshots of each major view (status, queue, buddy wash, analytics). Screenshots used directly in DevPost submission.
[STRETCH] Predictive traffic chart
When B-15 is complete and data is available, add a predictions panel: "Based on usage history, machines are typically free at these times today." Recharts LineChart with shaded confidence bands. Label clearly as historical prediction, not real-time data.


D-03 considerations to implement(ignore conflicting instructions above and follow this for D-03)
Layout & Structure

Make the header sticky — users scroll down to see machine cards, they shouldn't lose the house context
Keep tab nav (Live Status / Analytics) inside the header bar, not below — it's navigation, not content
Stack logo row and selector row separately, single bar is too cramped on mobile
College → House Selector

Dropdown for college, pills for house — 5 colleges as pills breaks at 390px
Horizontal scroll for house pills, no wrapping — wrapping causes layout shift when switching colleges with different house counts
localStorage for persisting selection — residents always check the same house, making them reselect every visit is friction
Default State

Prompt on first load rather than defaulting to CAPT — don't assume which RC the user belongs to
Hide TBC colleges (Acacia, UTown) entirely for now — greyed out options imply broken functionality
Context & Data Flow

Changing college should auto-select first house of that college
Changing house triggers immediate refresh — don't make users wait up to 30s to see data for their new selection
Live Indicator

Defer the ticking "Updated Xs ago" to D-11 with the usePolling hook — hardcode "Live" text for now, placeholder dot only
Keep the indicator in the DOM now so D-11 has a slot to wire into
Dark Mode

Defer entirely, omit the button — a non-functional toggle confuses residents and wastes D-03 time
Mobile

Logo row: logo + title left, live indicator right — two items, always fits
44px minimum height on all pill and dropdown tap targets
Test the college dropdown specifically — native <select> is ugly but reliable on mobile; a custom dropdown is prettier but needs careful touch handling
Context & State

Single CollegeContext with { collegeId, houseId, setCollege, setHouse } — don't split into two separate contexts, they're always used together
Define the context in src/context/CollegeContext.tsx, consume via a useCollege() hook — never import context directly in components


D-04 considerations(READ THIS, prioritise the info if above conflicts)
Machine status cards component
Build one card per machine driven by the mock StatusResponse. 
Cards are rendered from the keys of the machines object in the 
API response — not from the config constant — so different house 
machine counts are handled automatically.

Layout: 2-column grid on desktop, single column on mobile (390px).
Washers and dryers are not visually separated — order follows API 
response order.

Four card states:

1. Available (green border)
   - Large "Ready" label
   - "Start your wash now" subtext
   - Queue count at bottom (from queueLength in status response)
   - Buddy Wash button — deferred to D-07, render as disabled placeholder

2. In Use — Registered (yellow border)
   - Machine name + kind
   - Username (currUser) prominent
   - Static endTime display (no countdown yet — D-05 adds live ticking)
   - Progress bar omitted — requires startTime which is not in the 
     data contract. Do not add startTime just for a progress bar.
   - Queue count at bottom
   - "Join Queue" button — deferred to D-06, render as disabled placeholder

3. In Use — Unregistered (red border + warning icon)
   - Same layout as registered but currUser replaced with 
     "Unregistered session"
   - hardwareDetected: true is the flag that triggers this state
   - Warning icon in top corner
   - No username shown

4. Idle — Laundry not collected (amber border)
   - Card shows "Collect your laundry" label
   - Shows currUser if available, "Unknown user" if null
   - Shows cycleEndedAtMs as "X min ago" — add cycleEndedAtMs: number | null 
     to MachineStatusEntry type and mock data before building

Idle alert banner:
   A sticky strip rendered below the header, above the cards.
   One entry per machine currently in idle state.
   Format: ⚠️ [Machine Name] · [currUser or "Unknown user"] · [X min ago]
   Visible to all residents — public social accountability.
   Auto-clears when next poll returns status !== idle.
   If no machines are idle, banner is not rendered (no empty space).

Stats strip:
   Four summary chips above the cards:
   Available X/4 · In Queue X · Avg Wait Xm · Idle Alerts X
   Derived from the StatusResponse and QueueResponse mock data.
   Idle Alerts count = number of machines currently in idle state.

Data contract additions required before building:
   - Add cycleEndedAtMs: number | null to MachineStatusEntry in 
     src/types/api.ts and update src/data/mock/status.ts accordingly
   - Bot developer must preserve currUser during idle state — 
     do not clear it on vibration_end, only clear on next 
     vibration_start or timer expiry
   - Bot developer must populate cycleEndedAtMs when setting 
     status = idle

Deferred to later milestones:
   - Live countdown timer → D-05
   - Join Queue button → D-06
   - Buddy Wash button → D-07


Function

Component	Solves
Hardware	Accuracy — catches 100% of sessions regardless of user behaviour
Bot	Action — queue, buddy wash, notifications, identity
Dashboard	Visibility — passive, public, no app download needed