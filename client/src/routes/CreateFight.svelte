<script lang="ts">
    let redFirstName: string;
    let redLastName: string;
    let blueFirstName: string;
    let blueLastName: string;

    let x = { a: 'simea' };

    const check = (s: string) => s.length !== 0

    const encode = () => {
        
    }

    const send = async () => {
        await fetch('api/load-players', {
            method: 'POST',
            body: ''
        });
    }
</script>

<form on:submit={send}>
    <fieldset>
        <legend>Czerwony zawodnik</legend>
        <label for="p1-firstname"> Imię: </label>
        <input type="text" id="p1-firstname" bind:value={redFirstName}>

        <label for="p1-lastname"> Nazwisko: </label>
        <input type="text" id="p1-lastname" bind:value={redLastName}>
    </fieldset>

    <fieldset>
        <legend>Niebieski zawodnik</legend>
        <label for="p2-firstname"> Imię: </label>
        <input type="text" id="p2-firstname" bind:value={blueFirstName}>

        <label for="p2-lastname"> Nazwisko: </label>
        <input type="text" id="p2-lastname" bind:value={blueLastName}>
    </fieldset>
</form>

<style>
    form {
        flex-direction: column;
        display: flex;
        width: 100%;
        gap: 1rem;
    }

    fieldset {
        padding: .5rem;
        margin-inline: .5rem;
        border-radius: .5rem;
    }
    
    fieldset:first-child {
        border-color: var(--red-fighter);
    }

    fieldset:nth-child(2) {
        border-color: var(--blue-fighter);
    }

    label {
        font-size: .75rem;
        max-width: fit-content;
        margin: 0;
    }

    input {
        width: 100%;
        border-radius: .5rem;
        padding: .5rem;
    }

</style>
