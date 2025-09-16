console.log("Lets Write javascript");
let currentSong = new Audio();
let songs;
let currFolder;
let allAlbums = [];
let allSongsMasterList = [];

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

async function fetchAllSongs() {
  let a = await fetch(`songs/albums.json`);
  let albums = await a.json();
  for (const album of albums) {
    let songFetch = await fetch(`songs/${album.folder}/info.json`);
    let albumSongs = await songFetch.json();
    albumSongs.songs.forEach((song) => {
      allSongsMasterList.push({ ...song, folder: `songs/${album.folder}` });
    });
  }
  console.log("Master song list created:", allSongsMasterList);
}

function displaySearchResults(results) {
  const songUL = document.querySelector(".songList ul");
  songUL.innerHTML = "";
  if (results.length === 0) {
    songUL.innerHTML = `<li><div class="info">No songs found.</div></li>`;
    return;
  }
  for (const song of results) {
    songUL.innerHTML += `
      <li data-folder="${song.folder}" data-track="${song.name}">
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
  Array.from(songUL.querySelectorAll("li")).forEach((li) => {
    if (!li.querySelector(".info").textContent.includes("No songs found")) {
      li.addEventListener("click", () => {
        const folder = li.dataset.folder;
        const track = li.dataset.track;
        getSongs(folder).then(() => {
          playMusic(track);
        });
      });
    }
  });
}

async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`${folder}/info.json`);
  let response = await a.json();
  songs = response.songs;
  const songUL = document.querySelector(".songList ul");
  songUL.innerHTML = "";
  for (const song of songs) {
    if (!song) continue;
    let isPlaying = currentSong.src.includes(song.name);
    songUL.innerHTML += `<li class="${isPlaying ? "playing" : ""}">
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
      const songToPlay = songs.find((s) => s.name.toLowerCase().includes(songTitle.toLowerCase()));
      if (songToPlay) {
        playMusic(songToPlay.name);
      }
    });
  });
  return songs;
}

const playMusic = (track, pause = false) => {
  currentSong.src = `${currFolder}/` + track;
  const songInfo = songs.find((s) => s.name === track);
  if (songInfo) {
    document.querySelector(".songinfo").innerHTML = `${songInfo.name.replace(".mp3", "")} - ${songInfo.artist}`;
  }
  if (pause) {
    currentSong.pause();
    if (window.play) window.play.src = "img/play.svg";
  } else {
    currentSong.play();
    if (window.play) window.play.src = "img/pause.svg";
  }
  document.querySelector(".songtime").textContent = "00:00 / 00:00";
  Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach((li) => {
    li.classList.remove("playing");
  });
  const trackNameOnly = track.replaceAll("%20", " ").replace(".mp3", "");
  const currentLi = Array.from(document.querySelector(".songList").getElementsByTagName("li")).find(
    (li) => li.querySelector(".info").firstElementChild.textContent.trim() === trackNameOnly
  );
  if (currentLi) {
    currentLi.classList.add("playing");
  }
};

async function displayAlbums() {
  const cardContainer = document.querySelector(".cardContainer");
  const loader = document.querySelector(".loader");
  loader.style.display = "block";
  cardContainer.innerHTML = "";
  let a = await fetch(`songs/albums.json`);
  allAlbums = await a.json();
  loader.style.display = "none";
  for (const album of allAlbums) {
    cardContainer.innerHTML += `
      <div data-folder="${album.folder}" class="card">
        <div class="play">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 20V4L19 12L5 20Z" stroke="#000000" fill="#000000" stroke-width="1.5" stroke-linejoin="round" />
          </svg>
        </div>
        <img src="songs/${album.folder}/cover.jpg" alt="">
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
        if (window.innerWidth < 1200) {
          document.querySelector(".left").style.left = "0";
        }
      }
    });
  });
}

function resetMobileSearchUI() {
    const searchInput = document.getElementById("searchInput");
    const header = document.querySelector(".header");
    const library = document.querySelector(".library");
    const homeSection = document.querySelector(".home");
    const searchContainer = document.querySelector(".headerSearch");
    const headerButtons = document.querySelector(".buttons");

    if (searchContainer.parentElement === library) {
        searchInput.value = ''; 
        header.insertBefore(searchContainer, headerButtons);
        homeSection.style.display = 'block';
    }
}

function checkAndResetSearch() {
    const isMobile = window.innerWidth < 1200;
    const searchContainer = document.querySelector('.headerSearch');
    const library = document.querySelector('.library');

    if (isMobile && searchContainer.parentElement === library) {
        resetMobileSearchUI();
        getSongs(currFolder);
    }
}

async function playNextSong() {
  checkAndResetSearch();
  const currentSongName = getFileNameFromUrl(currentSong.src);
  const currentIndexInPlaylist = songs.findIndex((song) => song.name === currentSongName);
  if (currentIndexInPlaylist === songs.length - 1) {
    const currentFolderOnly = currFolder.split("/")[1];
    const currentAlbumIndex = allAlbums.findIndex((album) => album.folder === currentFolderOnly);
    const nextAlbumIndex = (currentAlbumIndex + 1) % allAlbums.length;
    const nextAlbumFolder = allAlbums[nextAlbumIndex].folder;
    await getSongs(`songs/${nextAlbumFolder}`);
    if (songs.length > 0) {
      playMusic(songs[0].name);
    }
    if (window.innerWidth < 1200) {
      document.querySelector(".left").style.left = "0";
    }
  } else {
    playMusic(songs[currentIndexInPlaylist + 1].name);
  }
}

async function main() {
  const playBtn = document.getElementById("play");
  const previousBtn = document.getElementById("previous");
  const nextBtn = document.getElementById("next");
  const searchInput = document.getElementById("searchInput");
  const closeBtn = document.querySelector(".close");
  window.play = playBtn;

  await fetchAllSongs();
  await displayAlbums();
  await getSongs("songs/Favourites");
  if (songs.length > 0) {
    playMusic(songs[0].name, true);
  }

  if (searchInput) {
    const header = document.querySelector(".header");
    const library = document.querySelector(".library");
    const homeSection = document.querySelector(".home");
    const searchContainer = document.querySelector(".headerSearch");
    const headerButtons = document.querySelector(".buttons");

    searchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase().trim();
        const isMobile = window.innerWidth < 1200;

        if (isMobile) {
            if (query !== "") {
                if (searchContainer.parentElement !== library) {
                    library.prepend(searchContainer);
                    searchInput.focus();
                    homeSection.style.display = 'none';
                }
            } else {
                resetMobileSearchUI();
            }
        }

        if (query === "") {
            getSongs(currFolder);
            if(isMobile) {
                document.querySelector(".left").style.left = "-120%";
            }
            return;
        }

        if (isMobile) {
            document.querySelector(".left").style.left = "0";
        }

        const results = allSongsMasterList.filter(
            (song) =>
            song.name.toLowerCase().replaceAll("%20", " ").includes(query) ||
            song.artist.toLowerCase().includes(query)
        );

        displaySearchResults(results);
    });
  }

  if (playBtn) {
    playBtn.addEventListener("click", () => {
      checkAndResetSearch();
      if (currentSong.paused) {
        currentSong.play();
        playBtn.src = "img/pause.svg";
      } else {
        currentSong.pause();
        playBtn.src = "img/play.svg";
      }
    });
  }

  function getCurrentIndex() {
    const currentName = getFileNameFromUrl(currentSong.src);
    return songs.findIndex((song) => song.name === currentName);
  }

  if (previousBtn) {
    previousBtn.addEventListener("click", () => {
      checkAndResetSearch();
      let index = getCurrentIndex();
      if (index !== -1) {
        const prevIdx = index - 1 >= 0 ? index - 1 : songs.length - 1;
        document.querySelector(".songtime").textContent = "00:00 / 00:00";
        playMusic(songs[prevIdx].name);
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", playNextSong);
  }

  currentSong.addEventListener("timeupdate", () => {
    if (!document.body.classList.contains("dragging")) {
      document.querySelector(".songtime").textContent = `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`;
      document.querySelector(".circle").style.left = (currentSong.currentTime / (currentSong.duration || 1)) * 100 + "%";
    }
  });

  currentSong.addEventListener("ended", playNextSong);

  const seekbar = document.querySelector(".seekbar");
  seekbar.addEventListener("click", (e) => {
    if (e.target.id !== "seek-circle") {
      const percent = e.offsetX / e.target.getBoundingClientRect().width;
      document.querySelector(".circle").style.left = percent * 100 + "%";
      currentSong.currentTime = (currentSong.duration || 0) * percent;
    }
  });

  const circle = document.getElementById("seek-circle");
  let isDragging = false;
  function startDrag(e) {
    isDragging = true;
    document.body.classList.add("dragging");
    e.preventDefault();
  }
  function doDrag(e) {
    if (isDragging) {
      e.preventDefault();
      const clientX = e.clientX || e.touches[0].clientX;
      const rect = seekbar.getBoundingClientRect();
      let offsetX = clientX - rect.left;
      if (offsetX < 0) offsetX = 0;
      if (offsetX > rect.width) offsetX = rect.width;
      let percent = (offsetX / rect.width) * 100;
      circle.style.left = percent + "%";
      if (currentSong.duration) {
        const newTime = (currentSong.duration * percent) / 100;
        document.querySelector(".songtime").textContent = `${formatTime(newTime)}/${formatTime(currentSong.duration)}`;
      }
    }
  }
  function stopDrag(e) {
    if (isDragging) {
      isDragging = false;
      document.body.classList.remove("dragging");
      const clientX = e.clientX || e.changedTouches[0].clientX;
      const rect = seekbar.getBoundingClientRect();
      let offsetX = clientX - rect.left;
      if (offsetX < 0) offsetX = 0;
      if (offsetX > rect.width) offsetX = rect.width;
      let percent = (offsetX / rect.width) * 100;
      currentSong.currentTime = (currentSong.duration * percent) / 100;
    }
  }

  circle.addEventListener("mousedown", startDrag);
  window.addEventListener("mousemove", doDrag);
  window.addEventListener("mouseup", stopDrag);
  circle.addEventListener("touchstart", startDrag);
  window.addEventListener("touchmove", doDrag);
  window.addEventListener("touchend", stopDrag);

  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });
  
  if (closeBtn) {
      closeBtn.addEventListener("click", () => {
          resetMobileSearchUI();
          getSongs(currFolder);
          document.querySelector(".left").style.left = "-120%";
      });
  }

  document.querySelector(".range input").addEventListener("change", (e) => {
    currentSong.volume = parseInt(e.target.value) / 100;
  });

  document.querySelector(".volume>img").addEventListener("click", (e) => {
    if (e.target.src.includes("img/volume.svg")) {
      e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg");
      currentSong.volume = 0;
      document.querySelector(".range input").value = 0;
    } else {
      e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg");
      currentSong.volume = 0.5;
      document.querySelector(".range input").value = 50;
    }
  });
}

main();