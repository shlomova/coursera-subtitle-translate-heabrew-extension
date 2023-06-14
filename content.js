//author= Mücahit Sahin
//github=https://github.com/mucahit-sahin

async function openBilingual() {
  let tracks = document.getElementsByTagName("track");
  let en;
  //let tr;
  if (tracks.length) {
    for (let i = 0; i < tracks.length; i++) {
      if (tracks[i].srclang === "en") {
        en = tracks[i];
      }
    }

    if (en) {
      en.track.mode = "showing";

      //addSubtitleStyles("font-size: 16px; color: red;", en);

      await sleep(500);
      let cues = en.track.cues;

      // Виявлення моментів закінчення речення в англійському письмі.
      // ..... кінець речення. Нове речення
      // Тут вважається, що речення закінчується лише у випадках, коли після символу крапки стоїть пробіл.
      // 75.3, model.fit і т.д., щоб не сприймати крапку як кінець речення.
      let endSentence = [];
      for (let i = 0; i < cues.length; i++) {
        cues[i].fontSize = "5px";
        cues[i].size = "97";
        for (let j = 0; j < cues[i].text.length; j++) {
          if (cues[i].text[j] == "." && cues[i].text[j + 1] == undefined) {
            endSentence.push(i);
          }
        }
      }
      ///////////////////////

      let cuesTextList = getTexts(cues);

      getTranslation(cuesTextList, (translatedText) => {
        //console.log("getTranslation. translatedText:", translatedText);
        let translatedList = translatedText.split(" u~~~u");
        //console.log("getTranslation. translatedList:", translatedList);
        translatedList.splice(-1, 1);
        // console.log(
        //   "getTranslation. translatedList:.splice(-1, 1)",
        //   translatedList
        // );

        for (let i = 0; i < endSentence.length; i++) {
          if (i != 0) {
            for (let j = endSentence[i - 1] + 1; j <= endSentence[i]; j++) {
              cues[j].text = cues[j].text
                .split(" u~~~u")[0]
                .replace(/\n/g, " ");
              cues[j].text += "\n\n" + translatedList[i].trim();
              // console.log(translatedList[i]);
            }
          } else {
            for (let j = 0; j <= endSentence[i]; j++) {
              cues[j].text = cues[j].text
                .split(" u~~~u")[0]
                .replace(/\n/g, " ");
              cues[j].text += "\n\n" + translatedList[i].trim();
              // console.log(translatedList[i]);
            }
          }
        }
      });
    }
  }
}

String.prototype.replaceAt = function (index, replacement) {
  return (
    this.substring(0, index) +
    replacement +
    this.substring(index + replacement.length)
  );
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getTexts(cues) {
  let cuesTextList = "";
  for (let i = 0; i < cues.length; i++) {
    /*for(let j=0;j<cues[i].text.length;j++)
    {
      if(cues[i].text[j] == '.' && cues[i].text[j+1] == ' ')
      {
        cues[i].text = cues[i].text.replaceAt(j, ",")
      }
    }*/

    if (cues[i].text[cues[i].text.length - 1] == ".") {
      cues[i].text = cues[i].text.replaceAt(
        cues[i].text.length - 1,
        ". u~~~u "
      );
      //console.log(cues[i].text.replaceAt(cues[i].text.length-1, ". u~~~u "))
    }

    cuesTextList += cues[i].text.replace(/\n/g, " ") + " ";
  }
  return cuesTextList;
}

// Add styles dynamically to the subtitles
function addSubtitleStyles(styles, subtitleTrack) {
  const styleElement = document.createElement("style");
  //styleElement.textContent = `#${subtitleTrack.id}::cue { ${styles} }`;
  styleElement.textContent = `::cue { ${styles} }`;
  document.head.appendChild(styleElement);
}

async function add_subtitle_styles() {
  const video = document.getElementById("video_player_html5_api");
  const subtitleTrack = video?.textTracks[0]; // Assuming it's the first track
  console.log(" *** add_subtitle_styles", video, subtitleTrack);
  // Usage: Add font-size and color styles to the subtitles
  addSubtitleStyles("font-size: 16px; color: red;", subtitleTrack);
}

function getTranslation(words, callback) {
  chrome.storage.sync.get(["lang"], function (result) {
    var lang = result.lang;
    const xhr = new XMLHttpRequest();
    let url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${lang}&dt=t&q=${encodeURI(
      words
    )}`;
    xhr.open("GET", url, true);
    xhr.responseType = "text";
    xhr.onload = function () {
      if (xhr.readyState === xhr.DONE) {
        if (xhr.status === 200 || xhr.status === 304) {
          const translatedList = JSON.parse(xhr.responseText)[0];
          let translatedText = "";
          if (translatedList) {
            for (let i = 0; i < translatedList.length; i++) {
              translatedText += translatedList[i][0];
            }
            callback(translatedText);
          }
        }
      }
    };
    xhr.send();
  });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.method == "translate") {
    //add_subtitle_styles();
    openBilingual();
    sendResponse({ method: "translated" });
  }
});
