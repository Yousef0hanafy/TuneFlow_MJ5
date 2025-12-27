let progress = document.getElementById("progress"),
    song = document.getElementById("song"),
    ctrlIcon = document.getElementById("ctrlIcon"),
    ctrlBtn = document.querySelector(".controls div:nth-child(3)");
let currentTimeEl = document.getElementById("currentTime"),
    durationEl = document.getElementById("duration");
let repeatBtn = document.getElementById("repeatBtn"),
    shuffleBtn = document.getElementById("shuffleBtn"),
    isRepeat = false,
    isShuffle = false;
let volumeSlider = document.getElementById("volumeSlider"),
    volumeIcon = document.getElementById("volumeIcon");
let lastVolume = song.volume;
let currentIndex = 0; // current song
let playlist = []; // fill from API or local
let prevSongBtn = document.getElementById("prevSong");
let nextSongBtn = document.getElementById("nextSong");

const barsIcon = document.querySelector(".fa-bars");
const playlistMenu = document.getElementById("playlistMenu");
const playlistList = document.getElementById("playlistList");

song.addEventListener("loadedmetadata", () =>{
    progress.max = song.duration;
    progress.value = song.currentTime;
    durationEl.textContent = formatTime(song.duration);
});

function playPause(){
    if(ctrlIcon.classList.contains("fa-pause")){ //this mean the song is currently playing
        song.pause(); //stops the audio
        ctrlIcon.classList.remove("fa-pause");
        ctrlIcon.classList.add("fa-play");
    }else{
        song.play();
        ctrlIcon.classList.add("fa-pause");
        ctrlIcon.classList.remove("fa-play");
    }
}
ctrlBtn.addEventListener("click", playPause)

function formatTime(time){
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? "0" : ""}${sec}`
}

song.addEventListener("timeupdate", () => {
    progress.value = song.currentTime;
    currentTimeEl.textContent = formatTime(song.currentTime);
});

progress.addEventListener("change", () =>{
    song.play();
    song.currentTime = progress.value;
    ctrlIcon.classList.add("fa-pause");
    ctrlIcon.classList.remove("fa-play");
});

// TO ADD THE SHUFFLE AND REPEAT BUTTONS
repeatBtn.addEventListener("click", ()=> {
    isRepeat = !isRepeat;
    song.loop = isRepeat
    repeatBtn.classList.toggle("active", isRepeat)
});
shuffleBtn.addEventListener("click", () => {
    isShuffle = !isShuffle;
    shuffleBtn.classList.toggle("active", isShuffle);
});

//To ADD THE Volume Control
song.volume = volumeSlider.value;
volumeSlider.addEventListener("input", () => {
    song.volume = volumeSlider.value;
    if(song.volume === 0){
        volumeIcon.className = "fa-solid fa-volume-xmark";
    }else if (song.volume < 0.5) {
        volumeIcon.className = "fa-solid fa-volume-low";
    }else {
        volumeIcon.className = "fa-solid fa-volume-high";
    }
})
// When I Click the Mute Icon 
volumeIcon.addEventListener("click", () => {
    if(song.volume > 0){ 
        // Mute
        lastVolume = song.volume;   // remember current volume
        song.volume = 0;
        volumeSlider.value = 0;
        volumeIcon.className = "fa-solid fa-volume-xmark";
    } else { 
        // Unmute
        song.volume = lastVolume;   // restore previous volume
        volumeSlider.value = lastVolume;
        if(lastVolume < 0.5){
            volumeIcon.className = "fa-solid fa-volume-low";
        } else {
            volumeIcon.className = "fa-solid fa-volume-high";
        }
    }
});

// API From Deezer 
fetch("https://cors-anywhere.herokuapp.com/https://api.deezer.com/playlist/908622995")
    .then(res => res.json())
    .then(data => {
        playlist = data.tracks.data.map(track => ({
            title: track.title,
            artist: track.artist.name,
            src: track.preview,   // 30s mp3 preview
            cover: track.album.cover
        }));
        loadSong(0); // play first song
        renderPlaylist();
    });

function loadSong(index) {
    const songData = playlist[index];
    song.src = songData.src;
    document.querySelector(".song-name").textContent = songData.title;
    document.querySelector(".artist-name").textContent = songData.artist;
    document.querySelector(".song-img").src = songData.cover;
    song.play();
}

function nextSong() {
    if (isShuffle) {
        let nextIndex;
        do {
            nextIndex = Math.floor(Math.random() * playlist.length);
        } while (nextIndex === currentIndex && playlist.length > 1);
        currentIndex = nextIndex;
    } else {
        currentIndex = (currentIndex + 1) % playlist.length;
    }
    loadSong(currentIndex);
}

function prevSong() {
    if (isShuffle) {
        let prevIndex;
        do {
            prevIndex = Math.floor(Math.random() * playlist.length);
        } while (prevIndex === currentIndex && playlist.length > 1);
        currentIndex = prevIndex;
    } else {
        currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    }
    loadSong(currentIndex);
}
prevSongBtn.addEventListener("click", prevSong);
nextSongBtn.addEventListener("click", nextSong);

song.addEventListener("play", () => {
    ctrlIcon.classList.replace("fa-play", "fa-pause");
});

// Sync icon when song is paused
song.addEventListener("pause", () => {
    ctrlIcon.classList.replace("fa-pause", "fa-play");
});

song.addEventListener("ended", () => {
    if(isRepeat){
        song.play();
    }else {
        nextSong();
    }
});

// TO ADD The Menu Bar Playlist
// Toggle playlist menu visibility
barsIcon.addEventListener("click", () => {
    playlistMenu.style.display = playlistMenu.style.display === "block" ? "none" : "block";
});

function renderPlaylist() {
    playlistList.innerHTML = ""; // clear
    playlist.forEach((songItem, index) => {
        const li = document.createElement("li");
        li.textContent = `${songItem.title} - ${songItem.artist}`;
        li.addEventListener("click", () => {
            currentIndex = index;
            loadSong(currentIndex);
            playlistMenu.style.display = "none"; // hide menu after selecting
        });
        playlistList.appendChild(li);
    });
}

// Call after playlist is ready
renderPlaylist();