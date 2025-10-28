// Default settings
const defaultSettings = {
  ui: {
    theme: 'gradient-purple',
    showStats: true,
    showLastCleaned: true,
    animationsEnabled: true
  },
  trackingEnabled: true, // Global toggle for all tracking
  sites: {
    'google.com': {
      enabled: true,
      keepParams: ['q', 'tbm', 'tbs', 'start', 'num', 'hl', 'gl'],
    },
    'bing.com': {
      enabled: true,
      keepParams: ['q'],
    },
    'duckduckgo.com': {
      enabled: true,
      keepParams: ['q'],
    },
    'facebook.com': {
        enabled: true,
        keepParams: [],
    },
    'twitter.com': {
        enabled: true,
        keepParams: [],
    }
  }
};

let settings = JSON.parse(JSON.stringify(defaultSettings));
let stats = {};

function getInitialStats() {
    const initialStats = {};
    for (const site in settings.sites) {
        initialStats[site] = {
            totalCleaned: 0,
            paramsRemoved: 0,
            lastCleaned: null
        };
    }
    return initialStats;
}
stats = getInitialStats();


// Load settings and stats from storage
chrome.storage.local.get(['settings', 'stats'], (result) => {
  if (result.settings) {
    settings = { ...defaultSettings, ...result.settings };
    settings.sites = { ...defaultSettings.sites, ...(result.settings.sites || {}) };
  }
  if (result.stats) {
    stats = result.stats;
  }
  // Ensure stats object has keys for all configured sites
  for (const site in settings.sites) {
    if (!stats[site]) {
      stats[site] = {
        totalCleaned: 0,
        paramsRemoved: 0,
        lastCleaned: null
      };
    }
  }
});

// Function to clean URL
function cleanURL(url) {
  if (!settings.trackingEnabled) return null;

  try {
    const urlObj = new URL(url);
    const matchingSiteKey = Object.keys(settings.sites).find(siteKey => urlObj.hostname.includes(siteKey));

    if (!matchingSiteKey) {
      return null;
    }

    const siteSettings = settings.sites[matchingSiteKey];
    if (!siteSettings || !siteSettings.enabled) {
      return null;
    }

    let removedCount = 0;
    const allParams = Array.from(urlObj.searchParams.keys());

    allParams.forEach(param => {
      if (!siteSettings.keepParams.includes(param)) {
        urlObj.searchParams.delete(param);
        removedCount++;
      }
    });

    if (removedCount > 0) {
      const siteStats = stats[matchingSiteKey];
      siteStats.totalCleaned++;
      siteStats.paramsRemoved += removedCount;
      siteStats.lastCleaned = new Date().toISOString();

      chrome.storage.local.set({ stats });

      return urlObj.toString();
    }

    return null;
  } catch (e) {
    console.error('Error cleaning URL:', e);
    return null;
  }
}

// Listen for navigation events
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (details.frameId !== 0) return; // Only main frame

  const cleanedURL = cleanURL(details.url);

  if (cleanedURL && cleanedURL !== details.url) {
    chrome.tabs.update(details.tabId, { url: cleanedURL });
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getStats') {
    sendResponse(stats);
  } else if (request.action === 'resetStats') {
    if (request.site && stats[request.site]) {
        stats[request.site] = {
            totalCleaned: 0,
            paramsRemoved: 0,
            lastCleaned: null
        };
    } else {
        stats = getInitialStats();
    }
    chrome.storage.local.set({ stats });
    sendResponse(stats);
  } else if (request.action === 'getSettings') {
    sendResponse(settings);
  } else if (request.action === 'updateSettings') {
    settings = { ...defaultSettings, ...request.settings };
    chrome.storage.local.set({ settings });
    sendResponse({ success: true, settings });
  } else if (request.action === 'resetSettings') {
    settings = JSON.parse(JSON.stringify(defaultSettings));
    chrome.storage.local.set({ settings });
    sendResponse({ success: true, settings });
  } else if (request.action === 'exportData') {
    sendResponse({
      settings,
      stats,
      exportDate: new Date().toISOString(),
      version: '1.0'
    });
  } else if (request.action === 'importData') {
    if (request.data.settings) {
      settings = { ...defaultSettings, ...request.data.settings };
      chrome.storage.local.set({ settings });
    }
    if (request.data.stats) {
      stats = request.data.stats;
      chrome.storage.local.set({ stats });
    }
    sendResponse({ success: true, settings, stats });
  }
  return true;
});