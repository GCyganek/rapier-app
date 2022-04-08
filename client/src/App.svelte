<script lang="ts">
	export let name: string;
	import Modal from './Modal.svelte';

	let isOpenModal = false;

	function openModal() {
		isOpenModal = true;
	}

	function closeModal() {
		isOpenModal = false;
	}
</script>

<main>
	<h1>Hello {name}!</h1>
	<button on:click={openModal}>Wynik</button>
	<Modal isOpenModal={isOpenModal} on:closeModal={closeModal} />
	

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