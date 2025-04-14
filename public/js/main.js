// --- Global Constants & Configuration ---
const OS_VERSION = 'ENCOM OS v12.1.0';
const HOSTNAME = 'grid.encom.os';
const IP_ADDRESS = '192.168.7.101'; // Simulated private IP
const CPU_CORES = 8;
const CPU_TYPE = 'GRID Hyperion-8 @ 4.2GHz'; // Simulated CPU Name
const TOTAL_RAM_GB = 64;
const USERNAME = 'elomibao';
const FULLNAME = 'Erwin Lomibao';
const USERLEVEL = 'System Operator';
const SYSTEM_START_TIME = Date.now();
const SIDEBAR_UPDATE_INTERVAL = 1000; // Update sidebar every second (ms)
const PROCESS_UPDATE_INTERVAL = 3000; // Update process list every 3 seconds (ms)
const GRAPH_WIDTH = 10; // Width of CPU/RAM load graphs in characters ('#'/' ')
const YOUTUBE_VIDEO_ID = 'CU3aishZEMo'; // Your YouTube Video ID

// --- State Variables ---
let player; // YouTube player instance
let currentRamUsedGB = TOTAL_RAM_GB * 0.15; // Start with some RAM used
let currentCpuLoad = 10; // Start with some CPU load %
let sidebarUpdateIntervalId = null;
let processUpdateIntervalId = null;

// --- NEW: Game State ---
let isGameRunning = false;
let gameLoopIntervalId = null;
let gameGrid = [];
let playerCycle = {};
let computerCycle = {};
const GRID_WIDTH = 40; // Characters wide
const GRID_HEIGHT = 20; // Characters high
const GAME_SPEED = 150; // Milliseconds per update

// --- DOM Element References ---
let outputElement, inputElement, terminalElement, sidebarElements, keyboardElement;

// --- Page Content (Keep your existing pages object) ---
const pages = {
    'about': {
        title: 'User Profile: Erwin Lomibao',
        content: `Initializing user profile... Access Granted.
<img width="200" height="200" src="img/profile-img.jpg" alt="Profile Image" class="profile-img" alt="Erwin Lomibao">
Designation: IT Operations, System Administrator
Location: Melbourne, Australia / Manila, Philippines
Primary Directives: Build efficient, scalable, and user-friendly digital solutions.
Secondary Directives: Explore new technologies, optimize system performance, consume tea.
Current System Status: experienced Information Technology Operations Manager with a demonstrated history of working in the online media industry. Among other things, With working knowledge of Linux, Amazon Web Services (AWS), Google Cloud Platform (GCP), MySQL, Varnish, Apache, lighttpd, and Nginx. Additional knowledge in PHP, Python, & NodeJS.

Status: Online and Operational.`
    },
    'employment': {
        title: 'Experience Record',
        content: `Accessing employment history... Data stream active.

<strong><em>Associate Director for IT Operations @ Inquirer Interactive (January 2020 - December 2023)
IT Operations Manager @ Inquirer Interactive (June 2010 - January 2020)
System Administrator @ Inquirer Interactive (July 2008 - June 2010)</em></strong>
- Lead a small team of system administrators and developers to manage the IT operations of Inquirer Interactive.
- Managed and maintained the Inquirer.net website, ensuring high availability and performance.
- Wrote scripts and tools to automate system administration tasks and improve efficiency.
- Collaborated with developers to optimize the website's performance and scalability.

<strong><em>Linux System Administrator @ Mindgate Systems (1997 - 2008)</em></strong>
- Developed the first online prepaid gaming service in the Philippines, Pinoybattle.net (CS 1.3/1.6)
- The first to offer multi-modem dial-up service (Linux EQL driver + Livingston/Lucent Portmaster)

<strong><em>Programmer @ University of the East, Caloocan (1995 - 1997)</em></strong>
- Developed the first Transcript of Records & True Copy of Grades program in Pascal
- Setup the first networked, online computer laboratory in the university
- Setup Novell Netware OS and Local Area Network

Full record available upon authorized request.`
    },
    'education': {
        title: 'Academic Credentials',
        content: `Retrieving academic credentials... Access granted.

Google Cybersecurity Certificate - [Coursera] (September 2024)
Google Automation with Python Certificate - [Coursera] (August 2022)
Google Digital Leader Training Certificate - [Coursera] (Agust 2022)
Bachelor of Science in Computer Information Science - [AMA University] (1993)
High School - [Ramon Magsaysay] - (1989)
Grade School - [GSIS Elementary School] - (1986)

`
    },
    'skills': {
        title: 'Skill Matrix',
        content: `Analyzing core competencies...

Languages: Python, Bash, PHP, HTML, [JavaScript, CSS, Dart, etc.]
Frameworks/Libraries: FastAPI, Bottle, [Flutter, Pandas, NumPy, etc.]
Web Services: Apache, Nginx, lighttpd, [Memcached, Redis, etc.]
Databases: MySQL, PostgreSQL, Firebase Firestore
Tools: VSCode, vim, Git, Docker, AWS, GCP, [Other...]
CMS: WordPress, Joomla, Movable Type

Skill levels represented by system resource allocation.`
    },
    'contact': {
        title: 'Communication Channels',
        content: `Establishing secure link...

Email: elomibao@gmail.com
LinkedIn: <a href="https://www.linkedin.com/in/erwin-lomibao-35b84a109/">erwin lomibao</a>
GitHub: <a href="https://github.com/111110100" target="_blank">111110100</a>

Awaiting incoming transmission...`
    },
    'social': {
        title: 'Network Nodes',
        content: `Scanning social grid...

LinkedIn: <a href="https://www.linkedin.com/in/erwin-lomibao-35b84a109/">erwin lomibao</a>
GitHub: <a href="https://github.com/111110100" target="_blank">111110100</a>
YouTube: <a href="https://www.youtube.com/@5eaf00d" target="_blank">elomibao</a>
LeetCode: <a href="https://www.leetcode.com/111110100" target="_blank">elomibao</a>

Download CV: <a href="https://docs.google.com/presentation/d/e/2PACX-1vQmIqjjDFksrdV46IzQQebmZzytuOFbl7RzoS5VeaAleX79w_3gWO1QxwVXoj9Fy-CtkOIcNUV8x95u/pub?start=false&loop=false&delayms=3000" target="_blank">elomibao</a>


Connect to expand network.`
    },
    'help': {
        title: 'System Commands',
        content: `Available Directives:
  LIST - Display available data nodes (pages).
  OPEN/SHOW <node> - Access data from the specified node.
  CLEAR/CLS - Purge terminal display buffer.
  PING <host> - Ping a host or IP (default: ${HOSTNAME}).
  SAR - Display simulated CPU utilization report.
  MEMSTAT - Display simulated memory statistics report.
  DF - Display simulated disk free space report.
  UPTIME - Show system uptime and load averages.
  RELOAD - Reload the terminal interface.
  HELP - Show this command list.`
    }
};
const availablePages = Object.keys(pages);

// --- Simulated Data ---
const simulatedPartitions = [
    { name: '/dev/grid0s1', label: 'SYSTEM', size: 512, mount: '/', used: 0 },
    { name: '/dev/grid0s2', label: 'USERS', size: 1024, mount: '/users', used: 0 },
    { name: '/dev/grid1s1', label: 'DATA', size: 2048, mount: '/data', used: 0 },
    { name: 'tmpfs', label: 'TEMP', size: 32, mount: '/tmp', used: 0 },
];
const simulatedProcesses = [ // Base processes
    { pid: 1, user: 'root', cmd: 'kernel_task' },
    { pid: 210, user: 'sys', cmd: 'security_svc' },
    { pid: 501, user: USERNAME, cmd: 'terminal_shell' },
    { pid: 505, user: USERNAME, cmd: 'yt_player_bg' },
];
let dynamicProcesses = [ // For processes that come and go
    { pid: 71, user: 'sys', cmd: 'net_probe' },
    { pid: 89, user: 'sys', cmd: 'data_sync' },
    { pid: 95, user: 'sys', cmd: 'cache_clean' },
    { pid: 101, user: 'sys', cmd: 'grid_daemon' },
    { pid: 105, user: 'sys', cmd: 'net_handler' },
    { pid: 612, user: 'sys', cmd: 'io_monitor' },
    { pid: 734, user: 'sys', cmd: 'logd' },
    { pid: 938, user: USERNAME, cmd: 'log_rotate' },
    { pid: 866, user: USERNAME, cmd: 'render_task' },
];

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Ready. Initializing ENCOM OS Interface...");
    selectElements();
    if (!checkElements()) return; // Stop if essential elements are missing

    setupStaticSidebarInfo();
    setupKeyboard();
    setupEventListeners();
    startDynamicUpdates();
    displayWelcomeMessage(); // Display welcome in the terminal
    inputElement.focus();
    console.log("Interface Initialized. Ready.");
});

function selectElements() {
    outputElement = document.getElementById('output');
    inputElement = document.getElementById('command-input');
    terminalElement = document.getElementById('terminal'); // Terminal container
    keyboardElement = document.getElementById('keyboard');

    sidebarElements = {
        container: document.querySelector('.sidebar'),
        osVersion: document.getElementById('os-version'),
        hostname: document.getElementById('hostname'),
        ipAddress: document.getElementById('ip-address'),
        cpuCores: document.getElementById('cpu-cores'),
        uptime: document.getElementById('uptime-sidebar'),
        loadAvg: document.getElementById('load-avg'),
        cpuType: document.getElementById('cpu-type'),
        cpuLoadGraph: document.getElementById('cpu-load-graph'),
        ramInfo: document.getElementById('ram-info'),
        ramLoadGraph: document.getElementById('ram-load-graph'),
        processList: document.getElementById('process-list'),
        fsList: document.getElementById('fs-list'),
        username: document.getElementById('username'),
        fullname: document.getElementById('fullname'),
        userlevel: document.getElementById('userlevel')
    };
}

function checkElements() {
    const essential = [outputElement, inputElement, terminalElement, keyboardElement, sidebarElements.container];
    if (essential.some(el => !el)) {
        console.error("Fatal Error: One or more essential DOM elements not found. Check HTML IDs/Classes.");
        document.body.innerHTML = '<h1 style="color:red; font-family: sans-serif;">Fatal Error: Interface failed to load. Check console.</h1>';
        return false;
    }
    // Check all sidebar elements individually
    for (const key in sidebarElements) {
        if (!sidebarElements[key]) {
            console.error(`Fatal Error: Sidebar element with ID/Class '${key}' not found.`);
             document.body.innerHTML = `<h1 style="color:red; font-family: sans-serif;">Fatal Error: Sidebar element ${key} missing. Check console.</h1>`;
            return false;
        }
    }
    return true;
}


function setupStaticSidebarInfo() {
    sidebarElements.osVersion.textContent = OS_VERSION;
    sidebarElements.hostname.textContent = HOSTNAME;
    sidebarElements.ipAddress.textContent = IP_ADDRESS;
    sidebarElements.cpuCores.textContent = CPU_CORES;
    sidebarElements.cpuType.textContent = CPU_TYPE;
    sidebarElements.username.textContent = USERNAME;
    sidebarElements.fullname.textContent = FULLNAME;
    sidebarElements.userlevel.textContent = USERLEVEL;

    // Initial Filesystem Render (sets initial random usage)
    renderFilesystemInfo();
}

function setupEventListeners() {
    inputElement.addEventListener('keydown', handleInputKeydown);
    // Use document level listeners for keyboard highlighting capture phase is often more reliable
    document.addEventListener('keydown', handleDocumentKeydown, true);
    document.addEventListener('keyup', handleDocumentKeyup, true);

    // Keep focus on the input field when clicking in the terminal area (but not on links)
    terminalElement.addEventListener('click', (e) => {
        if (e.target.tagName !== 'A' && inputElement) {
            inputElement.focus();
        }
    });

     // Focus input when clicking anywhere that isn't the sidebar or a link/interactive element
     document.body.addEventListener('click', (e) => {
        const isSidebarClick = sidebarElements.container?.contains(e.target);
        const isInteractive = ['A', 'INPUT', 'BUTTON', 'TEXTAREA'].includes(e.target.tagName);
        if (!isSidebarClick && !isInteractive && inputElement) {
             inputElement.focus();
        }
     });
}

function startDynamicUpdates() {
    // Clear existing intervals if any (e.g., during reload)
    if (sidebarUpdateIntervalId) clearInterval(sidebarUpdateIntervalId);
    if (processUpdateIntervalId) clearInterval(processUpdateIntervalId);

    // Update frequently changing elements
    sidebarUpdateIntervalId = setInterval(updateSidebarDynamic, SIDEBAR_UPDATE_INTERVAL);
    // Update process list less frequently
    processUpdateIntervalId = setInterval(updateProcessList, PROCESS_UPDATE_INTERVAL);

    // Initial call to populate immediately
    updateSidebarDynamic();
    updateProcessList();
}


// --- Sidebar Update Functions ---

function updateSidebarDynamic() {
    updateUptime();
    updateLoadAverages();
    updateRamUsage();
    updateCpuLoad();
    updateFilesystemUsage(); // Update usage values and bars
}

function formatUptime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    let uptimeString = "";
    if (days > 0) uptimeString += `${days}d `;
    uptimeString += `${String(hours).padStart(2, '0')}:`;
    uptimeString += `${String(minutes).padStart(2, '0')}:`;
    uptimeString += `${String(seconds).padStart(2, '0')}`;
    return uptimeString;
}

function updateUptime() {
    const now = Date.now();
    const uptimeMillis = now - SYSTEM_START_TIME;
    sidebarElements.uptime.textContent = formatUptime(uptimeMillis);
}

function updateLoadAverages() {
    // Simulate load averages slightly changing around a base value
    const baseLoad1 = 0.6;
    const baseLoad5 = 0.4;
    const baseLoad15 = 0.3;
    const load1 = (baseLoad1 + (Math.random() - 0.5) * 0.4).toFixed(2);
    const load5 = (baseLoad5 + (Math.random() - 0.5) * 0.3).toFixed(2);
    const load15 = (baseLoad15 + (Math.random() - 0.5) * 0.2).toFixed(2);
    // Ensure loads are not negative
    sidebarElements.loadAvg.textContent = `${Math.max(0.01, load1)}, ${Math.max(0.01, load5)}, ${Math.max(0.01, load15)}`;
}

function updateRamUsage() {
    // Simulate RAM usage fluctuating more realistically (tends to increase slightly over time)
    const fluctuation = (Math.random() - 0.48) * (TOTAL_RAM_GB * 0.01); // Smaller, slightly positive bias
    let potentialRam = currentRamUsedGB + fluctuation;
    // Clamp between 10% and 95% usage
    currentRamUsedGB = Math.max(TOTAL_RAM_GB * 0.1, Math.min(TOTAL_RAM_GB * 0.95, potentialRam));

    sidebarElements.ramInfo.textContent = `${TOTAL_RAM_GB.toFixed(0)}G / ${currentRamUsedGB.toFixed(1)}G Used`;
    renderLoadGraph(sidebarElements.ramLoadGraph, currentRamUsedGB / TOTAL_RAM_GB);
}

function updateCpuLoad() {
    // Simulate CPU load fluctuating, sometimes spiking
    const baseLoad = 15; // Average idle load
    const spikeChance = 0.1;
    let fluctuation;

    if (Math.random() < spikeChance) {
        fluctuation = Math.random() * 50 + 20; // Spike
    } else {
        fluctuation = (Math.random() - 0.5) * 15; // Normal fluctuation
    }

    let potentialLoad = baseLoad + fluctuation;
    currentCpuLoad = Math.max(5, Math.min(98, potentialLoad)); // Clamp between 5% and 98%

    renderLoadGraph(sidebarElements.cpuLoadGraph, currentCpuLoad / 100);
}

function renderLoadGraph(element, percentage) {
    const filledBlocks = Math.round(percentage * GRAPH_WIDTH);
    const emptyBlocks = Math.max(0, GRAPH_WIDTH - filledBlocks); // Ensure not negative
    // Use block characters for a more retro feel if desired, or stick with #/-
    // const blockChar = '\u2588'; // Full block character
    // const emptyChar = '\u2591'; // Light shade character
    // const graph = `[${blockChar.repeat(filledBlocks)}${emptyChar.repeat(emptyBlocks)}]`;
    const graph = `[${'#'.repeat(filledBlocks)}${'-'.repeat(emptyBlocks)}]`; // Simple #/- graph
    element.textContent = graph;
}

function updateProcessList() {
    // Simulate processes appearing/disappearing
    // Remove some old dynamic processes
    dynamicProcesses = dynamicProcesses.filter(() => Math.random() > 0.2);
    // Add some new dynamic processes
    if (Math.random() < 0.3 && dynamicProcesses.length < 5) {
        const tempPid = Math.floor(Math.random() * 8000) + 1000;
        const tempUser = Math.random() > 0.3 ? USERNAME : 'sys';
        const tempCmd = ['data_sync', 'log_rotate', 'net_probe', 'cache_clean', 'render_task'][Math.floor(Math.random() * 5)];
        dynamicProcesses.push({ pid: tempPid, user: tempUser, cmd: tempCmd });
    }

    let content = `PID   USER      CMD\n`;
    content += `----- --------- -----------------\n`; // Header line

    const allProcesses = [...simulatedProcesses, ...dynamicProcesses];
    // Sort by PID for consistency
    allProcesses.sort((a, b) => a.pid - b.pid);

    allProcesses.forEach(p => {
        const pidStr = String(p.pid).padEnd(5);
        const userStr = p.user.padEnd(9);
        const cmdStr = p.cmd.substring(0, 17).padEnd(17); // Truncate/pad command
        content += `${pidStr} ${userStr} ${cmdStr}\n`;
    });

    sidebarElements.processList.textContent = content;
    // Scroll process list to top (optional)
    // sidebarElements.processList.scrollTop = 0;
}

function renderFilesystemInfo() {
    sidebarElements.fsList.innerHTML = ''; // Clear previous entries
    simulatedPartitions.forEach((p, index) => {
        // Initial random usage (only set once or on reload)
        if (p.used === 0) {
             p.used = Math.random() * p.size * 0.8 + p.size * 0.1; // 10-90% usage
        }

        const free = p.size - p.used;
        const usePercent = (p.used / p.size) * 100;

        const entryDiv = document.createElement('div');
        entryDiv.classList.add('fs-entry');
        entryDiv.innerHTML = `
            <div>${p.name} (${p.label}) on ${p.mount}</div>
            <div class="fs-details" id="fs-details-${index}">${p.size.toFixed(0)}G Total / ${p.used.toFixed(1)}G Used / ${free.toFixed(1)}G Free</div>
            <div class="fs-bar-container">
                <div class="fs-bar-used" id="fs-bar-${index}" style="width: ${usePercent.toFixed(1)}%;"></div>
            </div>
        `;
        sidebarElements.fsList.appendChild(entryDiv);
    });
}

function updateFilesystemUsage() {
     // Simulate slight changes in usage for dynamic feel
     simulatedPartitions.forEach((p, index) => {
         // Only change usage if it's not the root/system partition (less volatile)
         if (p.mount !== '/') {
             const change = (Math.random() - 0.49) * (p.size * 0.001); // Very small fluctuation
             p.used = Math.max(p.size * 0.05, Math.min(p.size * 0.98, p.used + change)); // Clamp usage
         }

         const usePercent = (p.used / p.size) * 100;
         const barElement = document.getElementById(`fs-bar-${index}`);
         const detailsElement = document.getElementById(`fs-details-${index}`);

         if (barElement) {
             barElement.style.width = `${usePercent.toFixed(1)}%`;
         }
         if (detailsElement) {
             const free = p.size - p.used;
             detailsElement.textContent = `${p.size.toFixed(0)}G Total / ${p.used.toFixed(1)}G Used / ${free.toFixed(1)}G Free`;
         }
     });
}


// --- NEW: Game Logic Functions ---

function setupGameGrid() {
    gameGrid = [];
    for (let y = 0; y < GRID_HEIGHT; y++) {
        gameGrid[y] = [];
        for (let x = 0; x < GRID_WIDTH; x++) {
            // Add walls around the border
            if (y === 0 || y === GRID_HEIGHT - 1 || x === 0 || x === GRID_WIDTH - 1) {
                gameGrid[y][x] = '░'; // Wall
            } else {
                gameGrid[y][x] = ' '; // Empty space
            }
        }
    }
}

function initializeCycles() {
    // Player starts near top-left, going right
    playerCycle = {
        x: 5,
        y: 5,
        dx: 1, // Direction x (1=right, -1=left, 0=none)
        dy: 0, // Direction y (1=down, -1=up, 0=none)
        trailChar: '█',
        colorClass: 'player-trail' // CSS class for player trail color
    };
    gameGrid[playerCycle.y][playerCycle.x] = playerCycle.trailChar;

    // Computer starts near bottom-right, going left
    computerCycle = {
        x: GRID_WIDTH - 6,
        y: GRID_HEIGHT - 6,
        dx: -1,
        dy: 0,
        trailChar: '▓',
        colorClass: 'computer-trail' // CSS class for computer trail color
    };
    gameGrid[computerCycle.y][computerCycle.x] = computerCycle.trailChar;
}

function startGame() {
    if (isGameRunning) return;
    isGameRunning = true;

    // Clear terminal and disable normal input
    outputElement.innerHTML = '<pre id="game-area"></pre>'; // Use pre for fixed-width layout
    inputElement.disabled = true;
    inputElement.style.display = 'none'; // Hide input field
    document.querySelector('.input-line .prompt').style.display = 'none'; // Hide prompt

    // Setup game
    setupGameGrid();
    initializeCycles();

    // Add game-specific input listener
    document.addEventListener('keydown', handleGameInput);

    // Start game loop
    gameLoopIntervalId = setInterval(gameLoop, GAME_SPEED);

    // Initial render
    renderGame();
    output('Light Cycle Battle Initiated! Use Arrow Keys. Press ESC to exit.', 'response'); // Add instructions below game area
}

function endGame(winner) {
    if (!isGameRunning) return;
    isGameRunning = false;

    clearInterval(gameLoopIntervalId);
    document.removeEventListener('keydown', handleGameInput);

    // Re-enable normal input
    inputElement.disabled = false;
    inputElement.style.display = ''; // Show input field
    document.querySelector('.input-line .prompt').style.display = ''; // Show prompt

    // Display winner message below the final game state
    let message = 'Game Over! ';
    if (winner === 'player') {
        message += 'You Win!';
    } else if (winner === 'computer') {
        message += 'Computer Wins!';
    } else {
        message += 'It\'s a Draw?!'; // Should be rare
    }
     output(message, 'page-title'); // Use a distinct style
     output('Press Enter to return to terminal.', 'response');


    inputElement.focus(); // Focus back on input
}

function handleGameInput(event) {
    if (!isGameRunning) return;

    let newDx = playerCycle.dx;
    let newDy = playerCycle.dy;

    switch (event.key) {
        case 'ArrowUp':
            if (playerCycle.dy === 0) { newDx = 0; newDy = -1; } // Prevent reversing
            event.preventDefault();
            break;
        case 'ArrowDown':
            if (playerCycle.dy === 0) { newDx = 0; newDy = 1; }
            event.preventDefault();
            break;
        case 'ArrowLeft':
            if (playerCycle.dx === 0) { newDx = -1; newDy = 0; }
            event.preventDefault();
            break;
        case 'ArrowRight':
            if (playerCycle.dx === 0) { newDx = 1; newDy = 0; }
            event.preventDefault();
            break;
        case 'Escape':
            output('Simulation aborted by user.', 'error');
            endGame(null); // No winner if escaped
            event.preventDefault();
            break;
    }
    playerCycle.dx = newDx;
    playerCycle.dy = newDy;
}

function computerAI() {
    // Simple AI: Try to go straight. If blocked, try turning left/right randomly.
    const { x, y, dx, dy } = computerCycle;
    const nextX = x + dx;
    const nextY = y + dy;

    // Check if the path ahead is blocked
    if (gameGrid[nextY]?.[nextX] !== ' ') {
        // Path blocked, try turning
        const possibleTurns = [];
        if (dx !== 0) { // Moving horizontally
            if (gameGrid[y - 1]?.[x] === ' ') possibleTurns.push({ dx: 0, dy: -1 }); // Try Up
            if (gameGrid[y + 1]?.[x] === ' ') possibleTurns.push({ dx: 0, dy: 1 });  // Try Down
        } else { // Moving vertically
            if (gameGrid[y]?.[x - 1] === ' ') possibleTurns.push({ dx: -1, dy: 0 }); // Try Left
            if (gameGrid[y]?.[x + 1] === ' ') possibleTurns.push({ dx: 1, dy: 0 });  // Try Right
        }

        if (possibleTurns.length > 0) {
            // Choose a random valid turn
            const turn = possibleTurns[Math.floor(Math.random() * possibleTurns.length)];
            computerCycle.dx = turn.dx;
            computerCycle.dy = turn.dy;
        } else {
            // No valid turns - AI is trapped (will crash next turn)
        }
    }
    // Otherwise, continue straight (dx, dy remain unchanged)
}


function moveCycle(cycle) {
    // Update position based on direction
    cycle.x += cycle.dx;
    cycle.y += cycle.dy;

    // Check for collision at the new position
    const nextCell = gameGrid[cycle.y]?.[cycle.x]; // Use optional chaining for safety

    if (nextCell === undefined || nextCell !== ' ') {
        // Collision! (Hit wall '#' or another trail 'P'/'C')
        return false; // Indicate collision
    }

    // No collision, mark the new position with the trail
    gameGrid[cycle.y][cycle.x] = cycle.trailChar;
    return true; // Indicate successful move
}

function gameLoop() {
    // 1. Update Computer AI direction
    computerAI();

    // 2. Move Player
    const playerMovedOk = moveCycle(playerCycle);

    // 3. Move Computer
    const computerMovedOk = moveCycle(computerCycle);

    // 4. Render the updated grid
    renderGame();

    // 5. Check Game Over conditions
    if (!playerMovedOk && !computerMovedOk) {
        endGame('draw'); // Both crashed simultaneously
    } else if (!playerMovedOk) {
        endGame('computer'); // Player crashed
    } else if (!computerMovedOk) {
        endGame('player'); // Computer crashed
    }
    // If both moved OK, the loop continues
}

function renderGame() {
    const gameArea = document.getElementById('game-area');
    if (!gameArea) return;

    let html = '';
    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            const cell = gameGrid[y][x];
            if (cell === playerCycle.trailChar) {
                html += `<span class="${playerCycle.colorClass}">${cell}</span>`;
            } else if (cell === computerCycle.trailChar) {
                html += `<span class="${computerCycle.colorClass}">${cell}</span>`;
            } else if (cell === '#') {
                 html += `<span class="wall">${cell}</span>`; // Style walls if desired
            }
            else {
                html += cell; // Empty space
            }
        }
        html += '\n'; // Newline for the next row in <pre>
    }
    gameArea.innerHTML = html;
    // No need to call scrollToBottom here, the game area has fixed height
}
// --- End NEW Game Logic Functions ---

// --- Terminal Logic ---

function output(line, type = 'response') {
    if (!outputElement) return;
    const lineElement = document.createElement('div');
    lineElement.classList.add('output-line', type);
    lineElement.innerHTML = line; // Use innerHTML for prompt span, links etc.
    outputElement.appendChild(lineElement);
    scrollToBottom();
}

async function typeEffect(text, element, speed = 15) { // Slightly faster default typing
    if (!element) return;
    element.innerHTML = ''; // Clear previous content

    // Basic parser to handle HTML tags and entities during typing
    let currentHTML = '';
    let i = 0;
    while (i < text.length) {
        let char = text[i];
        let typed = true;

        if (char === '<') {
            // Look for closing '>'
            let tagEnd = text.indexOf('>', i);
            if (tagEnd !== -1) {
                // Check if it's a closing tag </...
                let isClosing = text[i + 1] === '/';
                // Check if it's a self-closing tag <.../>
                let isSelfClosing = text[tagEnd - 1] === '/';

                // Add the whole tag instantly
                currentHTML += text.substring(i, tagEnd + 1);
                i = tagEnd + 1;
                typed = false; // Don't add delay for the tag itself
            } else {
                // No closing '>', treat '<' as literal character
                currentHTML += '&lt;';
                i++;
            }
        } else if (char === '&') {
            // Look for closing ';' for entities
            let entityEnd = text.indexOf(';', i);
            if (entityEnd !== -1) {
                let entity = text.substring(i, entityEnd + 1);
                // Basic check for common entities
                if (entity === '&nbsp;' || entity === '&lt;' || entity === '&gt;' || entity === '&amp;') {
                    currentHTML += entity;
                    i = entityEnd + 1;
                    typed = false; // No delay for entity
                } else {
                    // Not a recognized entity, treat '&' as literal
                    currentHTML += '&amp;';
                    i++;
                }
            } else {
                 currentHTML += '&amp;';
                 i++;
            }
        }
        else {
            // Regular character
            currentHTML += char;
            i++;
        }

        element.innerHTML = currentHTML; // Update element content

        if (typed) {
            scrollToBottom(); // Scroll only when typing characters
            await new Promise(resolve => setTimeout(resolve, speed * (Math.random() * 0.6 + 0.7))); // Randomness
        }
    }
    // Final scroll after typing finishes
    scrollToBottom();
}

function scrollToBottom() {
    // Use requestAnimationFrame to ensure scrolling happens after the DOM updates
    requestAnimationFrame(() => {
        // *** Target the #terminal element for scrolling ***
        if (terminalElement) { // Check if the terminal element exists
            terminalElement.scrollTop = terminalElement.scrollHeight;
        }
    });
}

async function handleCommand(commandString) {
    const trimmedCommand = commandString.trim();
    const lowerCaseCommand = trimmedCommand.toLowerCase(); // Use a separate lower case version
    // Add the typed command to the output immediately
    output(`<span class="prompt">READY:/&gt;</span> ${trimmedCommand || ''}`, 'command');

    // Check for special commands
    if (lowerCaseCommand === 'tron') {
        output('Initializing Light Cycle simulation...', 'response');
        await new Promise(resolve => setTimeout(resolve, 500));
        startGame();
        return; // Stop further command processing
    }

    if (!trimmedCommand) return; // Do nothing if empty command entered

    const parts = trimmedCommand.toLowerCase().split(' ');
    const command = parts[0];
    const arg = parts.slice(1).join(' '); // Join remaining parts for args with spaces

    // Add a small delay to simulate processing
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));

    switch (command) {
        case 'list':
        case 'ls':
            output('Available data nodes. To display content, type \'show <i>node_name</i>\':');
            availablePages.forEach(page => output(`- ${page}`));
            break;

        case 'clear':
        case 'cls':
            outputElement.innerHTML = '';
            // output('Terminal buffer purged.'); // Optional confirmation
            break;

        case 'open':
        case 'cat':
        case 'show':
            if (!arg) {
                output('Error: Missing node name. Usage: OPEN <node_name>', 'error');
            } else if (pages[arg]) {
                const page = pages[arg];
                // Display title instantly
                output(`--- ${page.title} ---`, 'page-title');
                // Display content - use innerHTML directly for correct HTML rendering
                const contentElement = document.createElement('div');
                contentElement.classList.add('output-line', 'page-content');
                contentElement.innerHTML = page.content; // Render HTML instantly
                outputElement.appendChild(contentElement);
                scrollToBottom(); // Ensure scroll after adding content block

            } else {
                output(`Error: Node "${arg}" not found. Type 'LIST' to see available nodes.`, 'error');
            }
            break;

        case 'help':
             const helpPage = pages['help'];
             output(`--- ${helpPage.title} ---`, 'page-title');
             // Use innerHTML for help content too, in case of future formatting
             const helpContentElement = document.createElement('div');
             helpContentElement.classList.add('output-line', 'page-content');
             helpContentElement.innerHTML = helpPage.content;
             outputElement.appendChild(helpContentElement);
             scrollToBottom();
            break;

        case 'uptime': // Keep command for detailed view / consistency
            const now = Date.now();
            const uptimeMillis = now - SYSTEM_START_TIME;
            const uptimeString = formatUptime(uptimeMillis); // Use the sidebar formatter
            const currentLoad = sidebarElements.loadAvg.textContent; // Get current load from sidebar
            const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false });
            output(`${currentTime} up ${uptimeString}, load average: ${currentLoad}`, 'response');
            break;

        case 'ping':
            const target = arg;
            let isValidTarget = true;
            let targetHost = HOSTNAME; // Default to system hostname
            let resolvedIp = null;
            const reservedHosts = ['localhost', HOSTNAME, IP_ADDRESS, '127.0.0.1'];

            const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
            const ipv6Regex = /:/; // Basic check for colon

            if (target) {
                if (target.includes('/') || target.includes(':')) { // Basic IP structure check
                    if (!(ipv4Regex.test(target) || ipv6Regex.test(target))) {
                        output(`Error: Invalid IP address format "${target}"`, 'error');
                        isValidTarget = false;
                    } else {
                        targetHost = target; // Use the valid IP
                    }
                } else {
                    targetHost = target; // Assume hostname
                }
            } else {
                 output(`Pinging default host: ${targetHost}...`, 'response');
            }


            if (isValidTarget) {
                // Check if resolution is needed
                if (!reservedHosts.includes(targetHost) && !(ipv4Regex.test(targetHost) || ipv6Regex.test(targetHost))) {
                    output(`Resolving ${targetHost}...`, 'response');
                    await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 200));
                    resolvedIp = await resolveHostname(targetHost); // Use the existing function
                    if (!resolvedIp) {
                        output(`Could not resolve host ${targetHost}`, 'error');
                        isValidTarget = false;
                    } else {
                        output(`Pinging ${targetHost} [${resolvedIp}]...`, 'response');
                    }
                } else if (target) { // Only print if a target was specified
                     output(`Pinging ${targetHost}...`, 'response');
                }
            }

            if (!isValidTarget) break; // Stop if resolution failed or IP was invalid

            // Ping simulation
            let packetsSent = 0;
            let packetsReceived = 0;
            const times = [];
            const numPings = 4;
            output('Sending ICMP ECHO_REQUEST packets...', 'response'); // More verbose
            for (let i = 0; i < numPings; i++) {
                packetsSent++;
                const delay = Math.random() * 600 + 200; // Simulate network delay
                await new Promise(resolve => setTimeout(resolve, delay));
                if ((Math.random() > 0.15) || (reservedHosts.includes(targetHost))) { // 15% packet loss chance unless part of reserved hosts
                    packetsReceived++;
                    const latency = Math.floor(Math.random() * 140) + 10; // 10-150ms latency
                    times.push(latency);
                    const displayHost = resolvedIp ? `${targetHost} [${resolvedIp}]` : targetHost;
                    output(`Reply from ${displayHost}: bytes=32 time=${latency}ms TTL=58`, 'response'); // More realistic output
                } else {
                    output(`Request timed out.`, 'response');
                }
            }
            output('', 'response'); // Blank line
            output(`Ping statistics for ${targetHost}:`, 'response');
            const loss = packetsSent > 0 ? ((packetsSent - packetsReceived) / packetsSent) * 100 : 0;
            output(`    Packets: Sent = ${packetsSent}, Received = ${packetsReceived}, Lost = ${packetsSent - packetsReceived} (${loss.toFixed(0)}% loss),`, 'response');
            if (packetsReceived > 0) {
                const minTime = Math.min(...times);
                const maxTime = Math.max(...times);
                const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
                output(`Approximate round trip times in milli-seconds:`, 'response');
                output(`    Minimum = ${minTime}ms, Maximum = ${maxTime}ms, Average = ${avgTime.toFixed(0)}ms`, 'response');
            }
            break;

        case 'sar': // Keep command for detailed view
            output('Analyzing CPU core performance (Simulated)...', 'response');
            await new Promise(resolve => setTimeout(resolve, 400));
            output(`Timestamp        CPU    %user    %nice     %sys   %iowait    %idle`, 'response');
            output(`-----------------------------------------------------------------`, 'response');
            for (let i = 0; i < CPU_CORES; i++) {
                const user = (Math.random() * 30 + 5).toFixed(2);
                const sys = (Math.random() * 15 + 2).toFixed(2);
                const iowait = (Math.random() * 5).toFixed(2);
                const idle = Math.max(0, 100 - parseFloat(user) - parseFloat(sys) - parseFloat(iowait)).toFixed(2); // Ensure not negative
                const time = new Date().toLocaleTimeString('en-US', { hour12: false });
                const userPadded = user.padStart(7);
                const sysPadded = sys.padStart(7);
                const iowaitPadded = iowait.padStart(9);
                const idlePadded = idle.padStart(9);
                output(`${time}     CPU${i}  ${userPadded}     0.00  ${sysPadded}  ${iowaitPadded} ${idlePadded}`, 'response');
                await new Promise(resolve => setTimeout(resolve, 40)); // Faster output per line
            }
            break;

        case 'memstat': // Keep command for detailed view
            output('Querying memory allocation sectors (Simulated)...', 'response');
            await new Promise(resolve => setTimeout(resolve, 350));
            const usedPercent = ((currentRamUsedGB / TOTAL_RAM_GB) * 100).toFixed(1);
            const freeMemGB = (TOTAL_RAM_GB - currentRamUsedGB).toFixed(1);
            // Keep arbitrary block conversion for theme
            const totalBlocks = TOTAL_RAM_GB * 1024 * 16;
            const usedBlocks = Math.round(currentRamUsedGB * 1024 * 16);
            const freeBlocks = totalBlocks - usedBlocks;

            output(`Memory Grid Status:`, 'response');
            output(`  Total Blocks : ${totalBlocks.toLocaleString()}`, 'response');
            output(`  Used Blocks  : ${usedBlocks.toLocaleString()} (${usedPercent}%)`, 'response');
            output(`  Free Blocks  : ${freeBlocks.toLocaleString()}`, 'response');
            output(` `, 'response');
            output(`Equivalent (GB): Total=${TOTAL_RAM_GB.toFixed(1)} | Used=${currentRamUsedGB.toFixed(1)} | Free=${freeMemGB}`, 'response');
            break;

        case 'df': // Keep command for detailed view
            output('Scanning storage partitions (Simulated)...', 'response');
            await new Promise(resolve => setTimeout(resolve, 500));
            output(`Filesystem      Size   Used  Avail Use% Mounted on`, 'response');
            output(`-----------------------------------------------------`, 'response');
            simulatedPartitions.forEach(p => {
                const sizeGB = p.size.toFixed(0) + 'G';
                const usedGB = p.used.toFixed(1) + 'G'; // Show decimal for used
                const availGB = (p.size - p.used).toFixed(1) + 'G';
                const usePercent = ((p.used / p.size) * 100).toFixed(0) + '%';
                const namePadded = p.name.padEnd(14);
                const sizePadded = sizeGB.padStart(6);
                const usedPadded = usedGB.padStart(6);
                const availPadded = availGB.padStart(6);
                const usePercentPadded = usePercent.padStart(4);
                output(`${namePadded} ${sizePadded} ${usedPadded} ${availPadded} ${usePercentPadded} ${p.mount}`, 'response');
            });
            break;

        case 'reload':
            output('Reloading system interface...', 'response');
            await new Promise(resolve => setTimeout(resolve, 500));
            // Re-initialize parts of the interface
            outputElement.innerHTML = ''; // Clear terminal
            setupStaticSidebarInfo(); // Reset sidebar static info
            startDynamicUpdates(); // Restart intervals
            await displayWelcomeMessage(); // Show welcome message again
            inputElement.focus();
            break;

        case 'init':
        case 'start':
        case 'boot':
            output('System interface already initialized. Type \'HELP\' for commands.', 'error');
            break;

        default:
            output(`Error: Command "${command}" not recognized. Type 'HELP' for available commands.`, 'error');
            break;
    }

    scrollToBottom(); // Ensure scroll after command finishes
}

function handleInputKeydown(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent default newline behavior
        const command = inputElement.value;
        inputElement.value = ''; // Clear input field
        handleCommand(command); // Process command
    }
    // Key highlighting is handled by document listeners
}

// --- On-Screen Keyboard Logic ---

// Map event.code (layout independent) or event.key to keyboard element IDs
// Prioritize event.code for non-character keys
const keyMap = {
    // Row 1
    'Backquote': 'key-tilde', 'Digit1': 'key-1', 'Digit2': 'key-2', 'Digit3': 'key-3', 'Digit4': 'key-4',
    'Digit5': 'key-5', 'Digit6': 'key-6', 'Digit7': 'key-7', 'Digit8': 'key-8', 'Digit9': 'key-9', 'Digit0': 'key-0',
    'Minus': 'key-minus', 'Equal': 'key-equals', 'Backspace': 'key-backspace',
    // Row 2
    'Tab': 'key-tab', 'KeyQ': 'key-q', 'KeyW': 'key-w', 'KeyE': 'key-e', 'KeyR': 'key-r', 'KeyT': 'key-t',
    'KeyY': 'key-y', 'KeyU': 'key-u', 'KeyI': 'key-i', 'KeyO': 'key-o', 'KeyP': 'key-p',
    'BracketLeft': 'key-lbrack', 'BracketRight': 'key-rbrack', 'Backslash': 'key-bslash',
    // Row 3
    'CapsLock': 'key-caps', 'KeyA': 'key-a', 'KeyS': 'key-s', 'KeyD': 'key-d', 'KeyF': 'key-f', 'KeyG': 'key-g',
    'KeyH': 'key-h', 'KeyJ': 'key-j', 'KeyK': 'key-k', 'KeyL': 'key-l', 'Semicolon': 'key-semicolon',
    'Quote': 'key-quote', 'Enter': 'key-enter',
    // Row 4
    'ShiftLeft': 'key-lshift', 'KeyZ': 'key-z', 'KeyX': 'key-x', 'KeyC': 'key-c', 'KeyV': 'key-v', 'KeyB': 'key-b',
    'KeyN': 'key-n', 'KeyM': 'key-m', 'Comma': 'key-comma', 'Period': 'key-period', 'Slash': 'key-fslash',
    'ShiftRight': 'key-rshift',
    // Row 5
    'ControlLeft': 'key-lctrl', 'AltLeft': 'key-lalt', 'Space': 'key-space',
    'AltRight': 'key-ralt', 'ControlRight': 'key-rctrl',
    // Add other keys if needed: 'MetaLeft', 'MetaRight', 'ContextMenu'
};

function setupKeyboard() {
    if (!keyboardElement) return;
    keyboardElement.innerHTML = ''; // Clear loading message

    // Define keyboard layout rows (top to bottom)
    // Use text that visually represents the key
    const layout = [
        ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
        ['Tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
        ['Caps', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", 'Enter'],
        ['Shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'Shift'],
        ['Ctrl', 'Alt', 'Space', 'Alt', 'Ctrl']
    ];

    // Map the display text to the key ID suffix used in keyMap (mostly lowercase)
    const keyIdSuffixMap = {
        '`': 'tilde', '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9', '0': '0', '-': 'minus', '=': 'equals',
        'Backspace': 'backspace', 'Tab': 'tab', 'Q': 'q', 'W': 'w', 'E': 'e', 'R': 'r', 'T': 't', 'Y': 'y', 'U': 'u', 'I': 'i', 'O': 'o', 'P': 'p',
        '[': 'lbrack', ']': 'rbrack', '\\': 'bslash', 'Caps': 'caps', 'A': 'a', 'S': 's', 'D': 'd', 'F': 'f', 'G': 'g', 'H': 'h', 'J': 'j', 'K': 'k',
        'L': 'l', ';': 'semicolon', "'": 'quote', 'Enter': 'enter', 'Shift': 'shift', 'Z': 'z', 'X': 'x', 'C': 'c', 'V': 'v', 'B': 'b', 'N': 'n',
        'M': 'm', ',': 'comma', '.': 'period', '/': 'fslash', 'Ctrl': 'ctrl', 'Alt': 'alt', 'Space': 'space'
    };

    // Keep track of duplicate keys (Shift, Ctrl, Alt)
    let shiftCount = 0;
    let ctrlCount = 0;
    let altCount = 0;

    layout.forEach(rowKeys => {
        const rowDiv = document.createElement('div');
        rowDiv.classList.add('keyboard-row');
        rowKeys.forEach(keyText => {
            const keyDiv = document.createElement('div');
            keyDiv.classList.add('key');
            keyDiv.textContent = keyText; // Display text

            let idSuffix = keyIdSuffixMap[keyText];
            let keyId = `key-${idSuffix}`; // Default ID

            // Handle duplicate keys and assign specific IDs (l/r)
            if (keyText === 'Shift') {
                keyId = (shiftCount === 0) ? 'key-lshift' : 'key-rshift';
                shiftCount++;
                keyDiv.classList.add('special', 'shift');
            } else if (keyText === 'Ctrl') {
                keyId = (ctrlCount === 0) ? 'key-lctrl' : 'key-rctrl';
                ctrlCount++;
                keyDiv.classList.add('special', 'ctrl');
            } else if (keyText === 'Alt') {
                keyId = (altCount === 0) ? 'key-lalt' : 'key-ralt';
                altCount++;
                keyDiv.classList.add('special', 'alt');
            } else if (['Backspace', 'Tab', 'Caps', 'Enter', 'Space'].includes(keyText)) {
                keyDiv.classList.add('special', keyText.toLowerCase()); // Add class like 'backspace', 'enter'
            }

            keyDiv.id = keyId; // Assign the final ID
            rowDiv.appendChild(keyDiv);
        });
        keyboardElement.appendChild(rowDiv);
    });
}


function handleDocumentKeydown(event) {
    // Don't highlight if user is typing in input field (optional, but less distracting)
    // if (document.activeElement === inputElement) return;

    // Find the target ID using event.code primarily
    let targetId = keyMap[event.code];

    // If code didn't match (e.g., symbol keys might differ), try event.key as fallback
    // This is less reliable across keyboard layouts for non-alphanumeric keys
    // if (!targetId) {
    //     targetId = Object.keys(keyMap).find(key => keyMap[key] === `key-${event.key.toLowerCase()}`);
    // }

    if (targetId) {
        const keyElement = document.getElementById(targetId);
        if (keyElement) {
            keyElement.classList.add('pressed');
        }
    }
    // Prevent default browser actions for keys like Tab, Space (when input not focused)
    if (['Tab', 'Space'].includes(event.code) && document.activeElement !== inputElement) {
       // event.preventDefault(); // Be careful with this, might block accessibility features
    }
}

function handleDocumentKeyup(event) {
    // Find the target ID using event.code primarily
    let targetId = keyMap[event.code];

    // Fallback attempt using event.key (less reliable)
    // if (!targetId) {
    //     targetId = Object.keys(keyMap).find(key => keyMap[key] === `key-${event.key.toLowerCase()}`);
    // }

    if (targetId) {
        const keyElement = document.getElementById(targetId);
        if (keyElement) {
            keyElement.classList.remove('pressed');
        }
    } else {
        // If no specific ID found, try to release generic Shift/Ctrl/Alt based on event.key
        // This helps if only one side (e.g., ShiftLeft) was pressed but event.key is just 'Shift' on keyup
        if (event.key === 'Shift') {
            document.getElementById('key-lshift')?.classList.remove('pressed');
            document.getElementById('key-rshift')?.classList.remove('pressed');
        } else if (event.key === 'Control') {
            document.getElementById('key-lctrl')?.classList.remove('pressed');
            document.getElementById('key-rctrl')?.classList.remove('pressed');
        } else if (event.key === 'Alt') {
            document.getElementById('key-lalt')?.classList.remove('pressed');
            document.getElementById('key-ralt')?.classList.remove('pressed');
        }
    }
}

// --- Welcome Message ---
async function displayWelcomeMessage() {
    if (!outputElement) return;
    // Clear terminal before showing welcome message
    outputElement.innerHTML = '';

    const typeLine = async (text, type = 'response', speed = 5) => { // Faster welcome typing
        const lineElement = document.createElement('div');
        lineElement.classList.add('output-line', type);
        outputElement.appendChild(lineElement);
        await typeEffect(text, lineElement, speed);
    };
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    await typeLine(`Initializing ${OS_VERSION}...`, 'response', 10);
    await delay(50);
    await typeLine('Boot Sector: Verified', 'response');
    await typeLine(`Memory Check: ${TOTAL_RAM_GB}G OK`, 'response');
    await typeLine(`CPU Core Sync: ${CPU_CORES} Cores Active`, 'response');
    await typeLine('GPU Interface: Online [GRID Render Engine v3.2]', 'response');
    await delay(100);
    await typeLine('Loading Kernel Modules...', 'response');
    await typeLine('&nbsp;&nbsp;[core.sys]        Loaded', 'response', 1); // Use &nbsp; for indent
    await typeLine('&nbsp;&nbsp;[io.sys]          Loaded', 'response', 1);
    await typeLine('&nbsp;&nbsp;[net.sys]         Loaded', 'response', 1);
    await typeLine('&nbsp;&nbsp;[security.sys]    Loaded', 'response', 1);
    await typeLine('&nbsp;&nbsp;[gridlink.mod]    Loaded', 'response', 1);
    await delay(80);
    await typeLine('Mounting Filesystems...', 'response');
    for (const p of simulatedPartitions) { // Use for...of for async loop
         await typeLine(`&nbsp;&nbsp;[${p.name}] -> ${p.mount}`, 'response', 1);
         await delay(15); // Small delay between mounts
    }
    await delay(80);
    await typeLine(`Network Link: Active [Node ID: ${HOSTNAME}]`, 'response');
    await typeLine('Security Subsystem: Engaged', 'response');
    await delay(150);
    await typeLine(`Authenticating User: ${FULLNAME} (${USERNAME})`, 'response');
    await typeLine('Access Granted. User Level: ' + USERLEVEL, 'response', 2);
    await delay(50);
    await typeLine('------------------------------------', 'response', 1);
    await typeLine(`Welcome to the Grid. Type 'HELP' for commands.`, 'response', 2);
    output(''); // Add an empty line instantly

    scrollToBottom(); // Ensure scrolled down after message
}


// --- YouTube Background Logic ---
function onYouTubeIframeAPIReady() {
    console.log("YouTube API Ready.");
    const videoContainer = document.getElementById('video-background');
    if (!videoContainer) {
        console.error("Video background container not found!");
        return;
    }
    // Ensure container is empty before adding player div
    videoContainer.innerHTML = '';
    try {
        player = new YT.Player(videoContainer.appendChild(document.createElement('div')), {
            videoId: YOUTUBE_VIDEO_ID,
            playerVars: {
                'autoplay': 1, 'controls': 0, 'showinfo': 0, 'modestbranding': 1,
                'loop': 1, 'playlist': YOUTUBE_VIDEO_ID, // Required for looping
                'fs': 0, 'cc_load_policy': 0, 'iv_load_policy': 3,
                'autohide': 0, 'rel': 0, 'playsinline': 1,
                'origin': window.location.origin // Important for some environments
            },
            events: {
                'onReady': onPlayerReady,
                'onError': onPlayerError,
                // Add state change listener to restart on end if loop fails
                'onStateChange': onPlayerStateChange
            }
        });
    } catch (error) {
        console.error("Error creating YouTube player:", error);
         if (videoContainer) videoContainer.style.display = 'none'; // Hide if creation fails
    }
}

function onPlayerReady(event) {
    event.target.mute();
    event.target.playVideo();
    console.log("YouTube Player Ready, Muted, and Playing.");
    // Ensure video stays behind content
     const iframe = event.target.getIframe();
     if (iframe) {
         iframe.style.position = 'absolute';
         iframe.style.zIndex = '-1'; // Ensure it's behind .container
     }
}

function onPlayerError(event) {
    console.error("YouTube Player Error:", event.data);
    // Hide the background or show a static image on error
    const videoContainer = document.getElementById('video-background');
    if (videoContainer) videoContainer.style.display = 'none';
}

function onPlayerStateChange(event) {
    // If the video ends and looping isn't working perfectly, restart it
    if (event.data === YT.PlayerState.ENDED) {
        console.log("Video ended, restarting loop.");
        player.seekTo(0);
        player.playVideo();
    }
}

// --- DNS Resolution (Keep as is) ---
async function resolveHostname(hostname) {
    // Basic check: if it's already an IP, return it directly
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (ipv4Regex.test(hostname)) return hostname;
    // Add IPv6 check if needed

    try {
        // Using Cloudflare as an alternative/example
        // const response = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(hostname)}&type=A`, {
        //     headers: { 'accept': 'application/dns-json' }
        // });
        // Using Google DoH
         const response = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(hostname)}&type=A`);

        if (!response.ok) {
            console.error(`DNS query HTTP error: ${response.status}`);
            return null;
        }
        const data = await response.json();

        // Google Status check
        if (data.Status !== 0 && data.Status !== undefined) { // Google uses 0 for success
             console.warn(`DNS query failed for ${hostname}. Status: ${data.Status}`);
             return null;
        }
         // Cloudflare Status check (also uses 0 for success)
        // if (data.Status !== 0 && data.Status !== undefined) {
        //      console.warn(`DNS query failed for ${hostname}. Status: ${data.Status}`);
        //      return null;
        // }


        // Extract the first IPv4 address (A record, type=1)
        if (data.Answer && data.Answer.length > 0) {
            const aRecord = data.Answer.find(record => record.type === 1);
            return aRecord ? aRecord.data : null;
        }
        return null; // No A record found
    } catch (error) {
        console.error("Error during DNS resolution fetch:", error);
        return null;
    }
}

// --- Make sure YouTube API callback is globally accessible ---
window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
