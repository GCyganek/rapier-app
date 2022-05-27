<script lang="ts">
  import type { Response } from 'model/Communication';
  import type { Fighter } from 'model/Fighter';
  import FighterInfo from './bar/FighterInfo.svelte';
  import FightTime from './bar/FightTime.svelte';
  import {getContext} from "svelte";
  import {Events, FightSocket, key} from "../FightSocket";

  export let red: Fighter;
  export let blue: Fighter;
  export let role: Response.JudgeRole;
  export let start: number;

  const socket = (getContext(key) as () => FightSocket)();

  socket.on(Events.NewEvents, (response : Response.NewEvent) => {
    if (response["status"] == "OK") {
        red.points = response.redPlayer.points;
        blue.points = response.bluePlayer.points;
    }
  });

</script>

<div class="container">
  <div class="upper-bar">
    <FighterInfo type={'red'} fighter={red} />
    <FighterInfo type={'blue'} fighter={blue} />
  </div>

  <div class="timer">
    <FightTime {role} {start} on:return />
  </div>
</div>

<style>
  div.container {
    position: relative;
    box-sizing: content-box;
  }

  div.upper-bar {
    display: flex;
    flex-direction: row;
    position: relative;
    height: 4rem;
    border-bottom: 2px solid #2f4858;
    text-align: center;
  }

  div.timer {
    height: 3rem;
  }
</style>
