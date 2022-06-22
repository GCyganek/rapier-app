<script lang="ts">
  import { replace } from 'svelte-spa-router';

  function leave() {
    replace('/');
  }
</script>

<div class="site-container">
  <p>Walka zakończona!</p>
  <button on:click={leave}>Wyjdź</button>
</div>

<style>
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
