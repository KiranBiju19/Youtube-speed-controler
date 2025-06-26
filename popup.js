
let currentSpeed = 1.0;
let maxSpeed = 4.0;

chrome.storage.sync.get(['maxSpeed'], function (result) {
  if (result.maxSpeed) {
    maxSpeed = result.maxSpeed;
    document.getElementById('maxSpeed').value = maxSpeed;
  }
});

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  const tab = tabs[0];
  if (isYouTubeTab(tab)) {
    chrome.tabs.sendMessage(tab.id, { action: 'getSpeed' }, function (response) {
      if (chrome.runtime.lastError) {
        console.warn("Message error:", chrome.runtime.lastError.message);
        return;
      }
      if (response && response.speed) {
        currentSpeed = response.speed;
        updateSpeedDisplay();
      }
    });
  }
});

function isYouTubeTab(tab) {
  return tab.url && tab.url.includes("youtube.com/watch");
}

function updateSpeedDisplay() {
  document.getElementById('currentSpeed').textContent = currentSpeed.toFixed(2) + 'x';
}

function sendSpeedCommand(action, speed = null) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const tab = tabs[0];
    if (!isYouTubeTab(tab)) {
      console.warn("Not a YouTube watch tab.");
      return;
    }

    chrome.tabs.sendMessage(tab.id, {
      action: action,
      speed: speed,
      maxSpeed: maxSpeed
    }, function (response) {
      if (chrome.runtime.lastError) {
        console.warn("Failed to send message:", chrome.runtime.lastError.message);
        return;
      }
      if (response && response.speed) {
        currentSpeed = response.speed;
        updateSpeedDisplay();
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('increaseSpeed').addEventListener('click', () => sendSpeedCommand('increase'));
  document.getElementById('decreaseSpeed').addEventListener('click', () => sendSpeedCommand('decrease'));
  document.getElementById('resetSpeed').addEventListener('click', () => sendSpeedCommand('reset'));

  document.getElementById('maxSpeed').addEventListener('change', function () {
    maxSpeed = parseFloat(this.value) || 4.0;
    chrome.storage.sync.set({ maxSpeed: maxSpeed });
  });

  document.querySelectorAll('.preset').forEach(button => {
    button.addEventListener('click', () => {
      const speed = parseFloat(button.getAttribute('data-speed'));
      sendSpeedCommand('setSpeed', speed);
    });
  });
});
