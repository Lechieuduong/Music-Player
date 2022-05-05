/* 
        1. Render songs ✔
        2. Scroll top ✔
        3. Play / pause / seek ✔
        4. CD rotated ✔
        5. Next / prev ✔
        6. Random ✔
        7. Next/ Repeat when ended ✔
        8. Active song ✔
        9. Scroll active song into view ✔
        10. Play song when click ✔
        */
        const $ = document.querySelector.bind(document);
        const $$ = document.querySelectorAll.bind(document);

        const PLAYER_STORAGE_KEY = 'D9_PLAYER';

        const player = $('.player');
        const cd = $('.cd');
        const heading = $('header h2');
        const cdThumb = $('.cd-thumb');
        const audio = $('#audio');
        const playBtn = $('.btn-toggle-play');
        const progress = $('#progress');
        const nextBtn = $('.btn-next');
        const prevBtn = $('.btn-prev');
        const randomBtn = $('.btn-random');
        const repeatBtn = $('.btn-repeat');
        const playlist = $('.playlist');


        const app = {
          currentIndex: 0,
          isPlaying: false,
          isRandom: false,
          isRepeat: false,
          config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
          songs : [
          {
            name: 'Sài Gòn Hôm Nay Mưa',
            singer: 'JSOL ft. Hoàng Duyên「Cukak Remix」', 
            path: './assets/music/song1.mp3',
            image: './assets/img/song1.jpg'
          },
          {
            name: 'Forget Me Now',
            singer: 'Fishy ft. Trí Dũng「Cukak Remix」',
            path: './assets/music/song2.mp3',
            image: './assets/img/song2.jpg'
          },
          {
            name: 'Anh Sẽ Đón Em',
            singer: 'Nguyên ft. Trang「Cukak Remix 」',
            path: './assets/music/song3.mp3',
            image: './assets/img/song3.jpg'
          },
          {
            name: 'Thích Em Hơi Nhiều',
            singer: 'Wren Evans「Cukak Remix」',
            path: './assets/music/song4.mp3',
            image: './assets/img/song4.jpg'
          },
          {
            name: 'Tell Ur Mom II',
            singer: 'Winno ft. Heily「Cukak Remix」',
            path: './assets/music/song5.mp3',
            image: './assets/img/song5.jpg'
          },
          {
            name: 'Yêu Đừng Sợ Đau',
            singer: 'Ngô Lan Hương「Cukak Remix」',
            path: './assets/music/song6.mp3',
            image: './assets/img/song6.jpg'
          },
          {
            name: 'Có Hẹn Với Thanh Xuân',
            singer: 'Monstar「Cukak Remix」',
            path: './assets/music/song7.mp3',
            image: './assets/img/song7.jpg'
          },
          {
            name: 'Đường Tôi Chở Em Về',
            singer: 'Buitruonglinh「Cukak Remix」',
            path: './assets/music/song8.mp3',
            image: './assets/img/song8.jpg'
          }
        ],
          setConfig: function(key, value) {
            this.config[key] = value;
            localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
          },
          render: function() {
            const htmls = this.songs.map((song, index) => {
              return `
              <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                <div class="thumb" style="background-image: url('${song.image}')"></div>
                <div class="body">
                  <h3 class="title">${song.name}</h3>
                  <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                  <i class="fas fa-ellipsis-h"></i>
                </div>
              </div>`
            })
            playlist.innerHTML = htmls.join('');
          },
          defineProperties: function() {
            Object.defineProperty(this, 'currentSong', {
              get: function() {
                return this.songs[this.currentIndex];
              }
            })
          },handleEvents: function() {
            const _this = this;
            const cdWidth = cd.offsetWidth;

            //Handle CD rotate/ pause
            const cdThumbAnimate = cdThumb.animate([
              {transform: 'rotate(360deg)'}
            ], {
              duration: 10000, //10 seconds
              iterations: Infinity, 
            });

            cdThumbAnimate.pause();

            //Handle zoom in/ zoom out
            document.onscroll = function() {
              const scrollTop = window.scrollY || document.documentElement.scrollTop;
              const newCDWidth = cdWidth - scrollTop;
              cd.style.width = newCDWidth > 0 ? newCDWidth + 'px' : 0;
              cd.style.opacity = newCDWidth / cdWidth;
            }

            //Handle when click play
            playBtn.onclick = function(){
              if (_this.isPlaying){
                audio.pause();
              }else {
                audio.play();
              }
            }

            //When song is played 
            audio.onplay = function(){
              _this.isPlaying = true;
              player.classList.add('playing');
              cdThumbAnimate.play();
            }

            //When song is paused 
            audio.onpause = function(){
              _this.isPlaying = false;
              player.classList.remove('playing');
              cdThumbAnimate.pause();
            }

            //When progress is changed 
            audio.ontimeupdate = function(){
              if (audio.duration){
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = progressPercent;
              }
            }

            //Handle when seeking a song 
            progress.onchange = function(e) {
              const seekTime = audio.duration / 100 * e.target.value; 
              audio.currentTime = seekTime;
            }

            //Handle next song events
            nextBtn.onclick = function() {
              if(_this.isRandom){
                _this.playRandomSong();
              }else {
                _this.nextSong();
              }
              audio.play();
              _this.render();
              _this.scrollToActiveSong();
            }

            //Handle prev song events
            prevBtn.onclick = function() {
              if (_this.isRandom){
                _this.playRandomSong();
              }else {
                _this.prevSong();
              }
              audio.play();
              _this.render();
              _this.scrollToActiveSong();
            }

            //Handle random song Events
            randomBtn.onclick = function() { 
              _this.isRandom = !_this.isRandom;
              _this.setConfig('isRandom', _this.isRandom);
              randomBtn.classList.toggle('active', _this.isRandom);
            }

            //Handle repeat
            repeatBtn.onclick = function() {
              _this.isRepeat = !_this.isRepeat;
              _this.setConfig('isRepeat', _this.isRepeat);
              repeatBtn.classList.toggle('active', _this.isRepeat);
            }

            //Handle next song when audio ended
            audio.onended = function() {
              if (_this.isRepeat) {
                audio.play();
              }else {
                nextBtn.click();
              }
            }

            // Listen click events into playlist
            playlist.onclick = function(e) {
              const songNode = e.target.closest('.song:not(.active)');

              if (songNode || e.target.closest('.option')) {
                // Handle when click any song 
                if (songNode){
                  _this.currentIndex = Number(songNode.dataset.index);
                  _this.loadCurrentSong();
                  _this.render();
                  audio.play();
                }

                if (e.target.closest('.option')){

                }
              }
            }
          },
          scrollToActiveSong: function() {
            setTimeout(() => {
              if (this.currentIndex === 0){
                $('.song.active').scrollIntoView({
                  behavior: 'smooth',
                  block: 'center'
                });
              }else {
                $('.song.active').scrollIntoView({
                  behavior: 'smooth',
                  block: 'nearest'
                });
              }
            }, 500)
          },
          loadCurrentSong: function(){

            heading.textContent = this.currentSong.name;
            cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
            audio.src = this.currentSong.path;
          },
          loadConfig: function() {
            this.isRandom = this.config.isRandom;
            this.isRandom = this.config.isRepeat;
          },
          nextSong: function() {
            this.currentIndex++;
            if (this.currentIndex >= this.songs.length) {
              this.currentIndex = 0;
            }
            this.loadCurrentSong();
          },
          prevSong: function() {
            this.currentIndex--;
            if (this.currentIndex < 0) {
              this.currentIndex = this.songs.length - 1;
            }
            this.loadCurrentSong();
          },
          playRandomSong: function() {
            let newIndex;
            do {
              newIndex = Math.floor(Math.random() * this.songs.length);

            } while (newIndex === this.currentIndex)

            this.currentIndex = newIndex;
            this.loadCurrentSong();
          }
          ,start: function() {
            this.loadConfig();

            // Define element for object
            this.defineProperties();

            //Listen/ Execute events (DOM Events)
            this.handleEvents();

            //Load information of first song into UI when running app
            this.loadCurrentSong();

            //Render playlist
            this.render();

            //Show first status of repeat and random button
            randomBtn.classList.toggle('active', this.isRandom);
            repeatBtn.classList.toggle('active', this.isRepeat);
          }
        }
        app.start();