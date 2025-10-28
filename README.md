# 🛡️ Google Tracker Remover - Complete Guide

## 📦 Installation

1. **Create Extension Folder**
   ```
   tracker-remover/
   ├── manifest.json
   ├── background.js
   ├── popup.html
   ├── popup.js
   ├── icon16.png
   ├── icon48.png
   └── icon128.png
   ```

2. **Add Icons** (Optional but recommended)
   - Create simple PNG icons or use any existing icons
   - Name them: `icon16.png`, `icon48.png`, `icon128.png`
   - Or download free icons from [Icons8](https://icons8.com) or [Flaticon](https://flaticon.com)

3. **Load Extension**
   - Open Chrome and go to `chrome://extensions/`
   - Enable **Developer mode** (toggle in top-right)
   - Click **Load unpacked**
   - Select your `tracker-remover` folder
   - Extension is now active! 🎉

## 🎯 Features

### 📊 Statistics Tab
- **Real-time tracking** of cleaned URLs
- **Parameter count** showing total removed
- **Last cleaned** timestamp with smart formatting
- **Active/Inactive status** indicator

### ⚙️ Settings Tab
- **Tracking Toggle**: Enable/disable protection
- **4 Beautiful Themes**: Purple, Blue, Sunset, Dark
- **Custom Parameters**: Add/remove parameters to keep
- **Visual Chips**: Easy parameter management
- **Save & Reset**: Instant configuration updates

### 💾 Data Tab
- **Export Settings**: Download JSON backup
- **Import Settings**: Restore from JSON file
- **Live Preview**: See your configuration
- **Copy to Clipboard**: Quick JSON copy

## 📝 JSON Configuration Format

```json
{
  "settings": {
    "ui": {
      "theme": "gradient-purple",
      "showStats": true,
      "showLastCleaned": true,
      "animationsEnabled": true
    },
    "tracking": {
      "enabled": true,
      "keepParams": [
        "q",      // Search query
        "tbm",    // Search type (images, news)
        "tbs",    // Time-based filters
        "start",  // Pagination
        "num",    // Results per page
        "hl",     // Language
        "gl"      // Geographic location
      ],
      "removeParams": [
        "aqs", "sourceid", "ie", "oe", "gs_lcp",
        "sclient", "client", "source", "uact",
        "ved", "sa", "ei", "bih", "biw", "dpr",
        "ech", "psi", "sxsrf", "oq", "gs_lcrp"
      ]
    }
  },
  "stats": {
    "totalCleaned": 150,
    "paramsRemoved": 1250,
    "lastCleaned": "2025-10-28T12:30:00.000Z"
  },
  "exportDate": "2025-10-28T14:00:00.000Z",
  "version": "1.0"
}
```

## 🎨 Available Themes

### 💜 Purple Gradient (Default)
```json
"theme": "gradient-purple"
```
Beautiful purple to violet gradient

### 💙 Blue Ocean
```json
"theme": "gradient-blue"
```
Calming blue to teal gradient

### 🌅 Sunset Rainbow
```json
"theme": "gradient-sunset"
```
Vibrant pink to blue to green gradient

### 🌙 Dark Mode
```json
"theme": "dark"
```
Sleek dark slate gradient

## 🔧 Customization Guide

### Adding Custom Parameters to Keep

**Method 1: Using UI**
1. Go to Settings tab
2. Type parameter name in input field
3. Click "Add" button
4. Click "Save Settings"

**Method 2: Using JSON**
1. Go to Data tab
2. Export current settings
3. Edit `keepParams` array
4. Import modified JSON

Example:
```json
"keepParams": [
  "q",
  "tbm",
  "custom_param",  // Your custom parameter
  "another_param"
]
```

### Removing Parameters

**Using UI:**
1. Go to Settings tab
2. Click "×" on any parameter chip
3. Click "Save Settings"

**Using JSON:**
Remove the parameter from the `keepParams` array

### Changing Theme Programmatically

```json
"ui": {
  "theme": "gradient-sunset"  // Change this value
}
```

## 📤 Export/Import Workflows

### Backup Your Settings
1. Open extension popup
2. Go to **Data** tab
3. Click **📥 Export**
4. Save JSON file to safe location

### Share Configuration
1. Export your settings
2. Share JSON file with others
3. They import it to get same settings

### Restore Settings
1. Go to **Data** tab
2. Click **📤 Import**
3. Select your JSON backup file
4. Settings + stats restored instantly

### Transfer Between Devices
1. Export from Device A
2. Email/cloud sync the JSON file
3. Import on Device B
4. Identical configuration applied

## 🧪 Testing the Extension

1. **Test Tracking Removal:**
   - Search anything on Google
   - Check URL - should only have `?q=your-search`
   - Open popup - stats should increment

2. **Test Settings:**
   - Toggle tracking off
   - Search on Google
   - URL should keep all parameters
   - Toggle back on to re-enable

3. **Test Export/Import:**
   - Export settings
   - Change some settings
   - Import the file
   - Original settings should restore

## 🐛 Troubleshooting

### Extension Not Working?
- Check if enabled in `chrome://extensions/`
- Verify "Developer mode" is ON
- Try reloading the extension

### Stats Not Updating?
- Refresh the popup
- Check if tracking toggle is ON
- Make sure you're on google.com/search

### Import Failed?
- Verify JSON syntax is valid
- Check file extension is `.json`
- Ensure all required fields exist

### Theme Not Changing?
- Click "Save Settings" after selecting theme
- Refresh popup if needed

## 🔐 Privacy & Security

- ✅ All data stored locally (Chrome storage)
- ✅ No external servers contacted
- ✅ No data collection
- ✅ Works completely offline
- ✅ Open source - inspect the code

## 🚀 Advanced Usage

### Preset Configurations

**Minimal (Keep only search query):**
```json
"keepParams": ["q"]
```

**Standard (Default):**
```json
"keepParams": ["q", "tbm", "tbs", "start", "num", "hl", "gl"]
```

**Full (Keep more features):**
```json
"keepParams": ["q", "tbm", "tbs", "start", "num", "hl", "gl", "safe", "filter", "lr"]
```

### Automation Ideas

1. **Weekly Backups**: Export JSON weekly
2. **Team Sync**: Share config with team
3. **Multiple Profiles**: Different configs for work/personal
4. **Analytics**: Track your search patterns via stats

## 📚 Parameter Reference

### Essential Parameters (Recommended to Keep)

| Parameter | Purpose | Example |
|-----------|---------|---------|
| `q` | Search query | `q=chrome+extension` |
| `tbm` | Search type | `tbm=isch` (images) |
| `tbs` | Time filter | `tbs=qdr:d` (past day) |
| `start` | Pagination | `start=10` (page 2) |
| `num` | Results count | `num=50` |
| `hl` | Language | `hl=en` |
| `gl` | Region | `gl=us` |

### Tracking Parameters (Removed by Default)

| Parameter | Purpose |
|-----------|---------|
| `aqs` | AutoComplete Session |
| `sourceid` | Traffic source |
| `gs_lcp` | Google Search Parameters |
| `ved` | View Event Data |
| `ei` | Event Identifier |
| `oq` | Original Query |

## 🎓 Tips & Best Practices

1. **Regular Backups**: Export settings monthly
2. **Minimal Config**: Keep only essential parameters
3. **Monitor Stats**: Check regularly to see impact
4. **Share Configs**: Help others with your setup
5. **Test Changes**: Export before major changes

## 🆘 Support

- **Report Issues**: Check browser console for errors
- **Contribute**: Modify and enhance the code
- **Share**: Help others with your configurations

## 📄 License

Free to use, modify, and distribute. No restrictions!

---

**Version**: 1.0  
**Last Updated**: October 2025  
**Author**: Custom Chrome Extension