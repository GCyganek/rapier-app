<script lang="ts">
  let firstName = '';
  let lastName = '';

  const addFighter = async () => {
    const response = await fetch('api/load-players', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body:
        'players=' +
        JSON.stringify([
          {
            firstName,
            lastName,
          },
        ]),
    });
    return await response.json();
  };

  let promise;

  async function handleClick() {
    promise = addFighter();
  }
</script>

<div class="add">
  <fieldset>
    <legend>Imię zawodnika</legend>
    <input bind:value={firstName} />
  </fieldset>
  <fieldset>
    <legend>Nazwisko zawodnika</legend>
    <input bind:value={lastName} />
  </fieldset>

  <button on:click={handleClick}> Dodaj </button>
  {#await promise}
    <p>Trwa dodawanie...</p>
  {:then response}
    {#if response !== undefined}
      <p>Zawodnik został dodany!</p>
    {:else}
      <p style="visibility: hidden">Undefined</p>
    {/if}
  {/await}
</div>

<style>
  div.add {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-image: url('../resources/fightstart_background_semitransparent.png');
    background-repeat: repeat;
  }

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
  p {
    font-size: 1.5rem;
    font-weight: bold;
    -webkit-text-stroke: 0.05rem white;
    text-align: center;
  }
</style>
