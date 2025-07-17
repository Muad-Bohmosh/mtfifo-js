# 🧠 MTFIFO: A Minimalist Multi-Threaded FIFO Orchestrator for AI (javascript)

A super-light asynchronous task orchestrator that distributes queued requests across a pool of async functions ("threads"), preserving FIFO order — ideal for real-time apps, agents, or any async-heavy workload.

### 🚀 Ultra-Light. Dynamic. Runs Anywhere.

---

## 🧠 What is MTFIFO?

`MTFIFO` is a zero-dependency FIFO-first async job manager. It lets you:

- Schedule **many concurrent task requests**
- Distribute them over **custom thread functions**
- Maintain **FIFO discipline**
- Get notified on **success**, **failure**, or **all-done**

It’s designed for developers building custom task pipelines, async microservices, or AI agents — where every millisecond and execution order matters.

---

## 🧠 Why It Matters

Modern async systems are:

* ⚡ **High-throughput** (massive request volume)
* 🔄 **Unpredictable** (varying task times, streaming, retries)
* 🧬 **Fine-grained** (micro-inference, micro-decisions)
* 🎯 **Deterministic-demanding** (AI agents, reproducibility, latency guarantees)

But most orchestration tools are:

* 🏋️‍♂️ **Too bloated** (framework-heavy, dependency-locked)
* 🪵 **Too rigid** (static pipelines, no reactive control)
* 🛑 **Not low-level enough** (can’t “touch the metal”)

**MTFIFO-JS** solves this with:

* ✔️ **Minimalism** — Zero-dependency, browser/server-ready
* ✔️ **Determinism** — Explicit queueing, FIFO handling, and state clarity
* ✔️ **Performance** — Threaded execution, micro-latency tuning
* ✔️ **Control** — You define the logic, timing, and routing

> Built for builders. Meant for systems where you want *precision*, not just “it works.”

---

## ✅ Features

- FIFO queue management
- Native `setInterval`-based polling
- Event hooks for `"SUCCESS"`, `"ERROR"`, `"END"`
- Dynamic thread pool resizing
- Lightweight: <150 lines, no dependencies

---

## 🧩 Core API

### `new MTFIFO({ THREADS })`

Start the pool with custom thread handlers (async functions).

```js
const pool = new MTFIFO({ THREADS: [async (req) => req.func(req.params)] });
````

---

### `.on(event, callback)`

Listen for task results or lifecycle events:

```js
pool.on("SUCCESS", (res) => console.log("✔️", res));
pool.on("ERROR", (e) => console.warn("❌", e));
pool.on("END", () => console.log("🏁 All done"));
```

---

### `.add_requests(requests)`

Add one or more tasks to the pool.

```js
pool.add_requests([
  { params: { input: "someData" }, func: myAsyncFunc }
]);
```

---

### `.add_threads(threads)`

Inject more thread handlers at runtime:

```js
pool.add_threads([
  async (request) => request.func(request.params)
]);
```

---

### `.Start()` and `.Stop()`

Control polling manually if needed (starts automatically on `.add_requests()`).

---

## 🧪 Quick Example

```js
const THREADS = Array.from({ length: 3 }, () => async (req) => req.func(req.params));

const pool = new MTFIFO({ THREADS });

const REQUESTS = Array.from({ length: 10 }, (_, i) => ({
  params: { id: i },
  func: async ({ id }) => {
    console.log(`START ${id}`);
    await new Promise(res => setTimeout(res, Math.random() * 2000));
    console.log(`END ${id}`);
    return `Result ${id}`;
  }
}));

pool.on("SUCCESS", (res) => console.log("✔️", res));
pool.on("ERROR", (e) => console.warn("❌", e));
pool.on("END", () => console.log("✅ All done"));

pool.add_requests(REQUESTS);
```

---

## 🧠 Ideal For:

* Custom agent pipelines
* Async-heavy APIs
* Web scraping engines
* Multi-user LLM backends
* Anywhere async order matters

---

## 🛠 Install & Use

```bash
git clone https://github.com/Muad-Bohmosh/mtfifo-js
cd mtfifo-js
node index.js
```

Or install globally:

```bash
npm install mtfifo-js
```

---

## 📣 Use It as you please under [LICENSE](LICENSE) terms

> Like everything else, I Built it Because I Needed it.

---

## 📄 License

see the [LICENSE](LICENSE) file for details.

---

Contributions welcome. — thanks in advance!
