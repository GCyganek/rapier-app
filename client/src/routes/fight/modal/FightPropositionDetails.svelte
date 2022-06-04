<script lang="ts">
    import {createEventDispatcher, getContext} from 'svelte';
    import Button, { Label } from "@smui/button";
    import type { Batch } from "../fight-sequence-components/Batch";
    import { Actions } from "../fight-sequence-components/Actions";
    import {FightSocket, key} from "../../FightSocket";
    import { clear } from '../FightSequence.svelte';

    export let points: any;
    export let stack: Batch[];

    const dispatch = createEventDispatcher();
    const socket = (getContext(key) as () => FightSocket)();

    export let isOpenModal: boolean;

    function closeModal() {
        points = {};
        isOpenModal = false;
        dispatch('closeModal', { isOpenModal });
    }

    function confirmPoints(){
        if (points["red"] != null && points["blue"] != null){
            socket.sendEvents(points, stack);
            clear();
            closeModal();
        }
    }

    function choosePoints(point, fighter){
        points[fighter] = point;
    }
</script>

<div id="background" style="--display: {isOpenModal ? 'block' : 'none'};"></div>
<div id="modal" style="--display: {isOpenModal ? 'block' : 'none'};">
    <p class="pointsTitle">Propozycja wyników</p>
    <p>Sekwencja zdarzeń</p>
    <div class="container">
        <div class="actions">
            {#each stack as batch}
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
        <p>Czerwony: {points['red']}</p>
        <p>Niebieski: {points['blue']}</p>
    </div>
    <div class="buttonDiv">
        <Button class="bottomButton" id="cancelButton" on:click={closeModal}>
            <Label>Odrzuć</Label>
        </Button>
        <span class="spacer"></span>
        <Button class="bottomButton" id="confirmButton" on:click={confirmPoints}>
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
        flex-direction: column;
        margin: 0.25em;
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