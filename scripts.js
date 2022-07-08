const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const playerWrapper = $('.player-wrapper');

// Playlist elements
const playlist = $('.playlist');
const playlistWrapper = $('.playlist-wrapper');

// Song's info elements
const thumbnail = $('.thumbnail');
const title = $('.title');
const author = $('.author');
const audio = $('#audio');

// Control elements
const playPause = $('#play-pause');
const songFlow = $('#song-flow');
const volumeIcon = $('#volume-icon');
const volumeBar = $('.volume-bar');
const progressBar = $('.progress-bar');
const nextBtn = $('#next');
const prevBtn = $('#prev');
const openPlaylist = $('#open-playlist');
const closePlaylist = $('#close-playlist');

// Sound wave strokes
const strokes = `
   <span class="stroke"></span>
   <span class="stroke"></span>
   <span class="stroke"></span>
   <span class="stroke"></span>
   <span class="stroke"></span>
`
// Mouse holding state for progress and volume bar
let isHoldingProgress = false;
let isHoldingVolume = false;

const app = {
   // Current song index
   currentIndex: 0,

   // Control state
   songFlowStates: ['repeat','repeat_one','shuffle'],
   songFlowIndex: 0,

   // Volume state
   volumeState: 'volume_up',
   volumeOff: false,

   // Playlist is scrolled state
   isScrolled: true,

   // My playlist
   songs: [
      {
         title: 'Faded',
         author: 'Alan Walker',
         path: './music/song0.mp3',
         image: './image/image0.jpg'
      },
      {
         title: 'Believer',
         author: 'Imagine Dragons',
         path: './music/song1.mp3',
         image: './image/image1.jpg'
      },
      {
         title: 'Radioactive',
         author: 'Imagine Dragons',
         path: './music/song2.mp3',
         image: './image/image2.jpg'
      },
      {
         title: 'Spectre',
         author: 'Alan Walker',
         path: './music/song3.mp3',
         image: './image/image3.jpg'
      },
      {
         title: 'Basta Boi Remix',
         author: 'Alfons',
         path: './music/song4.mp3',
         image: './image/image4.jpg'
      },
      {
         title: 'Havana',
         author: 'Camila Cabello',
         path: './music/song5.mp3',
         image: './image/image5.jpg'
      },
      {
         title: 'Memories',
         author: 'Maroon 5',
         path: './music/song6.mp3',
         image: './image/image6.jpg'
      },
      {
         title: 'Bones',
         author: 'Imagine Dragons',
         path: './music/song7.mp3',
         image: './image/image7.jpg'
      },
      {
         title: 'Demons',
         author: 'Imagine Dragons',
         path: './music/song8.mp3',
         image: './image/image8.jpg'
      },
      {
         title: 'Natural',
         author: 'Imagine Dragons',
         path: './music/song9.mp3',
         image: './image/image9.jpg'
      },
      {
         title: 'Whatever it takes',
         author: 'Imagine Dragons',
         path: './music/song10.mp3',
         image: './image/image10.jpg'
      },
      {
         title: 'Enemy',
         author: 'Imagine Dragons',
         path: './music/song11.mp3',
         image: './image/image11.jpg'
      },
      {
         title: 'Sugar',
         author: 'Maroon 5',
         path: './music/song12.mp3',
         image: './image/image12.jpg'
      },
      {
         title: 'Wellerman',
         author: 'Nathen Evans',
         path: './music/song13.mp3',
         image: './image/image13.jpg'
      },
      {
         title: 'Masked Heroes',
         author: 'Vexento',
         path: './music/song14.mp3',
         image: './image/image14.jpg'
      },
      {
         title: 'Nevada',
         author: 'Vicetone',
         path: './music/song15.mp3',
         image: './image/image15.jpg'
      },
      {
         title: 'Warriors',
         author: 'Imagine Dragons',
         path: './music/song16.mp3',
         image: './image/image16.jpg'
      },
   ],

   // Setting timer format
   timerFormat(duration) {
      const rounded = Math.floor(duration);
      return `${Math.floor(rounded/60) >= 10 ? Math.floor(rounded/60) : '0' + Math.floor(rounded/60)}:${rounded%60 >= 10 ? rounded%60 : '0' + rounded%60}`;
   },

   // Function runs every time song change event happens
   setChangeSong(newIndex) {
      $$('.wave')[this.currentIndex].innerHTML = this.timerFormat($$('.duration-display')[this.currentIndex].duration);
      this.currentIndex = newIndex;
      $$('.wave')[this.currentIndex].innerHTML = strokes;
      this.renderPlayer();
      this.isScrolled = false;
      audio.play();
   },

   // Handle events function
   eventHandler() {
      const playListItems = $$('.playlist-item');

      // Change song every time a song is clicked
      playListItems.forEach((playListItem, index) => {
         playListItem.onclick = () => {
            this.setChangeSong(index);
         }
      })

      // Spinning animation of the thumbnail
      const thumbnailAnimation = thumbnail.animate([{
         transform: 'rotate(360deg)'
      }], {
         duration: 8000,
         iterations: Infinity
      })

      // Animation paused when initialized
      thumbnailAnimation.pause();

      // Updates song's duration when audio's metadata first update
      audio.onloadedmetadata = () => {
         $('#begin').innerText = this.timerFormat(audio.currentTime);
         $('#end').innerText = this.timerFormat(audio.duration);
      }

      // Updates current time and progress bar
      audio.ontimeupdate = () => {
         let progressBarWidth = (audio.currentTime/audio.duration)*100;
         $('#begin').innerText = this.timerFormat(audio.currentTime);
         $('.progress').style.width = `${progressBarWidth}%`;
      }

      // Volume change event
      audio.onvolumechange = () => {
         if(audio.muted) volumeIcon.innerHTML = 'volume_off';
         else volumeIcon.innerText = audio.volume >= 0.5 ? 'volume_up' : 
                                     audio.volume < 0.05 ? 'volume_mute' : 'volume_down';
         $('.volume').style.width = `${audio.volume*100}%`;
      }

      // Song's change flow every time a song is ended
      audio.onended = () => {
         if(this.songFlowIndex === 2) {
            // Making sure that the song is not repeated
            let newIndex;
            do {
               newIndex = Math.floor(Math.random() * this.songs.length);
            } while (newIndex === this.currentIndex);

            this.setChangeSong(newIndex);
         } else nextBtn.click();
      }

      // Play and pause event
      audio.onplay = () => {
         playPause.innerText = 'pause_circle';
         thumbnailAnimation.play();
      }
      audio.onpause = () => {
         playPause.innerText = 'play_circle';
         thumbnailAnimation.pause();
      }

      // Open playlist
      openPlaylist.onclick = () => {
         playlist.classList.add('active');

         if(!this.isScrolled) {
            setTimeout(() => {
               $$('.playlist-item')[this.currentIndex].scrollIntoView({
                  behavior: "smooth",
                  block: "center"
               });
            }, 200);

            this.isScrolled = true;
         }
      }

      // Clost playlist
      closePlaylist.onclick = () => playlist.classList.remove('active');

      // Skip to next or previous song
      nextBtn.onclick = () => {
         if(this.currentIndex === this.songs.length-1) this.setChangeSong(0);
         else this.setChangeSong(this.currentIndex + 1);
      }
      prevBtn.onclick = () => {
         if(this.currentIndex === 0) this.setChangeSong(this.songs.length-1);
         else this.setChangeSong(this.currentIndex - 1);
      }

      // Change the flow state
      songFlow.onclick = () => {
         this.songFlowIndex = this.songFlowIndex+1 > 2 ? 0 : this.songFlowIndex+1;
         songFlow.innerText = this.songFlowStates[this.songFlowIndex];
         if(this.songFlowIndex === 1) audio.loop = true;
         else audio.loop = false;
      }

      // Play pause button event
      playPause.onclick = () => {
         audio.paused ? audio.play() : audio.pause();
      }

      // Turn on and off the volume
      volumeIcon.onclick = () => {
         audio.muted = !audio.muted;
      }

      // ----------------DRAGGING ANIMATION ON PROGRESS AND VOLUME BAR----------------
      // Mouse down event
      volumeBar.onmousedown = (e) => {
         isHoldingVolume = true;
         audio.volume = e.offsetX/e.target.offsetWidth;
      }
      progressBar.onmousedown = (e) => {
         isHoldingProgress = true;
         audio.currentTime = (e.offsetX/e.target.offsetWidth)*audio.duration;
      }

      // Dragging event
      volumeBar.onmousemove = (e) => {
         if(isHoldingVolume) audio.volume = e.offsetX/e.target.offsetWidth;
      }
      progressBar.onmousemove = (e) => {
         if(isHoldingProgress) audio.currentTime = (e.offsetX/e.target.offsetWidth)*audio.duration;
      }

      // Mouse up event
      window.onmouseup = () => {
         isHoldingProgress = false;
         isHoldingVolume = false;
      }

      // Accessibility improvement with keydown events on space bar & arrow keys
      window.onkeydown = (e) => {
         switch (e.keyCode) {
            case 32:
               e.preventDefault();
               playPause.click();
               break;
            case 37:
               e.preventDefault();
               audio.currentTime-=5;
               break;
            case 38:
               e.preventDefault();
               audio.volume+0.05 < 1 ? audio.volume+=0.05 : audio.volume = 1;
               break;
            case 39:
               e.preventDefault();
               audio.currentTime+=5;
               break;
            case 40:
               e.preventDefault();
               audio.volume-0.05 > 0 ? audio.volume-=0.05 : audio.volume = 0;
               break;
         }
      }
   },

   // Render the song playlist
   renderPlaylist() {
      const htmls = this.songs.map(song => {
         return `
            <li class="playlist-item">
               <div class="playlist-thumb" style="background-image: url(${song.image})"></div>
               <div class="song-info">
                  <span class="playlist-title">${song.title}</span>
                  <span class="playlist-author">${song.author}</span>
               </div>
               <audio class="duration-display" preload="metadata" src=${song.path}></audio>
               <div class="wave"></div>
            </li>
         `
      }).join('');

      playlistWrapper.innerHTML = htmls;
      const durations = $$('.duration-display');
      const wave = $$('.wave');

      // Initialize isPlaying state and add song's duration at the end for every song in
      // the playlist
      durations.forEach((duration, index) => {
         duration.onloadedmetadata = () => {
            wave[index].innerHTML = index === this.currentIndex ? strokes : this.timerFormat(duration.duration);
         }
      })
   },

   // Render the player
   renderPlayer() {
      const currentSong = this.songs[this.currentIndex];
      thumbnail.style.backgroundImage = `url(${currentSong.image})`;
      title.innerText = currentSong.title;
      author.innerText = currentSong.author;
      audio.src = currentSong.path;
   },

   start() {
      this.renderPlayer();
      this.renderPlaylist();
      this.eventHandler();

      // Initialize the default volume
      audio.volume = 0.5;
   }
}

app.start();

/** P/S:
 * - audio.volume only works on desktop devices for some reasons
 */