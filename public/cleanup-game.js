(() => {
  const game = document.querySelector('.cleanup-game');
  const board = game.querySelector('.cleanup-board');
  const pieces = [...board.querySelectorAll('.cleanup-piece')];
  const total = pieces.filter(piece => piece.hasAttribute('data-litter')).length;
  const count = document.getElementById('cleanup-count');
  const title = document.getElementById('cleanup-message-title');
  const message = document.getElementById('cleanup-message');
  const announcement = document.getElementById('cleanup-announcement');
  const result = document.getElementById('cleanup-result');
  const reset = game.querySelector('.cleanup-reset');
  const collected = new Set();
  const initialTitle = title.textContent;
  const initialMessage = message.textContent;

  function showFeedback(heading, fact) {
    const progress = collected.size + ' of ' + total + ' found';
    count.textContent = progress;
    title.textContent = heading;
    message.textContent = fact;
    announcement.textContent = progress + '.';
  }

  board.addEventListener('click', event => {
    const piece = event.target.closest('.cleanup-piece');
    if (!piece || collected.has(piece)) return;

    const name = piece.getAttribute('aria-label');
    if (!piece.hasAttribute('data-litter')) {
      showFeedback(name + ' belongs here', piece.dataset.fact);
      return;
    }

    collected.add(piece);
    piece.setAttribute('aria-disabled', 'true');
    piece.setAttribute('tabindex', '-1');
    const complete = collected.size === total;
    showFeedback(complete ? 'Cleanup complete!' : name + ' collected', piece.dataset.fact);
    result.hidden = !complete;
    if (complete) reset.textContent = 'Play again';
  });

  reset.addEventListener('click', () => {
    collected.clear();
    for (const piece of pieces) {
      piece.removeAttribute('aria-disabled');
      piece.removeAttribute('tabindex');
    }
    result.hidden = true;
    reset.textContent = 'Restart challenge';
    showFeedback(initialTitle, initialMessage);
    pieces[0].focus();
  });

  game.hidden = false;
})();
