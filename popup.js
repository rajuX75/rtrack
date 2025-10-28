let currentSettings = null;
let currentStats = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  setupEventListeners();
});

// Load settings and stats
function loadData() {
  chrome.runtime.sendMessage({ action: 'getSettings' }, (settings) => {
    currentSettings = settings;
    applyTheme(settings.ui.theme);
    updateSettingsUI();
    updateJsonPreview();
  });
  
  chrome.runtime.sendMessage({ action: 'getStats' }, (stats) => {
    currentStats = stats;
    updateStatsDisplay(stats);
  });
}

// Setup event listeners
function setupEventListeners() {
  // Tab switching
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      
      tab.classList.add('active');
      document.getElementById(`${tab.dataset.tab}-tab`).classList.add('active');
    });
  });
  
  // Theme selection
  document.querySelectorAll('.theme-option').forEach(option => {
    option.addEventListener('click', () => {
      const theme = option.dataset.theme;
      applyTheme(theme);
      currentSettings.ui.theme = theme;
      
      document.querySelectorAll('.theme-option').forEach(o => o.classList.remove('active'));
      option.classList.add('active');
    });
  });
  
  // Tracking toggle
  document.getElementById('trackingToggle').addEventListener('click', function() {
    this.classList.toggle('active');
    currentSettings.tracking.enabled = this.classList.contains('active');
    updateStatusDisplay();
  });
  
  // Add keep parameter
  document.getElementById('addKeepBtn').addEventListener('click', addKeepParam);
  document.getElementById('addKeepParam').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addKeepParam();
  });
  
  // Save settings
  document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
  
  // Reset settings
  document.getElementById('resetSettingsBtn').addEventListener('click', () => {
    if (confirm('Reset all settings to defaults?')) {
      chrome.runtime.sendMessage({ action: 'resetSettings' }, (response) => {
        currentSettings = response.settings;
        updateSettingsUI();
        applyTheme(currentSettings.ui.theme);
        updateJsonPreview();
        alert('Settings reset successfully!');
      });
    }
  });
  
  // Reset stats
  document.getElementById('resetStatsBtn').addEventListener('click', () => {
    if (confirm('Reset all statistics?')) {
      chrome.runtime.sendMessage({ action: 'resetStats' }, (stats) => {
        currentStats = stats;
        updateStatsDisplay(stats);
      });
    }
  });
  
  // Export data
  document.getElementById('exportBtn').addEventListener('click', exportData);
  
  // Import data
  document.getElementById('importBtn').addEventListener('click', () => {
    document.getElementById('importFile').click();
  });
  
  document.getElementById('importFile').addEventListener('change', importData);
  
  // Copy JSON
  document.getElementById('copyJsonBtn').addEventListener('click', () => {
    const text = document.getElementById('jsonPreview').value;
    navigator.clipboard.writeText(text).then(() => {
      const btn = document.getElementById('copyJsonBtn');
      const originalText = btn.textContent;
      btn.textContent = '✓ Copied!';
      setTimeout(() => btn.textContent = originalText, 2000);
    });
  });
}

// Apply theme
function applyTheme(theme) {
  document.body.className = `theme-${theme}`;
}

// Update stats display
function updateStatsDisplay(stats) {
  document.getElementById('totalCleaned').textContent = stats.totalCleaned;
  document.getElementById('paramsRemoved').textContent = stats.paramsRemoved;
  
  const lastCleanedEl = document.getElementById('lastCleaned');
  if (stats.lastCleaned) {
    const date = new Date(stats.lastCleaned);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    let timeText;
    if (diffMins < 1) {
      timeText = 'Just now';
    } else if (diffMins < 60) {
      timeText = `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    } else if (diffMins < 1440) {
      const hours = Math.floor(diffMins / 60);
      timeText = `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffMins / 1440);
      timeText = `${days} day${days > 1 ? 's' : ''} ago`;
    }
    
    lastCleanedEl.textContent = `Last cleaned: ${timeText}`;
  } else {
    lastCleanedEl.textContent = 'No tracking removed yet';
  }
}

// Update status display
function updateStatusDisplay() {
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');
  
  if (currentSettings.tracking.enabled) {
    statusDot.classList.remove('inactive');
    statusText.textContent = 'Active';
  } else {
    statusDot.classList.add('inactive');
    statusText.textContent = 'Inactive';
  }
}

// Update settings UI
function updateSettingsUI() {
  // Update tracking toggle
  const trackingToggle = document.getElementById('trackingToggle');
  if (currentSettings.tracking.enabled) {
    trackingToggle.classList.add('active');
  } else {
    trackingToggle.classList.remove('active');
  }
  
  // Update theme selection
  document.querySelectorAll('.theme-option').forEach(option => {
    if (option.dataset.theme === currentSettings.ui.theme) {
      option.classList.add('active');
    } else {
      option.classList.remove('active');
    }
  });
  
  // Update keep parameters chips
  updateKeepParamsChips();
  updateStatusDisplay();
}

// Update keep parameters chips
function updateKeepParamsChips() {
  const container = document.getElementById('keepParamsChips');
  container.innerHTML = '';
  
  currentSettings.tracking.keepParams.forEach(param => {
    const chip = document.createElement('div');
    chip.className = 'chip';
    chip.innerHTML = `
      <span>${param}</span>
      <span class="chip-remove" data-param="${param}">×</span>
    `;
    container.appendChild(chip);
  });
  
  // Add remove listeners
  container.querySelectorAll('.chip-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const param = btn.dataset.param;
      currentSettings.tracking.keepParams = currentSettings.tracking.keepParams.filter(p => p !== param);
      updateKeepParamsChips();
    });
  });
}

// Add keep parameter
function addKeepParam() {
  const input = document.getElementById('addKeepParam');
  const param = input.value.trim();
  
  if (param && !currentSettings.tracking.keepParams.includes(param)) {
    currentSettings.tracking.keepParams.push(param);
    updateKeepParamsChips();
    input.value = '';
  }
}

// Save settings
function saveSettings() {
  chrome.runtime.sendMessage({ 
    action: 'updateSettings', 
    settings: currentSettings 
  }, (response) => {
    if (response.success) {
      const btn = document.getElementById('saveSettingsBtn');
      const originalText = btn.textContent;
      btn.textContent = '✓ Saved!';
      setTimeout(() => btn.textContent = originalText, 2000);
      updateJsonPreview();
    }
  });
}

// Update JSON preview
function updateJsonPreview() {
  chrome.runtime.sendMessage({ action: 'exportData' }, (data) => {
    document.getElementById('jsonPreview').value = JSON.stringify(data, null, 2);
  });
}

// Export data
function exportData() {
  chrome.runtime.sendMessage({ action: 'exportData' }, (data) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tracker-remover-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

// Import data
function importData(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const data = JSON.parse(event.target.result);
      
      chrome.runtime.sendMessage({ 
        action: 'importData', 
        data: data 
      }, (response) => {
        if (response.success) {
          currentSettings = response.settings;
          currentStats = response.stats;
          updateSettingsUI();
          updateStatsDisplay(currentStats);
          applyTheme(currentSettings.ui.theme);
          updateJsonPreview();
          alert('Data imported successfully!');
        }
      });
    } catch (error) {
      alert('Error importing file: Invalid JSON format');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

// Refresh stats periodically
setInterval(() => {
  chrome.runtime.sendMessage({ action: 'getStats' }, (stats) => {
    currentStats = stats;
    updateStatsDisplay(stats);
  });
}, 1000);