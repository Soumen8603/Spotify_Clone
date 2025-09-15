console.log("Lets Write javascript");
let currentSong = new Audio();
let songs;
let currFolder;

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const totalSeconds = Math.floor(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function getFileNameFromUrl(u) {
  try { u = decodeURIComponent(u); } catch (e) {}
  u = u.replace(/\\/g, "/");
  const parts = u.split("/");
  return parts[parts.length - 1];
}

async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`/${folder}/info.json`);
  let response = await a.json();
  songs = response.songs;

  const songUL = document.querySelector(".songList ul");
  songUL.innerHTML = "";
  for (const song of songs) {
    if (!song) continue;
    songUL.innerHTML += `<li>
      <img class="invert" src="img/music.svg" alt="">
      <div class="info">
        <div>${song.name.replaceAll("%20", " ").replace(".mp3", "")}</div>
        <div>${song.artist}</div>
      </div>
      <div class="playnow">
        <span>Play Now</span>
        <img class="invert" src="img/play.svg" alt="">
      </div>
    </li>`;
  }

  Array.from(document.querySelectorAll(".songList li")).forEach((li) => {
    li.addEventListener("click", () => {
      const songTitle = li.querySelector(".info").firstElementChild.textContent.trim();
      const songToPlay = songs.find(s => s.name.toLowerCase().includes(songTitle.toLowerCase()));
      if (songToPlay) {
        playMusic(songToPlay.name);
      }
    });
  });
  return songs;
}

const playMusic = (track, pause = false) => {
  currentSong.src = `/${currFolder}/` + track;
  
  // Find song object to display info
  const songInfo = songs.find(s => s.name === track);
  if(songInfo){
    document.querySelector(".songinfo").innerHTML = `${songInfo.name.replace(".mp3","")} - ${songInfo.artist}`;
  }

  if (pause) {
    currentSong.pause();
    if (window.play) window.play.src = "img/play.svg";
  } else {
    currentSong.play();
    if (window.play) window.play.src = "img/pause.svg";
  }
  document.querySelector(".songtime").textContent = "00:00 / 00:00";
};

async function displayAlbums() {
  let a = await fetch(`/songs/albums.json`);
  let albums = await a.json();
  const cardContainer = document.querySelector(".cardContainer");
  cardContainer.innerHTML = "";

  for (const album of albums) {
    cardContainer.innerHTML += `
      <div data-folder="${album.folder}" class="card">
        <div class="play">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5" stroke-linejoin="round" />
          </svg>
        </div>
        <img src="/songs/${album.folder}/cover.jpg" alt="">
        <h2>${album.title}</h2>
        <p>${album.description}</p>
      </div>
    `;
  }

  Array.from(document.getElementsByClassName("card")).forEach((card) => {
    card.addEventListener("click", async (evt) => {
      const folder = evt.currentTarget.dataset.folder;
      if (folder) {
        await getSongs(`songs/${folder}`);
        if (songs.length > 0) {
          playMusic(songs[0].name);
        }
      }
    });
  });
}

async function main() {
  const playBtn = document.getElementById("play");
  const previousBtn = document.getElementById("previous");
  const nextBtn = document.getElementById("next");
  window.play = playBtn;

  // Load initial playlist and albums
  await getSongs("songs/Favourites"); // You can change the default playlist here
  if (songs.length > 0) {
    // UPDATED: Pass the song name (songs[0].name)
    playMusic(songs[0].name, true); 
  }
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

  // UPDATED: Helper to get current song index from the array of objects
  function getCurrentIndex() {
    const currentName = getFileNameFromUrl(currentSong.src);
    return songs.findIndex(song => song.name === currentName);
  }

  // Previous button logic
  if (previousBtn) {
    previousBtn.addEventListener("click", () => {
      let index = getCurrentIndex();
      if (index !== -1) {
        const prevIdx = index - 1 >= 0 ? index - 1 : songs.length - 1;
        // UPDATED: Pass the song name from the object (songs[prevIdx].name)
        playMusic(songs[prevIdx].name);
      }
    });
  }

  // Next button logic
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      let index = getCurrentIndex();
      if (index !== -1) {
        const nextIdx = index + 1 < songs.length ? index + 1 : 0;
        // UPDATED: Pass the song name from the object (songs[nextIdx].name)
        playMusic(songs[nextIdx].name);
      }
    });
  }

  // Progress/time update
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").textContent = `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`;
    document.querySelector(".circle").style.left = (currentSong.currentTime / (currentSong.duration || 1)) * 100 + "%";
  });
  
  // Auto-play next song when current one ends
  currentSong.addEventListener("ended", () => {
    let index = getCurrentIndex();
    if (index !== -1) {
        const nextIdx = index + 1 < songs.length ? index + 1 : 0;
        playMusic(songs[nextIdx].name);
    }
  });


  // Seekbar control
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    const percent = (e.offsetX / e.target.getBoundingClientRect().width);
    document.querySelector(".circle").style.left = percent * 100 + "%";
    currentSong.currentTime = (currentSong.duration || 0) * percent;
  });

  // UI toggles for mobile
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  // Volume control
  document.querySelector(".range input").addEventListener("change", (e) => {
    currentSong.volume = parseInt(e.target.value) / 100;
  });
  
  // Mute button
  document.querySelector(".volume>img").addEventListener("click", e => {
    if (e.target.src.includes("img/volume.svg")) {
      e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg");
      currentSong.volume = 0;
      document.querySelector(".range input").value = 0;
    } else {
      e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg");
      currentSong.volume = 0.5; // Restore to a default volume
      document.querySelector(".range input").value = 50;
    }
  });
}

main();