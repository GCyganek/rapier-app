<script lang="ts">
  import { push } from 'svelte-spa-router';

  function navigateOrganizer() {
    push('/organizer');
  }

  function navigateFight() {
    push('/login');
  }
</script>

<div class="site-container">
  <button on:click={navigateFight}> Walka </button>
  <button on:click={navigateOrganizer}> Organizator </button>
</div>

<style>
  button {
    border: 1px black solid;
    font-size: 2rem;
  }
</style>
