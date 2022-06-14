<script lang="ts">
  import { push } from 'svelte-spa-router';

  function navigateOrganizer() {
    push('/organizer');
  }

  function navigateFight() {
    push('/fight');
  }
</script>

<div class="home">
  <button on:click={navigateFight}> Walka </button>
  <button on:click={navigateOrganizer}> Organizator </button>
</div>

<style>
  div.home {
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
