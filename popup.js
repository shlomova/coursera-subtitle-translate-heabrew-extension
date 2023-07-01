function close_page() {
  setTimeout(() => {
    window.close();
  }, 200);
}

function get_saved_data() {
  chrome.storage.sync.get({ lang: "", fontsize: 75 }).then((result) => {
    let lang = result.lang;
    let fontsize = result.fontsize;
    if (lang) {
      document.getElementById("lang").value = lang;
    }
    if (fontsize) {
      document.getElementById("fontsize").value = fontsize;
    }
  });
}

document.addEventListener(
  "DOMContentLoaded",
  function () {
    get_saved_data();
    let checkButton = document.getElementById("translateBtn");
    checkButton.addEventListener(
      "click",
      function () {
        let lang = document.getElementById("lang").value;
        let fontsize = document.getElementById("fontsize").value;
        chrome.storage.sync.set({ lang: lang, fontsize: fontsize }).then(() => {
          console.log("Value is set to " + lang, fontsize);
        });
        chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
          chrome.tabs.sendMessage(tabs[0].id, { method: "translate" }, (response) => {
            if (response?.method && response.method == "translated") {
              close_page();
            }
          });
        });
      },
      false
    );
  },
  false
);
