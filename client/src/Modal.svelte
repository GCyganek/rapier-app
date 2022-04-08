<script>
    import { createEventDispatcher } from 'svelte';
	
    const dispatch = createEventDispatcher();
	
    export let isOpenModal;
	
    function closeModal() {
        isOpenModal = false;
        dispatch('closeModal', { isOpenModal });
    }
</script>

<div id="background" style="--display: {isOpenModal ? 'block' : 'none'};" on:click={closeModal}></div>
<div id="modal" style="--display: {isOpenModal ? 'block' : 'none'};">
    <p>This is a modal window.</p>
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
    }
</style>