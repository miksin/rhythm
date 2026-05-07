<!-- src/App.svelte -->
<script lang="ts">
  import EndlessMode from './lib/EndlessMode.svelte'
  import RegularMode from './lib/RegularMode.svelte'
  import type { GameMode } from './lib/types'

  let mode = $state<GameMode>('endless')
</script>

<main>
  <div class="mode-tabs">
    <button
      class="tab-btn"
      class:active={mode === 'endless'}
      onclick={() => mode = 'endless'}
    >
      Endless
    </button>
    <button
      class="tab-btn"
      class:active={mode === 'regular'}
      onclick={() => mode = 'regular'}
    >
      Regular
    </button>
  </div>

  {#if mode === 'endless'}
    <EndlessMode />
  {:else}
    <RegularMode />
  {/if}

  <footer>
    <a href="https://github.com/miksin/rhythm" target="_blank" rel="noopener noreferrer">
      miksin/rhythm
    </a>
  </footer>
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    padding: 24px 6px;
    min-height: 100vh;
  }

  @media (min-width: 500px) {
    main {
      gap: 28px;
      padding: 32px 16px;
    }
  }

  .mode-tabs {
    display: flex;
    gap: 0;
    border: 1.5px solid #9a8060;
    border-radius: 3px;
    overflow: hidden;
  }

  .tab-btn {
    padding: 8px 28px;
    background: transparent;
    color: #7a6040;
    border: none;
    cursor: pointer;
    font-size: 14px;
    font-family: Georgia, serif;
    letter-spacing: 0.06em;
    transition: background 0.15s, color 0.15s;
  }

  .tab-btn:first-child {
    border-right: 1.5px solid #9a8060;
  }

  .tab-btn.active {
    background: #7a5530;
    color: #faf6ee;
  }

  footer {
    margin-top: auto;
    padding-top: 8px;
  }

  footer a {
    font-size: 0.75rem;
    color: #9a7a55;
    text-decoration: none;
    letter-spacing: 0.05em;
    opacity: 0.7;
    transition: opacity 0.15s;
  }

  footer a:hover {
    opacity: 1;
  }
</style>
