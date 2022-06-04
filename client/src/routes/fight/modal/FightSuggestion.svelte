<script lang="ts">
    import {createEventDispatcher, getContext} from 'svelte';
    import Button, { Label } from "@smui/button";
    import { Actions } from "../fight-sequence-components/Actions";
    import {FightSocket, key} from "../../FightSocket";
    import type { Response } from "model/Communication";

    export let suggestion: Response.Suggestion;

    const dispatch = createEventDispatcher();
    const socket = (getContext(key) as () => FightSocket)();

    export let isOpenModal: boolean;

    let points = {};
    points["red"] = suggestion.redPlayerPoints;
    points["blue"] = suggestion.bluePlayerPoints;

    function closeModal() {
        isOpenModal = false;
        dispatch('closeModal', { isOpenModal });
    }

    function confirmSuggestion(){
        socket.sendEvents(points, suggestion.events);
        closeModal();
    }

</script>

<div id="background" style="--display: {isOpenModal ? 'block' : 'none'};"></div>
<div id="modal" style="--display: {isOpenModal ? 'block' : 'none'};">
    <p class="pointsTitle" 
        style="{suggestion.judgeColor.toLowerCase()==="red" ? 'var(--red-fighter)' : 'var(--blue-fighter)'}">Propozycja wyników</p>
    <p>Sekwencja zdarzeń</p>
    <div class="container">
        <div class="actions">
            {#each suggestion.events as batch}
            <span class="action" style="background-color: {batch.colour}">
                {
                    Actions.toHumanReadable(batch.action)
                }
            </span>
                <span> &#8594; </span>
            {/each}
        </div>
    </div>
    <p>Proponowane punkty</p>
    <div class="pointsDiv">
        <div class="redDiv">
            <p>Czerwony</p>
            <p>{suggestion.redPlayerPoints}</p>
        </div>
        <p>:</p>
        <div class="blueDiv">
            <p>{suggestion.bluePlayerPoints}</p>
            <p>Niebieski</p>
        </div>
    </div>
    <div class="buttonDiv">
        <Button class="bottomButton" id="cancelButton" on:click={closeModal}>
            <Label>Odrzuć</Label>
        </Button>
        <span class="spacer"></span>
        <Button class="bottomButton" id="confirmButton" on:click={confirmSuggestion}>
            <Label>Zatwierdź</Label>
        </Button>
    </div>

</div>

<style>
    #background {
        display: var(--display);
        position: fixed;
        z-index: 1;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: gray;
        opacity: 0.5;
    }

    #modal {
        display: var(--display);
        position: fixed;
        z-index: 2;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #fff;
        border-style: solid;
        padding: 1em;
    }

    div.container {
        border-top: 1px dimgray solid;
        padding: 1em;
        display: flex;
        justify-content: space-between;
        flex-direction: column;
        box-sizing: border-box;
        height: 36vh;
        overflow: auto;
    }

    span.action {
        font-size: 1em;
        padding: 0.5em 0.8em;
        border-radius: 1.5em;
        margin: 5px 2px;
        width: max-content;
        color: white;
        display: inline-block;
        position: relative;
    }

    span:last-child {
        display: none;
    }

    p{
        text-align: center;
    }

    .pointsTitle{
        font-weight: bold;
        font-size: 1.5em;
    }

    .pointsDiv{
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0.25em;
    }

    .pointsDiv div{
        color: white;
        flex: 1;
        display: flex;
        justify-content: space-between;
        padding: 0.25em;
    }

    .redDiv {
        background-color: var(--red-fighter);
        border-top-left-radius: 1em;
        border-bottom-left-radius: 1em;
    }

    .blueDiv {
        background-color: var(--blue-fighter);
        border-top-right-radius: 1em;
        border-bottom-right-radius: 1em;
    }

    * :global(.pointButton){
        height: 2.5em;
        margin: 0 0.5em;
        padding: 0 1em 0 1em;
        border-radius: 0.5em;
        color: white;
    }

    .buttonDiv{
        display: flex;
        align-items: center;
        flex-direction: row;
    }

    .spacer{
        flex: 1 1 auto;
    }

    * :global(#cancelButton){
        color: black;
    }

    * :global(#confirmButton){
        background-color: #2F4858;
        color: white;
    }
    * :global(.bottomButton){
        height: 2.5em;
        margin: 0 0.5em;
        padding: 0 1em 0 1em;
        border-radius: 2em;
    }
</style>