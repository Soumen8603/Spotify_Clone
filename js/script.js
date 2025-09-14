console.log("Lets Write javascript");
let currentSong = new Audio();
let songs;
let currFolder;
let cardContainer = document.querySelector(".cardContainer")
function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return "00:00";  // [web:44]
  const totalSeconds = Math.floor(seconds);  // [web:44]
  const minutes = Math.floor(totalSeconds / 60);  // [web:44]
  const secs = totalSeconds % 60;  // [web:44]
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;  // [web:44]
}

// Normalize to just filename from any URL/path
function getFileNameFromUrl(u) {
  try { u = decodeURIComponent(u); } catch (e) {}  // [web:89]
  u = u.replace(/\\/g, "/");  // normalize slashes [web:88]
  const parts = u.split("/");
  return parts[parts.length - 1];  // [web:88]
}

async function getSongs(folder) {
  currFolder = folder;
  
  const a = await fetch(`http://127.0.0.1:3000/${folder}/`);
  const response = await a.text();

  const div = document.createElement("div");
  div.innerHTML = response;  // parsing directory listing [web:81]
  const as = div.getElementsByTagName("a");

  songs = [];
  for (let i = 0; i < as.length; i++) {
    const element = as[i];
    if (element.href.endsWith(".mp3")) {
      const songName = getFileNameFromUrl(element.href);  // [web:88]
      if (songName) songs.push(songName);
      
    }
  }
 

  // Render sidebar playlist
  const songUL = document.querySelector(".songList ul");
  songUL.innerHTML = "";
  for (const song of songs) {
    if (!song) continue;
    songUL.innerHTML += `<li>
      <img class="invert" src="img/music.svg" alt="">
      <div class="info">
        <div>${song.replaceAll("%20", " ")}</div>
        <div>Harry</div>
      </div>
      <div class="playnow">
        <span>Play Now</span>
        <img class="invert" src="img/play.svg" alt="">
      </div>
    </li>`;
  }

  // Click to play specific song
  Array.from(document.querySelectorAll(".songList li")).forEach((li) => {
    li.addEventListener("click", () => {
      const name = li.querySelector(".info").firstElementChild.textContent.trim();
      playMusic(name);
    });
  });
  return songs;
}

const playMusic = (track, pause = false) => {
  // Always set a single-track title on the playbar
  const displayTitle = track.replaceAll("%20", " ");  // [web:62][web:82]
  document.querySelector(".songinfo").textContent = displayTitle;  // avoid array coercion [web:76][web:79]

  currentSong.src = `/${currFolder}/` + track;  // single track src [web:44]
  if(pause){
     currentSong.pause();
    // play is bound in main() to the play button element
    if (window.play) window.play.src = "img/play.svg";
    
    
  }
  else {
    currentSong.play();
    // play is bound in main() to the play button element
    if (window.play) window.play.src = "img/pause.svg";
    
  }
  document.querySelector(".songtime").textContent = "00:00 / 00:00";  // [web:44]
};

async function displayAlbums() {
 
  const a = await fetch(`/songs/`);
  const response = await a.text();
  const div = document.createElement("div");
  div.innerHTML = response;

  const anchors = Array.from(div.getElementsByTagName("a"));
  const cardContainer = document.querySelector(".cardContainer");
  cardContainer.innerHTML = "";

  for (const el of anchors) {
    const rawHref = el.getAttribute("href");
    if (!rawHref) continue;
    let decodedHref = decodeURIComponent(rawHref).replace(/\\/g, "/");  // normalize [web:88]
    // folder entries end with "/" and are not files
    if (decodedHref.endsWith("/") && !decodedHref.split("/").filter(Boolean).pop().includes(".")) {
      const parts = decodedHref.split("/").filter(Boolean);
      const folder = parts[parts.length - 1];
     

      try {
        const infoFetch = await fetch(`/songs/${folder}/info.json`);
        if (!infoFetch.ok) {
          
          continue;
        }
        const info = await infoFetch.json();
        cardContainer.innerHTML += `
          <div data-folder="${folder}" class="card">
            <div class="play">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5" stroke-linejoin="round" />
              </svg>
            </div>
            <img src="/songs/${folder}/cover.jpg" alt="">
            <h2>${info.title}</h2>
            <p>${info.description}</p>
          </div>
        `;
      } catch (err) {
        console.error(`Failed to get info.json or parse JSON for folder: ${folder}`, err);
      }
    }
  }

  // Click a card to load that playlist and start with first song
  Array.from(document.getElementsByClassName("card")).forEach((card) => {
    card.addEventListener("click", async (evt) => {
      const folder = evt.currentTarget.dataset.folder;
      
      if (folder) {
        await getSongs(`songs/${folder}`);
        if (songs.length > 0) playMusic(songs[0]);  // show only first track title [web:62][web:82]
      } else {
        console.error("Playlist card folder undefined");
      }
    });
  });
}

async function main() {
  const playBtn = document.getElementById("play");
  const previousBtn = document.getElementById("previous");
  const nextBtn = document.getElementById("next");
  // expose play for playMusic icon switching
  window.play = playBtn;

  // Initial load: only show first song on playbar
  await getSongs("songs/Arijit");
  if (songs.length > 0) playMusic(songs[0], true);  // ensures only first track title shows [web:62][web:82]
  await displayAlbums();

  // Play/Pause toggle
  if (playBtn) {
    playBtn.addEventListener("click", () => {
      if (currentSong.paused) {
        currentSong.play();
        playBtn.src = "img/pause.svg";
      } else {
        currentSong.pause();
        playBtn.src = "img/play.svg";
      }
    });
  }

  // Helper: get current index by normalizing currentSong.src
  function getCurrentIndex() {
    const currentName = getFileNameFromUrl(currentSong.src);  // [web:88]
    return songs.indexOf(currentName);
  }

  // Previous
  if (previousBtn) {
    previousBtn.addEventListener("click", () => {
      currentSong.pause();
      let index = getCurrentIndex();
      if (index === -1) index = 0;
      const prevIdx = index - 1 >= 0 ? index - 1 : songs.length - 1;
      playMusic(songs[prevIdx]);
    });
  }

  // Next
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      currentSong.pause();
      let index = getCurrentIndex();
      if (index === -1) index = -1; // so +1 becomes 0
      const nextIdx = index + 1 < songs.length ? index + 1 : 0;
      playMusic(songs[nextIdx]);
    });
  }

  // Progress/time
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").textContent =
      `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`;  // [web:44][web:76]
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / (currentSong.duration || 1)) * 100 + "%";  // [web:44]
  });

  // Seek
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    const percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;  // [web:44]
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration || 0) * percent / 100;  // [web:47]
  });

  // UI toggles
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  // Volume Range
  document.querySelector(".range input").addEventListener("change", (e) => {
    currentSong.volume = Math.min(1, Math.max(0, parseInt(e.target.value) / 100));  // [web:44]
  });

  //Add an event listener to mute the track
  document.querySelector(".volume>img").addEventListener("click",e=>{
   
    if(e.target.src.includes("img/volume.svg")){
      e.target.src = e.target.src.replace("img/volume.svg","img/mute.svg")
      currentSong.volume = 0;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
    }
    else{
      e.target.src = e.target.src.replace("img/mute.svg","img/volume.svg")
      currentSong.volume = .10;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 40;
    }
  })
}

main();
