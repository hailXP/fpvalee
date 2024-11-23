// ==UserScript==
// @name        Chess.com Helper
// @match       https://www.chess.com/*
// @version     1.2
// @author      Hail
// ==/UserScript==

(function() {
    let lastFen = "";
    const evalContainer = document.createElement('div');
    evalContainer.id = 'eval-container';
    evalContainer.style.cssText = 'position:fixed;top:10px;left:25%;padding:10px 20px;background-color:rgba(0,0,0,0.5);color:white;font-size:16px;font-family:Arial,sans-serif;border-radius:5px;z-index:1000;';
    evalContainer.innerText = 'Evaluation: N/A';
    document.body.appendChild(evalContainer);
    const updateEval = score => { evalContainer.innerText = `Evaluation: ${score}` };
    const getThreats = fen => fetch(`http://localhost:5000/threats?fen=${encodeURIComponent(fen)}`).then(r => r.ok ? r.json() : {}).then(d => d.markings || []);
    const getEval = fen => fetch(`http://localhost:5000/evaluate?fen=${encodeURIComponent(fen)}`).then(r => r.ok ? r.json() : {}).then(d => d.score !== undefined ? d.score : 'N/A');
    const logChange = () => {
        const board = document.querySelector('wc-chess-board')?.game;
        if (!board) return;
        const fen = board.getFEN();
        if (lastFen === fen) return;
        lastFen = fen;
        getEval(fen).then(updateEval);
        if (board.getTurn() !== board.getPlayingAs()) return;
        getThreats(fen).then(markings => { board.markings.clear(); board.markings.addMany(markings); });
    };
    const observe = el => new MutationObserver(logChange).observe(el, { attributes: true, childList: true, subtree: true, characterData: true });
    const check = () => {
        const chessBoard = document.querySelector('wc-chess-board');
        if (chessBoard) observe(chessBoard);
        else new MutationObserver(() => {
            const cb = document.querySelector('wc-chess-board');
            if (cb) { observe(cb); this.disconnect(); }
        }).observe(document.body, { childList: true, subtree: true });
    };
    check();
})();
