<script lang="ts">
  const getPlayers = async () => {
    const response = await fetch('api/get-players');
    return await response.json();
  };
</script>

{#await getPlayers()}
  <p>Trwa pobieranie listy zawodników...</p>
{:then players}
  <div class="background">
    {#each players as player}
      <div class="player">{player.firstName} {player.lastName}</div>
    {/each}
  </div>
{:catch error}
  <p>An error occurred! {error}</p>
{/await}

<style>
  div.background {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-image: url('../resources/fightstart_background_semitransparent.png');
    background-repeat: repeat;
  }
  div.player {
    font-size: 2rem;
    font-weight: bold;
    background-color: white;
    border: 0.2rem solid black;
    padding: 0.3rem;
    margin: 0.3rem;
  }
  p {
    font-size: 2rem;
    font-weight: bold;
    -webkit-text-stroke: 0.05rem white;
    text-align: center;
  }
</style>
