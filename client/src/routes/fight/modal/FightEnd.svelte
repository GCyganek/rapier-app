<script lang="ts">
    import { createEventDispatcher, getContext } from 'svelte';
    import { FightSocket, key } from '../../FightSocket';

    // const socket = getContext(key) as FightSocket;
    const socket = getContext(key)();
    const dispatch = createEventDispatcher();

    export let isOpenModal;

    function closeModal() {
        isOpenModal = false;
        dispatch('closeModal', { isOpenModal });
    }

    function finishFight(){
        closeModal();
        socket.finishFight();
    }

</script>

<div id="background" style="--display: {isOpenModal ? 'block' : 'none'};"></div>
<div id="modal" style="--display: {isOpenModal ? 'block' : 'none'};">
    <p>Zakończyć pojedynek?</p>
    <div class="buttonDiv">
        <button class="bottomButton" id="confirmButton" on:click={finishFight}>
            Tak
        </button>
        <span class="spacer"></span>
        <button class="bottomButton" id="cancelButton" on:click={closeModal}>
            Nie
        </button>
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
        text-align: center;
    }

    .buttonDiv{
        display: flex;
        align-items: center;
        flex-direction: row;
    }

    .spacer{
        flex: 1 1 auto;
    }

    #cancelButton{
        color: black;
    }

    #confirmButton{
        background-color: #2F4858;
        color: white;
    }
    .bottomButton{
        height: 2.5em;
        margin: 0 0.5em;
        padding: 0 2em 0 2em;
        border-radius: 1em;
    }


</style>