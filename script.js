(function observeChessBoard() {
    let lastFen = '';
  const logChange = () => {
        const fen = document.querySelector('wc-chess-board').game.getFEN();
        if (lastFen === fen) return;
        console.log(fen);
        lastFen = fen;
        
};

  const observe = (el) => {
    new MutationObserver(logChange).observe(el, {
      attributes: true,
      childList: true,
      subtree: true,
      characterData: true
    });
  };

  const check = () => {
    const chessBoard = document.querySelector('wc-chess-board');
    if (chessBoard) {
      observe(chessBoard);
    } else {
      const bodyObserver = new MutationObserver(() => {
        const chessBoard = document.querySelector('wc-chess-board');
        if (chessBoard) {
          observe(chessBoard);
          bodyObserver.disconnect();
        }
      });
      bodyObserver.observe(document.body, { childList: true, subtree: true });
    }
  };

  check();
})();