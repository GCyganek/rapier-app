<script lang="ts">
  import type { Response } from 'model/Communication';
  import { push } from 'svelte-spa-router';

  export let status: Response.Status;

  type StatusMap = {
    [Property in Exclude<Response.Status, 'OK'>]: string;
  };

  const messageMap: StatusMap = {
    BAD_REQUEST: 'Błąd w komunikacji z serwerem',
    UNAUTHORIZED: 'Brak odpowiednich uprawnień do wykonania akcji',
    NOT_FOUND:
      'Nie znaleziono walki/sędziego (sprawdź czy posiadasz odpowiedni link lub poprawnie wpisałeś dane)',
    NOT_READY: 'Walka nie została jeszcze rozpoczęta',
  };
</script>

<div class="site-container">
  <div class="error">
    <h3>Coś poszło nie tak!</h3>

    <p>{messageMap[status] ?? 'Wystąpił nieznany błąd'}!</p>

    <button on:click={() => push('/home')}> Strona główna </button>
  </div>
</div>

<style>
  h3 {
    font-size: 2rem;
  }

  div.error {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;

    background-color: whitesmoke;
    padding: 1rem 0.5rem;
    border: 1px black solid;
  }
</style>
