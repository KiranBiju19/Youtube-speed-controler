// YouTube Speed Controller Content Script
(function() {
  'use strict';

  let maxSpeed = 4.0;
  let speedStep = 0.25;
  let minSpeed = 0.25;
  
  // Load settings
  chrome.storage.sync.get(['maxSpeed'], function(result) {
    if (result.maxSpeed) {
      maxSpeed = result.maxSpeed;
    }
  });

  // Get video element
  function getVideoElement() {
    return document.querySelector('video');
  }

  // Get current playback speed
  function getCurrentSpeed() {
    const video = getVideoElement();
    return video ? video.playbackRate : 1.0;
  }

  // Set playback speed
  function setPlaybackSpeed(speed) {
    const video = getVideoElement();
    if (!video) return false;
    
    // Clamp speed between min and max
    speed = Math.max(minSpeed, Math.min(maxSpeed, speed));
    video.playbackRate = speed;
    
    // Show speed notification
    showSpeedNotification(speed);
    
    return speed;
  }

  // Show speed notification overlay
  function showSpeedNotification(speed) {
    // Remove existing notification
    const existing = document.getElementById('speed-notification');
    if (existing) {
      existing.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.id = 'speed-notification';
    notification.innerHTML = `
      <div class="speed-notification-content">
        <span class="speed-icon">⚡</span>
        <span class="speed-text">${speed.toFixed(2)}x</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-hide after 2 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 2000);
  }

  // Increase speed
  function increaseSpeed() {
    const currentSpeed = getCurrentSpeed();
    const newSpeed = Math.min(maxSpeed, currentSpeed + speedStep);
    return setPlaybackSpeed(newSpeed);
  }

  // Decrease speed
  function decreaseSpeed() {
    const currentSpeed = getCurrentSpeed();
    const newSpeed = Math.max(minSpeed, currentSpeed - speedStep);
    return setPlaybackSpeed(newSpeed);
  }

  // Reset speed to 1.0
  function resetSpeed() {
    return setPlaybackSpeed(1.0);
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', function(e) {
    // Only work when not typing in input fields
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return;
    }

    if (e.shiftKey) {
      switch(e.key) {
        case '>':
        case '.':
          e.preventDefault();
          increaseSpeed();
          break;
        case '<':
        case ',':
          e.preventDefault();
          decreaseSpeed();
          break;
        case 'R':
        case 'r':
          e.preventDefault();
          resetSpeed();
          break;
      }
    }
  });

  // Message listener for popup communication
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch(request.action) {
      case 'getSpeed':
        sendResponse({speed: getCurrentSpeed()});
        break;
      case 'setSpeed':
        if (request.maxSpeed) {
          maxSpeed = request.maxSpeed;
        }
        const newSpeed = setPlaybackSpeed(request.speed);
        sendResponse({speed: newSpeed});
        break;
      case 'increase':
        if (request.maxSpeed) {
          maxSpeed = request.maxSpeed;
        }
        const increasedSpeed = increaseSpeed();
        sendResponse({speed: increasedSpeed});
        break;
      case 'decrease':
        const decreasedSpeed = decreaseSpeed();
        sendResponse({speed: decreasedSpeed});
        break;
      case 'reset':
        const resetedSpeed = resetSpeed();
        sendResponse({speed: resetedSpeed});
        break;
    }
  });

  // Add floating speed control widget
  function createSpeedWidget() {
    if (document.getElementById('youtube-speed-widget')) {
      return; // Already exists
    }

    const widget = document.createElement('div');
    widget.id = 'youtube-speed-widget';
    widget.innerHTML = `
      <div class="speed-widget-content">
        <div class="speed-display">${getCurrentSpeed().toFixed(2)}x</div>
        <div class="speed-controls">
          <button class="speed-btn" id="speed-decrease">-</button>
          <button class="speed-btn" id="speed-increase">+</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(widget);

    // Widget event listeners
    document.getElementById('speed-decrease').addEventListener('click', function() {
      const newSpeed = decreaseSpeed();
      updateWidgetDisplay(newSpeed);
    });

    document.getElementById('speed-increase').addEventListener('click', function() {
      const newSpeed = increaseSpeed();
      updateWidgetDisplay(newSpeed);
    });

    // Double-click to reset
    widget.addEventListener('dblclick', function() {
      const newSpeed = resetSpeed();
      updateWidgetDisplay(newSpeed);
    });

    // Make widget draggable
    makeDraggable(widget);
  }

  function updateWidgetDisplay(speed) {
    const display = document.querySelector('#youtube-speed-widget .speed-display');
    if (display) {
      display.textContent = speed.toFixed(2) + 'x';
    }
  }

  function makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
    element.onmousedown = dragMouseDown;
    
    function dragMouseDown(e) {
      e = e || window.event;
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
    }
    
    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      element.style.top = (element.offsetTop - pos2) + "px";
      element.style.left = (element.offsetLeft - pos1) + "px";
    }
    
    function closeDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }

  // Initialize widget when page loads
  function init() {
    if (window.location.pathname.includes('/watch')) {
      setTimeout(createSpeedWidget, 2000); // Wait for page to load
    }
  }

  // Listen for navigation changes (YouTube is a SPA)
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      if (url.includes('/watch')) {
        setTimeout(createSpeedWidget, 2000);
      }
    }
  }).observe(document, {subtree: true, childList: true});

  // Initialize
  init();
})();