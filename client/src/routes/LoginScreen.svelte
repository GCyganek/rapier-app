<script lang="ts">
  import FightStart from './FightStart.svelte';
  import { FightSocket, key } from './FightSocket';
  import { setContext } from 'svelte';

  let fightId = '';
  let judgeId = '';
  let socket: FightSocket;
  
  setContext(key, () => socket);

  function enterData() {
    console.log(fightId, judgeId);
    socket = new FightSocket(fightId.trim(), judgeId.trim());
    enteredData = true;
  }

  let enteredData = false;
</script>

{#if !enteredData}
  <div class="login">
    <fieldset>
      <legend>Identyfikator walki</legend>
      <input bind:value={fightId}/>
    </fieldset>
    <fieldset>
      <legend>Identyfikator sędziego</legend>
      <input bind:value={judgeId}/>
    </fieldset>

    <button on:click={enterData}> Wejdź </button>
  </div>
{:else}
  {#await socket.join()}
    <!-- Bez styli! -->
    <p>Oczekuję na połączenie...</p>
  {:then response}
    <FightStart {response} />
  {:catch err}
    <p>Error: {err}</p>
  {/await}
{/if}

<style>
  div.login {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-image: url('../resources/fightstart_background_semitransparent.png');
    background-repeat: repeat;
  }

  input{
    border: 1px black solid;
    width: 9em;
    font-size: 2rem;
  }
  button{
    border: 1px black solid;
    font-size: 2rem;
  }
  fieldset{
    background-color: rgba(255, 255, 255, 0.7);

  }
</style>