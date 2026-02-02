let heap = [];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function insertNode() {
  const input = document.getElementById("keyInput");
  const val = input.value;
  if (val === "" || isNaN(val)) return;

  heap.push(parseInt(val));
  updateUI();
  input.value = "";
  document.getElementById("status").innerText = `Inserted ${val}.`;
}

async function startSort() {
  console.log("Start Sort clicked", heap);

  if (heap.length === 0) return;

  document.getElementById(
    "status"
  ).innerText = `Processing ${heapType.toUpperCase()} Heap on Backend...`;

  // DATA TRABSFERED
  try {
    const response = await fetch("http://127.0.0.1:5000/heap-sort", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        array: heap,
        strategy: heapType,
      }),
    });

    const data = await response.json();
    const steps = data.steps;

    //SORTED COLORED
    for (const step of steps) {
      heap = step.array;
      updateUI(step.boundary);
      await sleep(animationSpeed);
    }

    document.getElementById("status").innerText = "Sorting Complete!";
    triggerConfetti();
  } catch (err) {
    console.error(err);
    document.getElementById("status").innerText = "Backend Error!";
  }
}

/* ✅ SIMPLE CELEBRATION: Purplish Background + Confetti */
function triggerConfetti() {
  // 1. Background ko purplish party mode mein shift karo
  document.body.style.transition = "background-color 1s ease";
  document.body.style.backgroundColor = "#1e1b4b"; // Wohi purplish vibe

  // 2. Confetti shots
  var duration = 5 * 1000;
  var animationEnd = Date.now() + duration;

  var interval = setInterval(function () {
    var timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      clearInterval(interval);
      document.body.style.backgroundColor = "#0f172a";
      return;
    }

    confetti({
      particleCount: 40,
      startVelocity: 30,
      spread: 360,
      origin: {
        x: Math.random(),
        y: Math.random() - 0.2,
      },
      colors: ["#22d3ee", "#818cf8", "#f472b6"], // Cyan, Indigo, Pink shades
    });
  }, 250);
}

function generateRandomArray() {
  resetHeap();
  const size = Math.floor(Math.random() * 10) + 5;
  for (let i = 0; i < size; i++) {
    heap.push(Math.floor(Math.random() * 100) + 1);
  }
  updateUI();
  document.getElementById(
    "status"
  ).innerText = `Generated ${size} random nodes!`;
}

function deleteNode() {
  if (heap.length === 0) return;
  const removed = heap.shift();
  updateUI();
  document.getElementById("status").innerText = `Deleted ${removed}.`;
}

function updateUI(boundary = heap.length) {
  const arrayContainer = document.getElementById("array-container");
  const treeContainer = document.getElementById("tree-container");
  const barsContainer = document.getElementById("bars-visualizer");

  arrayContainer.innerHTML = "";
  treeContainer.innerHTML = "";
  barsContainer.innerHTML = "";

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "absolute inset-0 w-full h-full");
  treeContainer.appendChild(svg);

  // ✅ FIXED: Pehle maxHeight dhoondo taake bars scale hon
  const maxHeight = heap.length > 0 ? Math.max(...heap) : 100;

  heap.forEach((num, index) => {
    const isSorted = index >= boundary;

    // 1. Array Nodes
    const div = document.createElement("div");
    div.className = `${
      isSorted ? "bg-green-500" : "bg-slate-700"
    } px-4 py-2 rounded-lg font-bold shadow-lg transition-all`;
    div.innerText = num;
    arrayContainer.appendChild(div);

    // 2. Tree Logic
    drawTreeElements(num, index, treeContainer, svg, boundary);

    const barWrapper = document.createElement("div");
    barWrapper.className =
      "flex flex-col items-center justify-end h-full gap-2";

    const bar = document.createElement("div");
    const barPercentage = (num / maxHeight) * 100;
    bar.style.height = `${barPercentage}%`;
    bar.style.width = "25px"; // Slightly thinner taake labels fit ho jayein

    if (isSorted) {
      bar.className =
        "bg-green-500 rounded-t-md transition-all duration-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]";
    } else {
      const colors = [
        "bg-cyan-500",
        "bg-pink-500",
        "bg-amber-500",
        "bg-indigo-500",
        "bg-purple-500",
      ];
      const randomColor = colors[index % colors.length];
      bar.className = `${randomColor} rounded-t-md transition-all duration-500 shadow-lg`;
    }
    bar.title = num;

    const label = document.createElement("span");
    label.className = "text-[10px] font-black text-slate-500 font-mono"; // Chota aur professional font
    label.innerText = num;

    barWrapper.appendChild(bar);
    barWrapper.appendChild(label);
    barsContainer.appendChild(barWrapper);
  });
}

function drawTreeElements(num, index, container, svg, boundary) {
  const { x, y } = getCoords(index);

  if (index > 0) {
    const { x: px, y: py } = getCoords(Math.floor((index - 1) / 2));
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", `${px}%`);
    line.setAttribute("y1", `${py}px`);
    line.setAttribute("x2", `${x}%`);
    line.setAttribute("y2", `${y}px`);
    line.setAttribute("stroke", "#475569");
    line.setAttribute("stroke-width", "2");
    svg.appendChild(line);
  }

  const node = document.createElement("div");
  node.className = `absolute -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2
        ${
          index >= boundary
            ? "bg-green-600 border-green-300"
            : "bg-cyan-500 border-white text-slate-900"
        }`;

  node.style.left = `${x}%`;
  node.style.top = `${y}px`;
  node.innerText = num;
  container.appendChild(node);
}

function getCoords(index) {
  const level = Math.floor(Math.log2(index + 1));
  const pos = index - (2 ** level - 1);
  const total = 2 ** level;

  return {
    x: (pos + 0.5) * (100 / total),
    y: level * 70 + 40,
  };
}

function resetHeap() {
  heap = [];
  updateUI();
  document.getElementById("status").innerText = "Ready!";
}

let animationSpeed = 800;
let heapType = "max"; // Default max heap

document.getElementById("speedRange").addEventListener("input", (e) => {
  animationSpeed = e.target.value;
});

function setHeapType(type) {
  heapType = type;
  const maxBtn = document.getElementById("maxHeapBtn");
  const minBtn = document.getElementById("minHeapBtn");

  if (type === "max") {
    maxBtn.className =
      "flex-1 py-2 text-xs font-bold rounded-lg transition-all bg-cyan-600 text-white shadow-lg";
    minBtn.className =
      "flex-1 py-2 text-xs font-bold rounded-lg transition-all text-slate-400 hover:text-white";
  } else {
    minBtn.className =
      "flex-1 py-2 text-xs font-bold rounded-lg transition-all bg-pink-600 text-white shadow-lg";
    maxBtn.className =
      "flex-1 py-2 text-xs font-bold rounded-lg transition-all text-slate-400 hover:text-white";
  }
  document.getElementById(
    "status"
  ).innerText = `Switched to ${type.toUpperCase()} Heap!`;
}

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");

  const isHidden =
    sidebar.style.left === "-256px" || sidebar.classList.contains("-left-64");

  if (isHidden) {
    sidebar.style.left = "0px";
    sidebar.classList.remove("-left-64");
    if (overlay) overlay.classList.remove("hidden");
  } else {
    sidebar.style.left = "-256px";
    sidebar.classList.add("-left-64");
    if (overlay) overlay.classList.add("hidden");
  }
}
