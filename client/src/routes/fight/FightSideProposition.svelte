<script>
    import Button, {Label} from "@smui/button";

    function handleClick(type){
        console.log("clicked!")
    }
</script>

<div class="sideDiv">
    <p>Proponowane zdarzenia od sędziów bocznych:</p>
    <Button class="redButton" disabled=true on:click={() => handleClick("red")}>
    </Button>
    <Button class="blueButton" on:click={() => handleClick("blue")}>
        <Label>[informacje od niebieskiego]</Label>
    </Button>
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
        width: 85vw;
        height: 50px;
        border-radius: 10px;
        color: white;
    }
    * :global(Button:disabled){
        opacity: 0.5;
    }
</style>