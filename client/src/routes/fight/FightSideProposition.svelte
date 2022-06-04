<script lang="ts">
  import { FightSocket, key } from 'routes/FightSocket';
  import { getContext } from 'svelte';
  import FightPropositionDetails from './FightPropositionDetails.svelte';

  const socket = (getContext(key) as () => FightSocket)();

  const [red, blue] = socket.awaitSuggestions();
</script>

<div class="side">
  <p>Proponowane zdarzenia od sędziów bocznych:</p>

  <FightPropositionDetails suggestion={$red} />
  <FightPropositionDetails suggestion={$blue} />
</div>

<style>
  div.side {
    display: flex;
    height: 20vh;
    align-items: center;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.5rem;
  }

  p {
    color: var(--blue-fighter);
    margin: 0;
  }
</style>
