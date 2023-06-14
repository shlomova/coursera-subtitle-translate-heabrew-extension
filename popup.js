function close_page() {
  setTimeout(() => {
    window.close();
  }, 200);
}

function get_saved_language() {
  chrome.storage.sync.get(["lang"], function (result) {
    let lang = result.lang;
    if (lang) {
      document.getElementById("lang").value = lang;
    }
  });
}

document.addEventListener(
  "DOMContentLoaded",
  function () {
    get_saved_language();
    let checkButton = document.getElementById("translateBtn");
    checkButton.addEventListener(
      "click",
      function () {
        let lang = document.getElementById("lang").value;
        chrome.storage.sync.set({ lang: lang }, function () {
          console.log("Value is set to " + lang);
        });
        chrome.tabs.query(
          { active: true, currentWindow: true },
          function (tabs) {
            chrome.tabs.sendMessage(
              tabs[0].id,
              { method: "translate" },
              function (response) {
                if (response.method == "translated") {
                  close_page();
                }
              }
            );
          }
        );
      },
      false
    );
  },
  false
);
