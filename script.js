// ==UserScript==
// @name        Chess.com Helper
// @match       https://www.chess.com/*
// @version     1.0
// @author      Hail
// ==/UserScript==

(function observeChessBoard() {
    let lastFen = "";

    const getThreats = async (fen) => {
        const response = await fetch(`http://localhost:5000/threats?fen=${encodeURIComponent(fen)}`);
        const { markings } = await response.json();
        return markings;
    }

    const getEval = async (fen) => {
        const response = await fetch(`http://localhost:5000/evaluate?fen=${encodeURIComponent(fen)}`);
        const { score } = await response.json();
        return score;
    }

    const logChange = () => {
        const game = document.querySelector("wc-chess-board").game;
        const fen = game.getFEN();
        const turn = game.getTurn();
        const playingAs = game.getPlayingAs();

        if (lastFen === fen) return;
        lastFen = fen;

        getEval(fen).then((score) => {
            console.log(`Score: ${score}`);
        });

        if (turn !== playingAs) return;
        
        getThreats(fen).then((threats) => {
            console.log(`Threats: ${threats}`);
        });

    };

    const observe = (el) => {
        new MutationObserver(logChange).observe(el, {
            attributes: true,
            childList: true,
            subtree: true,
            characterData: true,
        });
    };

    const check = () => {
        const chessBoard = document.querySelector("wc-chess-board");
        if (chessBoard) {
            observe(chessBoard);
        } else {
            const bodyObserver = new MutationObserver(() => {
                const chessBoard = document.querySelector("wc-chess-board");
                if (chessBoard) {
                    observe(chessBoard);
                    bodyObserver.disconnect();
                }
            });
            bodyObserver.observe(document.body, {
                childList: true,
                subtree: true,
            });
        }
    };

    check();
})();
