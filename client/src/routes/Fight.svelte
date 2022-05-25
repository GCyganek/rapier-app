<script lang="ts">
  import type { TimerAction } from './fight/bar/FightTime.svelte';
  import { FightSocket, key } from './FightSocket';
  import FightStack from './fight/FightStack.svelte';
  import FightSideProposition from './fight/FightSideProposition.svelte';
  import { getContext } from 'svelte';
  import type { Fighter } from 'model/Fighter';
  import FighterBar from './fight/FighterBar.svelte';
  import FightSequence, {
    fightSequence,
    clear,
    pop,
  } from './fight/FightSequence.svelte';
  import type { Response } from 'model/Communication';

  const socket = (getContext(key) as () => FightSocket)();

  export let redPlayer: Fighter;
  export let bluePlayer: Fighter;
  export let role: Response.JudgeRole;

  function timerEventHandler(event: CustomEvent<TimerAction>) {
    switch (event.detail) {
      case 'pause':
        return socket.pauseTimer();

      case 'resume':
        return socket.resumeTimer();
    }
  }
</script>

<div class={role === 'MAIN' ? 'container-main' : 'container-side'}>
  <FighterBar
    red={redPlayer}
    blue={bluePlayer}
    on:action={timerEventHandler}
    on:return={pop}
  />

  <FightSequence />

  {#if role === 'MAIN'}
    <FightSideProposition />
  {/if}
  <FightStack stack={$fightSequence} on:clear={clear} />
</div>

<style>
  div.container-main,
  div.container-side {
    height: 100vh;
    width: 100vw;

    display: grid;
    box-sizing: border-box;
  }

  div.container-main {
    grid-template-rows: 7rem auto 7rem 20rem;
  }

  div.container-side {
    grid-template-rows: 7rem auto 20rem;
  }
</style>
