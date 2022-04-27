<script>
    import Button, {Label} from "@smui/button";
    import FightPoints from "./modal/FightPoints.svelte";

    function handleClick(type){
        console.log("clicked! " + type)
    }

    let isOpenPoints = false;

    function openPoints() {
        isOpenPoints = true;
    }

    function closePoints() {
        isOpenPoints = false;
    }
</script>

<div class="sideDiv">
    <p>Proponowane zdarzenia od sędziów bocznych:</p>
    <Button class="redButton" disabled=true on:click={() => handleClick("red")}>
        <Label>[informacje od czerwonego]</Label>
    </Button>
    <Button class="blueButton" on:click={() => handleClick("blue")}>
        <Label>[informacje od niebieskiego]</Label>
    </Button>
<!--    TODO delete below-->
    <Button style="color: black;" on:click={() => openPoints()}>
        <Label>Zaproponuj punkty</Label>
    </Button>
    <FightPoints isOpenModal={isOpenPoints} on:closeModal={closePoints} />
<!--    TODO delete above-->
</div>

<style>
    .sideDiv{
        display: flex;
        align-items: center;
        flex-direction: column;
    }

    p{
        color: var(--blue-fighter);
    }

    * :global(.blueButton){
        background-color: var(--blue-fighter);
    }

    * :global(.redButton){
        background-color: var(--red-fighter);
    }
    * :global(Button){
        width: 85%;
        height: 3em;
        border-radius: 0.5em;
        color: white;
    }
    * :global(Button:disabled){
        background-color: lightgray;
        border-color: lightgray;
        color: gray;
    }
</style>