<script>
    import { createEventDispatcher } from 'svelte';
    import Button, {Label} from "@smui/button";

    const dispatch = createEventDispatcher();

    export let isOpenModal;

    let possiblePoints = [0, 1, 2, 3];
    let points = {};

    function closeModal() {
        isOpenModal = false;
        dispatch('closeModal', { isOpenModal });
    }

    function confirmPoints(){
        console.log(points);
        closeModal();
    }

    function choosePoints(point, fighter){
        points[fighter] = point;
    }


</script>

<div id="background" style="--display: {isOpenModal ? 'block' : 'none'};"></div>
<div id="modal" style="--display: {isOpenModal ? 'block' : 'none'};">
    <p class="pointsTitle">Propozycja wyników</p>
    <p>Sekwencja zdarzeń</p>
    <div class="sequenceDiv">
        <p>tutaj sekwencja</p>
    </div>
    <p>Proponowane punkty</p>
    <div class="pointsDiv">
        <div class="pointDiv">
            {#each possiblePoints as point}
                <Button class="pointButton" style="background-color: var(--blue-fighter)" on:click={() => choosePoints(point.valueOf(), "blue")}>
                    <Label>{point}</Label>
                </Button>
            {/each}
            <input type="number" style="background-color: var(--blue-fighter);" bind:value={points["blue"]}>
        </div>
        <div class="pointDiv">
            {#each possiblePoints as point}
                <Button class="pointButton" style="background-color: var(--red-fighter)" on:click={() => choosePoints(point.valueOf(), "red")}>
                    <Label>{point}</Label>
                </Button>
            {/each}
            <input type="number" style="background-color: var(--red-fighter);" bind:value={points["red"]}>
        </div>
    </div>
    <div class="buttonDiv">
        <Button class="bottomButton" id="cancelButton" on:click={closeModal}>
            <Label>Odrzuć</Label>
        </Button>
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
    .pointDiv{
        display: flex;
        align-items: center;
        flex-direction: row;
        margin: 0.25em;
    }

    * :global(.pointButton){
        height: 2.5em;
        margin: 0 0.5em;
        padding: 0 1em 0 1em;
        border-radius: 0.5em;
    }

    input{
        height: 2.5em;
        width: 2.5em;
        margin: 0 0.5em;
        border-radius: 0.5em;
        text-align: center;
        color: white;
    }

    .buttonDiv{
        display: flex;
        align-items: center;
        flex-direction: row;
    }

    * :global(#cancelButton){
        color: black;
    }

    * :global(#confirmButton){
        background-color: #2F4858;
    }
    * :global(.bottomButton){
        height: 2.5em;
        margin: 0 0.5em;
        padding: 0 1em 0 1em;
        border-radius: 2em;
    }
    input[type=number]::-webkit-inner-spin-button,
    input[type=number]::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
</style>