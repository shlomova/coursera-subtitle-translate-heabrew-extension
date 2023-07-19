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

function some_error(target) {
  if (target) {
    target.style.background = "red";
    target.title = "Error. Are you sure this is the Coursera tab?";
  }
}

function ok_state(target) {
  if (target) {
    target.style.background = "blue";
    target.title = "All translated, closing now...";
  }
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
          chrome.tabs
            .sendMessage(tabs[0].id, { method: "translate" })
            .then((response) => {
              if (response?.method && response.method == "translated") {
                ok_state(checkButton);
                close_page();
              } else {
                console.log("Answer not from target page?");
                some_error(checkButton);
              }
            })
            .catch(() => {
              console.log("Not connected target page");
              some_error(checkButton);
            });
        });
      },
      false
    );
  },
  false
);
