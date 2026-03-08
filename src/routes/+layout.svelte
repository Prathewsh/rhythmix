<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>Rhythmix Music</title>
	<link
		href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css"
		rel="stylesheet"
	/>
	<link rel="shortcut icon" href="/logo.jpeg" type="image/x-icon" />
</svelte:head>

{@render children()}
