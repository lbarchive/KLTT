// Initial setup.
var reopen_tab_id = null;
var creating_tab = false;


// Grab data from sync.
var select_new_created;
var close_second_tab;
var auto_pin;
var open_custom_page;
var custom_page_url;
chrome.storage.sync.get(["select_new_created", "close_second_tab", "auto_pin", "open_custom_page", "custom_page_url"], 
	function(items) {
		select_new_created = items['select_new_created'];
		close_second_tab = items['close_second_tab'];
		auto_pin = items['auto_pin'];
		open_custom_page = items['open_custom_page'];
		custom_page_url = items['custom_page_url'];
	}
);


// Functions.
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
				selected: select_new_created,
				pinned: (auto_pin && !w.tabs[0].pinned)
			};
			
			if (open_custom_page == 1)
				create_options['url'] = custom_page_url;
				
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
	
	// ...What?
	close_second_tab = (close_second_tab == 1);
	
	if (close_second_tab)
		close_second(tab);
});