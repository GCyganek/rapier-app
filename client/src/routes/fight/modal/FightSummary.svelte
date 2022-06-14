<script lang="ts">
  import { replace } from 'svelte-spa-router';

  function leave() {
    replace('/');
  }
</script>

<div class="summary">
  <p>Walka zakończona!</p>
  <button on:click={leave}>Wyjdź</button>
</div>

<style>
  div.summary {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-image: url('../resources/fightstart_background_semitransparent.png');
    background-repeat: repeat;
  }
  p {
    font-size: 2rem;
    font-weight: bold;
    -webkit-text-stroke: 0.05rem white;
    text-align: center;
  }
  button {
    border: 1px black solid;
    font-size: 2rem;
  }
</style>
