// Add these functions
function toggleTheme() {
    const body = document.body;
    const sunIcon = document.querySelector('.fa-sun');
    const moonIcon = document.querySelector('.fa-moon');
    
    body.classList.toggle('light-mode');
    const isLight = body.classList.contains('light-mode');
    
    sunIcon.style.display = isLight ? 'none' : 'block';
    moonIcon.style.display = isLight ? 'block' : 'none';
    
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
}

// Initialize theme from localStorage
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        document.querySelector('.fa-sun').style.display = 'none';
        document.querySelector('.fa-moon').style.display = 'block';
    }
}
initTheme();

// Update loadPopularTopics to prevent multiple loads
let topicsLoaded = false;
async function loadPopularTopics() {
    if (topicsLoaded) return;
    
    const topicsList = document.getElementById('topics-list');
    topicsList.innerHTML = '<div class="loader"></div>';
    
    try {
        const response = await fetch('/popular');
        const topics = await response.json();
        topicsList.innerHTML = topics.map(topic => `
            <div class="topic-item">
                <span>${topic.topic}</span>
                <span>${topic.count} times</span>
            </div>
        `).join('');
        topicsLoaded = true;
    } catch (error) {
        topicsList.innerHTML = `Error loading topics: ${error.message}`;
    }
}

async function generate() {
    const input = document.getElementById('input').value;
    const isTopic = document.getElementById('isTopic').checked;
    const resultDiv = document.getElementById('result');

    resultDiv.innerHTML = '<div class="loader"></div>';

    try {
        const response = await fetch('/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ input, isTopic })
        });

        const data = await response.json();
        resultDiv.innerHTML = data.question;
    } catch (error) {
        resultDiv.innerHTML = `Error: ${error.message}`;
    }
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.getElementById(tabName).classList.add('active');
    document.querySelector(`button[onclick="switchTab('${tabName}')"]`).classList.add('active');

    if (tabName === 'popular') loadPopularTopics();
}

async function loadPopularTopics() {
    const response = await fetch('/popular');
    const topics = await response.json();
    
    const topicsList = document.getElementById('topics-list');
    topicsList.innerHTML = topics.map(topic => `
        <div class="topic-item">
            <span>${topic.topic}</span>
            <span>${topic.count} times</span>
        </div>
    `).join('');
} 
