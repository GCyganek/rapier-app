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
  <input bind:value={fightId} placeholder="Wprowadź fightID" /><br />
  <input bind:value={judgeId} placeholder="Wprowadź judgeID" /><br />
  <button on:click={enterData}> Wejdź </button>
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
