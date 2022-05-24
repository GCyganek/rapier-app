<script lang="ts">
    import FightStart from "./FightStart.svelte";
    import {FightSocket, key} from "./FightSocket";
    import {setContext} from "svelte";

    let fightID = "";
    let judgeID = "";
    let socket;
    setContext(key, () => socket);

    function enterData(){
        socket = new FightSocket(fightID, judgeID);
        enteredData = true;
    }

    let enteredData = false;
</script>

{#if !enteredData}
    <input bind:value={fightID} placeholder="Wprowadź fightID"><br>
    <input bind:value={judgeID} placeholder="Wprowadź judgeID"><br>
    <button on:click={enterData}>
        Wejdź
    </button>
{:else}
    {#await socket.join()}
        <!-- Bez styli! -->
        <p> Oczekuję na połączenie... </p>

    {:then response}
        <FightStart {response}/>
    {:catch err}
        <p> Error: {err} </p>
    {/await}
{/if}