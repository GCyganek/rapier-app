<script lang="ts">
	import PlayerView, { PlayerColor, PlayerData } from "./PlayerView.svelte";
	
	export let name: string;

	const examplePlayer: PlayerData = {
		name: "Mike Wazowski",
		points: 10,
		color: PlayerColor.Blue
	}
</script>

<main>
	<h1> Hello there {name}! </h1>
	<p> Visit the <a href="https://svelte.dev/tutorial">Svelte tutorial</a> to learn how to build Svelte apps. </p>

	<PlayerView playerData={examplePlayer} />
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>