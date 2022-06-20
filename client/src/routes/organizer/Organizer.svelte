<script lang="ts">
  import { push } from 'svelte-spa-router';

  function navigateFighterList() {
    push('/fighterlist');
  }

  function navigateAddFighter() {
    push('/addfighter');
  }
</script>

<div class="organizer">
  <button on:click={navigateFighterList}> Lista zawodników </button>
  <button on:click={navigateAddFighter}> Dodaj zawodnika </button>
</div>

<style>
  div.organizer {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-image: url('../resources/fightstart_background_semitransparent.png');
    background-repeat: repeat;
  }

  button {
    border: 1px black solid;
    font-size: 2rem;
  }
</style>
