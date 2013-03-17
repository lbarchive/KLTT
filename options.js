// Saves options to chrome sync storage.
function saveOps() {
	chrome.storage.sync.set({
		"select_new_created": document.getElementById("select_new_created").checked,
		"close_second_tab": document.getElementById("close_second_tab").checked,
		"auto_pin": document.getElementById("auto_pin").checked,
		"open_custom_page": document.getElementById("open_custom_page").checked,
		"custom_page_url": document.getElementById("custom_page_url").value
	});

	// Update status to let user know options were saved.
	var status = document.getElementById("status");
	status.innerHTML = "Options Saved.";
	setTimeout(function() {
		status.innerHTML = "";
	}, 750);
}

// Restores select box state to saved value from chrome sync storage.
function loadOps() {
	chrome.storage.sync.get(
    ["select_new_created", "close_second_tab", "auto_pin", "open_custom_page", "custom_page_url"], 
		function(items) {
			document.getElementById("select_new_created").checked = !!items["select_new_created"];
			document.getElementById("close_second_tab").checked = !!items["close_second_tab"];
			document.getElementById("auto_pin").checked = !!items["auto_pin"];
			document.getElementById("open_custom_page").checked = !!items["open_custom_page"];
			document.getElementById("custom_page_url").value = items["custom_page_url"] || '';
	});
}

// Add the events to load/save from this page.
document.addEventListener('DOMContentLoaded', loadOps);
document.querySelector('#save').addEventListener('click', saveOps);
