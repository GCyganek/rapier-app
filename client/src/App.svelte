<script lang="ts">
  import Router from 'svelte-spa-router';
  import LoginScreen from './routes/LoginScreen.svelte';
  import Home from './routes/Home.svelte';
  import Organizer from './routes/organizer/Organizer.svelte';
  import FightSummary from './routes/fight/modal/FightSummary.svelte';
  import FightStart from './routes/FightStart.svelte';
  import FighterList from './routes/organizer/FighterList.svelte';
  import AddFighter from './routes/organizer/AddFighter.svelte';

  const routes = {
    '/': Home,
    '/login': LoginScreen,
    '/fight/:fightId/:judgeId': FightStart,
    '/summary': FightSummary,
    '/organizer': Organizer,
    '/fighterlist': FighterList,
    '/addfighter': AddFighter,
    '*': Home,
  };
</script>

<Router {routes} />
