<script>
    import Button, {Label} from "@smui/button";

    function handleClick(type){
        console.log("clicked! " + type)
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
</div>

<style>
    div.sideDiv {
        display: flex;
        align-items: center;
        flex-direction: column;
        gap: 0.5rem;
        padding: 0.5rem;
    }

    p {
        color: var(--blue-fighter);
        margin: 0;
    }

    * :global(.blueButton) {
        background-color: var(--blue-fighter);
    }

    * :global(.redButton) {
        background-color: var(--red-fighter);
    }
    
    * :global(Button) {
        width: 85%;
        height: 2rem;
        border-radius: 0.5rem;
        color: white;
        margin: 0;
    }
    
    * :global(Button:disabled){
        background-color: lightgray;
        border-color: lightgray;
        color: gray;
    }
</style>