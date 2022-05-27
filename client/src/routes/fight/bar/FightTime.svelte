<script lang="ts">
  import { createEventDispatcher, getContext } from 'svelte';
  import { emptySeq } from '../fight-sequence-components/Store';
  import Icon from '@iconify/svelte';
  import FightEnd from '../modal/FightEnd.svelte';
  import type { Response } from 'model/Communication';
  import { Events, FightSocket, key } from 'routes/FightSocket';
  import { PreciseTimer } from 'model/Timer';

  export let role: Response.JudgeRole;
  export let start: number;

  let endCondition = false;
  let timer = new PreciseTimer(start);
  const time = timer.time;
  const paused = timer.paused;

  const socket = (getContext(key) as () => FightSocket)();

  const dispatch = createEventDispatcher();

  socket.awaitEndCondition().then(() => (endCondition = true));

  const showTime = (time: number) => {
    const min = Math.floor(time / 60),
      tbs = time % 60,
      secs = tbs < 10 ? `0${tbs}` : tbs.toString();

    return `${min}:${secs}`;
  };

  const pause = () => {
    if (role === 'MAIN') {
      socket
        .pauseTimer(Date.now())
        .then((res) => timer.pause(res.timeInMillis));
    }
  };

  const resume = () => {
    if (role === 'MAIN') {
      socket
        .resumeTimer(Date.now())
        .then((res) => timer.resume(res.timeInMillis));
    }
  };

  if (role !== 'MAIN') {
    socket.on(Events.PauseTimer, (res) => timer.pause(res.timeInMillis));
    socket.on(Events.ResumeTimer, (res) => timer.resume(res.timeInMillis));
  }

  let isOpenEnd = false;

  function openEnd() {
    dispatch('end');
    isOpenEnd = true;
  }

  function closeEnd() {
    isOpenEnd = false;
  }
</script>

<div>
  <button
    class="returnButton"
    on:click={() => dispatch('return')}
    hidden={$emptySeq}
  >
    <Icon icon="bx:left-arrow-circle" color="#2f4858" height="2rem" />
  </button>

  <div
    class="info"
    style="background-color: {endCondition ? '#8f1d21' : '#333'};"
  >
    {showTime($time)}
  </div>

  <div class="buttonWrapper">
    {#if role === 'MAIN'}
      {#if $paused}
        <button class="stopButton" on:click={() => openEnd()}>
          <Icon icon="mdi:stop-circle-outline" color="#2f4858" height="2rem" />
        </button>
      {/if}

      <button class="previous" on:click={$paused ? resume : pause}>
        {#if $paused}
          <Icon icon="bx:play-circle" color="#2f4858" height="2rem" />
        {:else}
          <Icon icon="carbon:pause-outline" color="#2f4858" height="2rem" />
        {/if}
      </button>

      <FightEnd isOpenModal={isOpenEnd} on:closeModal={closeEnd} />
    {/if}
  </div>
</div>

<style>
  div {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    border-bottom: 2px solid #2f4858;
  }

  button {
    box-sizing: content-box;
    border: none;
    background: none;
    padding: 0;
    margin: 0.5rem;
    height: 2rem;
    width: 2rem;
  }

  div.info {
    background-color: #333;
    display: flex;
    justify-content: center;
    height: 2.5rem;
    margin: 0.2rem 0;
    border-radius: 0.3em;
    text-align: center;
    font-size: 2rem;
    color: whitesmoke;
    width: 8rem;
    box-sizing: border-box;
  }

  div.buttonWrapper {
    display: flex;
    flex-direction: row;
    justify-content: right;
    border: none;
    position: absolute;
    right: 0;
  }

  .returnButton {
    position: absolute;
    left: 0;
  }
</style>
