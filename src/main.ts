import { createGame } from './game/Game';

window.addEventListener('load', () => {
  const game = createGame();

  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      game.destroy(true);
    });
  }
});
