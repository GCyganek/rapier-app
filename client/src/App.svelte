<script lang="ts">
  import Router from 'svelte-spa-router';
  import LoginScreen from './routes/LoginScreen.svelte';
  import Home from './routes/Home.svelte';
  import Organizer from './routes/Organizer.svelte';
  import FightSummary from './routes/fight/modal/FightSummary.svelte';
  import FightStart from './routes/FightStart.svelte';

  const routes = {
    '/': Home,
    '/login': LoginScreen,
    '/fight/:fightId/:judgeId': FightStart,
    '/organizer': Organizer,
    '/summary': FightSummary,
    '*': Home,
  };
</script>

<Router {routes} />
