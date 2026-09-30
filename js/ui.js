class UI {
    constructor(player, albumData) {
        this.player = player;
        this.albumData = albumData;

        // Caching DOM elements
        this.elements = {
            // Header
            albumArtist: document.getElementById('album-artist'),
            albumTitle: document.getElementById('album-title'),
            albumMeta: document.getElementById('album-meta'),
            albumCover: document.getElementById('album-cover'),
            ambientBg: document.getElementById('ambient-bg'),
            vinylDisc: document.getElementById('vinyl-disc'),

            // Buttons Modais
            btnAbout: document.getElementById('btn-about'),
            btnAwards: document.getElementById('btn-awards'),
            btnCredits: document.getElementById('btn-credits'),

            // Modais
            modalAbout: document.getElementById('modal-about'),
            modalAwards: document.getElementById('modal-awards'),
            modalCredits: document.getElementById('modal-credits'),

            // Modais Content
            aboutContent: document.getElementById('about-content'),
            awardsContent: document.getElementById('awards-content'),
            creditsContent: document.getElementById('credits-content'),

            // Player
            currentTitle: document.getElementById('current-title'),
            currentComposers: document.getElementById('current-composers'),
            timeCurrent: document.getElementById('time-current'),
            timeTotal: document.getElementById('time-total'),
            progressBar: document.getElementById('progress-bar'),
            volumeBar: document.getElementById('volume-bar'),

            // Player Controls
            btnPlayPause: document.getElementById('btn-play-pause'),
            btnNext: document.getElementById('btn-next'),
            btnPrev: document.getElementById('btn-prev'),
            btnShuffle: document.getElementById('btn-shuffle'),
            btnRepeat: document.getElementById('btn-repeat'),

            // Tracklist & Lyrics
            tracklist: document.getElementById('tracklist'),
            lyricsSection: document.querySelector('.lyrics-section'),
            lyricsTitle: document.getElementById('lyrics-title'),
            lyricsComposers: document.getElementById('lyrics-composers'),
            lyricsContent: document.getElementById('lyrics-content'),
            btnToggleLyrics: document.getElementById('btn-toggle-lyrics')
        };

        // Estado da letra sincronizada (LRC) da faixa atual
        this.currentLyrics = null;
        this.activeLyricIndex = -1;

        this.init();
    }

    init() {
        this.renderAlbumInfo();
        this.renderTracklist();
        this.renderModals();
        this.setupEventListeners();
        this.updatePlayerControlsState();
    }

    formatTime(seconds) {
        if (isNaN(seconds)) return "00:00";
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    // Converte texto no formato LRC (ex: "[00:12.34]Linha da letra") em uma
    // lista ordenada de { time (segundos), text }. Linhas de metadado como
    // [ar:], [ti:], [by:] são ignoradas por não terem o padrão mm:ss.
    // Retorna null se o texto não contiver nenhuma tag de tempo válida,
    // permitindo o fallback para letra em texto simples/HTML.
    parseLRC(rawText) {
        if (!rawText) return null;

        const lines = rawText.split(/\r?\n/);
        const timeTag = /\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\]/g;
        const result = [];
        let hasTimestamps = false;

        lines.forEach(line => {
            const tags = [...line.matchAll(timeTag)];
            if (tags.length === 0) return;

            hasTimestamps = true;
            const text = line.replace(timeTag, '').trim();

            tags.forEach(tag => {
                const min = parseInt(tag[1], 10);
                const sec = parseInt(tag[2], 10);
                const msRaw = tag[3] ? tag[3].padEnd(3, '0').slice(0, 3) : '0';
                const ms = parseInt(msRaw, 10);
                const time = (min * 60) + sec + (ms / 1000);
                result.push({ time, text });
            });
        });

        if (!hasTimestamps) return null;

        result.sort((a, b) => a.time - b.time);
        return result;
    }

    renderAlbumInfo() {
        const { elements, albumData } = this;

        elements.albumTitle.textContent = albumData.title || "Álbum Desconhecido";
        elements.albumArtist.textContent = albumData.artist || "Artista";

        const coverSrc = albumData.cover || "";
        elements.albumCover.src = coverSrc;
        if (coverSrc) {
            elements.ambientBg.style.backgroundImage = `url('${coverSrc}')`;
        }

        const metaParts = [];
        if (albumData.releaseDate) metaParts.push(albumData.releaseDate);
        if (albumData.genre) metaParts.push(albumData.genre);
        if (albumData.totalDuration) metaParts.push(albumData.totalDuration);

        elements.albumMeta.textContent = metaParts.join(' • ');
    }

    renderTracklist() {
        const { elements, albumData } = this;
        elements.tracklist.innerHTML = "";

        albumData.tracks.forEach((track, index) => {
            const li = document.createElement('li');
            li.className = 'track-item';
            li.setAttribute('role', 'button');
            li.setAttribute('tabindex', '0');
            li.setAttribute('aria-label', `Tocar faixa ${track.number}: ${track.title || 'Sem título'}`);

            // Number
            const numDiv = document.createElement('div');
            numDiv.className = 'track-num';
            numDiv.textContent = track.number.toString().padStart(2, '0');

            // Details
            const detailsDiv = document.createElement('div');
            detailsDiv.className = 'track-details';

            const titleSpan = document.createElement('span');
            titleSpan.className = 'track-title';
            titleSpan.textContent = track.title || "---";

            const composersSpan = document.createElement('span');
            composersSpan.className = 'composers';
            composersSpan.textContent = track.composers && track.composers.length > 0
                ? track.composers.join(' / ')
                : "Compositor não informado";

            detailsDiv.appendChild(titleSpan);
            detailsDiv.appendChild(composersSpan);

            // Duration
            const durationDiv = document.createElement('div');
            durationDiv.className = 'track-duration';
            durationDiv.textContent = track.duration || "--:--";

            li.appendChild(numDiv);
            li.appendChild(detailsDiv);
            li.appendChild(durationDiv);

            li.addEventListener('click', () => this.player.playTrack(index));
            li.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.player.playTrack(index);
                }
            });

            elements.tracklist.appendChild(li);
        });
    }

    renderModals() {
        // About
        let aboutHtml = `<p><strong>Lançamento:</strong> ${this.albumData.releaseDate || 'Não informado'}</p>`;
        aboutHtml += `<p><strong>Gravação:</strong> ${this.albumData.recordingDate || 'Não informado'}</p>`;
        aboutHtml += `<p><strong>Gravadora(s):</strong> ${this.albumData.labels && this.albumData.labels.length > 0 ? this.albumData.labels.join(', ') : 'Não informado'}</p>`;
        if (this.albumData.description) {
            aboutHtml += `<br><p>${this.albumData.description}</p>`;
        }
        this.elements.aboutContent.innerHTML = aboutHtml;

        // Awards
        if (!this.albumData.awards || this.albumData.awards.length === 0) {
            this.elements.awardsContent.innerHTML = `<p class="empty-state">Nenhuma premiação cadastrada.</p>`;
        } else {
            let awardsHtml = '';
            this.albumData.awards.forEach(a => {
                awardsHtml += `
                    <div class="award-card">
                        <h3>${a.award || 'Prêmio'} - ${a.result || 'Vencedor'}</h3>
                        <p class="award-meta">${a.year || ''} • ${a.category || ''}</p>
                        ${a.description ? `<p>${a.description}</p>` : ''}
                    </div>
                `;
            });
            this.elements.awardsContent.innerHTML = awardsHtml;
        }

        // Credits
        const tc = this.albumData.technicalCredits;
        if (!tc || Object.keys(tc).length === 0) {
            this.elements.creditsContent.innerHTML = `<p class="empty-state">Ficha técnica não disponível.</p>`;
        } else {
            let tcHtml = '<div class="credits-grid">';
            const addCredit = (label, value) => {
                if (value && ((Array.isArray(value) && value.length > 0) || (typeof value === 'string' && value.trim() !== ''))) {
                    const displayValue = Array.isArray(value) ? value.join('<br>') : value;
                    tcHtml += `<div class="credit-item"><h4>${label}</h4><p>${displayValue}</p></div>`;
                }
            };

            addCredit('Produção', tc.production);
            addCredit('Direção', tc.direction);
            addCredit('Arranjos', tc.arrangements);
            addCredit('Gravação', tc.recording);
            addCredit('Mixagem', tc.mixing);
            addCredit('Masterização', tc.mastering);
            addCredit('Estúdios', tc.studios);
            addCredit('Fotografia', tc.photography);
            addCredit('Projeto Gráfico', tc.artwork);
            addCredit('Músicos', tc.musicians);

            tcHtml += '</div>';
            if (tcHtml === '<div class="credits-grid"></div>') {
                tcHtml = `<p class="empty-state">Ficha técnica não disponível.</p>`;
            }
            this.elements.creditsContent.innerHTML = tcHtml;
        }
    }

    setupEventListeners() {
        const { elements, player } = this;

        // Player Controls
        elements.btnPlayPause.addEventListener('click', () => player.togglePlay());
        elements.btnNext.addEventListener('click', () => player.nextTrack());
        elements.btnPrev.addEventListener('click', () => player.prevTrack());

        elements.btnShuffle.addEventListener('click', () => {
            const isShuffle = player.toggleShuffle();
            elements.btnShuffle.classList.toggle('active', isShuffle);


        });

        elements.btnRepeat.addEventListener('click', () => {
            const mode = player.toggleRepeat();
            if (mode === 0) {
                elements.btnRepeat.classList.remove('active');
                elements.btnRepeat.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>';
            } else if (mode === 1) {
                elements.btnRepeat.classList.add('active');
                elements.btnRepeat.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>';
            } else {
                elements.btnRepeat.classList.add('active');
                elements.btnRepeat.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z"/></svg>';
            }
        });

        // Progress & Volume
        elements.progressBar.addEventListener('input', (e) => {
            player.seek(e.target.value);
        });

        elements.volumeBar.addEventListener('input', (e) => {
            player.setVolume(e.target.value);
            elements.volumeBar.style.setProperty('--volume', `${e.target.value * 100}%`);
        });
        elements.volumeBar.value = player.audio.volume;
        elements.volumeBar.style.setProperty('--volume', `${player.audio.volume * 100}%`);

        // Modais events
        const openModal = (modal) => {
            modal.showModal();
        };
        const closeModals = () => {
            [elements.modalAbout, elements.modalAwards, elements.modalCredits].forEach(m => {
                if (m.open) m.close();
            });
        };

        elements.btnAbout.addEventListener('click', () => openModal(elements.modalAbout));
        elements.btnAwards.addEventListener('click', () => openModal(elements.modalAwards));
        elements.btnCredits.addEventListener('click', () => openModal(elements.modalCredits));

        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', closeModals);
        });

        // Close modal clicking outside
        document.querySelectorAll('dialog').forEach(dialog => {
            dialog.addEventListener('click', (e) => {
                const rect = dialog.getBoundingClientRect();
                const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
                    rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
                if (!isInDialog) {
                    dialog.close();
                }
            });
        });

        // Toggle da seção de letras
        elements.btnToggleLyrics.addEventListener('click', () => {
            const isCollapsed = elements.lyricsSection.classList.toggle('lyrics-collapsed');
            elements.btnToggleLyrics.setAttribute('aria-expanded', String(!isCollapsed));
        });
        // Estado inicial: expandido
        elements.btnToggleLyrics.setAttribute('aria-expanded', 'true');
    }

    updatePlayerControlsState() {
        const { elements, player } = this;
        const playIcon = '<svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48"><path d="M8 5v14l11-7z"/></svg>';
        const pauseIcon = '<svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';

        elements.btnPlayPause.innerHTML = player.isPlaying ? pauseIcon : playIcon;
        elements.btnPlayPause.setAttribute('aria-label', player.isPlaying ? 'Pausar' : 'Play');
        elements.vinylDisc.classList.toggle('is-spinning', player.isPlaying);
        elements.btnShuffle.classList.toggle('active', player.isShuffle);

        if (player.repeatMode === 0) {
            elements.btnRepeat.classList.remove('active');
            elements.btnRepeat.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>';
        } else if (player.repeatMode === 1) {
            elements.btnRepeat.classList.add('active');
            elements.btnRepeat.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>';
        } else {
            elements.btnRepeat.classList.add('active');
            elements.btnRepeat.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z"/></svg>';
        }
    }

    onTrackChange(index) {
        const { elements, player, albumData } = this;
        const track = player.getCurrentTrack();

        if (!track) return;

        // Update tracklist highlights
        const items = elements.tracklist.querySelectorAll('li');
        items.forEach((item, i) => {
            item.classList.toggle('active', i === index);
        });

        // Update Player Info
        elements.currentTitle.textContent = `${track.number}. ${track.title || 'Faixa ' + track.number}`;
        elements.currentComposers.textContent = track.composers && track.composers.length > 0
            ? track.composers.join(' / ')
            : "Compositor não informado";

        // Update Lyrics
        elements.lyricsTitle.textContent = track.title || 'Faixa ' + track.number;
        elements.lyricsComposers.textContent = elements.currentComposers.textContent;

        this.renderLyrics(track);

        // Reset progress visually
        elements.progressBar.value = 0;
        elements.progressBar.style.setProperty('--progress', '0%');
        elements.timeCurrent.textContent = "00:00";
    }

    // Renderiza a letra da faixa. Se o texto estiver no formato LRC
    // (com tags [mm:ss.xx]), monta uma linha por <p> sincronizável.
    // Caso contrário, cai no modo antigo (texto/HTML estático).
    renderLyrics(track) {
        const { elements } = this;

        this.currentLyrics = null;
        this.activeLyricIndex = -1;

        if (!track.lyrics) {
            elements.lyricsContent.classList.remove('lyrics-synced');
            elements.lyricsContent.innerHTML = `<p class="empty-state">Letra ainda não cadastrada.</p>`;
            return;
        }

        const parsed = this.parseLRC(track.lyrics);

        if (parsed && parsed.length > 0) {
            this.currentLyrics = parsed;
            elements.lyricsContent.classList.add('lyrics-synced');
            elements.lyricsContent.innerHTML = '';

            parsed.forEach((line, i) => {
                const p = document.createElement('p');
                p.className = 'lyrics-line';
                p.dataset.index = i;
                p.textContent = line.text || '\u00A0';
                elements.lyricsContent.appendChild(p);
            });
        } else {
            elements.lyricsContent.classList.remove('lyrics-synced');
            elements.lyricsContent.innerHTML = track.lyrics;
        }

        elements.lyricsContent.scrollTop = 0;
    }

    // Chamado a cada timeupdate do áudio. Descobre qual linha da letra
    // corresponde ao tempo atual, destaca ela e rola a view suavemente.
    updateActiveLyric(currentTime) {
        if (!this.currentLyrics) return;

        const lines = this.currentLyrics;
        let idx = -1;
        for (let i = 0; i < lines.length; i++) {
            if (currentTime >= lines[i].time) {
                idx = i;
            } else {
                break;
            }
        }

        if (idx === this.activeLyricIndex) return;
        this.activeLyricIndex = idx;

        const items = this.elements.lyricsContent.querySelectorAll('.lyrics-line');
        items.forEach((el, i) => el.classList.toggle('active', i === idx));

        if (idx >= 0 && items[idx] && !this.elements.lyricsSection.classList.contains('lyrics-collapsed')) {
            items[idx].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    onProgressUpdate(currentTime, duration) {
        const { elements } = this;
        if (!isNaN(duration) && duration > 0) {
            const percent = (currentTime / duration) * 100;
            elements.progressBar.value = percent;
            elements.progressBar.style.setProperty('--progress', `${percent}%`);
            elements.timeTotal.textContent = this.formatTime(duration);
        }
        elements.timeCurrent.textContent = this.formatTime(currentTime);
        this.updateActiveLyric(currentTime);
    }

    onStateChange() {
        this.updatePlayerControlsState();
    }
}
