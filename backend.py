from flask import Flask, request, jsonify, abort
import chess
import chess.engine
import os

app = Flask(__name__)

STOCKFISH_PATH = "stockfish.exe"

if not os.path.exists(STOCKFISH_PATH):
    raise FileNotFoundError(f"Stockfish executable not found at path: {STOCKFISH_PATH}")

stockfish_engine = chess.engine.SimpleEngine.popen_uci(STOCKFISH_PATH)

@app.route("/threat", methods=['POST'])
def get_threat_move():
    try:
        data = request.get_json()
        fen = data['fen']
        board = chess.Board(fen)
    except ValueError as e:
        abort(400, description=f"Invalid FEN: {e}")
    
    board.turn = not board.turn

    try:
        result = stockfish_engine.analyse(board, chess.engine.Limit(depth=12))
        from_square = chess.SQUARE_NAMES[result["pv"][0].from_square]
        to_square = chess.SQUARE_NAMES[result["pv"][0].to_square]

        markings = [{
            "type": 'arrow',
            "data": {
                "from": from_square,
                "to": to_square,
                "color": 'red',
                "opacity": 0.6
            },
            "node": True,
            "persistent": False
        }]

        return jsonify(markings=markings)
    except Exception as e:
        abort(500, description=f"Engine error: {e}")

@app.route("/eval", methods=['POST'])
def evaluate_position():
    try:
        data = request.get_json()
        fen = data['fen']
        board = chess.Board(fen)
    except ValueError as e:
        abort(400, description=f"Invalid FEN: {e}")

    try:
        info = stockfish_engine.analyse(board, chess.engine.Limit(depth=12))
        score = info["score"].white()

        if score.is_mate():
            if score.mate() < 0:
                eval_score = f"-M({abs(score.mate())})"
            else:
                eval_score = f'M{score.mate()}'
        else:
            eval_score = f'{round(score.score()/100, 2)}'

        return jsonify(score=eval_score)
    except Exception as e:
        abort(500, description=f"Engine error: {e}")

@app.route("/shutdown", methods=['POST'])
def shutdown():
    stockfish_engine.quit()
    return jsonify(message="Stockfish engine shut down successfully")

if __name__ == "__main__":
    app.run(debug=True)
