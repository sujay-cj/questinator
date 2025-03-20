// Theme Management
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

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        document.querySelector('.fa-sun').style.display = 'none';
        document.querySelector('.fa-moon').style.display = 'block';
    }
}
initTheme();

// Topic Management
let topicsLoaded = false;
let cameraStream = null;

async function loadPopularTopics() {
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

function clearPopularTopics() {
    const topicsList = document.getElementById('topics-list');
    const topicHeader = document.getElementById('topic');
    topicsList.innerHTML = '';
    topicHeader.style.display = 'none';
    topicsLoaded = false;
}

// Camera Functions
async function openCamera() {
    try {
        const modal = document.getElementById('cameraModal');
        const video = document.getElementById('cameraPreview');
        
        cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = cameraStream;
        modal.style.display = 'block';
    } catch (error) {
        alert('Camera access error: ' + error.message);
    }
}

function closeCamera() {
    const modal = document.getElementById('cameraModal');
    modal.style.display = 'none';
    
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
}

function capturePhoto() {
    const video = document.getElementById('cameraPreview');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageData = canvas.toDataURL('image/jpeg');
    processImage(imageData);
    closeCamera();
}

async function processImage(imageData) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '<div class="loader"></div>';
    
    try {
        const response = await fetch('/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: imageData })
        });
        
        const data = await response.json();
        // Only update result div, not input field
        resultDiv.innerHTML = `<p class="generated">${data.question}</p>`;
    } catch (error) {
        resultDiv.innerHTML = `Error: ${error.message}`;
    }
}

// Core Functionality
async function generate() {
    const input = document.getElementById('input').value.trim();
    const isTopic = document.getElementById('isTopic').checked;
    const resultDiv = document.getElementById('result');

    if (!input) {
        resultDiv.innerHTML = '<p class="error">Please enter a question or topic.</p>';
        return;
    }

    resultDiv.innerHTML = '<div class="loader"></div>';

    try {
        const response = await fetch('/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ input, isTopic })
        });

        const data = await response.json();
        resultDiv.innerHTML = `<p class="generated">${data.question}</p>`;
    } catch (error) {
        resultDiv.innerHTML = `Error: ${error.message}`;
    }
}

function handleKeyPress(event) {
    if (event.key === 'Enter') generate();
}

// Tab Management
function switchTab(tabName) {
    if (tabName === 'generator') {
        clearPopularTopics();
    }

    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    
    document.getElementById(tabName).classList.add('active');
    document.querySelector(`button[onclick="switchTab('${tabName}')"]`).classList.add('active');

    if (tabName === 'popular') {
        document.getElementById('topic').style.display = 'block';
        if (!topicsLoaded) loadPopularTopics();
    }
}