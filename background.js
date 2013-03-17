// Initial setup.
var reopen_tab_id = null;
var creating_tab = false;


// Grab data from sync.
var options = {};
chrome.storage.sync.get(
  ["select_new_created", "close_second_tab", "auto_pin", "open_custom_page", "custom_page_url"], 
  update_options
);


// Functions.
function update_options(items) {
  for (key in items) {
    value = items[key];
    if (typeof(value) == 'object') {
      // from chrome.storage.onChanged event.
      value = value.newValue;
    } else {
      value = items[key];
    }
    switch (key) {
      case "select_new_created":
      case "close_second_tab":
      case "auto_pin":
      case "open_custom_page":
        options[key] = !!value;
        break;
      case "custom_page_url":
        options[key] = value || '';
        break;
      default:
        console.error('Unknown option ' + key + ': ' + value);
        break;
    }
  }
}

function keep_two() {
	chrome.windows.getAll({populate: true}, function(windows){
		var tab_count = 0;
		for (var i = 0; i < windows.length; i++) {
			var w = windows[i];
			tab_count += w.tabs.length;
		};
	
		if (tab_count == 1 && !creating_tab) {
			creating_tab = true;
			
			var create_options = {
				selected: options.select_new_created,
				pinned: (options.auto_pin && !w.tabs[0].pinned)
			};
			
			if (options.open_custom_page)
				create_options['url'] = options.custom_page_url;
				
			chrome.tabs.create(create_options, function(tab){
				// save this tab id in case of Close Tabs to The Right.
				// Chrome will close this tab if that is the case even it's just being
				// added.
				reopen_tab_id = tab.id;
				creating_tab = false;
			});
		}
	});
}

function close_second(tab) {
	chrome.tabs.getAllInWindow(tab.windowId, function(tabs){
		if (tabs.length < 3)
			return;
			
		for (var i = 0, closed = 0; i<tabs.length && closed < tabs.length - 2; i++) {
			if (tabs[i].id == tab.id) // Do not close new tab which is chrome://newtab
				continue;
			if (tabs[i].url == 'chrome://newtab/') {
				chrome.tabs.remove(tabs[i].id);
				closed++;
			}
		}
	});
}


// Kick it off to begin with.
keep_two();


// Listeners.
chrome.tabs.onRemoved.addListener(function(tabId) {
	if (reopen_tab_id == tabId) {
		setTimeout(keep_two, 100);
		return;
	}
	
	keep_two();
});

chrome.tabs.onCreated.addListener(function(tab) {
	if (tab.id != reopen_tab_id)
		reopen_tab_id = null;
	
	if (options.close_second_tab)
		close_second(tab);
});

chrome.storage.onChanged.addListener(function(changes, areaName) {
  update_options(changes);
}); 
