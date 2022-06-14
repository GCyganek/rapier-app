<script lang="ts">
  import Fight from './Fight.svelte';
  import { Events, FightSocket, key } from './FightSocket';
  import { getContext } from 'svelte';
  import type { Response } from 'model/Communication';
  import { push } from 'svelte-spa-router';

  export let response: Response.Join;
  let startPointSync = 0;

  const socket = (getContext(key) as () => FightSocket)();

  enum FightState {
    Waiting,
    Started,
    Finished,
  }

  let fightState = FightState.Waiting;

  socket.on(Events.FinishFight, (response: Response.Status) => {
    if (response['status'] == 'OK') {
      fightState = FightState.Finished;
      push('/summary');
    }
  });

  socket.on(Events.StartFight, (res) => {
    if (response.status === 'OK') {
      fightState = FightState.Started;
      startPointSync = res.timeInMillis;
    }
  });

  function handleClick() {
    socket.startFight(Date.now());
  }
</script>

{#if fightState === FightState.Waiting}
  {#if response.role === 'MAIN'}
    <div class="start">
      <button on:click={handleClick} class="startButton">
        Rozpocznij pojedynek
      </button>
    </div>
  {:else}
    <div class="start">
      <p>Oczekiwanie na rozpoczęcie spotkania...</p>
    </div>
  {/if}
{:else if fightState === FightState.Started}
  <Fight {...response} start={startPointSync} />
{/if}

<style>
  div.start {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-image: url('../resources/fightstart_background_semitransparent.png');
    background-repeat: repeat;
  }

  .startButton {
    background-color: #ff5f69;
    color: white;
    font-size: 2rem;
    font-weight: bold;
    border-radius: 2em;
    width: 12em;
    height: 3em;
  }

  .startButton:active {
    background-color: darkred;
    color: grey;
  }

  p {
    font-size: 2rem;
    font-weight: bold;
    -webkit-text-stroke: 0.05rem white;
    text-align: center;
  }
</style>
