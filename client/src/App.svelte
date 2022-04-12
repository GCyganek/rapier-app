<script lang="ts">
	import Button, { Label } from '@smui/button';
	import { Router, Route, useNavigate } from 'svelte-navigator';
	import SecondView from './SecondView.svelte';

	const navigate = useNavigate();

	function startFight(){
		console.log("clicked");
	}
</script>


<Router>
	<main>
		<Route path="/">
			<div>
				<Button class="startButton" on:click={()=>navigate('start')} }>
					<Label>Rozpocznij pojedynek</Label>
				</Button>
			</div>
		</Route>
		<Route path="start">
			<SecondView />
		</Route>
	</main>
</Router>


<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	* :global(.startButton){
		background-color: red;
	}
	* :global(.startButton):active{
		background-color: darkred;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>