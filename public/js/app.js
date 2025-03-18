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