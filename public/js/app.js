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

// Tab Management
let topicsLoaded = false;
function switchTab(tabName) {
    const popularContent = document.getElementById('popular');
    const switchContainer = document.querySelector('.slider-switch');
    const labels = document.querySelectorAll('.slider-label');

    switchContainer.setAttribute('data-active', tabName);
    labels.forEach(label => label.classList.remove('active'));
    document.querySelector(`.slider-label[onclick="switchTab('${tabName}')"]`).classList.add('active');

    if (tabName === 'popular') {
        popularContent.classList.add('active');
        if (!topicsLoaded) loadPopularTopics();
    } else {
        popularContent.classList.remove('active');
        clearPopularTopics();
    }
}

// Topic Management
async function loadPopularTopics() {
    const topicsList = document.getElementById('topics-list');
    topicsList.innerHTML = '<div class="loader">Loading...</div>';
    
    try {
        const response = await fetch('/popular');
        if (!response.ok) throw new Error('Failed to fetch topics');
        const topics = await response.json();
        
        topicsList.innerHTML = topics.map(topic => `
            <div class="topic-item">
                <span>${topic.topic}</span>
                <span>${topic.count} times</span>
            </div>
        `).join('');
        topicsLoaded = true;
    } catch (error) {
        topicsList.innerHTML = `<div class="error">Error: ${error.message}</div>`;
    }
}

function clearPopularTopics() {
    document.getElementById('topics-list').innerHTML = '';
    topicsLoaded = false;
}

// Camera Functions
let cameraStream = null;
let currentFacingMode = 'user';

async function openCamera() {
    try {
        const video = document.getElementById('cameraPreview');
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
        }
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: currentFacingMode }
        });
        video.srcObject = cameraStream;
        document.getElementById('cameraModal').style.display = 'block';
    } catch (error) {
        alert('Error accessing camera: ' + error.message);
    }
}

function switchCamera() {
    const switchBtn = document.querySelector('.switch-camera-btn');
    const icon = switchBtn.querySelector('i');
    
    icon.classList.add('clicked');
    setTimeout(() => icon.classList.remove('clicked'), 600);
    
    currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
    openCamera();
}

function closeCamera() {
    document.getElementById('cameraModal').style.display = 'none';
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    currentFacingMode = 'user';
}

function capturePhoto() {
    const video = document.getElementById('cameraPreview');
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    processImage(canvas.toDataURL('image/jpeg'));
    closeCamera();
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

    resultDiv.innerHTML = '<div class="loader">Generating...</div>';

    try {
        const response = await fetch('/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ input, isTopic })
        });

        if (!response.ok) throw new Error('Generation failed');
        
        const data = await response.json();
        resultDiv.innerHTML = `<p class="generated">${data.question}</p>`;
    } catch (error) {
        resultDiv.innerHTML = `<p class="error">Error: ${error.message}</p>`;
    }
}

async function processImage(imageData) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '<div class="loader">Processing image...</div>';

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: imageData })
        });

        if (!response.ok) throw new Error('Image processing failed');
        
        const data = await response.json();
        resultDiv.innerHTML = `<p class="generated">${data.question}</p>`;
    } catch (error) {
        resultDiv.innerHTML = `<p class="error">Error: ${error.message}</p>`;
    }
}

// Event Listeners
function handleKeyPress(event) {
    if (event.key === 'Enter') generate();
}

document.addEventListener('DOMContentLoaded', () => {
    switchTab('generator');
    document.getElementById('input').focus();
});

// Global Exports
window.toggleTheme = toggleTheme;
window.switchTab = switchTab;
window.openCamera = openCamera;
window.closeCamera = closeCamera;
window.capturePhoto = capturePhoto;
window.generate = generate;
window.handleKeyPress = handleKeyPress;
window.switchCamera = switchCamera;