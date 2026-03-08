<script>
	import { onMount } from 'svelte';

	// ---------- STATE ----------
	/** @type {any[]} */
	let queue = $state([]);
	/** @type {any[]} */
	let library = $state([]);
	/** @type {any[]} */
	let history = $state([]);
	/** @type {any[]} */
	let exploreSongs = $state([]);
	/** @type {any[]} */
	let searchResults = $state([]);
	let activeTab = $state('home');
	let currentIndex = $state(0);
	let isPlaying = $state(false);
	/** @type {any} */
	let ytPlayer = $state.raw(null);
	let ytReady = $state(false);
	let currentTime = $state(0);
	let duration = $state(0);
	let volume = $state(0.8);
	let sidebarOpen = $state(false);
	let searchBoxValue = $state('');

	// ---------- UTILS ----------
	/** @param {number} s */
	function formatTime(s) {
		if (!s || isNaN(s)) return '0:00';
		s = Math.floor(s);
		const m = Math.floor(s / 60);
		const sec = s % 60;
		return `${m}:${sec < 10 ? '0' + sec : sec}`;
	}

	/** @param {Record<string, string>} params */
	async function fetchYouTube(params) {
		const searchParams = new URLSearchParams(params);
		const res = await fetch(`/api/youtube?${searchParams.toString()}`);
		return await res.json();
	}

	function saveToStorage() {
		if (typeof window === 'undefined') return;
		localStorage.setItem('library', JSON.stringify(library));
		localStorage.setItem('history', JSON.stringify(history));
		localStorage.setItem('queue', JSON.stringify({ queue, currentIndex }));
	}

	// ---------- PLAYBACK ----------
	/** @param {number} [index] */
	function play(index) {
		if (queue.length === 0 || !ytReady || !ytPlayer) return;

		let targetIndex = index !== undefined ? index : currentIndex;

		// Boundary check
		if (targetIndex < 0) targetIndex = queue.length - 1;
		if (targetIndex >= queue.length) targetIndex = 0;

		const song = queue[targetIndex];
		if (!song) return;

		const videoData = ytPlayer.getVideoData ? ytPlayer.getVideoData() : null;
		const playerVideoId = videoData?.video_id;

		isPlaying = true;

		if (currentIndex !== targetIndex || playerVideoId !== song.id) {
			currentIndex = targetIndex;
			ytPlayer.loadVideoById({
				videoId: song.id,
				suggestedQuality: 'small'
			});
			ytPlayer.setVolume(Math.round(volume * 100));
			addToHistory(song);
		} else {
			ytPlayer.playVideo();
		}
		saveToStorage();
	}

	function pause() {
		if (ytReady && ytPlayer) ytPlayer.pauseVideo();
		isPlaying = false;
	}

	function next() {
		if (queue.length === 0) return;
		play((currentIndex + 1) % queue.length);
	}

	function prev() {
		if (currentTime > 3) {
			ytPlayer.seekTo(0, true);
		} else {
			play((currentIndex - 1 + queue.length) % queue.length);
		}
	}

	function handleSeek(e) {
		if (!ytReady || queue.length === 0) return;
		const rect = e.currentTarget.getBoundingClientRect();
		const pct = (e.clientX - rect.left) / rect.width;
		if (duration > 0) {
			ytPlayer.seekTo(pct * duration, true);
		}
	}

	// ---------- HISTORY & LIBRARY ----------
	function addToHistory(song) {
		history = [song, ...history.filter((s) => s.id !== song.id)].slice(0, 20);
		saveToStorage();
	}

	function toggleLibrary(song) {
		const idx = library.findIndex((s) => s.id === song.id);
		if (idx >= 0) {
			library = library.filter((s) => s.id !== song.id);
		} else {
			library = [...library, song];
		}
		saveToStorage();
	}

	function addToQueue(song) {
		queue = [...queue, song];
		saveToStorage();
		play(queue.length - 1);
	}

	/** @param {number} i */
	function removeFromQueue(i) {
		const isCurrent = i === currentIndex;
		const newQueue = [...queue];
		newQueue.splice(i, 1);
		queue = newQueue;

		if (queue.length === 0) {
			currentIndex = 0;
			pause();
		} else if (isCurrent) {
			currentIndex = i % queue.length;
			play(currentIndex);
		} else if (currentIndex > i) {
			currentIndex--;
		}
		saveToStorage();
	}

	// ---------- ACTIONS ----------
	async function searchYouTube(query) {
		if (!query.trim()) return;
		
		// Check for URL
		const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
		const match = query.match(regExp);
		const vid = (match && match[2].length === 11) ? match[2] : null;

		if (vid) {
			const data = await fetchYouTube({ id: vid });
			if (data.items?.length > 0) {
				const i = data.items[0];
				addToQueue({
					id: i.id,
					title: i.snippet.title,
					channel: i.snippet.channelTitle,
					thumb: i.snippet.thumbnails.medium.url
				});
				searchBoxValue = '';
			}
		} else {
			activeTab = 'home';
			const data = await fetchYouTube({ q: query + ' official audio' });
			searchResults = data.items?.map((/** @type {any} */ i) => ({
				id: i.id.videoId,
				title: i.snippet.title,
				channel: i.snippet.channelTitle,
				thumb: i.snippet.thumbnails.medium.url
			})) || [];
		}
	}

	async function loadExplore() {
		const data = await fetchYouTube({ chart: 'mostPopular', regionCode: 'US' });
		exploreSongs = data.items?.map((/** @type {any} */ i) => ({
			id: i.id,
			title: i.snippet.title,
			channel: i.snippet.channelTitle,
			thumb: i.snippet.thumbnails.medium.url
		})) || [];
	}

	// ---------- INITIALIZATION ----------
	onMount(() => {
		// Load from storage
		library = JSON.parse(localStorage.getItem('library') || '[]');
		history = JSON.parse(localStorage.getItem('history') || '[]');
		const savedQueue = JSON.parse(localStorage.getItem('queue') || '{}');
		queue = savedQueue.queue || [];
		currentIndex = savedQueue.currentIndex || 0;

		loadExplore();

		// YouTube API
		// @ts-ignore
		window.onYouTubeIframeAPIReady = () => {
			ytPlayer = new YT.Player('ytPlayerContainer', {
				height: '0',
				width: '0',
				events: {
					onReady: () => {
						ytReady = true;
						ytPlayer.setVolume(Math.round(volume * 100));
					},
					onStateChange: (e) => {
						if (e.data === YT.PlayerState.PLAYING) isPlaying = true;
						else if (e.data === YT.PlayerState.PAUSED) isPlaying = false;
						else if (e.data === YT.PlayerState.ENDED) next();
					},
					onError: () => {
						if (queue.length > 1) next();
						else pause();
					}
				},
				playerVars: { autoplay: 0, controls: 0, disablekb: 1, playsinline: 1 }
			});
		};

		const tag = document.createElement('script');
		tag.src = 'https://www.youtube.com/iframe_api';
		document.head.appendChild(tag);

		const timer = setInterval(() => {
			if (ytReady && ytPlayer) {
				currentTime = ytPlayer.getCurrentTime();
				duration = ytPlayer.getDuration();
			}
		}, 500);

		return () => clearInterval(timer);
	});

	$effect(() => {
		if (ytReady && ytPlayer) {
			ytPlayer.setVolume(Math.round(volume * 100));
		}
	});
</script>

<!-- Navbar -->
<header class="navbar">
	<div class="nav-left">
		<button class="mobile-toggle" onclick={() => (sidebarOpen = !sidebarOpen)}>
			<i class="bi bi-list"></i>
		</button>
		<div class="logo">Rhythmix</div>
	</div>
	<div class="nav-right">
		<div class="profile">
			<img src="https://via.placeholder.com/32" alt="Profile" />
		</div>
	</div>
</header>

<div class="app">
	<!-- Sidebar -->
	<aside class="sidebar {sidebarOpen ? 'open' : ''}">
		<nav>
			<button class:active={activeTab === 'home'} onclick={() => (activeTab = 'home')}>Home</button>
			<button class:active={activeTab === 'explore'} onclick={() => (activeTab = 'explore')}
				>Explore</button
			>
			<button class:active={activeTab === 'library'} onclick={() => (activeTab = 'library')}
				>Library</button
			>
			<button class:active={activeTab === 'queue'} onclick={() => (activeTab = 'queue')}>Queue</button>
		</nav>
	</aside>

	<!-- Main content -->
	<main class="content">
		<!-- Search -->
		<div class="search-container">
			<input
				bind:value={searchBoxValue}
				onkeydown={(e) => e.key === 'Enter' && searchYouTube(searchBoxValue)}
				placeholder="Search YouTube / paste URL"
				autocomplete="off"
			/>
		</div>

		<!-- Home Tab -->
		<div class="tab-content" class:active={activeTab === 'home'}>
			{#if searchResults.length === 0}
				<div class="home-placeholder">
					<h3>Welcome to Rhythmix 🎵</h3>
					<p>Start searching for your favorite songs above!</p>
				</div>
				{#if history.length > 0}
					<div class="recent-history">
						<h4>Recently Played</h4>
						<div class="history-grid">
							{#each history as song}
								<button class="history-card" onclick={() => addToQueue(song)}>
									<img src={song.thumb} alt={song.title} />
									<div class="title">{song.title.length > 40 ? song.title.slice(0, 37) + '...' : song.title}</div>
								</button>
							{/each}
						</div>
					</div>
				{/if}
			{:else}
				{#each searchResults as song}
					<div class="tab-item">
						<img src={song.thumb} alt={song.title} />
						<button class="info" onclick={() => addToQueue(song)}>
							<div class="title">{song.title}</div>
							<div class="channel">{song.channel}</div>
						</button>
						<button
							class="bi bi-heart like-btn"
							class:liked={library.some((s) => s.id === song.id)}
							onclick={() => toggleLibrary(song)}
						></button>
					</div>
				{/each}
			{/if}
		</div>

		<!-- Explore Tab -->
		<div class="tab-content" class:active={activeTab === 'explore'}>
			{#each exploreSongs as song}
				<div class="tab-item">
					<img src={song.thumb} alt={song.title} />
					<button class="info" onclick={() => addToQueue(song)}>
						<div class="title">{song.title}</div>
						<div class="channel">{song.channel}</div>
					</button>
					<button
						class="bi bi-heart like-btn"
						class:liked={library.some((s) => s.id === song.id)}
						onclick={() => toggleLibrary(song)}
					></button>
				</div>
			{/each}
		</div>

		<!-- Library Tab -->
		<div class="tab-content" class:active={activeTab === 'library'}>
			{#each library as song}
				<div class="tab-item">
					<img src={song.thumb} alt={song.title} />
					<button class="info" onclick={() => addToQueue(song)}>
						<div class="title">{song.title}</div>
						<div class="channel">{song.channel}</div>
					</button>
				</div>
			{/each}
		</div>

		<!-- Queue Tab -->
		<div class="tab-content" class:active={activeTab === 'queue'}>
			{#each queue as song, i}
				<div class="tab-item">
					<img src={song.thumb} alt={song.title} />
					<button class="info" onclick={() => play(i)}>
						<div class="title">{song.title}</div>
						<div class="channel">{song.channel}</div>
					</button>
					<button
						class="bi bi-heart like-btn"
						class:liked={library.some((s) => s.id === song.id)}
						onclick={() => toggleLibrary(song)}
					></button>
					<button class="bi bi-x remove-btn" onclick={() => removeFromQueue(i)}></button>
				</div>
			{/each}
		</div>
	</main>
</div>

<!-- Bottom player -->
<div class="player-bar">
	<div class="player-left">
		<img src={queue[currentIndex]?.thumb || '/music_placeholder.jpg'} class="player-cover" alt="Cover" />
		<div>
			<div id="playerTitle">{queue[currentIndex]?.title || 'Rhythmix Music'}</div>
			<div id="playerArtist">{queue[currentIndex]?.channel || 'Select a song to play'}</div>
		</div>
	</div>
	<div class="player-middle">
		<div class="controls">
			<button onclick={prev}><i class="bi bi-skip-start-fill"></i></button>
			<button onclick={() => (isPlaying ? pause() : play())}>
				<i class="bi {isPlaying ? 'bi-pause-fill' : 'bi-play-fill'}"></i>
			</button>
			<button onclick={next}><i class="bi bi-skip-end-fill"></i></button>
		</div>
		<div class="progress-container">
			<div id="currentTime">{formatTime(currentTime)}</div>
			<button id="progressBar" onclick={handleSeek}>
				<div id="progressFill" style="width: {(currentTime / duration) * 100 || 0}%"></div>
			</button>
			<div id="durationTime">{formatTime(duration)}</div>
		</div>
	</div>
	<div class="player-right">
		<input type="range" min="0" max="1" step="0.01" bind:value={volume} />
	</div>
</div>

<div id="ytPlayerContainer" style="width:1px; height:1px; overflow:hidden;"></div>

<style>
	/* Any Svelte-specific style overrides can go here, but app.css handles most global styles */
	button {
		background: none;
		border: none;
		color: inherit;
		cursor: pointer;
		padding: 0;
		text-align: left;
		font-family: inherit;
	}
	.history-card {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
</style>
