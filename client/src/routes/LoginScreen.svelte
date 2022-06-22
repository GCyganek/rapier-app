<script lang="ts">
  import { push } from 'svelte-spa-router';

  let fightId = '';
  let judgeId = '';

  function enterData() {
    push('/fight/' + fightId.trim() + '/' + judgeId.trim());
  }
</script>

<div class="site-container">
  <fieldset>
    <legend>Identyfikator walki</legend>
    <input bind:value={fightId} />
  </fieldset>
  <fieldset>
    <legend>Identyfikator sędziego</legend>
    <input bind:value={judgeId} />
  </fieldset>

  <button on:click={enterData}> Wejdź </button>
</div>

<style>
  input {
    border: 1px black solid;
    width: 9em;
    font-size: 2rem;
  }
  
  button {
    border: 1px black solid;
    font-size: 2rem;
  }
  
  fieldset {
    background-color: rgba(255, 255, 255, 0.7);
  }
</style>
