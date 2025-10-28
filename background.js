// Default settings
const defaultSettings = {
  ui: {
    theme: 'gradient-purple',
    showStats: true,
    showLastCleaned: true,
    animationsEnabled: true
  },
  tracking: {
    enabled: true,
    keepParams: ['q', 'tbm', 'tbs', 'start', 'num', 'hl', 'gl'],
    removeParams: ['aqs', 'sourceid', 'ie', 'oe', 'gs_lcp', 'sclient',
      'client', 'source', 'uact', 'ved', 'sa', 'ei',
      'bih', 'biw', 'dpr', 'ech', 'psi', 'sxsrf',
      'oq', 'gs_lcrp', 'gs_ivs', 'gs_lp', 'gs_ssp']
  }
};

let settings = { ...defaultSettings };
let stats = {
  totalCleaned: 0,
  paramsRemoved: 0,
  lastCleaned: null
};

// Load settings and stats from storage
chrome.storage.local.get(['settings', 'stats'], (result) => {
  if (result.settings) {
    settings = { ...defaultSettings, ...result.settings };
  }
  if (result.stats) {
    stats = result.stats;
  }
});

// Function to clean URL
function cleanURL(url) {
  if (!settings.tracking.enabled) return null;
  
  try {
    const urlObj = new URL(url);
    let removedCount = 0;
    
    // Only process Google search URLs
    if (!urlObj.hostname.includes('google.com') || !urlObj.pathname.includes('/search')) {
      return null;
    }
    
    // Get all parameter names
    const allParams = Array.from(urlObj.searchParams.keys());
    
    // Remove parameters that are not in the keep list
    allParams.forEach(param => {
      if (!settings.tracking.keepParams.includes(param)) {
        urlObj.searchParams.delete(param);
        removedCount++;
      }
    });
    
    if (removedCount > 0) {
      stats.totalCleaned++;
      stats.paramsRemoved += removedCount;
      stats.lastCleaned = new Date().toISOString();
      
      // Save stats
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
}, {
  url: [{ hostContains: 'google.com' }]
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getStats') {
    sendResponse(stats);
  } else if (request.action === 'resetStats') {
    stats = {
      totalCleaned: 0,
      paramsRemoved: 0,
      lastCleaned: null
    };
    chrome.storage.local.set({ stats });
    sendResponse(stats);
  } else if (request.action === 'getSettings') {
    sendResponse(settings);
  } else if (request.action === 'updateSettings') {
    settings = { ...defaultSettings, ...request.settings };
    chrome.storage.local.set({ settings });
    sendResponse({ success: true, settings });
  } else if (request.action === 'resetSettings') {
    settings = { ...defaultSettings };
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