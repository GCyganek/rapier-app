<script lang="ts">
  import FightStack from './fight/FightStack.svelte';
  import FightSideProposition from './fight/FightSideProposition.svelte';
  import type { Fighter } from 'model/Fighter';
  import FighterBar from './fight/FighterBar.svelte';
  import FightSequence, {
    fightSequence,
    clear,
    pop,
  } from './fight/FightSequence.svelte';
  import type { Response } from 'model/Communication';

  export let redPlayer: Fighter;
  export let bluePlayer: Fighter;
  export let role: Response.JudgeRole;
  export let start: number;
</script>

<div class={role === 'MAIN' ? 'container-main' : 'container-side'}>
  <FighterBar red={redPlayer} blue={bluePlayer} {role} {start} on:return={pop} />

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
